// ═══════════════════════════════════════════════════════════════════════════════
// PowerCard.jsx — Métricas derivadas para React Native (Expo)
// ═══════════════════════════════════════════════════════════════════════════════

import { View, Text, StyleSheet } from 'react-native';

// ── Componente ─────────────────────────────────────────────────────────────────
/**
 * PowerCard
 * Muestra potencia (W), porcentaje de batería, muestras e intervalo.
 *
 * @param {number|null} power      - potencia en W
 * @param {number|null} batteryPct - porcentaje de batería (0–100)
 * @param {number}      samples    - cantidad de muestras recibidas
 *
 * Ejemplo de uso:
 *   <PowerCard power={power} batteryPct={batteryPct} samples={sampleCount} />
 */
export default function PowerCard({ power, batteryPct, samples = 0 }) {
  const metrics = [
    {
      label: 'potencia',
      value: power != null ? power.toFixed(1) : '—',
      sub: 'vatios (W)',
    },
    {
      label: 'batería',
      value: batteryPct != null ? `${batteryPct}` : '—',
      sub: '% estimado',
    },
    {
      label: 'muestras',
      value: `${samples}`,
      sub: 'esta sesión',
    },
    {
      label: 'intervalo',
      value: '500',
      sub: 'ms / muestra',
    },
  ];

  return (
    <View style={styles.grid}>
      {metrics.map((m) => (
        <View key={m.label} style={styles.card}>
          <Text style={styles.label}>{m.label}</Text>
          <Text style={styles.value}>{m.value}</Text>
          <Text style={styles.sub}>{m.sub}</Text>
        </View>
      ))}
    </View>
  );
}

// ── Estilos ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 14,
    // Cada tarjeta ocupa ~50% del ancho menos el gap
    flexBasis: '47%',
    flexGrow: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 24,
    fontWeight: '500',
    fontFamily: 'monospace',
    color: '#1C1C1E',
    lineHeight: 28,
  },
  sub: {
    fontSize: 11,
    color: '#AEAEB2',
    marginTop: 2,
  },
});
