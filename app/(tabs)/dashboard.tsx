import React, { useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { usePacienteStore } from '@/src/store/pacienteStore';
import { useFamiliaStore } from '@/src/store/familiaStore';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTema } from '@/src/contexts/TemaContext';
import { router } from 'expo-router';
import { DashboardStats } from '@/src/components/DashboardStats';
import { SkeletonList } from '@/src/components/Skeleton';

export default function DashboardScreen() {
  const pacientes = usePacienteStore(s => s.pacientes);
  const carregarPacientes = usePacienteStore(s => s.carregar);
  const carregandoPacientes = usePacienteStore(s => s.carregando);
  const carregarFamilias = useFamiliaStore(s => s.carregar);
  const carregandoFamilias = useFamiliaStore(s => s.carregando);
  const { logout } = useAuth();
  const { cores } = useTema();

  useFocusEffect(
    useCallback(() => {
      carregarPacientes();
      carregarFamilias();
    }, [])
  );

  const onRefresh = useCallback(() => {
    carregarPacientes();
    carregarFamilias();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const hipertensos = pacientes.filter(p => (p as any).hipertensao).length;
  const diabeticos = pacientes.filter(p => (p as any).diabetes).length;
  const gestantes = pacientes.filter(p => (p as any).gestante).length;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: cores.fundo }]}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Saúde do Gueto</Text>
      <Text style={styles.subtitle}>Dashboard do ACS</Text>

      {carregandoPacientes || carregandoFamilias ? (
        <SkeletonList count={2} />
      ) : (
        <>
          <DashboardStats />

          <View style={styles.grid}>
            <View style={[styles.card, { backgroundColor: '#FFF3E0' }]}>
              <Text style={styles.cardNumero}>{hipertensos}</Text>
              <Text style={styles.cardLabel}>Hipertensos</Text>
            </View>
            <View style={[styles.card, { backgroundColor: '#E8F5E9' }]}>
              <Text style={styles.cardNumero}>{diabeticos}</Text>
              <Text style={styles.cardLabel}>Diabéticos</Text>
            </View>
            <View style={[styles.card, { backgroundColor: '#F3E5F5' }]}>
              <Text style={styles.cardNumero}>{gestantes}</Text>
              <Text style={styles.cardLabel}>Gestantes</Text>
            </View>
          </View>

          {/* Atalhos */}
          <View style={styles.atalhos}>
            <TouchableOpacity
              style={styles.atalho}
              onPress={() => router.push('/(tabs)/cadastro')}
            >
              <Text style={styles.atalhoIcone}>➕</Text>
              <Text style={styles.atalhoTexto}>Novo Paciente</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.atalho}
              onPress={() => router.push('/(tabs)/lista')}
            >
              <Text style={styles.atalhoIcone}>📋</Text>
              <Text style={styles.atalhoTexto}>Pacientes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.atalho}
              onPress={() => router.push('/(tabs)/familias')}
            >
              <Text style={styles.atalhoIcone}>🏠</Text>
              <Text style={styles.atalhoTexto}>Famílias</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.atalho}
              onPress={() => router.push('/(tabs)/visita')}
            >
              <Text style={styles.atalhoIcone}>👣</Text>
              <Text style={styles.atalhoTexto}>Registrar Visita</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.atalho}
              onPress={() => router.push('/(tabs)/agente')}
            >
              <Text style={styles.atalhoIcone}>🧠</Text>
              <Text style={styles.atalhoTexto}>Agente de Saúde</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.atalho}
              onPress={() => router.push('/(tabs)/mapa')}
            >
              <Text style={styles.atalhoIcone}>🗺️</Text>
              <Text style={styles.atalhoTexto}>Mapa Social</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.atalho}
              onPress={() => router.push('/(tabs)/esus-export')}
            >
              <Text style={styles.atalhoIcone}>💻</Text>
              <Text style={styles.atalhoTexto}>e-SUS / SIS</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.atalho}
              onPress={() => router.push('/(tabs)/lembretes')}
            >
              <Text style={styles.atalhoIcone}>🔔</Text>
              <Text style={styles.atalhoTexto}>Lembretes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.atalho}
              onPress={() => router.push('/(tabs)/config')}
            >
              <Text style={styles.atalhoIcone}>⚙️</Text>
              <Text style={styles.atalhoTexto}>Configurações</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3B82F6',
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardTotal: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 24,
    margin: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  cardTotalNumero: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  cardTotalLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    width: '30%',
    alignItems: 'center',
  },
  cardNumero: { fontSize: 28, fontWeight: 'bold', color: '#1F2937' },
  cardLabel: { fontSize: 11, color: '#4B5563', marginTop: 4, textAlign: 'center' },
  atalhos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
  },
  atalho: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '45%',
    borderWidth: 1,
    borderColor: '#374151',
  },
  atalhoIcone: { fontSize: 28, marginBottom: 4 },
  atalhoTexto: { color: '#D1D5DB', fontSize: 13, fontWeight: '600' },
  logout: {
    margin: 24,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
