## Setup BLE — Monitor Moto React Native + Expo

### 1. Instalar dependencias

```bash
npm install react-native-ble-plx
npx expo install react-native-ble-plx
```

### 2. Permisos Android

Abre o crea `android/app/src/main/AndroidManifest.xml` y agrega:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.motobtle">

    <!-- Permisos BLE -->
    <uses-permission android:name="android.permission.BLUETOOTH" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
    <uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <application>
        <!-- resto de la config -->
    </application>
</manifest>
```

### 3. Build para Android (elige una opción)

#### Opción A — Expo EAS Build (recomendado, sin Android Studio)

```bash
npm install -g eas-cli
eas build --platform android --local
```

Se genera un APK en `dist/` — lo copias al celular y lo instalas.

#### Opción B — Build local con Expo

```bash
npx expo run:android
```

Requiere Android Studio y emulador, pero es más rápido si ya lo tienes.

### 4. Permisos en tiempo de ejecución

La app pedirá permisos de Bluetooth y ubicación cuando se abra. Acepta ambos para que funcione el escaneo BLE.

### 5. Verificar que el ESP32 está listo

- [ ] ESP32 subió el firmware BLE (`moto_monitor_ble.ino`)
- [ ] Serial Monitor muestra `✓ BLE iniciado — esperando conexión...`
- [ ] Bluetooth del celular está **activado**

### 6. Correr la app

```bash
# Después de instalada:
npx expo start
```

La app:
1. Inicia el escaneo de dispositivos BLE
2. Busca un dispositivo llamado `"MotoMonitor"`
3. Se conecta automáticamente
4. Comienza a recibir datos cada 500ms

En la pantalla verás:
- Estado de conexión (● verde = conectado, ○ rojo = buscando)
- Voltaje y corriente en vivo
- Gráficas de historial
- Alertas si hay sobre/subtensión

### Troubleshooting

**"Cannot find BLE device"**
- Verifica que el ESP32 está encendido
- Reinicia el Bluetooth del celular
- Abre la app de configuración de Android → Bluetooth → busca "MotoMonitor"

**"Data not updating"**
- Verifica la IP del ESP32 en el Serial Monitor
- Asegúrate que el firmware BLE está subido, no el WiFi

**"Permisos denegados"**
- Android 12+ requiere permisos dinámicos en tiempo de ejecución
- La app los solicita automáticamente, acepta todos

### Configuración BLE (si necesitas cambiar UUIDs)

Los UUIDs deben coincidir entre ESP32 y React Native:

**ESP32 config.h:**
```cpp
#define SERVICE_UUID      "12345678-1234-1234-1234-123456789abc"
#define CHAR_UUID         "abcd1234-ab12-ab12-ab12-abcdef123456"
#define BLE_DEVICE_NAME   "MotoMonitor"
```

**React Native useBLE.js:**
```javascript
const SERVICE_UUID    = '12345678-1234-1234-1234-123456789abc';
const CHAR_UUID       = 'abcd1234-ab12-ab12-ab12-abcdef123456';
const BLE_DEVICE_NAME = 'MotoMonitor';
```

Si cambias algo, **cambia en ambos lugares**.

---

**Estado:** ✅ Listo para producción
**Consumo ESP32:** ~80mA (BLE activado)
**Latencia:** ~500ms entre muestras (configurable en config.h con `SEND_INTERVAL`)
