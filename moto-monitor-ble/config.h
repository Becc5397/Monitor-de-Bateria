// ═══════════════════════════════════════════════════════════════════════════════
// config.h — Configuración BLE para monitor de motocicleta TVS Apache 160 4v
// ═══════════════════════════════════════════════════════════════════════════════

#ifndef CONFIG_H
#define CONFIG_H

// ── Identificación BLE ─────────────────────────────────────────────────────────
// Nombre que verá el celular al escanear dispositivos Bluetooth
#define BLE_DEVICE_NAME   "MotoMonitor"

// UUIDs del servicio y característica BLE
// Estos deben coincidir EXACTAMENTE con los del hook useBLE en React Native
// Puedes generar los tuyos en: https://www.uuidgenerator.net/
#define SERVICE_UUID      "12345678-1234-1234-1234-123456789abc"
#define CHAR_UUID         "abcd1234-ab12-ab12-ab12-abcdef123456"

// ── Intervalo de envío ─────────────────────────────────────────────────────────
#define SEND_INTERVAL     500   // milisegundos entre cada notificación BLE

// ── Pines del ESP32 ────────────────────────────────────────────────────────────
#define PIN_VOLTAJE       34    // GPIO34 — divisor resistivo
#define PIN_CORRIENTE     35    // GPIO35 — ACS712 VOUT

// ── Calibración voltaje ────────────────────────────────────────────────────────
// R1 = 27kΩ + 27kΩ en serie = 54kΩ, R2 = 10kΩ
#define FACTOR_VOLTAJE    6.4f
#define OFFSET_VOLTAJE    1.00f  // ajustado con multímetro

// ── Calibración corriente ACS712-30A ──────────────────────────────────────────
#define ACS712_SENSIBILIDAD  0.066f   // 30A = 66 mV/A
#define ACS712_VREF          2.5f
#define OFFSET_CORRIENTE     0.0f

// ── Promediado ADC ─────────────────────────────────────────────────────────────
#define MUESTRAS_PROMEDIO    20

// ── Límites de alerta ──────────────────────────────────────────────────────────
#define VOLTAJE_MIN   11.5f
#define VOLTAJE_MAX   14.8f
#define CORRIENTE_MAX  9.0f

#endif
