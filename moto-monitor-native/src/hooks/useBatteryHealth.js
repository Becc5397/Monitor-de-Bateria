// ═══════════════════════════════════════════════════════════════════════════════
// useBatteryHealth.js — Cálculo de salud de batería basado en historial
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HEALTH_KEY     = 'moto_battery_health';
const MAX_SESSIONS   = 30; // máximo de sesiones guardadas

// Curva de descarga de batería plomo-ácido NUEVA (referencia 100% salud)
const CURVA_NUEVA = [
  { v: 12.7, pct: 100 },
  { v: 12.5, pct: 85  },
  { v: 12.3, pct: 70  },
  { v: 12.1, pct: 55  },
  { v: 11.9, pct: 40  },
  { v: 11.7, pct: 25  },
  { v: 11.5, pct: 10  },
  { v: 11.0, pct: 0   },
];

// Voltaje máximo esperado en carga completa de batería nueva
const VOLTAJE_CARGA_NUEVA = 12.7;

function calcularSalud(sesiones) {
  if (sesiones.length < 3) return null;

  // Promedio de voltaje máximo alcanzado en cada sesión
  const voltajesMax = sesiones.map((s) => s.voltajeMax);
  const promedioMax = voltajesMax.reduce((a, b) => a + b, 0) / voltajesMax.length;

  // Salud = qué tan cerca está el voltaje máximo del esperado en batería nueva
  const salud = Math.min(100, Math.round((promedioMax / VOLTAJE_CARGA_NUEVA) * 100));

  // Estimación de vida útil restante
  // Batería plomo-ácido dura ~300-500 ciclos; consideramos 400 como referencia
  const ciclosEstimados = Math.round((salud / 100) * 400);

  // Tendencia — comparar últimas 3 sesiones vs anteriores
  let tendencia = 'estable';
  if (sesiones.length >= 6) {
    const recientes  = sesiones.slice(-3).map((s) => s.voltajeMax);
    const anteriores = sesiones.slice(-6, -3).map((s) => s.voltajeMax);
    const promReciente  = recientes.reduce((a, b) => a + b, 0)  / recientes.length;
    const promAnterior  = anteriores.reduce((a, b) => a + b, 0) / anteriores.length;
    if (promReciente < promAnterior - 0.1)  tendencia = 'bajando';
    if (promReciente > promAnterior + 0.05) tendencia = 'mejorando';
  }

  return { salud, ciclosEstimados, promedioMax, tendencia };
}

export function useBatteryHealth(voltage) {
  const [sesiones,    setSesiones]    = useState([]);
  const [health,      setHealth]      = useState(null);
  const [sessionData, setSessionData] = useState({ voltajeMax: 0, voltajeMin: 99, muestras: 0 });

  // Cargar historial de sesiones al iniciar
  useEffect(() => {
    AsyncStorage.getItem(HEALTH_KEY)
      .then((raw) => {
        if (raw) {
          const data = JSON.parse(raw);
          setSesiones(data);
          setHealth(calcularSalud(data));
        }
      })
      .catch((e) => console.error('Error cargando health:', e));
  }, []);

  // Acumular datos de la sesión actual
  useEffect(() => {
    if (voltage === null || isNaN(voltage)) return;
    setSessionData((prev) => ({
      voltajeMax: Math.max(prev.voltajeMax, voltage),
      voltajeMin: Math.min(prev.voltajeMin, voltage),
      muestras:   prev.muestras + 1,
    }));
  }, [voltage]);

  // Guardar sesión al salir / cuando hay suficientes muestras
  const saveSession = useCallback(async () => {
    if (sessionData.muestras < 10) return; // sesión muy corta, ignorar

    const nuevaSesion = {
      fecha:      Date.now(),
      voltajeMax: sessionData.voltajeMax,
      voltajeMin: sessionData.voltajeMin,
      muestras:   sessionData.muestras,
    };

    const nuevasSesiones = [...sesiones, nuevaSesion].slice(-MAX_SESSIONS);

    try {
      await AsyncStorage.setItem(HEALTH_KEY, JSON.stringify(nuevasSesiones));
      setSesiones(nuevasSesiones);
      setHealth(calcularSalud(nuevasSesiones));
    } catch (e) {
      console.error('Error guardando sesión:', e);
    }
  }, [sesiones, sessionData]);

  // Guardar sesión automáticamente cada 5 minutos
  useEffect(() => {
    const interval = setInterval(saveSession, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [saveSession]);

  return { health, sesiones, saveSession };
}