// ═══════════════════════════════════════════════════════════════════════════════
// useNotifications.js — Notificaciones push de alertas
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Configurar cómo se muestran las notificaciones cuando la app está abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  false,
  }),
});

async function requestPermissions() {
  if (!Device.isDevice) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

async function sendAlert(title, body) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: null, // inmediata
  });
}

export function useNotifications(alerts) {
  const prevAlertsRef = useRef([]);
  const permissionRef = useRef(false);

  // Pedir permisos al montar
  useEffect(() => {
    requestPermissions().then((ok) => {
      permissionRef.current = ok;
      if (!ok) console.warn('Permisos de notificación denegados');
    });
  }, []);

  // Detectar alertas nuevas y notificar
  useEffect(() => {
    if (!permissionRef.current) return;
    if (!alerts || alerts.length === 0) {
      prevAlertsRef.current = [];
      return;
    }

    // Solo notificar alertas que no existían antes
    const prevMsgs = prevAlertsRef.current.map((a) => a.msg);
    const nuevas   = alerts.filter((a) => !prevMsgs.includes(a.msg));

    nuevas.forEach((alerta) => {
      const title = alerta.tipo === 'danger' ? '🚨 Alerta crítica' : '⚠️ Advertencia';
      sendAlert(title, alerta.msg);
    });

    prevAlertsRef.current = alerts;
  }, [alerts]);
}