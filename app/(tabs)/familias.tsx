import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, FlatList, Alert, Image
} from 'react-native';
import { usePacientes, Paciente } from '@/src/contexts/PacienteContext';
import { useFamilias, Familia } from '@/src/contexts/FamiliaContext';
import { useTema } from '@/src/contexts/TemaContext';
import { useToast } from '@/src/components/Toast';
import { ConfirmDialog } from '@/src/components/ConfirmDialog';
import { router } from 'expo-router';

export default function FamiliasScreen() {
  const { pacientes, carregarPacientes } = usePacientes();
  const {
    familias, carregarFamilias, criarFamilia,
    atualizarFamilia, adicionarMembro, removerMembro, excluirFamilia
  } = useFamilias();
  const { cores } = useTema();
  const { showToast } = useToast();
  const [salvando, setSalvando] = useState(false);

  // ─── Form de família ──────────────────────────────
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoFamiliaId, setEditandoFamiliaId] = useState<string | null>(null);
  const [nomeResp, setNomeResp] = useState('');
  const [sugestoesResp, setSugestoesResp] = useState<Paciente[]>([]);
  const [respSelecionado, setRespSelecionado] = useState<Paciente | null>(null);
  const enderecoRef = useRef<TextInput>(null);
  const [endereco, setEndereco] = useState('');
  const [bairro, setBairro] = useState('');
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

  // ─── Abrir formulário para editar ────────────────────
  const abrirEdicao = useCallback((familia: Familia) => {
    setEditandoFamiliaId(familia.id);
    setNomeResp(familia.nomeResponsavel);
    setEndereco(familia.endereco);
    setBairro(familia.bairro || '');
    setMicroarea(familia.microarea);
    setTelefone(familia.telefone);
    setRespSelecionado(null);
    setSugestoesResp([]);
    setMostrarForm(true);
  }, []);

  // ─── Autocomplete do responsável ─────────────────────
  const handleNomeRespChange = useCallback((texto: string) => {
    setNomeResp(texto);
    setRespSelecionado(null);
    if (texto.trim().length >= 1) {
      const t = texto.toLowerCase();
      const encontrados = pacientes.filter(p => p.nome.toLowerCase().includes(t));
      setSugestoesResp(encontrados.slice(0, 8));
    } else {
      setSugestoesResp([]);
    }
  }, [pacientes]);

  const selecionarResponsavel = useCallback((paciente: Paciente) => {
    setRespSelecionado(paciente);
    setNomeResp(paciente.nome);
    setSugestoesResp([]);
    // Preenche TODOS os campos com os dados do paciente
    const micro = paciente.microareaProntuario || paciente.microarea || '';
    setEndereco(paciente.endereco || '');
    setBairro('');
    setMicroarea(micro);
    setTelefone(paciente.telefone || '');
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

  // ─── Salvar (criar ou editar) ────────────────────────
  const handleSalvarFamilia = async () => {
    if (!nomeResp.trim() || !endereco.trim()) {
      showToast('Nome do responsável e endereço são obrigatórios', 'warning');
      return;
    }
    setSalvando(true);
    try {
      if (editandoFamiliaId) {
        // Editar
        await atualizarFamilia(editandoFamiliaId, {
          nomeResponsavel: nomeResp.trim(),
          endereco: endereco.trim(),
          bairro: bairro.trim(),
          microarea: microarea.trim(),
          telefone: telefone.trim(),
        });
        showToast('Família atualizada com sucesso!');
      } else {
        // Criar
        const familiaId = await criarFamilia({
          nomeResponsavel: nomeResp.trim(),
          endereco: endereco.trim(),
          bairro: bairro.trim(),
          microarea: microarea.trim(),
          telefone: telefone.trim(),
        });
        if (respSelecionado) {
          await adicionarMembro(familiaId, respSelecionado.id);
        }
        showToast('Família cadastrada com sucesso!');
      }
      resetForm();
      carregarFamilias();
    } catch (error) {
      showToast('Erro ao salvar família', 'error');
    } finally {
      setSalvando(false);
    }
  };

  const resetForm = () => {
    setNomeResp('');
    setEndereco('');
    setBairro('');
    setMicroarea('');
    setTelefone('');
    setRespSelecionado(null);
    setSugestoesResp([]);
    setMostrarForm(false);
    setEditandoFamiliaId(null);
  };

  // ─── Adicionar membro ────────────────────────────────
  const handleAdicionarMembro = async (familiaId: string, pacienteId: string) => {
    await adicionarMembro(familiaId, pacienteId);
    setBuscasMembros(prev => ({ ...prev, [familiaId]: '' }));
    carregarFamilias();
    showToast('Membro adicionado à família');
  };

  // ─── Excluir família ─────────────────────────────────
  const [excluirConfirm, setExcluirConfirm] = useState<Familia | null>(null);
  
  const handleExcluirFamilia = (familia: Familia) => {
    setExcluirConfirm(familia);
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
          onPress={() => { resetForm(); setMostrarForm(true); }}
        >
          <Text style={styles.btnCriarText}>+ Nova Família</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>
            {editandoFamiliaId ? '✏️ Editar Família' : 'Nova Família'}
          </Text>

          {/* Se está editando, não mostra autocomplete de pacientes */}
          {!editandoFamiliaId && (
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
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {p.foto ? (
                          <Image source={{ uri: p.foto }} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }} />
                        ) : (
                          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', marginRight: 8 }}>
                            <Text style={{ fontSize: 14 }}>👤</Text>
                          </View>
                        )}
                        <Text style={styles.sugestaoNome}>{p.nome}</Text>
                      </View>
                      <Text style={styles.sugestaoInfo}>
                        {p.dataNascimento ? `🎂 ${p.dataNascimento}` : ''}
                        {p.endereco ? ` • 📍 ${p.endereco}` : ''}
                      </Text>
                      {(p.microareaProntuario || p.microarea) && (
                        <Text style={styles.sugestaoInfo}>
                          🏷️ {p.microareaProntuario || p.microarea}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {editandoFamiliaId && (
            <TextInput
              style={styles.input}
              placeholder="Nome do responsável *"
              value={nomeResp}
              onChangeText={setNomeResp}
              autoCapitalize="words"
            />
          )}

          <TextInput
            ref={enderecoRef}
            style={styles.input}
            placeholder="Endereço (rua, número) *"
            value={endereco}
            onChangeText={setEndereco}
          />
          <TextInput
            style={styles.input}
            placeholder="Bairro"
            value={bairro}
            onChangeText={setBairro}
          />
          <TextInput
            style={styles.input}
            placeholder="Microárea / Prontuário"
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
              onPress={handleSalvarFamilia}
              disabled={salvando}
            >
              <Text style={styles.btnSalvarText}>
                {salvando ? 'Salvando...' : editandoFamiliaId ? '💾 Salvar' : 'Criar Família'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnCancelar]}
              onPress={resetForm}
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
        const podeAdicionar = pacientesDisponiveis.length > 0;

        return (
          <View key={familia.id} style={styles.familiaCard}>
            {/* Header com ações */}
            <View style={styles.familiaHeader}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Text style={styles.familiaNome}>👤 {familia.nomeResponsavel}</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => abrirEdicao(familia)}
                    style={styles.headerAction}
                  >
                    <Text style={styles.headerActionText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleExcluirFamilia(familia)}
                    style={styles.headerAction}
                  >
                    <Text style={{ fontSize: 16, color: '#E53935' }}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.familiaInfo}>📍 {familia.endereco}{familia.bairro ? ` - ${familia.bairro}` : ''}</Text>
              {familia.microarea ? (
                <Text style={styles.familiaInfo}>🏷️ Microárea/Prontuário: {familia.microarea}</Text>
              ) : null}
              {familia.telefone ? (
                <Text style={styles.familiaInfo}>📞 {familia.telefone}</Text>
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
                    <TouchableOpacity
                      style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                      onPress={() => router.push({ pathname: '/(tabs)/detalhes', params: { id: m.id } })}
                    >
                      {m.foto ? (
                        <Image source={{ uri: m.foto }} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }} />
                      ) : (
                        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', marginRight: 8 }}>
                          <Text style={{ fontSize: 14 }}>👤</Text>
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={styles.membroNome}>{m.nome}</Text>
                        {m.dataNascimento && <Text style={{ fontSize: 11, color: '#999' }}>🎂 {m.dataNascimento}</Text>}
                        {(m.microareaProntuario || m.microarea) && <Text style={{ fontSize: 11, color: '#999' }}>🏷️ {m.microareaProntuario || m.microarea}</Text>}
                      </View>
                    </TouchableOpacity>
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

            {membros.length === 0 && (
              <Text style={styles.semMembros}>Nenhum membro vinculado ainda</Text>
            )}

            {/* Busca de membros (só pacientes disponíveis) */}
            {podeAdicionar ? (
              <>
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
                        {p.foto ? (
                          <Image source={{ uri: p.foto }} style={styles.pacienteItemFoto} />
                        ) : (
                          <View style={styles.pacienteItemFotoPlaceholder}>
                            <Text style={styles.pacienteItemFotoEmoji}>👤</Text>
                          </View>
                        )}
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <Text style={styles.pacienteItemNome}>{p.nome}</Text>
                          <Text style={styles.pacienteItemInfo}>
                            {p.dataNascimento ? `🎂 ${p.dataNascimento} • ` : ''}
                            {p.endereco ? `📍 ${p.endereco}` : ''}
                          </Text>
                          {(p.microareaProntuario || p.microarea) && (
                            <Text style={styles.pacienteItemInfo}>
                              🏷️ {p.microareaProntuario || p.microarea}
                            </Text>
                          )}
                        </View>
                        <Text style={styles.pacienteItemAdd}>+</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {termoBusca.length > 0 && resultadosBusca.length === 0 && (
                  <Text style={styles.semResultados}>Nenhum paciente disponível com esse nome</Text>
                )}
              </>
            ) : (
              <Text style={styles.semResultados}>
                ✅ Todos os pacientes já estão vinculados a alguma família
              </Text>
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

      <ConfirmDialog
        visivel={excluirConfirm !== null}
        titulo="Excluir Família"
        mensagem={`Tem certeza que deseja excluir a família de ${excluirConfirm?.nomeResponsavel}?\n${excluirConfirm?.membros.length || 0} membro(s) serão desvinculados.`}
        confirmarTexto="Excluir"
        tipo="danger"
        onConfirmar={async () => {
          if (excluirConfirm) {
            await excluirFamilia(excluirConfirm.id);
            carregarFamilias();
            showToast('Família excluída');
          }
          setExcluirConfirm(null);
        }}
        onCancelar={() => setExcluirConfirm(null)}
      />
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
  headerAction: {
    padding: 4,
  },
  headerActionText: {
    fontSize: 16,
  },
  familiaNome: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
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
  semMembros: {
    fontSize: 12,
    color: '#CCC',
    textAlign: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
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
  pacienteItemFoto: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FF8C00',
  },
  pacienteItemFotoPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  pacienteItemFotoEmoji: {
    fontSize: 16,
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
