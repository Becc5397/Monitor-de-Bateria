// ═══════════════════════════════════════════════════════════════════════════════
// WizardScreen.jsx — Pantalla de primera conexión tipo wizard
// ═══════════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Dimensions, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useConfig, CONFIG_DEFAULT } from '../hooks/useConfig';

const { width: SCREEN_W } = Dimensions.get('window');

// ── Indicador de pasos ─────────────────────────────────────────────────────────
function StepIndicator({ current, total }) {
  return (
    <View style={styles.stepRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[styles.stepDot, i === current && styles.stepDotActive, i < current && styles.stepDotDone]}
        />
      ))}
    </View>
  );
}

// ── Paso 1: Bienvenida ─────────────────────────────────────────────────────────
function StepBienvenida({ onNext }) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.emoji}>🏍️⚡</Text>
      <Text style={styles.stepTitle}>Bienvenido a{'\n'}Monitor de Batería</Text>
      <Text style={styles.stepDesc}>
        Monitorea el voltaje y corriente de tu moto en tiempo real desde tu celular via Bluetooth.
        {'\n\n'}
        En los siguientes pasos configuraremos la app para tu vehículo.
      </Text>
      <View style={styles.featureList}>
        {[
          '📊 Gráfica en tiempo real',
          '🔔 Alertas de voltaje y corriente',
          '🔋 Porcentaje de batería',
          '📡 Conexión BLE automática',
        ].map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.btnPrimary} onPress={onNext}>
        <Text style={styles.btnPrimaryText}>Comenzar configuración →</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Paso 2: Configurar BLE ─────────────────────────────────────────────────────
function StepBLE({ form, set, onNext, onBack }) {
  return (
    <ScrollView contentContainerStyle={styles.stepContainer}>
      <Text style={styles.emoji}>📡</Text>
      <Text style={styles.stepTitle}>Configura tu dispositivo</Text>
      <Text style={styles.stepDesc}>
        Ingresa el nombre del módulo ESP32 que instalaste en tu moto y el nombre de tu vehículo.
      </Text>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Nombre del dispositivo BLE</Text>
        <TextInput
          style={styles.input}
          value={form.bleDeviceName}
          onChangeText={set('bleDeviceName')}
          placeholder="MotoMonitor"
          placeholderTextColor="#AEAEB2"
          autoCapitalize="none"
        />
        <Text style={styles.fieldHint}>
          Debe coincidir exactamente con el nombre configurado en el ESP32.
        </Text>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Nombre del vehículo</Text>
        <TextInput
          style={styles.input}
          value={form.vehicleName}
          onChangeText={set('vehicleName')}
          placeholder="Apache 160 4v"
          placeholderTextColor="#AEAEB2"
        />
        <Text style={styles.fieldHint}>
          Este nombre aparecerá en el header de la app.
        </Text>
      </View>

      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.btnSecondary} onPress={onBack}>
          <Text style={styles.btnSecondaryText}>← Atrás</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnPrimary} onPress={onNext}>
          <Text style={styles.btnPrimaryText}>Siguiente →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ── Paso 3: Parámetros eléctricos ─────────────────────────────────────────────
