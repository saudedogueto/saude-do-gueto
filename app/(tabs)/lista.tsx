import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, Alert
} from 'react-native';
import { usePacientes, Paciente } from '@/src/contexts/PacienteContext';
import { useTema } from '@/src/contexts/TemaContext';
import { router } from 'expo-router';

type FiltroCondicao = 'todos' | 'hipertensao' | 'diabetes' | 'gestante';

export default function ListaScreen() {
  const { pacientes, carregarPacientes, pesquisarPacientes, excluirPaciente } = usePacientes();
  const { cores } = useTema();
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<FiltroCondicao>('todos');
  const [resultados, setResultados] = useState<Paciente[]>([]);

  useEffect(() => {
    carregarPacientes();
  }, []);

  useEffect(() => {
    let lista = busca.trim() ? pesquisarPacientes(busca) : pacientes;

    if (filtro === 'hipertensao') {
      lista = lista.filter(p => p.hipertensao);
    } else if (filtro === 'diabetes') {
      lista = lista.filter(p => p.diabetes);
    } else if (filtro === 'gestante') {
      lista = lista.filter(p => p.gestante);
    }

    setResultados(lista);
  }, [busca, pacientes, filtro]);

  const handleExcluir = (paciente: Paciente) => {
    Alert.alert(
      'Excluir Paciente',
      `Tem certeza que deseja excluir ${paciente.nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await excluirPaciente(paciente.id);
            carregarPacientes();
          }
        }
      ]
    );
  };

  const renderPaciente = ({ item }: { item: Paciente }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: cores.card }]}
      onPress={() => router.push({
        pathname: '/(tabs)/detalhes',
        params: { id: item.id }
      })}
      onLongPress={() => handleExcluir(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.nome}>{item.nome}</Text>
        <Text style={styles.sus}>CPF: {item.cpf || '---'}</Text>
      </View>

      <View style={styles.tags}>
        {item.hipertensao && <Text style={[styles.tag, { backgroundColor: '#FFF3E0', color: '#E65100' }]}>HAS</Text>}
        {item.diabetes && <Text style={[styles.tag, { backgroundColor: '#E8F5E9', color: '#2E7D32' }]}>DM</Text>}
        {item.gestante && <Text style={[styles.tag, { backgroundColor: '#FCE4EC', color: '#C62828' }]}>GEST</Text>}
      </View>

      {item.telefone ? <Text style={styles.info}>📞 {item.telefone}</Text> : null}
      {item.endereco ? <Text style={styles.info}>🏠 {item.endereco}</Text> : null}
      {item.microarea ? <Text style={styles.info}>📍 {item.microarea}</Text> : null}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: cores.fundo }]}>
      {/* Filtros de condição */}
      <View style={styles.filtrosRow}>
        {[
          { key: 'todos', label: 'Todos' },
          { key: 'hipertensao', label: '🫀 HAS' },
          { key: 'diabetes', label: '🩸 DM' },
          { key: 'gestante', label: '🤰 GEST' },
        ].map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filtroBtn, filtro === f.key && styles.filtroAtivo]}
            onPress={() => setFiltro(f.key as FiltroCondicao)}
          >
            <Text style={[styles.filtroText, filtro === f.key && styles.filtroTextAtivo]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.search}
        placeholder="🔍 Buscar por nome, CPF, SUS ou telefone..."
        value={busca}
        onChangeText={setBusca}
      />

      {resultados.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>
            {busca ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/(tabs)/cadastro')}
          >
            <Text style={styles.buttonText}>+ Cadastrar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={resultados}
          renderItem={renderPaciente}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    padding: 15,
  },
  search: {
    height: 48,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 15,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    marginBottom: 8,
  },
  nome: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
  },
  sus: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  tags: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  tag: {
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    overflow: 'hidden',
  },
  info: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FF8C00',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
