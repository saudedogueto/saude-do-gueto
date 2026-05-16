import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  Alert, Switch, ScrollView, TouchableOpacity, Platform, Keyboard,
  Image, ActivityIndicator
} from 'react-native';
import { usePacientes } from '@/src/contexts/PacienteContext';
import { useTema } from '@/src/contexts/TemaContext';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  mascaraCPF,
  mascaraTelefone,
  mascaraData,
  mascaraCEP,
  validarCPF,
  validarData,
  validarTelefone,
  buscarCEP,
} from '@/src/utils/mascaras';

// ─── Cores dos switches ────────────────────────────────────────────────

const SWITCH_CORES = {
  hipertensao:   { trackAtivo: '#E53935', thumbAtivo: '#C62828' },
  diabetes:      { trackAtivo: '#1E88E5', thumbAtivo: '#1565C0' },
  gestante:      { trackAtivo: '#D81B60', thumbAtivo: '#AD1457' },
  menuorDoisAnos: { trackAtivo: '#43A047', thumbAtivo: '#2E7D32' },
  puerperio:     { trackAtivo: '#8E24AA', thumbAtivo: '#6A1B9A' },
};

const placeholderCor = (coresHover: any, isEscuro: boolean): string =>
  isEscuro ? '#777' : '#AAA';

// ─── Componente ────────────────────────────────────────────────────────

