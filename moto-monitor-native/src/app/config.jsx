// ═══════════════════════════════════════════════════════════════════════════════
// app/config.jsx — Pantalla de configuración universal
// ═══════════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useConfig, CONFIG_DEFAULT } from '../hooks/useConfig';

function SectionTitle({ label }) {
  return <Text style={styles.sectionLabel}>{label}</Text>;
}

function Field({ label, value, onChangeText, keyboardType = 'default', placeholder }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor="#AEAEB2"
      />
    </View>
  );
}

function BatteryTypeSelector({ value, onChange }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>Tipo de batería</Text>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.typeBtn, value === 'plomo' && styles.typeBtnActive]}
          onPress={() => onChange('plomo')}
        >
          <Text style={[styles.typeBtnText, value === 'plomo' && styles.typeBtnTextActive]}>
            Plomo-ácido
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeBtn, value === 'litio' && styles.typeBtnActive]}
          onPress={() => onChange('litio')}
        >
          <Text style={[styles.typeBtnText, value === 'litio' && styles.typeBtnTextActive]}>
            Litio
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ConfigScreen() {
  const router = useRouter();
  const { config, saveConfig, resetConfig } = useConfig();

  // Estado local del formulario
  const [form, setForm] = useState({
    bleDeviceName:  config.bleDeviceName,
    vehicleName:    config.vehicleName,
    voltajeMin:     String(config.voltajeMin),
    voltajeMax:     String(config.voltajeMax),
    bateriaBaja:    String(config.bateriaBaja),
    corrienteMax:   String(config.corrienteMax),
    corrienteAlta:  String(config.corrienteAlta),
    tipoBateria:    config.tipoBateria,
  });

  const set = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    // Validar números
    const nums = ['voltajeMin', 'voltajeMax', 'bateriaBaja', 'corrienteMax', 'corrienteAlta'];
    for (const key of nums) {
      if (isNaN(parseFloat(form[key]))) {
        Alert.alert('Error', `El campo "${key}" debe ser un número válido.`);
        return;
      }
    }
    if (!form.bleDeviceName.trim()) {
      Alert.alert('Error', 'El nombre BLE no puede estar vacío.');
      return;
    }

    const ok = await saveConfig({
      bleDeviceName:  form.bleDeviceName.trim(),
      vehicleName:    form.vehicleName.trim(),
      voltajeMin:     parseFloat(form.voltajeMin),
      voltajeMax:     parseFloat(form.voltajeMax),
      bateriaBaja:    parseFloat(form.bateriaBaja),
      corrienteMax:   parseFloat(form.corrienteMax),
      corrienteAlta:  parseFloat(form.corrienteAlta),
      tipoBateria:    form.tipoBateria,
    });

    if (ok) {
      Alert.alert('✅ Guardado', 'Configuración actualizada. Reconecta el BLE para aplicar cambios.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Restablecer defaults',
      '¿Seguro que quieres volver a la configuración por defecto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restablecer',
          style: 'destructive',
          onPress: async () => {
            await resetConfig();
            setForm({
              bleDeviceName:  CONFIG_DEFAULT.bleDeviceName,
              vehicleName:    CONFIG_DEFAULT.vehicleName,
              voltajeMin:     String(CONFIG_DEFAULT.voltajeMin),
              voltajeMax:     String(CONFIG_DEFAULT.voltajeMax),
              bateriaBaja:    String(CONFIG_DEFAULT.bateriaBaja),
              corrienteMax:   String(CONFIG_DEFAULT.corrienteMax),
              corrienteAlta:  String(CONFIG_DEFAULT.corrienteAlta),
              tipoBateria:    CONFIG_DEFAULT.tipoBateria,
            });
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        <View style={styles.card}>
          <SectionTitle label="🔵 Bluetooth" />
          <Field
            label="Nombre del dispositivo BLE"
            value={form.bleDeviceName}
            onChangeText={set('bleDeviceName')}
            placeholder="MotoMonitor"
          />
          <Field
            label="Nombre del vehículo"
            value={form.vehicleName}
            onChangeText={set('vehicleName')}
            placeholder="Apache 160 4v"
          />
        </View>

        <View style={styles.card}>
          <SectionTitle label="⚡ Voltaje" />
          <Field
            label="Voltaje mínimo (V)"
            value={form.voltajeMin}
            onChangeText={set('voltajeMin')}
            keyboardType="numeric"
            placeholder="11.5"
          />
          <Field
            label="Voltaje máximo (V)"
            value={form.voltajeMax}
            onChangeText={set('voltajeMax')}
            keyboardType="numeric"
            placeholder="14.8"
          />
          <Field
            label="Alerta batería baja (V)"
            value={form.bateriaBaja}
            onChangeText={set('bateriaBaja')}
            keyboardType="numeric"
            placeholder="12.0"
          />
        </View>

        <View style={styles.card}>
          <SectionTitle label="🔋 Corriente" />
          <Field
            label="Corriente máxima (A)"
            value={form.corrienteMax}
            onChangeText={set('corrienteMax')}
            keyboardType="numeric"
            placeholder="9.0"
          />
          <Field
            label="Alerta corriente alta (A)"
            value={form.corrienteAlta}
            onChangeText={set('corrienteAlta')}
            keyboardType="numeric"
            placeholder="7.0"
          />
        </View>

        <View style={styles.card}>
          <SectionTitle label="🔋 Batería" />
          <BatteryTypeSelector
            value={form.tipoBateria}
            onChange={set('tipoBateria')}
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Guardar configuración</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <Text style={styles.resetBtnText}>Restablecer defaults</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: '#F2F2F7' },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#F2F2F7' },
  headerTitle:  { fontSize: 17, fontWeight: '600', color: '#1C1C1E' },
  backBtn:      { width: 70 },
  backText:     { fontSize: 15, color: '#0A84FF' },
  content:      { padding: 16, gap: 12, paddingBottom: 40 },
  card:         { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 0.5, borderColor: '#E5E5E5', padding: 16, gap: 12 },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.8 },
  field:        { gap: 6 },
  fieldLabel:   { fontSize: 13, fontWeight: '500', color: '#1C1C1E' },
  input:        { backgroundColor: '#F2F2F7', borderRadius: 10, borderWidth: 0.5, borderColor: '#E5E5E5', paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: '#1C1C1E' },
  toggleRow:    { flexDirection: 'row', gap: 10 },
  typeBtn:      { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 0.5, borderColor: '#E5E5E5', alignItems: 'center', backgroundColor: '#F2F2F7' },
  typeBtnActive:     { backgroundColor: '#E1F5EE', borderColor: '#5DCAA5' },
  typeBtnText:       { fontSize: 14, color: '#8E8E93', fontWeight: '500' },
  typeBtnTextActive: { color: '#085041', fontWeight: '600' },
  saveBtn:      { backgroundColor: '#1D9E75', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  saveBtnText:  { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  resetBtn:     { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  resetBtnText: { fontSize: 14, color: '#FF3B30' },
});