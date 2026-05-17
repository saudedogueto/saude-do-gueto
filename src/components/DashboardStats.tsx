import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFamiliaStore } from '../store/familiaStore';
import { usePacienteStore } from '../store/pacienteStore';

export function DashboardStats() {
  const familias = useFamiliaStore(s => s.familias);
  const pacientes = usePacienteStore(s => s.pacientes);

  return (
    <View style={styles.grid}>
      <View style={[styles.card, { borderLeftColor: '#3B82F6' }]}>
        <Text style={styles.icone}>🏠</Text>
        <View style={styles.info}>
          <Text style={styles.valor}>{familias.length}</Text>
          <Text style={styles.titulo}>Total de Famílias</Text>
        </View>
      </View>
      <View style={[styles.card, { borderLeftColor: '#F59E0B' }]}>
        <Text style={styles.icone}>👤</Text>
        <View style={styles.info}>
          <Text style={styles.valor}>{pacientes.length}</Text>
          <Text style={styles.titulo}>Total de Pacientes</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 12,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
  },
  icone: {
    fontSize: 22,
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  valor: {
    color: '#F9FAFB',
    fontSize: 22,
    fontWeight: 'bold',
  },
  titulo: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 1,
  },
});
