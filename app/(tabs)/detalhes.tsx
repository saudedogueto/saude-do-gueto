import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  TextInput, Alert, Switch
} from 'react-native';
import { usePacientes } from '@/src/contexts/PacienteContext';
import { useVisitas, Visita } from '@/src/contexts/VisitaContext';
import { useTema } from '@/src/contexts/TemaContext';
import { useToast } from '@/src/components/Toast';
import { router, useLocalSearchParams } from 'expo-router';

type Aba = 'dados' | 'gestante' | 'visitas' | 'visita';
export default function DetalhesScreen() {
  const params = useLocalSearchParams();
  const { buscarPaciente, carregarPacientes, salvarPaciente } = usePacientes();
  const { visitasPorPaciente, carregarVisitas, salvarVisita } = useVisitas();
  const { cores } = useTema();
  const paciente = params?.id ? buscarPaciente(params.id as string) : null;
  const visitas = paciente ? visitasPorPaciente(paciente.id) : [];

  const { showToast } = useToast();
  const [aba, setAba] = useState<Aba>('dados');

  // ── Campos da visita ───────────────────────────────
  const [vPressaoS, setVPressaoS] = useState('');
  const [vPressaoD, setVPressaoD] = useState('');
  const [vGlicemia, setVGlicemia] = useState('');
  const [vMedicamentos, setVMedicamentos] = useState('');
  const [vObs, setVObs] = useState('');
  const [salvandoVisita, setSalvandoVisita] = useState(false);

  // ── Puerpério ──────────────────────────────────────
  const [puerperio, setPuerperio] = useState(paciente?.puerperio || false);
  const [dataParto, setDataParto] = useState(paciente?.dataParto || '');
  const [tipoParto, setTipoParto] = useState(paciente?.tipoParto || '');
  const [aleitamentoPuerp, setAleitamentoPuerp] = useState(paciente?.aleitamentoPuerperio || '');

  useEffect(() => { carregarPacientes(); carregarVisitas(); }, []);

  // Atualiza dados do paciente localmente quando recarrega
  useEffect(() => {
    if (paciente) {
      setPuerperio(paciente.puerperio || false);
      setDataParto(paciente.dataParto || '');
      setTipoParto(paciente.tipoParto || '');
      setAleitamentoPuerp(paciente.aleitamentoPuerperio || '');
    }
  }, [paciente?.id]);

  if (!paciente) {
    return (
      <View style={[styles.container, { backgroundColor: cores.fundo, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.notFound}>Paciente não encontrado</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSalvarVisita = async () => {
    if (!vPressaoS && !vPressaoD && !vGlicemia && !vMedicamentos && !vObs) {
      showToast('Preencha pelo menos um campo da visita', 'warning');
      return;
    }
    setSalvandoVisita(true);
    try {
      await salvarVisita({
        pacienteId: paciente.id,
        data: new Date().toISOString().split('T')[0],
        pressaoSistolica: vPressaoS,
        pressaoDiastolica: vPressaoD,
        glicemia: vGlicemia,
        medicamentos: vMedicamentos,
        observacoes: vObs,
      });
      // Atualiza ultimaVisita
      await salvarPaciente({
        ...paciente,
        id: paciente.id,
        ultimaVisita: new Date().toISOString().split('T')[0],
      });
      showToast('Visita registrada com sucesso!');
      setVPressaoS(''); setVPressaoD(''); setVGlicemia('');
      setVMedicamentos(''); setVObs('');
      setAba('visitas');
    } catch {
      showToast('Erro ao salvar visita', 'error');
    } finally {
      setSalvandoVisita(false);
    }
  };

  const handleSalvarPuerperio = async () => {
    try {
      await salvarPaciente({
        ...paciente,
        id: paciente.id,
        puerperio,
        dataParto,
        tipoParto,
        aleitamentoPuerperio: aleitamentoPuerp,
      });
      showToast('Dados de puerpério atualizados!');
    } catch {
      showToast('Erro ao salvar puerpério', 'error');
    }
  };

  const renderFoto = () => {
    if (!paciente.foto) return null;
    return <Image source={{ uri: paciente.foto }} style={styles.fotoDetalhe} />;
  };

  const renderAbas = () => (
    <View style={styles.abasRow}>
      {(['dados', ...(paciente.gestante ? ['gestante'] : []), 'visitas', 'visita'] as Aba[]).map(a => (
        <TouchableOpacity
          key={a}
          style={[styles.abaBtn, aba === a && styles.abaAtiva]}
          onPress={() => setAba(a)}
        >
          <Text style={[styles.abaText, aba === a && styles.abaTextAtiva]}>
            {a === 'dados' ? '📋 Dados' : a === 'gestante' ? '🤰 Gestante' : a === 'visitas' ? '📊 Visitas' : '➕ Visita'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderDados = () => (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Dados Pessoais</Text>
        {[
          ['CPF', paciente.cpf || '---'],
          ['Cartão SUS', paciente.cartaoSUS || '---'],
          ['Data de Nasc.', paciente.dataNascimento || '---'],
          ['Telefone', paciente.telefone || '---'],
          ['Endereço', paciente.endereco || '---'],
          ['Microárea / Prontuário', paciente.microareaProntuario || paciente.microarea || '---'],
          ['Cadastrado em', paciente.dataCadastro],
          ['Última visita', paciente.ultimaVisita || 'Nenhuma'],
        ].map(([label, value]) => (
          <View key={label} style={styles.row}>
            <Text style={styles.label}>{label}:</Text>
            <Text style={styles.value}>{value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🩺 Condições de Saúde</Text>
        {([
          ['🔴 Hipertensão', paciente.hipertensao],
          ['🔵 Diabetes', paciente.diabetes],
          ['🩷 Gestante', paciente.gestante],
          ['👶 Menor de 2 anos', paciente.menorDoisAnos],
        ] as [string, boolean][]).map(([label, ativo]) => (
          <View key={label} style={styles.condRow}>
            <Text style={styles.condLabel}>{label}</Text>
            <Text style={[styles.condValue, ativo ? styles.sim : styles.nao]}>
              {ativo ? '✅ Sim' : '❌ Não'}
            </Text>
          </View>
        ))}
      </View>

      {paciente.observacoes ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Observações</Text>
          <Text style={styles.obs}>{paciente.observacoes}</Text>
        </View>
      ) : null}
    </>
  );

  const renderGestante = () => (
    <>
      {/* Dados da gestação */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🤰 Acompanhamento Gestacional</Text>
        {[
          ['Idade gestacional', paciente.idadeGestacional || '---', 'semanas'],
          ['Consultas pré-natal', paciente.consultasPreNatal || '---'],
          ['DPP', paciente.dpp || '---'],
        ].map(([label, value, suffix]) => (
          <View key={label} style={styles.row}>
            <Text style={styles.label}>{label}:</Text>
            <Text style={styles.value}>{value}{suffix ? ` ${suffix}` : ''}</Text>
          </View>
        ))}
      </View>

      {/* Puerpério */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👩‍🍼 Puerpério</Text>
        <View style={[styles.switchRow, { backgroundColor: cores.input, borderColor: cores.borda }]}>
          <Text style={[styles.switchLabel, { color: cores.texto }]}>Em puerpério?</Text>
          <Switch
            value={puerperio}
            onValueChange={setPuerperio}
            trackColor={{ false: '#DDD', true: '#8E24AA' }}
            thumbColor={puerperio ? '#6A1B9A' : '#f4f3f4'}
          />
        </View>

        {puerperio && (
          <>
            <Text style={[styles.label, { color: cores.texto }]}>Data do parto</Text>
            <TextInput
              style={[styles.input, { backgroundColor: cores.input, color: cores.texto, borderColor: '#8E24AA' }]}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="#AAA"
              value={dataParto}
              onChangeText={(v) => {
                const nums = v.replace(/\D/g, '').slice(0, 8);
                setDataParto(nums.replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{2})(\d)/, '$1/$2'));
              }}
              keyboardType="numeric"
              maxLength={10}
            />

            <Text style={[styles.label, { color: cores.texto }]}>Tipo de parto</Text>
            <View style={styles.optionsRow}>
              {['Normal', 'Cesárea'].map(op => (
                <TouchableOpacity
                  key={op}
                  style={[styles.optionChip, { backgroundColor: tipoParto === op ? '#8E24AA' : cores.input, borderColor: tipoParto === op ? '#8E24AA' : cores.borda }]}
                  onPress={() => setTipoParto(op)}
                >
                  <Text style={{ color: tipoParto === op ? '#FFF' : cores.texto, fontWeight: tipoParto === op ? 'bold' : 'normal' }}>{op}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: cores.texto }]}>Aleitamento</Text>
            <View style={styles.optionsRow}>
              {['Sim', 'Não', 'Dificuldade'].map(op => (
                <TouchableOpacity
                  key={op}
                  style={[styles.optionChip, { backgroundColor: aleitamentoPuerp === op ? '#8E24AA' : cores.input, borderColor: aleitamentoPuerp === op ? '#8E24AA' : cores.borda }]}
                  onPress={() => setAleitamentoPuerp(op)}
                >
                  <Text style={{ color: aleitamentoPuerp === op ? '#FFF' : cores.texto, fontWeight: aleitamentoPuerp === op ? 'bold' : 'normal' }}>
                    {op === 'Sim' ? '🤱 Sim' : op === 'Não' ? '🚫 Não' : '⚠️ Dificuldade'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={[styles.buttonSmall]} onPress={handleSalvarPuerperio}>
              <Text style={styles.buttonText}>Salvar Puerpério</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Menor de 2 anos */}
      {paciente.menorDoisAnos && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👶 Acompanhamento Infantil</Text>
          {[
            ['Peso ao nascer', paciente.pesoNascer || '---', 'kg'],
            ['Caderneta de vacinação', paciente.vacinacaoDia ? '✅ Em dia' : '❌ Atrasada'],
            ['Aleitamento', paciente.aleitamentoBebe || '---'],
          ].map(([label, value]) => (
            <View key={label} style={styles.row}>
              <Text style={styles.label}>{label}:</Text>
              <Text style={styles.value}>{value}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Botão editar */}
      <TouchableOpacity style={styles.button} onPress={() => router.push(`/(tabs)/cadastro?id=${paciente.id}`)}>
        <Text style={styles.buttonText}>✏️ Editar Paciente</Text>
      </TouchableOpacity>
    </>
  );

  const renderVisitas = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📊 Histórico de Visitas</Text>
      {visitas.length === 0 ? (
        <Text style={styles.obs}>Nenhuma visita registrada ainda.</Text>
      ) : (
        visitas.map(v => (
          <View key={v.id} style={styles.visitaCard}>
            <Text style={styles.visitaData}>📅 {v.data}</Text>
            {v.pressaoSistolica && <Text style={styles.visitaItem}>🫀 PA: {v.pressaoSistolica}/{v.pressaoDiastolica} mmHg</Text>}
            {v.glicemia && <Text style={styles.visitaItem}>🩸 Glicemia: {v.glicemia}</Text>}
            {v.medicamentos && <Text style={styles.visitaItem}>💊 Medicamentos: {v.medicamentos}</Text>}
            {v.observacoes && <Text style={styles.visitaItemObs}>{v.observacoes}</Text>}
          </View>
        ))
      )}
    </View>
  );

  const renderVisitaForm = () => (
    <ScrollView>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>➕ Registrar Visita</Text>
        <Text style={styles.visitaData}>📅 {new Date().toLocaleDateString('pt-BR')}</Text>

        <Text style={[styles.label, { color: cores.texto }]}>Pressão arterial</Text>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <TextInput
            style={[styles.input, { flex: 1, backgroundColor: cores.input, color: cores.texto, borderColor: cores.borda }]}
            placeholder="Sistólica"
            placeholderTextColor="#AAA"
            value={vPressaoS}
            onChangeText={setVPressaoS}
            keyboardType="numeric"
          />
          <Text style={{ fontSize: 18, color: cores.texto }}>/</Text>
          <TextInput
            style={[styles.input, { flex: 1, backgroundColor: cores.input, color: cores.texto, borderColor: cores.borda }]}
            placeholder="Diastólica"
            placeholderTextColor="#AAA"
            value={vPressaoD}
            onChangeText={setVPressaoD}
            keyboardType="numeric"
          />
          <Text style={{ fontSize: 14, color: cores.textoSecundario }}>mmHg</Text>
        </View>

        <Text style={[styles.label, { color: cores.texto }]}>Glicemia</Text>
        <TextInput
          style={[styles.input, { backgroundColor: cores.input, color: cores.texto, borderColor: cores.borda }]}
          placeholder="Ex: 95"
          placeholderTextColor="#AAA"
          value={vGlicemia}
          onChangeText={setVGlicemia}
          keyboardType="numeric"
        />

        <Text style={[styles.label, { color: cores.texto }]}>Medicamentos em uso</Text>
        <TextInput
          style={[styles.input, { backgroundColor: cores.input, color: cores.texto, borderColor: cores.borda }]}
          placeholder="Ex: Captopril 25mg, Metformina 850mg"
          placeholderTextColor="#AAA"
          value={vMedicamentos}
          onChangeText={setVMedicamentos}
        />

        <Text style={[styles.label, { color: cores.texto }]}>Observações da visita</Text>
        <TextInput
          style={[styles.input, styles.observacoes, { backgroundColor: cores.input, color: cores.texto, borderColor: cores.borda }]}
          placeholder="Anotações sobre o estado do paciente..."
          placeholderTextColor="#AAA"
          value={vObs}
          onChangeText={setVObs}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.button, salvandoVisita && styles.buttonDisabled]}
          onPress={handleSalvarVisita}
          disabled={salvandoVisita}
        >
          <Text style={styles.buttonText}>{salvandoVisita ? 'Salvando...' : '✅ Finalizar Visita'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: cores.fundo }]}>
      <View style={styles.header}>
        {renderFoto()}
        <Text style={styles.nome}>{paciente.nome}</Text>
        {(paciente.microareaProntuario || paciente.microarea) && <Text style={styles.microarea}>📍 {paciente.microareaProntuario || paciente.microarea}</Text>}
      </View>

      {renderAbas()}

      {aba === 'dados' && renderDados()}
      {aba === 'gestante' && renderGestante()}
      {aba === 'visitas' && renderVisitas()}
      {aba === 'visita' && renderVisitaForm()}

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { fontSize: 18, color: '#999', textAlign: 'center', marginBottom: 20 },
  header: { padding: 20, alignItems: 'center', marginBottom: 5 },
  fotoDetalhe: { width: 80, height: 80, borderRadius: 40, marginBottom: 12, borderWidth: 3, borderColor: '#FF8C00' },
  nome: { fontSize: 24, fontWeight: 'bold', color: '#222', textAlign: 'center' },
  microarea: { fontSize: 14, color: '#FF8C00', marginTop: 5 },
  abasRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 15, gap: 6 },
  abaBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#F0F0F0', alignItems: 'center' },
  abaAtiva: { backgroundColor: '#FF8C00' },
  abaText: { fontSize: 13, fontWeight: '600', color: '#666' },
  abaTextAtiva: { color: '#FFF' },
  section: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginHorizontal: 16, marginBottom: 15, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#FF8C00', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  label: { fontSize: 14, color: '#666' },
  value: { fontSize: 14, color: '#333', fontWeight: '500', textAlign: 'right', flex: 1, marginLeft: 10 },
  condRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  condLabel: { fontSize: 15, color: '#444' },
  condValue: { fontSize: 15, fontWeight: '600' },
  sim: { color: '#2E7D32' },
  nao: { color: '#999' },
  obs: { fontSize: 14, color: '#555', lineHeight: 22 },
  button: { backgroundColor: '#FF8C00', height: 48, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  buttonSmall: { backgroundColor: '#8E24AA', height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  input: { height: 48, borderWidth: 1, borderRadius: 8, marginBottom: 12, paddingHorizontal: 14, fontSize: 16 },
  observacoes: { height: 100, paddingTop: 12 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 8, marginBottom: 10, borderWidth: 1 },
  switchLabel: { fontSize: 16 },
  optionsRow: { flexDirection: 'row', gap: 8, marginBottom: 15, flexWrap: 'wrap' },
  optionChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1 },
  visitaCard: { backgroundColor: '#F9F9F9', borderRadius: 8, padding: 12, marginBottom: 8 },
  visitaData: { fontSize: 14, fontWeight: 'bold', color: '#FF8C00', marginBottom: 4 },
  visitaItem: { fontSize: 14, color: '#444', marginBottom: 2 },
  visitaItemObs: { fontSize: 13, color: '#666', fontStyle: 'italic', marginTop: 4 },
});
