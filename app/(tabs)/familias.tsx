import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [criando, setCriando] = useState(false);

  // ─── Form de nova família ───────────────────────────
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nomeResp, setNomeResp] = useState('');
  const [sugestoesResp, setSugestoesResp] = useState<Paciente[]>([]);
  const [respSelecionado, setRespSelecionado] = useState<Paciente | null>(null);
  const enderecoRef = useRef<TextInput>(null);
  const [endereco, setEndereco] = useState('');
  const [microarea, setMicroarea] = useState('');
  const [telefone, setTelefone] = useState('');

  // ─── Busca de membros (separada por família) ─────────
  const [buscasMembros, setBuscasMembros] = useState<Record<string, string>>({});

  // IDs dos pacientes que já estão em alguma família
  const pacientesEmFamilias = new Set<string>();
  familias.forEach(f => f.membros.forEach(id => pacientesEmFamilias.add(id)));

  // Pacientes disponíveis pra adicionar (sem família)
  const pacientesDisponiveis = pacientes.filter(p => !pacientesEmFamilias.has(p.id));

  useEffect(() => {
    carregarFamilias();
    carregarPacientes();
  }, []);

  // ─── Autocomplete do responsável ─────────────────────
  const handleNomeRespChange = useCallback((texto: string) => {
    setNomeResp(texto);
    setRespSelecionado(null);
    if (texto.trim().length >= 1) {
      const t = texto.toLowerCase();
      const encontrados = pacientes.filter(p => p.nome.toLowerCase().includes(t));
      setSugestoesResp(encontrados.slice(0, 8)); // max 8 sugestões
    } else {
      setSugestoesResp([]);
    }
  }, [pacientes]);

  const selecionarResponsavel = useCallback((paciente: Paciente) => {
    setRespSelecionado(paciente);
    setNomeResp(paciente.nome);
    setSugestoesResp([]);
    // Se o paciente já tem endereço, preenche automaticamente
    if (paciente.endereco) setEndereco(paciente.endereco);
    if (paciente.microarea) setMicroarea(paciente.microarea);
    if (paciente.telefone) setTelefone(paciente.telefone);
    enderecoRef.current?.focus();
  }, []);

  // ─── Busca de membros (separada) ─────────────────────
  const handleBuscaMembroChange = useCallback((familiaId: string, texto: string) => {
    setBuscasMembros(prev => ({ ...prev, [familiaId]: texto }));
  }, []);

  const getPacientesFiltrados = useCallback((familiaId: string) => {
    const termo = (buscasMembros[familiaId] || '').toLowerCase().trim();
    if (!termo) return [];
    return pacientesDisponiveis.filter(p =>
      p.nome.toLowerCase().includes(termo)
    );
  }, [buscasMembros, pacientesDisponiveis]);

  // ─── Criar família ───────────────────────────────────
  const handleCriarFamilia = async () => {
    if (!nomeResp.trim() || !endereco.trim()) {
      Alert.alert('Atenção', 'Nome do responsável e endereço são obrigatórios');
      return;
    }
    setCriando(true);
    try {
      const familiaId = await criarFamilia({
        nomeResponsavel: nomeResp.trim(),
        endereco: endereco.trim(),
        microarea: microarea.trim(),
        telefone: telefone.trim(),
      });
      // Se selecionou um paciente existente como responsável, já adiciona como membro
      if (respSelecionado) {
        await adicionarMembro(familiaId, respSelecionado.id);
      }
      Alert.alert('Família criada!', 'Nova família registrada com sucesso');
      // Reset do formulário
      setNomeResp('');
      setEndereco('');
      setMicroarea('');
      setTelefone('');
      setRespSelecionado(null);
      setSugestoesResp([]);
      setMostrarForm(false);
      carregarFamilias();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar a família');
    } finally {
      setCriando(false);
    }
  };

  const cancelarForm = () => {
    setMostrarForm(false);
    setNomeResp('');
    setEndereco('');
    setMicroarea('');
    setTelefone('');
    setRespSelecionado(null);
    setSugestoesResp([]);
  };

  // ─── Adicionar membro ────────────────────────────────
  const handleAdicionarMembro = async (familiaId: string, pacienteId: string) => {
    await adicionarMembro(familiaId, pacienteId);
    setBuscasMembros(prev => ({ ...prev, [familiaId]: '' }));
    carregarFamilias();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: cores.fundo }]}>
      <Text style={styles.title}>👨‍👩‍👧‍👦 Famílias</Text>
      <Text style={styles.subtitle}>
        {familias.length} família(s) • {pacientesEmFamilias.size} paciente(s) vinculados
      </Text>

      {/* ─── BOTÃO CRIAR / FORMULÁRIO ───────────────── */}
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

          {/* Responsável com autocomplete */}
          <View style={styles.autocompleteWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Nome do responsável *"
              value={nomeResp}
              onChangeText={handleNomeRespChange}
            />
            {sugestoesResp.length > 0 && (
              <View style={styles.sugestoesBox}>
                {sugestoesResp.map(p => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.sugestaoItem}
                    onPress={() => selecionarResponsavel(p)}
                  >
                    <Text style={styles.sugestaoNome}>{p.nome}</Text>
                    <Text style={styles.sugestaoInfo}>
                      {p.endereco ? `📍 ${p.endereco}` : ''}
                      {p.microarea ? ` • 🏷️ ${p.microarea}` : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <TextInput
            ref={enderecoRef}
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
              onPress={cancelarForm}
            >
              <Text style={styles.btnCancelarText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ─── LISTA DE FAMÍLIAS ─────────────────────── */}
      {familias.map(familia => {
        const membros = familia.membros
          .map(id => pacientes.find(p => p.id === id))
          .filter(Boolean) as Paciente[];

        const termoBusca = buscasMembros[familia.id] || '';
        const resultadosBusca = getPacientesFiltrados(familia.id);

        return (
          <View key={familia.id} style={styles.familiaCard}>
            <View style={styles.familiaHeader}>
              <Text style={styles.familiaNome}>👤 {familia.nomeResponsavel}</Text>
              <Text style={styles.familiaInfo}>📍 {familia.endereco}</Text>
              {familia.microarea ? (
                <Text style={styles.familiaInfo}>🏷️ Área: {familia.microarea}</Text>
              ) : null}
            </View>

            {/* Membros atuais */}
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

            {/* Busca de membros (só pacientes disponíveis) */}
            <TextInput
              style={styles.buscaInput}
              placeholder="🔍 Adicionar paciente pelo nome..."
              value={termoBusca}
              onChangeText={texto => handleBuscaMembroChange(familia.id, texto)}
            />

            {termoBusca.length > 0 && resultadosBusca.length > 0 && (
              <View style={styles.resultadosBusca}>
                {resultadosBusca.map(p => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.pacienteItem}
                    onPress={() => handleAdicionarMembro(familia.id, p.id)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pacienteItemNome}>{p.nome}</Text>
                      <Text style={styles.pacienteItemInfo}>
                        {p.endereco ? `📍 ${p.endereco}` : ''}
                        {p.microarea ? ` • 🏷️ ${p.microarea}` : ''}
                      </Text>
                    </View>
                    <Text style={styles.pacienteItemAdd}>+</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {termoBusca.length > 0 && resultadosBusca.length === 0 && (
              <Text style={styles.semResultados}>Nenhum paciente disponível com esse nome</Text>
            )}
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

  // ─── Botão criar ─────────────────────────────────
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

  // ─── Formulário ──────────────────────────────────
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

  // ─── Autocomplete ────────────────────────────────
  autocompleteWrapper: {
    position: 'relative',
    zIndex: 10,
  },
  sugestoesBox: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginTop: -8,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  sugestaoItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sugestaoNome: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  sugestaoInfo: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },

  // ─── Card de família ─────────────────────────────
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

  // ─── Membros ─────────────────────────────────────
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

  // ─── Busca ───────────────────────────────────────
  buscaInput: {
    height: 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 13,
    marginBottom: 6,
  },
  resultadosBusca: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    overflow: 'hidden',
  },
  pacienteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FAFAFA',
  },
  pacienteItemNome: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  pacienteItemInfo: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  pacienteItemAdd: {
    fontSize: 22,
    color: '#FF8C00',
    fontWeight: 'bold',
    paddingLeft: 8,
  },
  semResultados: {
    fontSize: 12,
    color: '#CCC',
    textAlign: 'center',
    paddingVertical: 10,
  },

  // ─── Empty state ─────────────────────────────────
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
