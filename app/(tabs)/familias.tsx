import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, FlatList, Alert
} from 'react-native';
import { usePacientes, Paciente } from '@/src/contexts/PacienteContext';
import { useFamilias } from '@/src/contexts/FamiliaContext';
import { useTema } from '@/src/contexts/TemaContext';
import { router } from 'expo-router';

export default function FamiliasScreen() {
  const { pacientes, carregarPacientes } = usePacientes();
  const { familias, carregarFamilias, criarFamilia, adicionarMembro, removerMembro } = useFamilias();
  const { cores } = useTema();
  const [buscaPaciente, setBuscaPaciente] = useState('');
  const [pacientesFiltrados, setPacientesFiltrados] = useState<Paciente[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [criando, setCriando] = useState(false);

  // Form de nova família
  const [nomeResp, setNomeResp] = useState('');
  const [endereco, setEndereco] = useState('');
  const [microarea, setMicroarea] = useState('');
  const [telefone, setTelefone] = useState('');

  useEffect(() => {
    carregarFamilias();
    carregarPacientes();
  }, []);

  useEffect(() => {
    if (buscaPaciente.trim()) {
      const t = buscaPaciente.toLowerCase();
      setPacientesFiltrados(pacientes.filter(p => p.nome.toLowerCase().includes(t)));
    } else {
      setPacientesFiltrados([]);
    }
  }, [buscaPaciente, pacientes]);

  // Contar membros não duplicados
  const pacientesEmFamilias = new Set<string>();
  familias.forEach(f => f.membros.forEach(id => pacientesEmFamilias.add(id)));

  const handleCriarFamilia = async () => {
    if (!nomeResp.trim() || !endereco.trim()) {
      Alert.alert('Atenção', 'Nome do responsável e endereço são obrigatórios');
      return;
    }
    setCriando(true);
    try {
      await criarFamilia({
        nomeResponsavel: nomeResp.trim(),
        endereco: endereco.trim(),
        microarea: microarea.trim(),
        telefone: telefone.trim(),
      });
      Alert.alert('Família criada!', 'Nova família registrada com sucesso');
      setNomeResp('');
      setEndereco('');
      setMicroarea('');
      setTelefone('');
      setMostrarForm(false);
      carregarFamilias();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar a família');
    } finally {
      setCriando(false);
    }
  };

  const handleAdicionar = async (familiaId: string, pacienteId: string) => {
    await adicionarMembro(familiaId, pacienteId);
    setBuscaPaciente('');
    carregarFamilias();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: cores.fundo }]}>
      <Text style={styles.title}>👨‍👩‍👧‍👦 Famílias</Text>
      <Text style={styles.subtitle}>
        {familias.length} família(s) • {pacientesEmFamilias.size} paciente(s) vinculados
      </Text>

      {/* Criar Família */}
      {!mostrarForm ? (
        <TouchableOpacity
          style={styles.btnCriar}
          onPress={() => setMostrarForm(true)}
        >
          <Text style={styles.btnCriarText}>+ Nova Família</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Nova Família</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome do responsável *"
            value={nomeResp}
            onChangeText={setNomeResp}
          />
          <TextInput
            style={styles.input}
            placeholder="Endereço completo *"
            value={endereco}
            onChangeText={setEndereco}
          />
          <TextInput
            style={styles.input}
            placeholder="Microárea"
            value={microarea}
            onChangeText={setMicroarea}
          />
          <TextInput
            style={styles.input}
            placeholder="Telefone"
            value={telefone}
            onChangeText={setTelefone}
            keyboardType="phone-pad"
          />
          <View style={styles.formActions}>
            <TouchableOpacity
              style={[styles.btn, styles.btnSalvar]}
              onPress={handleCriarFamilia}
              disabled={criando}
            >
              <Text style={styles.btnSalvarText}>
                {criando ? 'Criando...' : 'Criar Família'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnCancelar]}
              onPress={() => setMostrarForm(false)}
            >
              <Text style={styles.btnCancelarText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Lista de Famílias */}
      {familias.map(familia => {
        const membros = familia.membros
          .map(id => pacientes.find(p => p.id === id))
          .filter(Boolean) as Paciente[];

        return (
          <View key={familia.id} style={styles.familiaCard}>
            <View style={styles.familiaHeader}>
              <Text style={styles.familiaNome}>👤 {familia.nomeResponsavel}</Text>
              <Text style={styles.familiaInfo}>📍 {familia.endereco}</Text>
              {familia.microarea ? (
                <Text style={styles.familiaInfo}>🏷️ Área: {familia.microarea}</Text>
              ) : null}
            </View>

            {/* Membros */}
            {membros.length > 0 && (
              <View style={styles.membrosLista}>
                <Text style={styles.membrosTitle}>
                  Membros ({membros.length}):
                </Text>
                {membros.map(m => (
                  <View key={m.id} style={styles.membroItem}>
                    <Text style={styles.membroNome}>{m.nome}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert('Remover', `Remover ${m.nome} da família?`, [
                          { text: 'Cancelar', style: 'cancel' },
                          {
                            text: 'Remover',
                            style: 'destructive',
                            onPress: () => {
                              removerMembro(familia.id, m.id);
                              carregarFamilias();
                            }
                          }
                        ]);
                      }}
                    >
                      <Text style={styles.removerBtn}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Adicionar membro */}
            <TextInput
              style={styles.buscaInput}
              placeholder="🔍 Adicionar paciente pelo nome..."
              value={familia.id === buscaPaciente ? buscaPaciente : ''}
              onChangeText={text => setBuscaPaciente(text)}
              onFocus={() => setBuscaPaciente('')}
            />

            {buscaPaciente.length > 0 && pacientesFiltrados.map(p => {
              const jaMembro = familia.membros.includes(p.id);
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.pacienteItem, jaMembro && styles.pacienteInativo]}
                  onPress={() => {
                    if (!jaMembro) handleAdicionar(familia.id, p.id);
                  }}
                  disabled={jaMembro}
                >
                  <Text style={styles.pacienteItemNome}>{p.nome}</Text>
                  <Text style={styles.pacienteItemStatus}>
                    {jaMembro ? '✅ Já adicionado' : '+ Adicionar'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      })}

      {familias.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Nenhuma família cadastrada</Text>
          <Text style={styles.emptySub}>Crie a primeira família para agrupar pacientes do mesmo domicílio</Text>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    padding: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF8C00',
    textAlign: 'center',
    marginTop: 15,
  },
  subtitle: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  btnCriar: {
    backgroundColor: '#FF8C00',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  btnCriarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  input: {
    height: 46,
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  formActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 5,
  },
  btn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSalvar: {
    backgroundColor: '#FF8C00',
  },
  btnSalvarText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  btnCancelar: {
    backgroundColor: '#F0F0F0',
  },
  btnCancelarText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 15,
  },
  familiaCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  familiaHeader: {
    marginBottom: 12,
  },
  familiaNome: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
  },
  familiaInfo: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  membrosLista: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 10,
    marginBottom: 10,
  },
  membrosTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    marginBottom: 6,
  },
  membroItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  membroNome: {
    fontSize: 14,
    color: '#444',
  },
  removerBtn: {
    color: '#E53935',
    fontWeight: 'bold',
    fontSize: 16,
    padding: 4,
  },
  buscaInput: {
    height: 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 13,
    marginBottom: 6,
  },
  pacienteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pacienteInativo: {
    opacity: 0.5,
  },
  pacienteItemNome: {
    fontSize: 14,
    color: '#333',
  },
  pacienteItemStatus: {
    fontSize: 12,
    color: '#FF8C00',
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  emptySub: {
    fontSize: 13,
    color: '#CCC',
    textAlign: 'center',
    marginTop: 5,
    paddingHorizontal: 30,
  },
});
