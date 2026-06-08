import { useMemo, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Line, Path, Text as SvgText } from "react-native-svg";

const SCREEN_W = Dimensions.get("window").width;
const CHART_W = SCREEN_W - 64;
const CHART_H = 160;
const PAD = { t: 8, r: 12, b: 28, l: 34 };
const IW = CHART_W - PAD.l - PAD.r;
const IH = CHART_H - PAD.t - PAD.b;

function toPath(data, minY, maxY) {
  // ── GUARD: necesitamos al menos 2 puntos para dibujar una línea ──
  if (!data || data.length < 2) return "";
  const range = maxY - minY;
  if (range === 0) return "";

  return data
    .map((v, i) => {
      const safeV = isNaN(v) ? minY : Math.min(Math.max(v, minY), maxY);
      const x = PAD.l + (i / (data.length - 1)) * IW;
      const y = PAD.t + IH * (1 - (safeV - minY) / range);
      if (isNaN(x) || isNaN(y)) return "";
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .filter(Boolean)
    .join(" ");
}

function MiniChart({ data, minY, maxY, color, yTicks, xLabels }) {
  const path = useMemo(() => toPath(data, minY, maxY), [data, minY, maxY]);

  // No renderizar el SVG si no hay datos suficientes
  if (!data || data.length < 2) {
    return (
      <View
        style={{
          width: CHART_W,
          height: CHART_H,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 11, color: "#AEAEB2" }}>
          esperando datos...
        </Text>
      </View>
    );
  }

  return (
    <Svg width={CHART_W} height={CHART_H}>
      {/* Grid horizontal */}
      {yTicks.map((v, i) => {
        const y = PAD.t + IH * (1 - (v - minY) / (maxY - minY));
        return (
          <Line
            key={i}
            x1={PAD.l}
            y1={y.toFixed(1)}
            x2={(PAD.l + IW).toFixed(1)}
            y2={y.toFixed(1)}
            stroke="#E5E5E5"
            strokeWidth="0.5"
            strokeDasharray="3,3"
          />
        );
      })}

      {/* Etiquetas eje Y */}
      {yTicks.map((v, i) => {
        const y = PAD.t + IH * (1 - (v - minY) / (maxY - minY));
        return (
          <SvgText
            key={i}
            x={(PAD.l - 4).toFixed(1)}
            y={(y + 3).toFixed(1)}
            fontSize="9"
            fill="#AEAEB2"
            textAnchor="end"
            fontFamily="monospace"
          >
            {v}
          </SvgText>
        );
      })}

      {/* Etiquetas eje X */}
      {xLabels.map(({ idx, label }) => {
        const x = PAD.l + (idx / (data.length - 1)) * IW;
        if (isNaN(x)) return null;
        return (
          <SvgText
            key={idx}
            x={x.toFixed(1)}
            y={(CHART_H - 6).toFixed(1)}
            fontSize="9"
            fill="#AEAEB2"
            textAnchor="middle"
            fontFamily="monospace"
          >
            {label}
          </SvgText>
        );
      })}

      {/* Eje izquierdo */}
      <Line
        x1={PAD.l.toFixed(1)}
        y1={PAD.t.toFixed(1)}
        x2={PAD.l.toFixed(1)}
        y2={(PAD.t + IH).toFixed(1)}
        stroke="#E5E5E5"
        strokeWidth="0.5"
      />

      {/* Línea de datos */}
      {path ? (
        <Path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      ) : null}
    </Svg>
  );
}

export default function RealtimeChart({
  history,
  showVoltage = true,
  showCurrent = true,
}) {
  const [activeV, setActiveV] = useState(true);
  const [activeI, setActiveI] = useState(true);

  const dataV = useMemo(
    () => history.map((p) => p.voltage).filter((v) => !isNaN(v)),
    [history],
  );
  const dataI = useMemo(
    () => history.map((p) => p.current).filter((v) => !isNaN(v)),
    [history],
  );

  const xLabels = useMemo(() => {
    if (history.length < 2) return [];
    return history
      .map((_, i) => i)
      .filter((i) => i % 10 === 0)
      .map((i) => ({
        idx: i,
        label: `-${((history.length - 1 - i) * 0.5).toFixed(0)}s`,
      }));
  }, [history]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>últimos 60 puntos (~30 s)</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggle, activeV && styles.toggleActiveV]}
            onPress={() => setActiveV((v) => !v)}
          >
            <Text
              style={[styles.toggleText, activeV && styles.toggleTextActiveV]}
            >
              V
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggle, activeI && styles.toggleActiveI]}
            onPress={() => setActiveI((v) => !v)}
          >
            <Text
              style={[styles.toggleText, activeI && styles.toggleTextActiveI]}
            >
              A
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {showVoltage && activeV && (
        <View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: "#1D9E75" }]} />
            <Text style={styles.legendLabel}>voltaje (V)</Text>
          </View>
          <MiniChart
            data={dataV}
            minY={10}
            maxY={15}
            color="#1D9E75"
            yTicks={[10, 11, 12, 13, 14, 15]}
            xLabels={xLabels}
          />
        </View>
      )}

      {showCurrent && activeI && (
        <View style={showVoltage && activeV ? { marginTop: 8 } : {}}>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: "#EF9F27" }]} />
            <Text style={styles.legendLabel}>corriente (A)</Text>
          </View>
          <MiniChart
            data={dataI}
            minY={0}
            maxY={12}
            color="#EF9F27"
            yTicks={[0, 3, 6, 9, 12]}
            xLabels={xLabels}
          />
        </View>
      )}

      {!activeV && !activeI && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>activa al menos una línea</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: "#E5E5E5",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { fontSize: 12, fontWeight: "500", color: "#1C1C1E" },
  toggleRow: { flexDirection: "row", gap: 6 },
  toggle: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 99,
    borderWidth: 0.5,
    borderColor: "#E5E5E5",
  },
  toggleActiveV: { backgroundColor: "#E1F5EE", borderColor: "#5DCAA5" },
  toggleActiveI: { backgroundColor: "#FAEEDA", borderColor: "#EF9F27" },
  toggleText: { fontSize: 11, fontWeight: "600", color: "#8E8E93" },
  toggleTextActiveV: { color: "#085041" },
  toggleTextActiveI: { color: "#633806" },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
    marginLeft: 34,
  },
  legendDot: { width: 10, height: 3, borderRadius: 99 },
  legendLabel: { fontSize: 11, color: "#8E8E93" },
  empty: { height: 80, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 12, color: "#AEAEB2" },
});