export default function CadastroScreen() {
  const params = useLocalSearchParams();
  const { salvarPaciente, buscarPaciente } = usePacientes();
  const { cores, isEscuro } = useTema();
  const editando = !!params?.id;
  const scrollRef = useRef<ScrollView>(null);

  const p = params?.id ? buscarPaciente(params.id as string) : null;

  const [nome, setNome] = useState(p?.nome || '');
  const [cpf, setCpf] = useState(p?.cpf || '');
  const [dataNascimento, setDataNascimento] = useState(p?.dataNascimento || '');
  const [cartaoSUS, setCartaoSUS] = useState(p?.cartaoSUS || '');
  const [telefone, setTelefone] = useState(p?.telefone || '');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState(p?.endereco || '');
  const [bairro, setBairro] = useState('');
  const [microarea, setMicroarea] = useState(p?.microarea || '');
  const [hipertensao, setHipertensao] = useState(p?.hipertensao || false);
  const [diabetes, setDiabetes] = useState(p?.diabetes || false);
  const [gestante, setGestante] = useState(p?.gestante || false);
  const [menorDoisAnos, setMenorDoisAnos] = useState(p?.menorDoisAnos || false);
  const [observacoes, setObservacoes] = useState(p?.observacoes || '');
  const [fotoUri, setFotoUri] = useState(p?.foto || '');

  // Campos gestante 🤰
  const [idadeGestacional, setIdadeGestacional] = useState(p?.idadeGestacional || '');
  const [consultasPreNatal, setConsultasPreNatal] = useState(p?.consultasPreNatal || '');
  const [dpp, setDpp] = useState(p?.dpp || '');

  // Campos menor de 2 anos 👶
  const [pesoNascer, setPesoNascer] = useState(p?.pesoNascer || '');
  const [vacinacaoDia, setVacinacaoDia] = useState(p?.vacinacaoDia || false);
  const [aleitamentoBebe, setAleitamentoBebe] = useState(p?.aleitamentoBebe || '');

  const [prontuario, setProntuario] = useState(p?.prontuario || '');

  const [salvando, setSalvando] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);

  // Máscaras
  const handleCpfChange = useCallback((v: string) => setCpf(mascaraCPF(v)), []);
  const handleTelChange = useCallback((v: string) => setTelefone(mascaraTelefone(v)), []);
  const handleDataChange = useCallback((v: string) => setDataNascimento(mascaraData(v)), []);
  const handleDppChange = useCallback((v: string) => setDpp(mascaraData(v)), []);

  const handleCepChange = useCallback(async (v: string) => {
    const mascarado = mascaraCEP(v);
    setCep(mascarado);
    const nums = mascarado.replace(/\D/g, '');
    if (nums.length === 8) {
      setBuscandoCep(true);
      const result = await buscarCEP(mascarado);
      if (result) {
        setEndereco(result.logradouro ? `${result.logradouro}, ` : '');
        setBairro(result.bairro);
        if (!microarea) setMicroarea(result.bairro);
      } else {
        Alert.alert('CEP não encontrado', 'Verifique o número digitado.');
      }
      setBuscandoCep(false);
    }
  }, [microarea]);

  // Foto
  const handleTirarFoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) setFotoUri(result.assets[0].uri);
  }, []);

  const handleEscolherGaleria = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) setFotoUri(result.assets[0].uri);
  }, []);

  const handleFotoPress = useCallback(() => {
    Alert.alert('Foto do Paciente', 'Como deseja adicionar?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Tirar Foto', onPress: handleTirarFoto },
      { text: 'Escolher da Galeria', onPress: handleEscolherGaleria },
    ]);
  }, [handleTirarFoto, handleEscolherGaleria]);

  // Validação
  const validarFormulario = (): string | null => {
    if (!nome.trim()) return 'Nome do paciente é obrigatório';
    if (nome.trim().length < 3) return 'Nome deve ter pelo menos 3 caracteres';
    if (cpf.replace(/\D/g, '').length > 0 && !validarCPF(cpf)) return 'CPF inválido. Verifique o número.';
    if (dataNascimento.replace(/\D/g, '').length > 0 && !validarData(dataNascimento)) return 'Data de nascimento inválida.';
    if (telefone.replace(/\D/g, '').length > 0 && !validarTelefone(telefone)) return 'Telefone incompleto.';
    return null;
  };

  // Salvar
  const handleSalvar = async () => {
    Keyboard.dismiss();
    const erro = validarFormulario();
    if (erro) {
      Alert.alert('Atenção', erro);
      return;
    }
    setSalvando(true);
    try {
      const enderecoCompleto = [endereco, bairro].filter(Boolean).join(' - ');
      await salvarPaciente({
        id: editando ? (params.id as string) : undefined,
        nome: nome.trim(),
        cpf: cpf.trim(),
        dataNascimento,
        cartaoSUS: cartaoSUS.trim(),
        telefone: telefone.trim(),
        endereco: enderecoCompleto || endereco.trim(),
        microarea: microarea.trim(),
        hipertensao,
        diabetes,
        gestante,
        observacoes: observacoes.trim(),
        foto: fotoUri,
        prontuario: prontuario.trim(),
        // Gestante 🤰
        idadeGestacional: gestante ? idadeGestacional : undefined,
        consultasPreNatal: gestante ? consultasPreNatal : undefined,
        dpp: gestante ? dpp : undefined,
        // Menor 2 anos 👶
        menorDoisAnos,
        pesoNascer: menorDoisAnos ? pesoNascer : undefined,
        vacinacaoDia: menorDoisAnos ? vacinacaoDia : false,
        aleitamentoBebe: menorDoisAnos ? aleitamentoBebe : undefined,
        // Puerpério começa false no cadastro
        puerperio: false,
      });
      Alert.alert(editando ? 'Atualizado!' : 'Cadastrado!',
        editando ? 'Dados atualizados com sucesso' : 'Paciente cadastrado com sucesso',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const scrollToEnd = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
  };

  return (
    <View style={{ flex: 1, backgroundColor: cores.fundo }}>
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={true}
        bounces={true}
        overScrollMode="always"
        scrollEnabled={true}
        nestedScrollEnabled={true}
      >
        <Text style={[styles.sectionTitle, { color: cores.primary, textAlign: 'center', fontSize: 20, marginBottom: 20 }]}>
          {editando ? '✏️ Editar Paciente' : '📝 Novo Paciente'}
        </Text>

        {/* ── Foto ─────────────────────────────────────── */}
        <TouchableOpacity onPress={handleFotoPress} style={styles.fotoContainer}>
          {fotoUri ? (
            <Image source={{ uri: fotoUri }} style={styles.foto} />
          ) : (
            <View style={[styles.fotoPlaceholder, { backgroundColor: cores.input, borderColor: cores.borda }]}>
              <Text style={{ fontSize: 32, color: cores.textoSecundario }}>📷</Text>
              <Text style={{ fontSize: 12, color: cores.textoSecundario, marginTop: 4 }}>Adicionar foto</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* ── Identificação ───────────────────────────── */}
        <Text style={[styles.sectionTitle, { color: cores.primary }]}>Identificação</Text>

        <Text style={[styles.label, { color: cores.texto }]}>Nome completo *</Text>
        <TextInput
          style={[styles.input, styles.inputRequired, { backgroundColor: cores.input, color: cores.texto, borderColor: cores.borda }]}
          placeholder="Nome do paciente"
          placeholderTextColor={placeholderCor(cores, isEscuro)}
          value={nome}
          onChangeText={setNome}
          onFocus={scrollToEnd}
          autoCapitalize="words"
        />

        <Text style={[styles.label, { color: cores.texto }]}>CPF</Text>
        <TextInput
          style={[styles.input, { backgroundColor: cores.input, color: cores.texto, borderColor: cores.borda }]}
          placeholder="000.000.000-00"
          placeholderTextColor={placeholderCor(cores, isEscuro)}
          value={cpf}
          onChangeText={handleCpfChange}
          keyboardType="numeric"
          maxLength={14}
          onFocus={scrollToEnd}
        />

        <Text style={[styles.label, { color: cores.texto }]}>Data de nascimento</Text>
        <TextInput
          style={[styles.input, { backgroundColor: cores.input, color: cores.texto, borderColor: cores.borda }]}
          placeholder="DD/MM/AAAA"
          placeholderTextColor={placeholderCor(cores, isEscuro)}
          value={dataNascimento}
          onChangeText={handleDataChange}
          keyboardType="numeric"
          maxLength={10}
          onFocus={scrollToEnd}
        />

        {/* ── Documentos ──────────────────────────────── */}
        <Text style={[styles.sectionTitle, { color: cores.primary }]}>Documentos</Text>

        <Text style={[styles.label, { color: cores.texto }]}>Cartão SUS</Text>
        <TextInput
          style={[styles.input, { backgroundColor: cores.input, color: cores.texto, borderColor: cores.borda }]}
          placeholder="Número do cartão SUS"
          placeholderTextColor={placeholderCor(cores, isEscuro)}
          value={cartaoSUS}
          onChangeText={setCartaoSUS}
          keyboardType="numeric"
          onFocus={scrollToEnd}
        />

        {/* ── Contato ─────────────────────────────────── */}
        <Text style={[styles.sectionTitle, { color: cores.primary }]}>Contato</Text>

        <Text style={[styles.label, { color: cores.texto }]}>Telefone</Text>
        <TextInput
          style={[styles.input, { backgroundColor: cores.input, color: cores.texto, borderColor: cores.borda }]}
          placeholder="(11) 99999-9999"
          placeholderTextColor={placeholderCor(cores, isEscuro)}
          value={telefone}
          onChangeText={handleTelChange}
          keyboardType="phone-pad"
          maxLength={15}
          onFocus={scrollToEnd}
        />

        {/* ── Localização ─────────────────────────────── */}
        <Text style={[styles.sectionTitle, { color: cores.primary }]}>Localização</Text>

        <View style={styles.cepRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: cores.texto }]}>CEP</Text>
            <TextInput
              style={[styles.input, { backgroundColor: cores.input, color: cores.texto, borderColor: cores.borda }]}
              placeholder="00000-000"
              placeholderTextColor={placeholderCor(cores, isEscuro)}
              value={cep}
              onChangeText={handleCepChange}
              keyboardType="numeric"
              maxLength={9}
              onFocus={scrollToEnd}
            />
          </View>
          {buscandoCep && <ActivityIndicator size="small" color={cores.primary} style={{ marginLeft: 10, marginTop: 28 }} />}
        </View>

        <Text style={[styles.label, { color: cores.texto }]}>Endereço</Text>
        <TextInput
          style={[styles.input, { backgroundColor: cores.input, color: cores.texto, borderColor: cores.borda }]}
          placeholder="Rua, número"
          placeholderTextColor={placeholderCor(cores, isEscuro)}
          value={endereco}
          onChangeText={setEndereco}
          onFocus={scrollToEnd}
        />

        <Text style={[styles.label, { color: cores.texto }]}>Bairro</Text>
        <TextInput
          style={[styles.input, { backgroundColor: cores.input, color: cores.texto, borderColor: cores.borda }]}
          placeholder="Bairro"
          placeholderTextColor={placeholderCor(cores, isEscuro)}
          value={bairro}
          onChangeText={setBairro}
          onFocus={scrollToEnd}
        />

        <Text style={[styles.label, { color: cores.texto }]}>Microárea</Text>
        <TextInput
          style={[styles.input, { backgroundColor: cores.input, color: cores.texto, borderColor: cores.borda }]}
          placeholder="Ex: Área 1, Micro 3"
          placeholderTextColor={placeholderCor(cores, isEscuro)}
          value={microarea}
          onChangeText={setMicroarea}
          onFocus={scrollToEnd}
        />

        <Text style={[styles.label, { color: cores.texto }]}>Prontuário</Text>
        <TextInput
          style={[styles.input, { backgroundColor: cores.input, color: cores.texto, borderColor: cores.borda }]}
          placeholder="Nº do prontuário"
          placeholderTextColor={placeholderCor(cores, isEscuro)}
          value={prontuario}
          onChangeText={setProntuario}
          onFocus={scrollToEnd}
        />

        {/* ── Condições de Saúde ──────────────────────── */}
        <Text style={[styles.sectionTitle, { color: cores.primary }]}>Condições de Saúde</Text>

        {/* Hipertensão */}
        <View style={[styles.switchRow, { backgroundColor: cores.input, borderColor: cores.borda }]}>
          <View style={styles.switchLabelRow}>
            <View style={[styles.switchBullet, { backgroundColor: hipertensao ? '#E53935' : '#BDBDBD' }]} />
            <Text style={[styles.switchLabel, { color: cores.texto }]}>Hipertensão</Text>
          </View>
          <Switch
            value={hipertensao}
            onValueChange={setHipertensao}
            trackColor={{ false: '#DDD', true: SWITCH_CORES.hipertensao.trackAtivo }}
            thumbColor={hipertensao ? SWITCH_CORES.hipertensao.thumbAtivo : '#f4f3f4'}
            ios_backgroundColor="#DDD"
          />
        </View>

        {/* Diabetes */}
        <View style={[styles.switchRow, { backgroundColor: cores.input, borderColor: cores.borda }]}>
          <View style={styles.switchLabelRow}>
            <View style={[styles.switchBullet, { backgroundColor: diabetes ? '#1E88E5' : '#BDBDBD' }]} />
            <Text style={[styles.switchLabel, { color: cores.texto }]}>Diabetes</Text>
          </View>
          <Switch
            value={diabetes}
            onValueChange={setDiabetes}
            trackColor={{ false: '#DDD', true: SWITCH_CORES.diabetes.trackAtivo }}
            thumbColor={diabetes ? SWITCH_CORES.diabetes.thumbAtivo : '#f4f3f4'}
            ios_backgroundColor="#DDD"
          />
        </View>

        {/* Gestante 🤰 */}
        <View style={[styles.switchRow, { backgroundColor: cores.input, borderColor: cores.borda }]}>
          <View style={styles.switchLabelRow}>
            <View style={[styles.switchBullet, { backgroundColor: gestante ? '#D81B60' : '#BDBDBD' }]} />
            <Text style={[styles.switchLabel, { color: cores.texto }]}>🤰 Gestante</Text>
          </View>
          <Switch
            value={gestante}
            onValueChange={setGestante}
            trackColor={{ false: '#DDD', true: SWITCH_CORES.gestante.trackAtivo }}
            thumbColor={gestante ? SWITCH_CORES.gestante.thumbAtivo : '#f4f3f4'}
            ios_backgroundColor="#DDD"
          />
        </View>

        {/* Campos extras de gestante - aparecem só se gestante = true */}
        {gestante && (
          <View style={styles.subCampos}>
            <Text style={[styles.label, { color: cores.texto }]}>Idade gestacional (semanas)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: cores.input, color: cores.texto, borderColor: '#D81B60' }]}
              placeholder="Ex: 24"
              placeholderTextColor={placeholderCor(cores, isEscuro)}
              value={idadeGestacional}
              onChangeText={setIdadeGestacional}
              keyboardType="numeric"
              onFocus={scrollToEnd}
            />

            <Text style={[styles.label, { color: cores.texto }]}>Nº de consultas pré-natal</Text>
            <TextInput
              style={[styles.input, { backgroundColor: cores.input, color: cores.texto, borderColor: '#D81B60' }]}
              placeholder="Ex: 6"
              placeholderTextColor={placeholderCor(cores, isEscuro)}
              value={consultasPreNatal}
              onChangeText={setConsultasPreNatal}
              keyboardType="numeric"
              onFocus={scrollToEnd}
            />

            <Text style={[styles.label, { color: cores.texto }]}>DPP (Data prevista do parto)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: cores.input, color: cores.texto, borderColor: '#D81B60' }]}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={placeholderCor(cores, isEscuro)}
              value={dpp}
              onChangeText={handleDppChange}
              keyboardType="numeric"
              maxLength={10}
              onFocus={scrollToEnd}
            />
          </View>
        )}

        {/* Menor de 2 anos 👶 */}
        <View style={[styles.switchRow, { backgroundColor: cores.input, borderColor: cores.borda }]}>
          <View style={styles.switchLabelRow}>
            <View style={[styles.switchBullet, { backgroundColor: menorDoisAnos ? '#43A047' : '#BDBDBD' }]} />
            <Text style={[styles.switchLabel, { color: cores.texto }]}>👶 Menor de 2 anos</Text>
          </View>
          <Switch
            value={menorDoisAnos}
            onValueChange={setMenorDoisAnos}
            trackColor={{ false: '#DDD', true: SWITCH_CORES.menuorDoisAnos.trackAtivo }}
            thumbColor={menorDoisAnos ? SWITCH_CORES.menuorDoisAnos.thumbAtivo : '#f4f3f4'}
            ios_backgroundColor="#DDD"
          />
        </View>

        {/* Campos extras menor de 2 anos - aparecem se ativado */}
        {menorDoisAnos && (
          <View style={styles.subCampos}>
            <Text style={[styles.label, { color: cores.texto }]}>Peso ao nascer</Text>
            <TextInput
              style={[styles.input, { backgroundColor: cores.input, color: cores.texto, borderColor: '#43A047' }]}
              placeholder="Ex: 3.200 kg"
              placeholderTextColor={placeholderCor(cores, isEscuro)}
              value={pesoNascer}
              onChangeText={setPesoNascer}
              keyboardType="decimal-pad"
              onFocus={scrollToEnd}
            />

            <View style={[styles.switchRow, { backgroundColor: cores.input, borderColor: '#43A047' }]}>
              <Text style={[styles.switchLabel, { color: cores.texto }]}>💉 Caderneta de vacinação em dia</Text>
              <Switch
                value={vacinacaoDia}
                onValueChange={setVacinacaoDia}
                trackColor={{ false: '#DDD', true: SWITCH_CORES.menuorDoisAnos.trackAtivo }}
                thumbColor={vacinacaoDia ? SWITCH_CORES.menuorDoisAnos.thumbAtivo : '#f4f3f4'}
                ios_backgroundColor="#DDD"
              />
            </View>

            <Text style={[styles.label, { color: cores.texto }]}>Aleitamento</Text>
            <View style={styles.optionsRow}>
              {['Materno', 'Misto', 'Artificial'].map(op => (
                <TouchableOpacity
                  key={op}
                  style={[
                    styles.optionChip,
                    {
                      backgroundColor: aleitamentoBebe === op ? '#43A047' : cores.input,
                      borderColor: aleitamentoBebe === op ? '#43A047' : cores.borda,
                    }
                  ]}
                  onPress={() => setAleitamentoBebe(op)}
                >
                  <Text style={{
                    color: aleitamentoBebe === op ? '#FFF' : cores.texto,
                    fontWeight: aleitamentoBebe === op ? 'bold' : 'normal',
                  }}>
                    {op === 'Materno' ? '🤱 Materno' : op === 'Misto' ? '🍼 Misto' : '🧴 Artificial'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── Observações ─────────────────────────────── */}
        <Text style={[styles.sectionTitle, { color: cores.primary }]}>Observações</Text>
        <TextInput
          style={[styles.input, styles.observacoes, { backgroundColor: cores.input, color: cores.texto, borderColor: cores.borda }]}
          placeholder="Anotações relevantes sobre o paciente..."
          placeholderTextColor={placeholderCor(cores, isEscuro)}
          value={observacoes}
          onChangeText={setObservacoes}
          multiline
          textAlignVertical="top"
          onFocus={scrollToEnd}
        />

        {/* ── Botão ───────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.button, salvando && styles.buttonDisabled]}
          onPress={handleSalvar}
          disabled={salvando}
        >
          <Text style={styles.buttonText}>
            {salvando ? 'Salvando...' : editando ? 'Atualizar Paciente' : 'Cadastrar Paciente'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

// ─── Estilos ───────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 5, marginTop: 5 },
  input: { height: 48, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, marginBottom: 15, paddingHorizontal: 14, fontSize: 16 },
  inputRequired: { borderLeftWidth: 3, borderLeftColor: '#FF8C00' },
  observacoes: { height: 100, paddingTop: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 15, marginBottom: 10, color: '#FF8C00' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 14, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#E0E0E0' },
  switchLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  switchBullet: { width: 12, height: 12, borderRadius: 6 },
  switchLabel: { fontSize: 16 },
  button: { backgroundColor: '#FF8C00', height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 20, elevation: 3, shadowColor: '#FF8C00', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFF', fontSize: 17, fontWeight: 'bold' },
  cepRow: { flexDirection: 'row', alignItems: 'center' },
  fotoContainer: { alignSelf: 'center', marginBottom: 20 },
  foto: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#FF8C00' },
  fotoPlaceholder: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' },
  subCampos: { paddingLeft: 16, borderLeftWidth: 3, borderLeftColor: '#D81B60', marginBottom: 10 },
  optionsRow: { flexDirection: 'row', gap: 8, marginBottom: 15, flexWrap: 'wrap' },
  optionChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1 },
});
