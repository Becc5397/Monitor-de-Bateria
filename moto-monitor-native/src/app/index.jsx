// ═══════════════════════════════════════════════════════════════════════════════
// app/index.jsx — Pantalla principal del monitor de motocicleta (BLE)
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  StatusBar, RefreshControl, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useBLE }            from '../hooks/useBLE';
import { useConfig }         from '../hooks/useConfig';
import GaugeCard             from '../components/GaugeCard';
import PowerCard             from '../components/PowerCard';
import AlertPanel            from '../components/AlertPanel';
import RealtimeChart         from '../components/RealtimeChart';
import ConnectionStatus      from '../components/ConnectionStatus';

export default function HomeScreen() {
  const router = useRouter();
  const { config, loading } = useConfig();

  const [sampleCount, setSampleCount] = useState(0);
  const [refreshing,  setRefreshing]  = useState(false);

  // Pasa config a useBLE — ahora usa los valores guardados
  const {
    connected, voltage, current,
    power, batteryPct, history, alerts,
  } = useBLE(config);

  useEffect(() => {
    if (history.length > 0) setSampleCount(history.length);
  }, [history.length]);

  const onRefresh = () => {
    setRefreshing(true);
    setSampleCount(0);
    setTimeout(() => setRefreshing(false), 800);
  };

  // Espera a que cargue la config antes de renderizar
  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#8E8E93', fontSize: 14 }}>Cargando configuración...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />

      {/* ── Header ────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🏍️ {config.vehicleName}</Text>
          <Text style={styles.headerSub}>monitor en tiempo real — BLE</Text>
        </View>
        <View style={styles.headerRight}>
          <ConnectionStatus connected={connected} simulate={false} />
          {/* Botón configuración */}
          <TouchableOpacity
            style={styles.configBtn}
            onPress={() => router.push('/config')}
          >
            <Text style={styles.configIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {alerts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>⚠️ alertas</Text>
            <AlertPanel alerts={alerts} />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>mediciones</Text>
          <View style={styles.gaugeRow}>
            <GaugeCard
              label="voltaje"
              value={voltage ?? 0}
              unit="V"
              min={config.voltajeMin}
              max={config.voltajeMax}
            />
            <GaugeCard
              label="corriente"
              value={current ?? 0}
              unit="A"
              min={0}
              max={config.corrienteMax}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>métricas derivadas</Text>
          <PowerCard
            power={power}
            batteryPct={batteryPct}
            samples={sampleCount}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>historial</Text>
          <RealtimeChart
            history={history}
            showVoltage
            showCurrent
          />
        </View>

        {alerts.length === 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>alertas</Text>
            <AlertPanel alerts={[]} />
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            datos por BLE · {connected ? 'conectado' : 'buscando...'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: '#F2F2F7' },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#F2F2F7' },
  headerTitle:  { fontSize: 18, fontWeight: '600', color: '#1C1C1E', letterSpacing: -0.3 },
  headerSub:    { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  headerRight:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  configBtn:    { width: 36, height: 36, borderRadius: 99, backgroundColor: '#FFFFFF', borderWidth: 0.5, borderColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center' },
  configIcon:   { fontSize: 18 },
  scroll:       { flex: 1 },
  content:      { paddingHorizontal: 16, paddingBottom: 32, gap: 8 },
  section:      { gap: 8 },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: '#8E8E93', letterSpacing: 0.8, textTransform: 'uppercase', paddingHorizontal: 4 },
  gaugeRow:     { flexDirection: 'row', gap: 10 },
  footer:       { alignItems: 'center', paddingTop: 8 },
  footerText:   { fontSize: 11, color: '#AEAEB2' },
});