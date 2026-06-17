# 🏍️ Monitor de Batería — Apache 160 4v

Monitor en tiempo real del sistema eléctrico de motocicletas mediante BLE (Bluetooth Low Energy). Un ESP32 lee voltaje y corriente, los envía por BLE y la app React Native los muestra en gauges, métricas, gráfica histórica y notificaciones en tiempo real.

---

## 📱 Capturas de pantalla

<p align="center">
  <img src="docs/screenshot-gauges.png" width="220"/>
  <img src="docs/screenshot-chart.png" width="220"/>
  <img src="docs/screenshot-health.png" width="220"/>
</p>

---

## ✅ Funcionalidades

### App móvil
- 📡 Conexión BLE automática y reconexión sin intervención del usuario
- ⚡ Gauges de voltaje y corriente en tiempo real
- 📊 Gráfica histórica de los últimos 60 puntos (~30 segundos)
- 🔔 Alertas de voltaje crítico, sobrevoltaje, sobrecorriente y batería baja
- 🔋 Porcentaje de batería calculado por curva de descarga real
- 💡 Potencia calculada en tiempo real (V × A)
- 🧠 Salud de batería — historial de sesiones, tendencia y recomendación
- 🔔 Notificaciones push de alertas aunque la app esté en segundo plano
- 📌 Notificación persistente con voltaje y corriente siempre visible
- ⚙️ Configuración universal sin recompilar la APK
- 🧙 Wizard de primera conexión — guía paso a paso para nuevos usuarios

### Configuración universal (sin recompilar)
Desde la pantalla de configuración el usuario puede cambiar:
- Nombre del dispositivo BLE
- Nombre del vehículo
- Voltaje mínimo, máximo y alerta de batería baja
- Corriente máxima y alerta de corriente alta
- Tipo de batería (plomo-ácido o litio)

---

## 🗂️ Estructura del repositorio

```
Monitor-de-Bateria/
├── moto-monitor-native/          # App React Native (Expo)
│   ├── src/
│   │   ├── app/
│   │   │   ├── index.jsx         # Pantalla principal
│   │   │   └── config.jsx        # Pantalla de configuración
│   │   ├── components/
│   │   │   ├── GaugeCard.jsx
│   │   │   ├── RealtimeChart.jsx
│   │   │   ├── AlertPanel.jsx
│   │   │   ├── PowerCard.jsx
│   │   │   ├── ConnectionStatus.jsx
│   │   │   ├── BatteryHealthCard.jsx
│   │   │   └── WizardScreen.jsx
│   │   ├── hooks/
│   │   │   ├── useBLE.js
│   │   │   ├── useConfig.js
│   │   │   ├── useFirstLaunch.js
│   │   │   ├── useNotifications.js
│   │   │   └── useBatteryHealth.js
│   │   └── utils/
│   │       └── batteryPercent.js
│   └── app.json
└── moto-monitor-ble/             # Firmware ESP32 (Arduino IDE)
    ├── moto_monitor_ble.ino
    └── config.h
```

---

## 🔧 Hardware necesario

| Componente | Descripción |
|---|---|
| ESP32 (cualquier variante) | Microcontrolador con BLE integrado |
| ACS712-30A | Sensor de corriente por efecto Hall |
| LM2596 | Regulador step-down 5V para alimentar el ACS712 |
| Resistor 27kΩ × 2 | R1 del divisor de voltaje (en serie = 54kΩ) |
| Resistor 10kΩ | R2 del divisor de voltaje |
| Cables y protoboard | Conexiones |

> ⚠️ El sellado del módulo contra humedad (lluvia y lavados) está en proceso de resolución para instalación definitiva en la moto.

---

## ⚡ Diagrama de conexiones

```
Batería 12V ──┬──── R1 (27kΩ + 27kΩ) ──── R2 (10kΩ) ──── GND
              │                        │
              │                     GPIO34 (ESP32) ← lectura voltaje
              │
              └──── ACS712 (línea de corriente) ──── VOUT ──── GPIO35 (ESP32)
                         │
                      LM2596 ──── 5V ──── VCC ACS712
```

