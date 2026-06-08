// ═══════════════════════════════════════════════════════════════════════════════
// GaugeCard.jsx — Gauge semicircular para React Native (Expo)
// Dependencia: npx expo install react-native-svg
// ═══════════════════════════════════════════════════════════════════════════════

import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Line, Circle, Text as SvgText } from 'react-native-svg';

// ── Constantes ─────────────────────────────────────────────────────────────────
const ARC_LEN  = 251;   // longitud del semicírculo SVG con r=80
const SVG_W    = 220;
const SVG_H    = 130;

// ── Helpers ────────────────────────────────────────────────────────────────────
function getColor(ratio) {
  if (ratio > 0.85) return '#E24B4A'; // peligro  — rojo
  if (ratio > 0.65) return '#EF9F27'; // precaución — amarillo
  return '#1D9E75';                   // normal   — verde
}

function getStatus(ratio) {
  if (ratio > 0.85) return { label: 'peligro',    bg: '#FCEBEB', color: '#791F1F' };
  if (ratio > 0.65) return { label: 'precaución', bg: '#FAEEDA', color: '#633806' };
  return               { label: 'normal',     bg: '#EAF3DE', color: '#27500A' };
}

// Convierte ratio (0–1) a coordenadas X,Y sobre el arco SVG
function ratioToPoint(ratio) {
  const angle = Math.PI + ratio * Math.PI; // de 180° a 360° (semicírculo)
  const cx = SVG_W / 2;
  const cy = SVG_H - 20;
  const r  = 80;
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}

// ── Componente ─────────────────────────────────────────────────────────────────
/**
 * GaugeCard
 * @param {string} label  - etiqueta (ej: 'voltaje')
 * @param {number} value  - valor actual
 * @param {string} unit   - unidad (ej: 'V', 'A')
 * @param {number} min    - valor mínimo del rango
 * @param {number} max    - valor máximo del rango
 *
 * Ejemplo de uso:
 *   <GaugeCard label="voltaje"   value={voltage} unit="V" min={10.5} max={15.0} />
 *   <GaugeCard label="corriente" value={current} unit="A" min={0}    max={12}   />
 */
export default function GaugeCard({ label, value, unit, min, max }) {
  const ratio  = useMemo(() =>
    Math.min(Math.max((value - min) / (max - min), 0), 1),
    [value, min, max]
  );

  const offset  = ARC_LEN - ratio * ARC_LEN;
  const color   = getColor(ratio);
  const status  = getStatus(ratio);

  // Coordenadas de la aguja
  const cx    = SVG_W / 2;
  const cy    = SVG_H - 20;
  const angle = Math.PI + ratio * Math.PI;
  const needleX = cx + 65 * Math.cos(angle);
  const needleY = cy + 65 * Math.sin(angle);

  // Etiquetas de rango (esquinas del arco)
  const minPt = ratioToPoint(0);
  const maxPt = ratioToPoint(1);

  return (
    <View style={styles.card}>
      {/* Etiqueta */}
      <Text style={styles.label}>{label.toUpperCase()}</Text>

      {/* Gauge SVG */}
      <Svg width={SVG_W} height={SVG_H}>
        {/* Arco de fondo */}
        <Path
          d={`M ${cx - 80},${cy} A 80,80 0 0,1 ${cx + 80},${cy}`}
          fill="none"
          stroke="#E5E5E5"
          strokeWidth="13"
          strokeLinecap="round"
        />
        {/* Arco de progreso */}
        <Path
          d={`M ${cx - 80},${cy} A 80,80 0 0,1 ${cx + 80},${cy}`}
          fill="none"
          stroke={color}
          strokeWidth="13"
          strokeLinecap="round"
          strokeDasharray={ARC_LEN}
          strokeDashoffset={offset}
        />
        {/* Aguja */}
        <Line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke="#333"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Centro de la aguja */}
        <Circle cx={cx} cy={cy} r="5" fill="#888" />
        {/* Etiquetas min/max */}
        <SvgText x={minPt.x - 8} y={minPt.y + 14} fontSize="9" fill="#AAA" fontFamily="monospace">{min}</SvgText>
        <SvgText x={maxPt.x - 8} y={maxPt.y + 14} fontSize="9" fill="#AAA" fontFamily="monospace">{max}</SvgText>
      </Svg>

      {/* Valor numérico */}
      <View style={styles.valueRow}>
        <Text style={styles.value}>
          {value != null ? value.toFixed(2) : '—'}
        </Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>

      {/* Pill de estado */}
      <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
        <Text style={[styles.statusText, { color: status.color }]}>
          {status.label}
        </Text>
      </View>
    </View>
  );
}

// ── Estilos ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#E5E5E5',
    padding: 18,
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: '#888',
    letterSpacing: 1,
    alignSelf: 'flex-start',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  value: {
    fontSize: 28,
    fontWeight: '500',
    fontFamily: 'monospace',
    color: '#111',
    lineHeight: 32,
  },
  unit: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 99,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
