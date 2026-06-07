/**
 * DashboardStats.tsx — Cards estáticos com contraste
 *
 * Design profissional: fundo claro com borda sutil.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFamiliaStore } from '../store/familiaStore';
import { usePacienteStore } from '../store/pacienteStore';

interface StatCardProps {
  icone: string;
  valor: number;
  label: string;
  cor: string;
}

function StatCard({ icone, valor, label, cor }: StatCardProps) {
  return (
    <View style={[styles.card, { borderLeftColor: cor }]}>
      <View style={styles.cardTop}>
        <Text style={styles.icone}>{icone}</Text>
        <Text style={[styles.valor, { color: cor }]}>{valor}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

export function DashboardStats() {
  const familias = useFamiliaStore(s => s.familias);
  const pacientes = usePacienteStore(s => s.pacientes);

  const gestantes = pacientes.filter(p => (p as any).gestante).length;
  const areasRisco = familias.filter(f => (f as any).areaRisco).length;

  return (
    <View style={styles.grid}>
      <StatCard icone="🤰" valor={gestantes} label="Gestantes" cor="#0088E0" />
      <View style={styles.col}>
        <StatCard icone="👨‍👩‍👧‍👦" valor={familias.length} label="Famílias" cor="#00B860" />
        <StatCard icone="⚠️" valor={areasRisco} label="Áreas de risco" cor="#E05050" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  col: {
    flex: 1,
    gap: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E8EAF0',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  icone: {
    fontSize: 24,
  },
  valor: {
    fontSize: 28,
    fontWeight: '800',
  },
  label: {
    color: '#4A4A6A',
    fontSize: 11,
    fontWeight: '500',
  },
});