**Pines ESP32:**
- `GPIO34` — Voltaje (divisor resistivo)
- `GPIO35` — Corriente (ACS712 VOUT)

**Calibración por defecto:**
- `FACTOR_VOLTAJE = 6.4`
- `OFFSET_VOLTAJE = 1.00` (ajustado con multímetro)
- `ACS712_SENSIBILIDAD = 0.066 V/A` (modelo 30A)
- `ACS712_VREF = 2.5V`

---

## 🚀 Cómo flashear el ESP32

### Requisitos
- Arduino IDE 2.x
- Soporte ESP32 instalado (Boards Manager → `esp32` by Espressif)
- Librería **ArduinoJson** (Sketch → Manage Libraries)

### Pasos
1. Abre `moto-monitor-ble/moto_monitor_ble.ino` en Arduino IDE
2. Revisa `config.h` y ajusta pines, nombre BLE y calibración si es necesario
3. Selecciona tu placa ESP32 en `Tools → Board`
4. Conecta el ESP32 por USB y selecciona el puerto
5. Sube el sketch (`Ctrl+U`)
6. Abre el Serial Monitor a `115200 baudios` para verificar

---

## 📲 Cómo instalar y correr la app

### Requisitos
- Node.js 18+
- Expo CLI: `npm install -g expo`
- EAS CLI: `npm install -g eas-cli`
- Android con Bluetooth habilitado

### Desarrollo local
```bash
cd moto-monitor-native
npm install
npx expo start
```

> La app requiere un **Development Build** (no funciona en Expo Go por BLE).

### Generar APK
```bash
eas build --platform android --profile preview
```

El APK se descarga desde el dashboard de EAS y se instala directamente en el celular.

---

## 📡 Configuración BLE

Los UUIDs deben coincidir exactamente entre el ESP32 y la app:

| Variable | UUID |
|---|---|
| `SERVICE_UUID` | `12345678-1234-1234-1234-123456789abc` |
| `CHAR_UUID` | `abcd1234-ab12-ab12-ab12-abcdef123456` |
| Nombre dispositivo | Configurable desde la app (por defecto `MotoMonitor`) |

Para usar la app en múltiples motos, cada ESP32 debe tener un nombre BLE diferente en `config.h` y el usuario lo configura desde la pantalla de ajustes sin recompilar.

---

## 🛠️ Stack tecnológico

**App móvil:**
- React Native + Expo (Expo Router)
- `react-native-ble-plx` — comunicación BLE
- `react-native-svg` — gráfica personalizada
- `@react-native-async-storage/async-storage` — persistencia local
- `expo-notifications` — notificaciones push y persistente
- `expo-device` — detección de dispositivo físico
- `base-64` — decodificación de paquetes BLE
- EAS Build — generación del APK

**Firmware:**
- ESP32 + Arduino IDE
- `BLEDevice` / `BLEServer` / `BLE2902` — servidor BLE nativo
- JSON compacto `{"v":12.6,"i":3.2}` dentro del límite BLE

---

## 🔋 Salud de batería

La app acumula el voltaje máximo alcanzado en cada sesión de uso. Con un mínimo de 3 sesiones calcula:

- **Porcentaje de salud** — comparando el voltaje máximo real vs el esperado en batería nueva (12.7V)
- **Tendencia** — estable, bajando o mejorando comparando las últimas sesiones
- **Ciclos estimados restantes** — basado en la vida útil de referencia de 400 ciclos
- **Recomendación** — buen estado, revisión pronto, o reemplazo próximo

---

## 👤 Autor

**Boris Hernández (Boricuas)** — Técnico en electrónica marina, TMR Yacht, Cartagena, Colombia.
En transición hacia el desarrollo de software.

🔗 [GitHub](https://github.com/Becc5397) · [LinkedIn](https://www.linkedin.com/in/boris-hernández)

---

## 📄 Licencia

MIT — libre de usar, modificar y distribuir.