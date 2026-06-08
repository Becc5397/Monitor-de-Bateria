// ═══════════════════════════════════════════════════════════════════════════════
// moto_monitor_ble.ino — Monitor BLE para TVS Apache 160 4v
//
// Librerías necesarias (ya vienen incluidas con el ESP32 en Arduino IDE):
//   - BLEDevice   ← incluida en el paquete ESP32
//   - BLEServer   ← incluida en el paquete ESP32
//   - ArduinoJson ← instalar: Sketch → Manage Libraries → "ArduinoJson"
//
// NO necesitas instalar nada extra para BLE si ya tienes el soporte
// de ESP32 instalado en Arduino IDE.
// ═══════════════════════════════════════════════════════════════════════════════

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include "config.h"

// ── Variables globales ─────────────────────────────────────────────────────────
BLEServer*          pServer        = nullptr;
BLECharacteristic*  pCharacteristic = nullptr;
bool                deviceConnected = false;
bool                prevConnected   = false;
unsigned long       ultimoEnvio    = 0;

// ═══════════════════════════════════════════════════════════════════════════════
// CALLBACKS DE CONEXIÓN
// Se ejecutan automáticamente cuando el celular se conecta o desconecta
// ═══════════════════════════════════════════════════════════════════════════════
class ServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) override {
    deviceConnected = true;
    Serial.println("✓ Celular conectado por BLE");
    // Detener el advertising al conectarse (solo 1 cliente a la vez)
    BLEDevice::getAdvertising()->stop();
  }

  void onDisconnect(BLEServer* pServer) override {
    deviceConnected = false;
    Serial.println("✗ Celular desconectado");
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// LECTURA DEL ADC CON PROMEDIADO
// ═══════════════════════════════════════════════════════════════════════════════
float leerADC(uint8_t pin) {
  long suma = 0;
  for (int i = 0; i < MUESTRAS_PROMEDIO; i++) {
    suma += analogRead(pin);
    delayMicroseconds(50);
  }
  return (float)suma / MUESTRAS_PROMEDIO * (3.3f / 4095.0f);
}

// ═══════════════════════════════════════════════════════════════════════════════
// LECTURA DE VOLTAJE
// Divisor resistivo: R1=54kΩ (27+27), R2=10kΩ → GPIO34
// ═══════════════════════════════════════════════════════════════════════════════
float leerVoltaje() {
  return leerADC(PIN_VOLTAJE) * FACTOR_VOLTAJE + OFFSET_VOLTAJE;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LECTURA DE CORRIENTE
// ACS712-30A → GPIO35, alimentado con 5V del LM2596
// ═══════════════════════════════════════════════════════════════════════════════
float leerCorriente() {
  float v = leerADC(PIN_CORRIENTE);
  float corriente = (v - ACS712_VREF) / ACS712_SENSIBILIDAD + OFFSET_CORRIENTE;
  return corriente < 0.0f ? 0.0f : corriente;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SETUP
// ═══════════════════════════════════════════════════════════════════════════════
void setup() {
  Serial.begin(115200);
  Serial.println("\n══════════════════════════════════");
  Serial.println("  Monitor Moto BLE — Apache 160 4v");
  Serial.println("══════════════════════════════════\n");

  // Configurar ADC
  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);

  // ── Inicializar BLE ────────────────────────────────────────────────────────
  BLEDevice::init(BLE_DEVICE_NAME);
  Serial.printf("Dispositivo BLE: '%s'\n", BLE_DEVICE_NAME);

  // Crear servidor BLE
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new ServerCallbacks());

  // Crear servicio
  BLEService* pService = pServer->createService(SERVICE_UUID);

  // Crear característica con propiedad NOTIFY
  // NOTIFY = el ESP32 envía datos al celular sin que este los pida
  pCharacteristic = pService->createCharacteristic(
    CHAR_UUID,
    BLECharacteristic::PROPERTY_READ   |
    BLECharacteristic::PROPERTY_NOTIFY
  );

  // Descriptor necesario para que funcione NOTIFY en iOS y Android
  pCharacteristic->addDescriptor(new BLE2902());

  // Iniciar servicio
  pService->start();

  // Iniciar advertising (para que el celular pueda encontrar el ESP32)
  BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06); // ayuda con la conexión en iPhone
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();

  Serial.println("✓ BLE iniciado — esperando conexión del celular...");
  Serial.println("══════════════════════════════════\n");
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOOP
// ═══════════════════════════════════════════════════════════════════════════════
void loop() {
  unsigned long ahora = millis();

  // ── Reiniciar advertising si el celular se desconectó ─────────────────────
  // Esto permite que el celular vuelva a conectarse sin reiniciar el ESP32
  if (!deviceConnected && prevConnected) {
    delay(500); // pequeña pausa antes de reiniciar
    pServer->startAdvertising();
    Serial.println("→ Advertising reiniciado — listo para reconectar");
    prevConnected = false;
  }
  if (deviceConnected && !prevConnected) {
    prevConnected = true;
  }

  // ── Enviar datos cada SEND_INTERVAL ms ────────────────────────────────────
  if (ahora - ultimoEnvio >= SEND_INTERVAL) {
    ultimoEnvio = ahora;

    float voltaje   = leerVoltaje();
    float corriente = leerCorriente();

    // Construir JSON: {"voltage":12.6,"current":3.2,"timestamp":123456}
    String json = "{\"v\":" + String(voltaje, 2) + ",\"i\":" + String(corriente, 2) + "}";

    // Enviar por BLE solo si hay un cliente conectado
    if (deviceConnected) {
      pCharacteristic->setValue(json.c_str());
      pCharacteristic->notify();
    }

    // Log en Serial Monitor
    Serial.printf("JSON: %s | BLE: %s\n",
      json.c_str(),
      deviceConnected ? "conectado" : "esperando..."
    );

    // Alertas en Serial
    if (voltaje   < VOLTAJE_MIN)   Serial.println("  ⚠ Voltaje crítico bajo");
    if (voltaje   > VOLTAJE_MAX)   Serial.println("  ⚠ Sobrevoltaje");
    if (corriente > CORRIENTE_MAX) Serial.println("  ⚠ Sobrecorriente");
  }
}
