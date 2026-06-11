// ═══════════════════════════════════════════════════════════════════════════════
// useConfig.js — Configuración universal de la app (AsyncStorage)
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CONFIG_KEY = 'moto_monitor_config';

export const CONFIG_DEFAULT = {
  // BLE
  bleDeviceName:   'MotoMonitor',
  // Vehículo
  vehicleName:     'Apache 160 4v',
  // Voltaje
  voltajeMin:      11.5,
  voltajeMax:      14.8,
  bateriaBaja:     12.0,
  // Corriente
  corrienteMax:    9.0,
  corrienteAlta:   7.0,
  // Tipo de batería
  tipoBateria:     'plomo', // 'plomo' | 'litio'
};

export function useConfig() {
  const [config, setConfig]   = useState(CONFIG_DEFAULT);
  const [loading, setLoading] = useState(true);

  // Cargar config guardada al iniciar
  useEffect(() => {
    AsyncStorage.getItem(CONFIG_KEY)
      .then((raw) => {
        if (raw) {
          // Mezcla con defaults para no perder campos nuevos
          setConfig({ ...CONFIG_DEFAULT, ...JSON.parse(raw) });
        }
      })
      .catch((e) => console.error('Error cargando config:', e))
      .finally(() => setLoading(false));
  }, []);

  // Guardar config completa
  const saveConfig = useCallback(async (newConfig) => {
    const merged = { ...config, ...newConfig };
    try {
      await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(merged));
      setConfig(merged);
      return true;
    } catch (e) {
      console.error('Error guardando config:', e);
      return false;
    }
  }, [config]);

  // Resetear a defaults
  const resetConfig = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(CONFIG_KEY);
      setConfig(CONFIG_DEFAULT);
    } catch (e) {
      console.error('Error reseteando config:', e);
    }
  }, []);

  return { config, loading, saveConfig, resetConfig };
}