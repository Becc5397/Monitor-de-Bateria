// ═══════════════════════════════════════════════════════════════════════════════
// useNotifications.js — Alertas push + notificación persistente de voltaje
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

const PERSISTENT_ID = 'moto-monitor-persistent';

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
    trigger: null,
  });
}

async function updatePersistentNotification(voltage, current, connected) {
  // Cancela la anterior
  await Notifications.dismissNotificationAsync(PERSISTENT_ID).catch(() => {});

  const title = connected
    ? `🏍️ ${voltage?.toFixed(2) ?? '--'} V · ${current?.toFixed(2) ?? '--'} A`
    : '🏍️ Monitor de Batería';

  const body = connected
    ? `Batería monitoreada · Toca para abrir`
    : 'Buscando dispositivo BLE...';

  await Notifications.scheduleNotificationAsync({
    identifier: PERSISTENT_ID,
    content: {
      title,
      body,
      sticky: true,    // ← no se descarta con swipe
      ongoing: true,   // ← siempre visible
      sound: false,    // ← sin sonido para la persistente
    },
    trigger: null,
  });
}

export function useNotifications(alerts, voltage, current, connected) {
  const prevAlertsRef = useRef([]);
  const permissionRef = useRef(false);

  // Pedir permisos al montar
  useEffect(() => {
    requestPermissions().then((ok) => {
      permissionRef.current = ok;
    });

    // Limpiar notificación persistente al desmontar
    return () => {
      Notifications.dismissNotificationAsync(PERSISTENT_ID).catch(() => {});
    };
  }, []);

  // Actualizar notificación persistente cuando cambian voltage/current
  useEffect(() => {
    if (!permissionRef.current) return;
    updatePersistentNotification(voltage, current, connected);
  }, [voltage, current, connected]);

  // Detectar alertas nuevas
  useEffect(() => {
    if (!permissionRef.current) return;
    if (!alerts || alerts.length === 0) {
      prevAlertsRef.current = [];
      return;
    }

    const prevMsgs = prevAlertsRef.current.map((a) => a.msg);
    const nuevas   = alerts.filter((a) => !prevMsgs.includes(a.msg));

    nuevas.forEach((alerta) => {
      const title = alerta.tipo === 'danger' ? '🚨 Alerta crítica' : '⚠️ Advertencia';
      sendAlert(title, alerta.msg);
    });

    prevAlertsRef.current = alerts;
  }, [alerts]);
}