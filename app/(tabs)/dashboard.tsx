import React, { useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl
} from 'react-native';
import { usePacientes } from '@/src/contexts/PacienteContext';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTema } from '@/src/contexts/TemaContext';
import { router } from 'expo-router';

export default function DashboardScreen() {
  const { pacientes, carregarPacientes } = usePacientes();
  const { logout } = useAuth();
  const { cores } = useTema();

  useEffect(() => {
    carregarPacientes();
  }, []);

  const onRefresh = useCallback(() => {
    carregarPacientes();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const hipertensos = pacientes.filter(p => p.hipertensao).length;
  const diabeticos = pacientes.filter(p => p.diabetes).length;
  const gestantes = pacientes.filter(p => p.gestante).length;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: cores.fundo }]}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Saúde do Gueto</Text>
      <Text style={styles.subtitle}>Dashboard do ACS</Text>

      <View style={styles.cardTotal}>
        <Text style={styles.cardTotalNumero}>{pacientes.length}</Text>
        <Text style={styles.cardTotalLabel}>Total de Pacientes</Text>
      </View>

      <View style={styles.grid}>
        <View style={[styles.card, { backgroundColor: '#FFF3E0' }]}>
          <Text style={styles.cardNumero}>{hipertensos}</Text>
          <Text style={styles.cardLabel}>Hipertensos</Text>
        </View>
        <View style={[styles.card, { backgroundColor: '#E8F5E9' }]}>
          <Text style={styles.cardNumero}>{diabeticos}</Text>
          <Text style={styles.cardLabel}>Diabéticos</Text>
        </View>
        <View style={[styles.card, { backgroundColor: '#FCE4EC' }]}>
          <Text style={styles.cardNumero}>{gestantes}</Text>
          <Text style={styles.cardLabel}>Gestantes</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/(tabs)/cadastro')}
        >
          <Text style={styles.buttonText}>+ Novo Cadastro</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecundario]}
          onPress={() => router.push('/(tabs)/lista')}
        >
          <Text style={[styles.buttonText, { color: '#FF8C00' }]}>
            📋 Ver Pacientes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/(tabs)/visita')}
        >
          <Text style={styles.buttonText}>🏠 Registrar Visita</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecundario]}
          onPress={() => router.push('/(tabs)/historico-visitas')}
        >
          <Text style={[styles.buttonText, { color: '#FF8C00' }]}>
            📊 Histórico de Visitas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/(tabs)/lembretes')}
        >
          <Text style={styles.buttonText}>🔔 Lembretes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/(tabs)/relatorios')}
        >
          <Text style={styles.buttonText}>📊 Relatórios</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecundario]}
          onPress={() => router.push('/(tabs)/familias')}
        >
          <Text style={[styles.buttonText, { color: '#FF8C00' }]}>
            👨‍👩‍👧‍👦 Famílias
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/(tabs)/backup')}
        >
          <Text style={styles.buttonText}>💾 Backup</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecundario]}
          onPress={() => router.push('/(tabs)/esus-export')}
        >
          <Text style={[styles.buttonText, { color: '#FF8C00' }]}>
            📋 e-SUS / SIS Online
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/(tabs)/config')}
        >
          <Text style={styles.buttonText}>⚙️ Configurações</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF8C00',
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 25,
  },
  cardTotal: {
    backgroundColor: '#FF8C00',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardTotalNumero: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFF',
  },
  cardTotalLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 5,
  },
  grid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 25,
  },
  card: {
    flex: 1,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  cardNumero: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  cardLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
    textAlign: 'center',
  },
  actions: {
    gap: 12,
  },
  button: {
    backgroundColor: '#FF8C00',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  buttonSecundario: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#FF8C00',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutBtn: {
    alignSelf: 'center',
    marginTop: 30,
    padding: 10,
  },
  logoutText: {
    color: '#CCC',
    fontSize: 14,
  },
});
