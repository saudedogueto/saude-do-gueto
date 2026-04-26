import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity
} from 'react-native';
import { usePacientes } from '@/src/contexts/PacienteContext';
import { useTema } from '@/src/contexts/TemaContext';
import { router, useLocalSearchParams } from 'expo-router';

export default function DetalhesScreen() {
  const params = useLocalSearchParams();
  const { buscarPaciente, carregarPacientes } = usePacientes();
  const { cores } = useTema();
  const paciente = params?.id ? buscarPaciente(params.id as string) : null;

  useEffect(() => {
    carregarPacientes();
  }, []);

  if (!paciente) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Paciente não encontrado</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: cores.fundo }]}>
      <View style={styles.header}>
        <Text style={styles.nome}>{paciente.nome}</Text>
        {paciente.microarea && (
          <Text style={styles.microarea}>📍 {paciente.microarea}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Dados Pessoais</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Cartão SUS:</Text>
          <Text style={styles.value}>{paciente.cartaoSUS || '---'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Data de Nasc.:</Text>
          <Text style={styles.value}>{paciente.dataNascimento || '---'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Telefone:</Text>
          <Text style={styles.value}>{paciente.telefone || '---'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Endereço:</Text>
          <Text style={styles.value}>{paciente.endereco || '---'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Cadastrado em:</Text>
          <Text style={styles.value}>{paciente.dataCadastro || '---'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🩺 Condições de Saúde</Text>
        <View style={styles.condRow}>
          <Text style={styles.condLabel}>Hipertensão:</Text>
          <Text style={[styles.condValue, paciente.hipertensao ? styles.sim : styles.nao]}>
            {paciente.hipertensao ? '✅ Sim' : '❌ Não'}
          </Text>
        </View>
        <View style={styles.condRow}>
          <Text style={styles.condLabel}>Diabetes:</Text>
          <Text style={[styles.condValue, paciente.diabetes ? styles.sim : styles.nao]}>
            {paciente.diabetes ? '✅ Sim' : '❌ Não'}
          </Text>
        </View>
        <View style={styles.condRow}>
          <Text style={styles.condLabel}>Gestante:</Text>
          <Text style={[styles.condValue, paciente.gestante ? styles.sim : styles.nao]}>
            {paciente.gestante ? '✅ Sim' : '❌ Não'}
          </Text>
        </View>
      </View>

      {paciente.observacoes ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Observações</Text>
          <Text style={styles.obs}>{paciente.observacoes}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push({
            pathname: '/(tabs)/cadastro',
            params: { id: paciente.id }
          })}
        >
          <Text style={styles.buttonText}>✏️ Editar Paciente</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    padding: 20,
  },
  notFound: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginTop: 50,
  },
  header: {
    marginBottom: 25,
  },
  nome: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
  },
  microarea: {
    fontSize: 14,
    color: '#FF8C00',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF8C00',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  condRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  condLabel: {
    fontSize: 15,
    color: '#444',
  },
  condValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  sim: {
    color: '#2E7D32',
  },
  nao: {
    color: '#999',
  },
  obs: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  actions: {
    marginTop: 10,
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#FF8C00',
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
