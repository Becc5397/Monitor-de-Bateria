// ═══════════════════════════════════════════════════════════════════════════════
// useBLE.js — Monitor BLE usando configuración dinámica
// ═══════════════════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { BleManager, State } from "react-native-ble-plx";
import { decode } from "base-64";
import { voltajePorcentaje } from "../utils/batteryPercent";

async function requestBLEPermissions() {
  if (Platform.OS !== "android") return true;
  try {
    if (Platform.Version >= 31) {
      const results = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      return Object.values(results).every(
        (r) => r === PermissionsAndroid.RESULTS.GRANTED
      );
    }
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.error("Error permisos BLE:", err);
    return false;
  }
}

const SERVICE_UUID = "12345678-1234-1234-1234-123456789abc";
const CHAR_UUID    = "abcd1234-ab12-ab12-ab12-abcdef123456";
const MAX_HISTORY  = 60;

// ← recibe config como parámetro
export function useBLE(config) {
  const [connected,  setConnected]  = useState(false);
  const [voltage,    setVoltage]    = useState(null);
  const [current,    setCurrent]    = useState(null);
  const [power,      setPower]      = useState(null);
  const [batteryPct, setBatteryPct] = useState(null);
  const [history,    setHistory]    = useState([]);
  const [alerts,     setAlerts]     = useState([]);

  const deviceRef  = useRef(null);
  const monitorRef = useRef(null);
  const scanRef    = useRef(false);
  const managerRef = useRef(new BleManager());

  // Refs para setters
  const setHistoryRef    = useRef(setHistory);
  const setVoltageRef    = useRef(setVoltage);
  const setCurrentRef    = useRef(setCurrent);
  const setPowerRef      = useRef(setPower);
  const setBatteryPctRef = useRef(setBatteryPct);
  const setAlertsRef     = useRef(setAlerts);
  const setConnectedRef  = useRef(setConnected);

  // Config en ref para que handleData siempre tenga el valor más reciente
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const handleData = useRef((char) => {
    if (!char?.value) return;
    try {
      const json = decode(char.value);
      const data = JSON.parse(json);

      const v = parseFloat(data.v ?? data.voltage);
      const i = parseFloat(data.i ?? data.current);
      if (isNaN(v) || isNaN(i)) return;

      // Usa config desde ref — siempre actualizado
      const cfg = configRef.current;

      setVoltageRef.current(v);
      setCurrentRef.current(i);
      setPowerRef.current(parseFloat((v * i).toFixed(2)));
      setBatteryPctRef.current(voltajePorcentaje(v));

      const a = [];
      if (v < cfg.voltajeMin)
        a.push({ tipo: "danger",  msg: `Voltaje crítico < ${cfg.voltajeMin}V` });
      if (v > cfg.voltajeMax)
        a.push({ tipo: "danger",  msg: `Sobrevoltaje > ${cfg.voltajeMax}V` });
      if (i > cfg.corrienteMax)
        a.push({ tipo: "danger",  msg: `Sobrecorriente > ${cfg.corrienteMax}A` });
      else if (i > cfg.corrienteAlta)
        a.push({ tipo: "warning", msg: `Corriente alta > ${cfg.corrienteAlta}A` });
      if (v < cfg.bateriaBaja && v >= cfg.voltajeMin)
        a.push({ tipo: "warning", msg: `Batería baja < ${cfg.bateriaBaja}V` });
      setAlertsRef.current(a);

      setHistoryRef.current((prev) => {
        const next = [...prev, { voltage: v, current: i, timestamp: Date.now() }];
        return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
      });
    } catch (e) {
      console.error("Error BLE:", e.message);
    }
  }).current;

  const startScanRef = useRef(null);

  const connectDevice = useRef(async (device) => {
    try {
      console.log("Conectando...");
      const dev = await device.connect({ autoConnect: false, timeout: 15000 });
      await dev.discoverAllServicesAndCharacteristics();
      await new Promise((r) => setTimeout(r, 600));

      deviceRef.current = dev;
      setConnectedRef.current(true);
      console.log("Conectado!");

      const monitor = dev.monitorCharacteristicForService(
        SERVICE_UUID,
        CHAR_UUID,
        (err, char) => {
          if (err) {
            console.error("Monitor error:", err.message);
            setConnectedRef.current(false);
            deviceRef.current = null;
            setTimeout(() => startScanRef.current?.(), 2000);
            return;
          }
          handleData(char);
        }
      );
      monitorRef.current = monitor;
    } catch (err) {
      console.error("Error conexión:", err.message);
      setConnectedRef.current(false);
      setTimeout(() => startScanRef.current?.(), 2000);
    }
  }).current;

  startScanRef.current = () => {
    if (scanRef.current) return;
    scanRef.current = true;
    const manager = managerRef.current;
    // Usa el nombre BLE de la config
    const deviceName = configRef.current.bleDeviceName;
    console.log("Escaneando por:", deviceName);

    setTimeout(() => {
      manager.startDeviceScan(
        null,
        { allowDuplicates: false },
        (error, device) => {
          if (error) {
            console.error("Error escaneo:", error.message);
            scanRef.current = false;
            return;
          }
          if (device?.name === deviceName) {
            manager.stopDeviceScan();
            scanRef.current = false;
            connectDevice(device);
          }
        }
      );
    }, 1000);
  };

  useEffect(() => {
    const manager = managerRef.current;
    const sub = manager.onStateChange(async (state) => {
      if (state === State.PoweredOn) {
        sub.remove();
        const ok = await requestBLEPermissions();
        if (ok) startScanRef.current();
      }
    }, true);

    return () => {
      sub.remove();
      manager.stopDeviceScan();
      monitorRef.current?.remove();
      deviceRef.current?.cancelConnection().catch(() => {});
    };
  }, []);

  return { connected, voltage, current, power, batteryPct, history, alerts };
}