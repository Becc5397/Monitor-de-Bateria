import { useState, useEffect, useRef, useCallback } from 'react';
import { voltajePorcentaje } from '../utils/batteryPercent';

// ── Configuración ──────────────────────────────────────────────────────────────
// Cambia esta IP por la de tu ESP32 cuando lo tengas conectado
const DEFAULT_URL = 'ws://192.168.1.100:81';

// Cuántos puntos guarda el historial (~30 s a 500 ms por muestra)
const MAX_HISTORY = 60;

// ── Simulación ─────────────────────────────────────────────────────────────────
// Genera datos falsos con pequeñas variaciones, igual que el sensor real
function generarDatoSimulado(prev) {
  const voltage = parseFloat(
    Math.min(15.0, Math.max(10.5,
      (prev?.voltage ?? 12.6) + (Math.random() - 0.5) * 0.2
    )).toFixed(2)
  );
  const current = parseFloat(
    Math.min(11.0, Math.max(0.1,
      (prev?.current ?? 3.2) + (Math.random() - 0.5) * 0.35
    )).toFixed(2)
  );
  return { voltage, current, timestamp: Date.now() };
}

// ── Hook principal ─────────────────────────────────────────────────────────────
/**
 * useWebSocket
 * @param {string}  url      - URL del WebSocket del ESP32  (ej: 'ws://192.168.1.100:81')
 * @param {boolean} simulate - true = datos simulados (desarrollo sin ESP32)
 *
 * Retorna:
 *   connected   {boolean}        - estado de la conexión
 *   voltage     {number|null}    - voltaje en V
 *   current     {number|null}    - corriente en A
 *   power       {number|null}    - potencia en W (V × I)
 *   batteryPct  {number|null}    - % estimado de batería
 *   history     {Array}          - últimos MAX_HISTORY puntos [{voltage, current, timestamp}]
 *   alerts      {Array}          - alertas activas [{tipo: 'danger'|'warning', msg: string}]
 */
export function useWebSocket(url = DEFAULT_URL, simulate = false) {
  const [connected,  setConnected]  = useState(false);
  const [voltage,    setVoltage]    = useState(null);
  const [current,    setCurrent]    = useState(null);
  const [history,    setHistory]    = useState([]);
  const [alerts,     setAlerts]     = useState([]);

  const wsRef   = useRef(null);
  const prevRef = useRef(null);

  // Valores derivados (calculados en cada render)
  const power      = voltage != null && current != null
    ? parseFloat((voltage * current).toFixed(2))
    : null;
  const batteryPct = voltage != null
    ? voltajePorcentaje(voltage)
    : null;

  // Evalúa alertas según los umbrales de la TVS Apache 160 4v (batería 9A)
  const evaluarAlertas = useCallback((v, i) => {
    const nuevas = [];

    if      (v < 11.5) nuevas.push({ tipo: 'danger',  msg: 'Voltaje crítico < 11.5V' });
    else if (v < 12.0) nuevas.push({ tipo: 'warning', msg: 'Batería baja < 12.0V' });

    if (v > 14.8) nuevas.push({ tipo: 'danger',  msg: 'Sobrevoltaje > 14.8V — revisar alternador' });

    if      (i > 9) nuevas.push({ tipo: 'danger',  msg: 'Sobrecorriente > 9A — límite de la batería' });
    else if (i > 7) nuevas.push({ tipo: 'warning', msg: 'Corriente alta > 7A' });

    setAlerts(nuevas);
  }, []);

  // Procesa un paquete recibido: { voltage, current, timestamp }
  const procesarDato = useCallback((dato) => {
    prevRef.current = dato;
    setVoltage(dato.voltage);
    setCurrent(dato.current);
    setHistory(h => {
      const siguiente = [...h, dato];
      return siguiente.length > MAX_HISTORY
        ? siguiente.slice(siguiente.length - MAX_HISTORY)
        : siguiente;
    });
    evaluarAlertas(dato.voltage, dato.current);
  }, [evaluarAlertas]);

  useEffect(() => {
    if (simulate) {
      // ── Modo simulación ────────────────────────────────────────────────────
      setConnected(true);
      const intervalo = setInterval(() => {
        procesarDato(generarDatoSimulado(prevRef.current));
      }, 500);
      return () => clearInterval(intervalo);
    }

    // ── Modo real: WebSocket al ESP32 ─────────────────────────────────────────
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen    = () => setConnected(true);
    ws.onclose   = () => setConnected(false);
    ws.onerror   = () => setConnected(false);
    ws.onmessage = (e) => {
      try {
        const dato = JSON.parse(e.data);
        // Valida que el paquete tenga los campos esperados
        if (typeof dato.voltage === 'number' && typeof dato.current === 'number') {
          procesarDato(dato);
        }
      } catch (_) {
        // Mensaje inválido — ignorar silenciosamente
      }
    };

    return () => ws.close();
  }, [url, simulate, procesarDato]);

  return { connected, voltage, current, power, batteryPct, history, alerts };
}
