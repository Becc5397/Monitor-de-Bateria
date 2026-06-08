// ═══════════════════════════════════════════════════════════════════════════════
// ConnectionStatus.jsx — Estado de conexión WebSocket para React Native (Expo)
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

/**
 * ConnectionStatus
 * @param {boolean} connected - true = conectado al ESP32
 * @param {boolean} simulate  - true = modo simulación
 */
export default function ConnectionStatus({ connected, simulate = false }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!connected) { pulse.setValue(1); return; }
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.2, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,   duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [connected]);

  const label = simulate ? 'simulado' : connected ? 'ESP32 conectado' : 'desconectado';
  const style = connected ? styles.on : styles.off;
  const dotColor = connected ? '#27500A' : '#791F1F';

  return (
    <View style={[styles.pill, style.pill]}>
      <Animated.View style={[styles.dot, { backgroundColor: dotColor, opacity: pulse }]} />
      <Text style={[styles.text, style.text]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
  on:  { pill: { backgroundColor: '#EAF3DE' }, text: { color: '#27500A' } },
  off: { pill: { backgroundColor: '#FCEBEB' }, text: { color: '#791F1F' } },
});
