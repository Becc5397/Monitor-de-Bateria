// ═══════════════════════════════════════════════════════════════════════════════
// BatteryHealthCard.jsx — Tarjeta de salud de batería
// ═══════════════════════════════════════════════════════════════════════════════

import { View, Text, StyleSheet } from 'react-native';

function HealthBar({ value }) {
  const color = value >= 75 ? '#1D9E75' : value >= 50 ? '#EF9F27' : '#FF3B30';
  return (
    <View style={styles.barBg}>
      <View style={[styles.barFill, { width: `${value}%`, backgroundColor: color }]} />
    </View>
  );
}

function StatBox({ label, value, unit, color }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, color && { color }]}>{value}</Text>
      <Text style={styles.statUnit}>{unit}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const TENDENCIA_CONFIG = {
  estable:   { emoji: '→', color: '#8E8E93', label: 'Estable'   },
  bajando:   { emoji: '↓', color: '#FF3B30', label: 'Bajando'   },
  mejorando: { emoji: '↑', color: '#1D9E75', label: 'Mejorando' },
};

export default function BatteryHealthCard({ health, sesiones }) {
  // Sin suficientes datos aún
  if (!health) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>🔋 Salud de batería</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📊</Text>
          <Text style={styles.emptyTitle}>Acumulando datos...</Text>
          <Text style={styles.emptyDesc}>
            Se necesitan al menos 3 sesiones de uso para calcular la salud.
            {'\n'}Sesiones registradas: {sesiones.length}/3
          </Text>
          <View style={styles.barBg}>
            <View style={[styles.barFill, {
              width: `${(sesiones.length / 3) * 100}%`,
              backgroundColor: '#1D9E75'
            }]} />
          </View>
        </View>
      </View>
    );
  }

  const healthColor = health.salud >= 75 ? '#1D9E75' : health.salud >= 50 ? '#EF9F27' : '#FF3B30';
  const tendencia   = TENDENCIA_CONFIG[health.tendencia] ?? TENDENCIA_CONFIG.estable;

  const healthLabel =
    health.salud >= 75 ? 'Buena' :
    health.salud >= 50 ? 'Regular' :
    'Deteriorada';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>🔋 Salud de batería</Text>
        <View style={[styles.tendenciaBadge, { backgroundColor: tendencia.color + '20' }]}>
          <Text style={[styles.tendenciaText, { color: tendencia.color }]}>
            {tendencia.emoji} {tendencia.label}
          </Text>
        </View>
      </View>

      {/* Porcentaje principal */}
      <View style={styles.healthMain}>
        <Text style={[styles.healthPct, { color: healthColor }]}>
          {health.salud}%
        </Text>
        <Text style={[styles.healthLabel, { color: healthColor }]}>
          {healthLabel}
        </Text>
      </View>

      <HealthBar value={health.salud} />

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatBox
          label="Voltaje prom. máx."
          value={health.promedioMax.toFixed(2)}
          unit="V"
          color="#1D9E75"
        />
        <StatBox
          label="Ciclos estimados"
          value={health.ciclosEstimados}
          unit="ciclos"
          color="#0A84FF"
        />
        <StatBox
          label="Sesiones"
          value={sesiones.length}
          unit="registros"
        />
      </View>

      {/* Recomendación */}
      <View style={[styles.recomendacion, { borderLeftColor: healthColor }]}>
        <Text style={styles.recomendacionText}>
          {health.salud >= 75
            ? '✅ Batería en buen estado. Mantén el programa de carga actual.'
            : health.salud >= 50
            ? '⚠️ Batería con desgaste moderado. Considera revisarla pronto.'
            : '🚨 Batería deteriorada. Se recomienda reemplazo próximo.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card:             { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 0.5, borderColor: '#E5E5E5', padding: 16 },
  header:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title:            { fontSize: 15, fontWeight: '600', color: '#1C1C1E' },
  tendenciaBadge:   { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  tendenciaText:    { fontSize: 12, fontWeight: '600' },
  healthMain:       { alignItems: 'center', marginBottom: 12 },
  healthPct:        { fontSize: 52, fontWeight: '700', letterSpacing: -1 },
  healthLabel:      { fontSize: 16, fontWeight: '500', marginTop: -4 },
  barBg:            { height: 8, backgroundColor: '#F2F2F7', borderRadius: 99, overflow: 'hidden', marginBottom: 16 },
  barFill:          { height: '100%', borderRadius: 99 },
  statsRow:         { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statBox:          { alignItems: 'center', flex: 1 },
  statValue:        { fontSize: 20, fontWeight: '700', color: '#1C1C1E' },
  statUnit:         { fontSize: 11, color: '#8E8E93', marginTop: -2 },
  statLabel:        { fontSize: 11, color: '#AEAEB2', textAlign: 'center', marginTop: 2 },
  recomendacion:    { backgroundColor: '#F2F2F7', borderRadius: 10, padding: 12, borderLeftWidth: 3 },
  recomendacionText:{ fontSize: 13, color: '#1C1C1E', lineHeight: 18 },
  emptyContainer:   { alignItems: 'center', paddingVertical: 16, gap: 8 },
  emptyEmoji:       { fontSize: 36 },
  emptyTitle:       { fontSize: 15, fontWeight: '600', color: '#1C1C1E' },
  emptyDesc:        { fontSize: 13, color: '#8E8E93', textAlign: 'center', lineHeight: 18, marginBottom: 8 },
});