// ═══════════════════════════════════════════════════════════════════════════════
// AlertPanel.jsx — Panel de alertas para React Native (Expo)
// ═══════════════════════════════════════════════════════════════════════════════

import { View, Text, StyleSheet } from 'react-native';

// ── Configuración de estilos por tipo ──────────────────────────────────────────
const ALERT_STYLES = {
  danger: {
    container: { backgroundColor: '#FCEBEB', borderColor: '#F09595' },
    text:      { color: '#791F1F' },
    icon:      '⚠️',
  },
  warning: {
    container: { backgroundColor: '#FAEEDA', borderColor: '#FAC775' },
    text:      { color: '#633806' },
    icon:      '⚡',
  },
};

// ── Componente ─────────────────────────────────────────────────────────────────
/**
 * AlertPanel
 * Muestra las alertas activas que vienen del hook useWebSocket.
 *
 * @param {Array} alerts - array de alertas: [{ tipo: 'danger'|'warning', msg: string }]
 *
 * Ejemplo de uso:
 *   <AlertPanel alerts={alerts} />
 */
export default function AlertPanel({ alerts = [] }) {
  if (alerts.length === 0) {
    return (
      <View style={styles.noneContainer}>
        <Text style={styles.noneText}>✓  sin alertas activas</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {alerts.map((alert, idx) => {
        const cfg = ALERT_STYLES[alert.tipo] ?? ALERT_STYLES.warning;
        return (
          <View
            key={idx}
            style={[styles.alertItem, cfg.container]}
          >
            <Text style={styles.icon}>{cfg.icon}</Text>
            <Text style={[styles.alertText, cfg.text]}>{alert.msg}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ── Estilos ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 0.5,
  },
  icon: {
    fontSize: 16,
  },
  alertText: {
    fontSize: 13,
    fontWeight: '500',
    flexShrink: 1,
  },
  noneContainer: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  noneText: {
    fontSize: 12,
    color: '#8E8E93',
  },
});
