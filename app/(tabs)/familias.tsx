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
import SeletorMapaLeaflet from '@/src/components/SeletorMapaLeaflet';
import { NeonButton } from '@/src/components/NeonButton';
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
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();

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
    setLatitude(familia.latitude);
    setLongitude(familia.longitude);
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
          latitude,
          longitude,
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
          latitude,
          longitude,
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
    setLatitude(undefined);
    setLongitude(undefined);
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
      <Text style={[styles.title, { color: cores.primary }]}>👨‍👩‍👧‍👦 Famílias</Text>
      <Text style={[styles.subtitle, { color: cores.textoSecundario }]}>
        {familias.length} família(s) • {pacientesEmFamilias.size} paciente(s) vinculados
      </Text>

      {/* ─── BOTÃO CRIAR / FORMULÁRIO ───────────────── */}
      {!mostrarForm ? (
        <NeonButton
          titulo="+ Nova Família"
          cor="#FFFFFF"
          onPress={() => { resetForm(); setMostrarForm(true); }}
        />
      ) : (
        <View style={[styles.formCard, { backgroundColor: cores.card, borderColor: cores.borda }]}>
          <Text style={[styles.formTitle, { color: cores.texto }]}>
            {editandoFamiliaId ? '✏️ Editar Família' : 'Nova Família'}
          </Text>

          {/* Se está editando, não mostra autocomplete de pacientes */}
          {!editandoFamiliaId && (
            <View style={styles.autocompleteWrapper}>
              <TextInput
                style={[styles.input, { backgroundColor: cores.card, borderColor: cores.borda, color: cores.texto }]}
                placeholder="Nome do responsável *"
                placeholderTextColor={cores.textoSecundario}
                value={nomeResp}
                onChangeText={handleNomeRespChange}
              />
              {sugestoesResp.length > 0 && (
                <View style={[styles.sugestoesBox, { backgroundColor: cores.card, borderColor: cores.borda }]}>
                  {sugestoesResp.map(p => (
                    <TouchableOpacity
                      key={p.id}
                      style={[styles.sugestaoItem, { borderBottomColor: cores.card }]}
                      onPress={() => selecionarResponsavel(p)}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {p.foto ? (
                          <Image source={{ uri: p.foto }} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }} />
                        ) : (
                          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: cores.card, justifyContent: 'center', alignItems: 'center', marginRight: 8 }}>
                            <Text style={{ fontSize: 14 }}>👤</Text>
                          </View>
                        )}
                        <Text style={[styles.sugestaoNome, { color: cores.texto }]}>{p.nome}</Text>
                      </View>
                      <Text style={[styles.sugestaoInfo, { color: cores.textoSecundario }]}>
                        {p.dataNascimento ? `🎂 ${p.dataNascimento}` : ''}
                        {p.endereco ? ` • 📍 ${p.endereco}` : ''}
                      </Text>
                      {(p.microareaProntuario || p.microarea) && (
                        <Text style={[styles.sugestaoInfo, { color: cores.textoSecundario }]}>
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
              style={[styles.input, { backgroundColor: cores.card, borderColor: cores.borda, color: cores.texto }]}
              placeholder="Nome do responsável *"
              placeholderTextColor={cores.textoSecundario}
              value={nomeResp}
              onChangeText={setNomeResp}
              autoCapitalize="words"
            />
          )}

          <TextInput
            ref={enderecoRef}
            style={[styles.input, { backgroundColor: cores.card, borderColor: cores.borda, color: cores.texto }]}
            placeholder="Endereço (rua, número) *"
            placeholderTextColor={cores.textoSecundario}
            value={endereco}
            onChangeText={setEndereco}
          />
          <TextInput
            style={[styles.input, { backgroundColor: cores.card, borderColor: cores.borda, color: cores.texto }]}
            placeholder="Bairro"
            placeholderTextColor={cores.textoSecundario}
            value={bairro}
            onChangeText={setBairro}
          />
          <TextInput
            style={[styles.input, { backgroundColor: cores.card, borderColor: cores.borda, color: cores.texto }]}
            placeholder="Microárea / Prontuário"
            placeholderTextColor={cores.textoSecundario}
            value={microarea}
            onChangeText={setMicroarea}
          />
          <TextInput
            style={[styles.input, { backgroundColor: cores.card, borderColor: cores.borda, color: cores.texto }]}
            placeholder="Telefone"
            placeholderTextColor={cores.textoSecundario}
            value={telefone}
            onChangeText={setTelefone}
            keyboardType="phone-pad"
          />

          <SeletorMapaLeaflet
            latitude={latitude}
            longitude={longitude}
            endereco={endereco}
            onSelecionar={(lat, lng) => {
              setLatitude(lat);
              setLongitude(lng);
            }}
          />

          <View style={styles.formActions}>
            <NeonButton
              titulo={salvando ? 'Salvando...' : editandoFamiliaId ? '💾 Salvar' : 'Criar Família'}
              cor="#FFFFFF"
              onPress={handleSalvarFamilia}
            />
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: cores.card }]}
              onPress={resetForm}
            >
              <Text style={[styles.btnCancelarText, { color: cores.textoSecundario }]}>Cancelar</Text>
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
          <View key={familia.id} style={[styles.familiaCard, { backgroundColor: cores.card, borderColor: cores.borda }]}>
            {/* Header com ações */}
            <View style={[styles.familiaHeader, { borderBottomColor: cores.card }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Text style={[styles.familiaNome, { color: cores.texto }]}>👤 {familia.nomeResponsavel}</Text>
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
              <Text style={[styles.familiaInfo, { color: cores.textoSecundario }]}>📍 {familia.endereco}{familia.bairro ? ` - ${familia.bairro}` : ''}</Text>
              {familia.microarea ? (
                <Text style={[styles.familiaInfo, { color: cores.textoSecundario }]}>🏷️ Microárea/Prontuário: {familia.microarea}</Text>
              ) : null}
              {familia.telefone ? (
                <Text style={[styles.familiaInfo, { color: cores.textoSecundario }]}>📞 {familia.telefone}</Text>
              ) : null}
            </View>

            {/* Membros atuais */}
            {membros.length > 0 && (
              <View style={[styles.membrosLista, { borderTopColor: cores.card }]}>
                <Text style={[styles.membrosTitle, { color: cores.textoSecundario }]}>
                  Membros ({membros.length}):
                </Text>
                {membros.map(m => (
                  <View key={m.id} style={[styles.membroItem, { borderBottomColor: cores.card }]}>
                    <TouchableOpacity
                      style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                      onPress={() => router.push({ pathname: '/(tabs)/detalhes', params: { id: m.id } })}
                    >
                      {m.foto ? (
                        <Image source={{ uri: m.foto }} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }} />
                      ) : (
                        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: cores.card, justifyContent: 'center', alignItems: 'center', marginRight: 8 }}>
                          <Text style={{ fontSize: 14 }}>👤</Text>
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.membroNome, { color: cores.texto }]}>{m.nome}</Text>
                        {m.dataNascimento && <Text style={{ fontSize: 11, color: cores.textoSecundario }}>🎂 {m.dataNascimento}</Text>}
                        {(m.microareaProntuario || m.microarea) && <Text style={{ fontSize: 11, color: cores.textoSecundario }}>🏷️ {m.microareaProntuario || m.microarea}</Text>}
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
                      <Text style={[styles.removerBtn, { color: '#E53935' }]}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {membros.length === 0 && (
              <Text style={[styles.semMembros, { color: cores.textoSecundario, borderTopColor: cores.card }]}>Nenhum membro vinculado ainda</Text>
            )}

            {/* Busca de membros (só pacientes disponíveis) */}
            {podeAdicionar ? (
              <>
                <TextInput
                  style={[styles.buscaInput, { backgroundColor: cores.card, color: cores.texto }]}
                  placeholder="🔍 Adicionar paciente pelo nome..."
                  placeholderTextColor={cores.textoSecundario}
                  value={termoBusca}
                  onChangeText={texto => handleBuscaMembroChange(familia.id, texto)}
                />

                {termoBusca.length > 0 && resultadosBusca.length > 0 && (
                  <View style={[styles.resultadosBusca, { borderColor: cores.borda }]}>
                    {resultadosBusca.map(p => (
                      <TouchableOpacity
                        key={p.id}
                        style={[styles.pacienteItem, { borderBottomColor: cores.card, backgroundColor: cores.card }]}
                        onPress={() => handleAdicionarMembro(familia.id, p.id)}
                      >
                        {p.foto ? (
                          <Image source={{ uri: p.foto }} style={[styles.pacienteItemFoto, { borderColor: cores.primary }]} />
                        ) : (
                          <View style={[styles.pacienteItemFotoPlaceholder, { backgroundColor: cores.card, borderColor: cores.borda }]}>
                            <Text style={styles.pacienteItemFotoEmoji}>👤</Text>
                          </View>
                        )}
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <Text style={[styles.pacienteItemNome, { color: cores.texto }]}>{p.nome}</Text>
                          <Text style={[styles.pacienteItemInfo, { color: cores.textoSecundario }]}>
                            {p.dataNascimento ? `🎂 ${p.dataNascimento} • ` : ''}
                            {p.endereco ? `📍 ${p.endereco}` : ''}
                          </Text>
                          {(p.microareaProntuario || p.microarea) && (
                            <Text style={[styles.pacienteItemInfo, { color: cores.textoSecundario }]}>
                              🏷️ {p.microareaProntuario || p.microarea}
                            </Text>
                          )}
                        </View>
                        <Text style={[styles.pacienteItemAdd, { color: cores.primary }]}>+</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {termoBusca.length > 0 && resultadosBusca.length === 0 && (
                  <Text style={[styles.semResultados, { color: cores.textoSecundario }]}>Nenhum paciente disponível com esse nome</Text>
                )}
              </>
            ) : (
              <Text style={[styles.semResultados, { color: cores.textoSecundario }]}>
                ✅ Todos os pacientes já estão vinculados a alguma família
              </Text>
            )}
          </View>
        );
      })}

      {familias.length === 0 && (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: cores.textoSecundario }]}>Nenhuma família cadastrada</Text>
          <Text style={[styles.emptySub, { color: cores.textoSecundario }]}>Crie a primeira família para agrupar pacientes do mesmo domicílio</Text>
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
    padding: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 15,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
  },

  // ─── Botão criar ─────────────────────────────────
  btnCriarText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  // ─── Formulário ──────────────────────────────────
  formCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    elevation: 2,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    height: 46,
    borderWidth: 1,
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
  btnCancelarText: {
    fontWeight: '600',
    fontSize: 15,
  },

  // ─── Autocomplete ────────────────────────────────
  autocompleteWrapper: {
    position: 'relative',
    zIndex: 10,
  },
  sugestoesBox: {
    borderWidth: 1,
    borderRadius: 8,
    marginTop: -8,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  sugestaoItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  sugestaoNome: {
    fontSize: 14,
    fontWeight: '600',
  },
  sugestaoInfo: {
    fontSize: 11,
    marginTop: 2,
  },

  // ─── Card de família ─────────────────────────────
  familiaCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  familiaHeader: {
    marginBottom: 12,
    borderBottomWidth: 1,
    paddingBottom: 10,
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
    flex: 1,
  },
  familiaInfo: {
    fontSize: 13,
    marginTop: 2,
  },

  // ─── Membros ─────────────────────────────────────
  membrosLista: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginBottom: 10,
  },
  membrosTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  membroItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  membroNome: {
    fontSize: 14,
  },
  removerBtn: {
    fontWeight: 'bold',
    fontSize: 16,
    padding: 4,
  },
  semMembros: {
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
  },

  // ─── Busca ───────────────────────────────────────
  buscaInput: {
    height: 40,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 13,
    marginBottom: 6,
  },
  resultadosBusca: {
    marginTop: 4,
    borderWidth: 1,
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
  },
  pacienteItemFoto: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
  },
  pacienteItemFotoPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  pacienteItemFotoEmoji: {
    fontSize: 16,
  },
  pacienteItemNome: {
    fontSize: 14,
    fontWeight: '600',
  },
  pacienteItemInfo: {
    fontSize: 11,
    marginTop: 2,
  },
  pacienteItemAdd: {
    fontSize: 22,
    fontWeight: 'bold',
    paddingLeft: 8,
  },
  semResultados: {
    fontSize: 12,
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
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 5,
    paddingHorizontal: 30,
  },
});