function StepParametros({ form, set, onNext, onBack }) {
  return (
    <ScrollView contentContainerStyle={styles.stepContainer}>
      <Text style={styles.emoji}>⚡</Text>
      <Text style={styles.stepTitle}>Parámetros eléctricos</Text>
      <Text style={styles.stepDesc}>
        Configura los límites de voltaje y corriente según tu batería.
        Puedes dejarlo por defecto si no estás seguro.
      </Text>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Tipo de batería</Text>
        <View style={styles.toggleRow}>
          {['plomo', 'litio'].map((tipo) => (
            <TouchableOpacity
              key={tipo}
              style={[styles.typeBtn, form.tipoBateria === tipo && styles.typeBtnActive]}
              onPress={() => set('tipoBateria')(tipo)}
            >
              <Text style={[styles.typeBtnText, form.tipoBateria === tipo && styles.typeBtnTextActive]}>
                {tipo === 'plomo' ? '🔋 Plomo-ácido' : '⚡ Litio'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.row2}>
        <View style={[styles.fieldGroup, { flex: 1 }]}>
          <Text style={styles.fieldLabel}>Voltaje mínimo (V)</Text>
          <TextInput
            style={styles.input}
            value={form.voltajeMin}
            onChangeText={set('voltajeMin')}
            keyboardType="numeric"
            placeholder="11.5"
            placeholderTextColor="#AEAEB2"
          />
        </View>
        <View style={[styles.fieldGroup, { flex: 1 }]}>
          <Text style={styles.fieldLabel}>Voltaje máximo (V)</Text>
          <TextInput
            style={styles.input}
            value={form.voltajeMax}
            onChangeText={set('voltajeMax')}
            keyboardType="numeric"
            placeholder="14.8"
            placeholderTextColor="#AEAEB2"
          />
        </View>
      </View>

      <View style={styles.row2}>
        <View style={[styles.fieldGroup, { flex: 1 }]}>
          <Text style={styles.fieldLabel}>Corriente máxima (A)</Text>
          <TextInput
            style={styles.input}
            value={form.corrienteMax}
            onChangeText={set('corrienteMax')}
            keyboardType="numeric"
            placeholder="9.0"
            placeholderTextColor="#AEAEB2"
          />
        </View>
        <View style={[styles.fieldGroup, { flex: 1 }]}>
          <Text style={styles.fieldLabel}>Alerta batería baja (V)</Text>
          <TextInput
            style={styles.input}
            value={form.bateriaBaja}
            onChangeText={set('bateriaBaja')}
            keyboardType="numeric"
            placeholder="12.0"
            placeholderTextColor="#AEAEB2"
          />
        </View>
      </View>

      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.btnSecondary} onPress={onBack}>
          <Text style={styles.btnSecondaryText}>← Atrás</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnPrimary} onPress={onNext}>
          <Text style={styles.btnPrimaryText}>Finalizar ✓</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ── Paso 4: Listo ─────────────────────────────────────────────────────────────
function StepListo({ vehicleName, onFinish }) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.emoji}>✅</Text>
      <Text style={styles.stepTitle}>¡Todo listo!</Text>
      <Text style={styles.stepDesc}>
        La app está configurada para <Text style={{ fontWeight: '700', color: '#1C1C1E' }}>{vehicleName}</Text>.
        {'\n\n'}
        Enciende tu moto y asegúrate de que el módulo ESP32 esté activo. La app se conectará automáticamente.
      </Text>
      <View style={styles.featureList}>
        {[
          '📡 Buscando dispositivo BLE automáticamente',
          '🔔 Recibirás alertas en tiempo real',
          '⚙️ Puedes cambiar la config en cualquier momento',
        ].map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.btnPrimary} onPress={onFinish}>
        <Text style={styles.btnPrimaryText}>Ir al monitor 🏍️</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Componente principal ───────────────────────────────────────────────────────
export default function WizardScreen({ onComplete }) {
  const { saveConfig } = useConfig();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    bleDeviceName: CONFIG_DEFAULT.bleDeviceName,
    vehicleName:   CONFIG_DEFAULT.vehicleName,
    voltajeMin:    String(CONFIG_DEFAULT.voltajeMin),
    voltajeMax:    String(CONFIG_DEFAULT.voltajeMax),
    bateriaBaja:   String(CONFIG_DEFAULT.bateriaBaja),
    corrienteMax:  String(CONFIG_DEFAULT.corrienteMax),
    corrienteAlta: String(CONFIG_DEFAULT.corrienteAlta),
    tipoBateria:   CONFIG_DEFAULT.tipoBateria,
  });

  const set = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleFinish = async () => {
    await saveConfig({
      bleDeviceName:  form.bleDeviceName.trim(),
      vehicleName:    form.vehicleName.trim(),
      voltajeMin:     parseFloat(form.voltajeMin),
      voltajeMax:     parseFloat(form.voltajeMax),
      bateriaBaja:    parseFloat(form.bateriaBaja),
      corrienteMax:   parseFloat(form.corrienteMax),
      corrienteAlta:  parseFloat(form.corrienteAlta),
      tipoBateria:    form.tipoBateria,
    });
    onComplete();
  };

  const TOTAL_STEPS = 4;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <StepIndicator current={step} total={TOTAL_STEPS} />

        {step === 0 && <StepBienvenida onNext={() => setStep(1)} />}
        {step === 1 && <StepBLE form={form} set={set} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
        {step === 2 && <StepParametros form={form} set={set} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
        {step === 3 && <StepListo vehicleName={form.vehicleName} onFinish={handleFinish} />}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: '#F2F2F7' },
  stepRow:          { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingTop: 16, paddingBottom: 8 },
  stepDot:          { width: 8, height: 8, borderRadius: 99, backgroundColor: '#E5E5E5' },
  stepDotActive:    { backgroundColor: '#1D9E75', width: 24 },
  stepDotDone:      { backgroundColor: '#5DCAA5' },
  stepContainer:    { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  emoji:            { fontSize: 56, marginBottom: 16 },
  stepTitle:        { fontSize: 26, fontWeight: '700', color: '#1C1C1E', textAlign: 'center', marginBottom: 12, lineHeight: 34 },
  stepDesc:         { fontSize: 15, color: '#8E8E93', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  featureList:      { width: '100%', gap: 10, marginBottom: 32 },
  featureRow:       { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, borderWidth: 0.5, borderColor: '#E5E5E5' },
  featureText:      { fontSize: 14, color: '#1C1C1E' },
  fieldGroup:       { width: '100%', gap: 6, marginBottom: 16 },
  fieldLabel:       { fontSize: 13, fontWeight: '600', color: '#1C1C1E' },
  fieldHint:        { fontSize: 12, color: '#AEAEB2' },
  input:            { backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 0.5, borderColor: '#E5E5E5', paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#1C1C1E' },
  toggleRow:        { flexDirection: 'row', gap: 10 },
  typeBtn:          { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 0.5, borderColor: '#E5E5E5', alignItems: 'center', backgroundColor: '#FFFFFF' },
  typeBtnActive:    { backgroundColor: '#E1F5EE', borderColor: '#5DCAA5' },
  typeBtnText:      { fontSize: 14, color: '#8E8E93', fontWeight: '500' },
  typeBtnTextActive:{ color: '#085041', fontWeight: '600' },
  row2:             { flexDirection: 'row', gap: 12, width: '100%' },
  btnRow:           { flexDirection: 'row', gap: 12, width: '100%', marginTop: 8 },
  btnPrimary:       { flex: 1, backgroundColor: '#1D9E75', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  btnPrimaryText:   { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  btnSecondary:     { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, paddingVertical: 16, alignItems: 'center', borderWidth: 0.5, borderColor: '#E5E5E5' },
  btnSecondaryText: { fontSize: 16, fontWeight: '500', color: '#8E8E93' },
});