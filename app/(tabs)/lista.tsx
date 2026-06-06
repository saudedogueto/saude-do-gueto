import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, Alert, Image
} from 'react-native';
import { usePacientes, Paciente } from '@/src/contexts/PacienteContext';
import { useTema } from '@/src/contexts/TemaContext';
import { useToast } from '@/src/components/Toast';
import { ConfirmDialog } from '@/src/components/ConfirmDialog';
import { router } from 'expo-router';

type FiltroCondicao = 'todos' | 'hipertensao' | 'diabetes' | 'gestante' | 'menorDoisAnos';

export default function ListaScreen() {
  const { pacientes, carregarPacientes, pesquisarPacientes, excluirPaciente } = usePacientes();
  const { cores } = useTema();
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<FiltroCondicao>('todos');
  const { showToast } = useToast();
  const [resultados, setResultados] = useState<Paciente[]>([]);
  const [excluirConfirm, setExcluirConfirm] = useState<Paciente | null>(null);

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
    } else if (filtro === 'menorDoisAnos') {
      lista = lista.filter(p => p.menorDoisAnos);
    }

    setResultados(lista);
  }, [busca, pacientes, filtro]);

  const handleExcluir = (paciente: Paciente) => {
    setExcluirConfirm(paciente);
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
      <View style={styles.cardRow}>
        {item.foto ? (
          <Image source={{ uri: item.foto }} style={[styles.fotoCard, { borderColor: cores.primary }]} />
        ) : (
          <View style={[styles.fotoCardPlaceholder, { backgroundColor: cores.card, borderColor: cores.borda }]}>
            <Text style={styles.fotoCardEmoji}>👤</Text>
          </View>
        )}
        <View style={styles.cardInfo}>
          <Text style={[styles.nome, { color: cores.texto }]}>{item.nome}</Text>
          <Text style={[styles.sus, { color: cores.textoSecundario }]}>CPF: {item.cpf || '---'}</Text>
        </View>
      </View>

      <View style={styles.tags}>
        {item.hipertensao && <Text style={[styles.tag, { backgroundColor: 'rgba(0,230,118,0.15)', color: '#00E676' }]}>HAS</Text>}
        {item.diabetes && <Text style={[styles.tag, { backgroundColor: 'rgba(0,176,255,0.15)', color: '#00B0FF' }]}>DM</Text>}
        {item.gestante && <Text style={[styles.tag, { backgroundColor: 'rgba(255,255,255,0.06)', color: '#FF5252' }]}>GEST</Text>}
        {item.menorDoisAnos && <Text style={[styles.tag, { backgroundColor: 'rgba(255,193,7,0.15)', color: '#FFD740' }]}>{'👶 <2A'}</Text>}
      </View>

      {item.telefone ? <Text style={[styles.info, { color: cores.textoSecundario }]}>📞 {item.telefone}</Text> : null}
      {item.endereco ? <Text style={[styles.info, { color: cores.textoSecundario }]}>🏠 {item.endereco}</Text> : null}
      {(item.microareaProntuario || item.microarea) ? <Text style={[styles.info, { color: cores.textoSecundario }]}>📍 {item.microareaProntuario || item.microarea}</Text> : null}
    </TouchableOpacity>
  );

  const getFiltroBtnStyle = (key: string) => [
    styles.filtroBtn,
    {
      backgroundColor: filtro === key ? cores.primary : cores.card,
      borderColor: filtro === key ? cores.primary : cores.borda,
    },
  ];

  const getFiltroTextStyle = (key: string) => [
    styles.filtroText,
    { color: filtro === key ? '#FFFFFF' : cores.textoSecundario },
  ];

  return (
    <View style={[styles.container, { backgroundColor: cores.fundo }]}>
      {/* Filtros de condição */}
      <View style={styles.filtrosRow}>
        {[
          { key: 'todos', label: 'Todos' },
          { key: 'hipertensao', label: '🫀 HAS' },
          { key: 'diabetes', label: '🩸 DM' },
          { key: 'gestante', label: '🤰 GEST' },
          { key: 'menorDoisAnos', label:  '👶 <2A' },
        ].map(f => (
          <TouchableOpacity
            key={f.key}
            style={getFiltroBtnStyle(f.key)}
            onPress={() => setFiltro(f.key as FiltroCondicao)}
          >
            <Text style={getFiltroTextStyle(f.key)}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={[styles.search, { backgroundColor: cores.card, borderColor: cores.borda, color: cores.texto }]}
        placeholder="🔍 Buscar por nome, CPF, SUS ou telefone..."
        placeholderTextColor={cores.textoSecundario}
        value={busca}
        onChangeText={setBusca}
      />

      {resultados.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={[styles.emptyText, { color: cores.textoSecundario }]}>
            {busca ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: cores.primary }]}
            onPress={() => router.push('/(tabs)/cadastro')}
          >
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>+ Cadastrar</Text>
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

      <ConfirmDialog
        visivel={excluirConfirm !== null}
        titulo="Excluir Paciente"
        mensagem={`Tem certeza que deseja excluir ${excluirConfirm?.nome}?`}
        confirmarTexto="Excluir"
        tipo="danger"
        onConfirmar={async () => {
          if (excluirConfirm) {
            await excluirPaciente(excluirConfirm.id);
            carregarPacientes();
            showToast('Paciente excluído');
          }
          setExcluirConfirm(null);
        }}
        onCancelar={() => setExcluirConfirm(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  search: {
    height: 48,
    borderWidth: 1,
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
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  cardHeader: {
    marginBottom: 8,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fotoCard: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 2,
  },
  fotoCardPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  fotoCardEmoji: {
    fontSize: 20,
  },
  cardInfo: {
    flex: 1,
  },
  nome: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  sus: {
    fontSize: 13,
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
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  filtrosRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  filtroBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filtroText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
