import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFamiliaStore } from '../store/familiaStore';
import { usePacienteStore } from '../store/pacienteStore';

interface StatCardProps {
  titulo: string;
  valor: number;
  cor: string;
  icone: string;
}

function StatCard({ titulo, valor, cor, icone }: StatCardProps) {
  return (
    <View style={[styles.card, { borderLeftColor: cor }]}>
      <Text style={styles.icone}>{icone}</Text>
      <View style={styles.info}>
        <Text style={styles.valor}>{valor}</Text>
        <Text style={styles.titulo}>{titulo}</Text>
      </View>
    </View>
  );
}

export function DashboardStats() {
  const familias = useFamiliaStore(s => s.familias);

  return (
    <View style={styles.grid}>
      <StatCard titulo="Famílias" valor={familias.length} cor="#3B82F6" icone="🏠" />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    width: '47%',
    borderLeftWidth: 4,
  },
  icone: {
    fontSize: 24,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  valor: {
    color: '#F9FAFB',
    fontSize: 24,
    fontWeight: 'bold',
  },
  titulo: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
});
