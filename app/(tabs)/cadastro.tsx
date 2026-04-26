import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  Alert, Switch, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard
} from 'react-native';
import { usePacientes, Paciente } from '@/src/contexts/PacienteContext';
import { useTema } from '@/src/contexts/TemaContext';
import { router, useLocalSearchParams } from 'expo-router';

export default function CadastroScreen() {
  const params = useLocalSearchParams();
  const { salvarPaciente, buscarPaciente } = usePacientes();
  const { cores } = useTema();
  const editando = !!params?.id;
  const scrollRef = useRef<ScrollView>(null);

  const pacienteExistente = params?.id ? buscarPaciente(params.id as string) : null;

  const [nome, setNome] = useState(pacienteExistente?.nome || '');
  const [dataNascimento, setDataNascimento] = useState(pacienteExistente?.dataNascimento || '');
  const [cartaoSUS, setCartaoSUS] = useState(pacienteExistente?.cartaoSUS || '');
  const [telefone, setTelefone] = useState(pacienteExistente?.telefone || '');
  const [endereco, setEndereco] = useState(pacienteExistente?.endereco || '');
  const [microarea, setMicroarea] = useState(pacienteExistente?.microarea || '');
  const [hipertensao, setHipertensao] = useState(pacienteExistente?.hipertensao || false);
  const [diabetes, setDiabetes] = useState(pacienteExistente?.diabetes || false);
  const [gestante, setGestante] = useState(pacienteExistente?.gestante || false);
  const [observacoes, setObservacoes] = useState(pacienteExistente?.observacoes || '');
  const [salvando, setSalvando] = useState(false);

  const handleSalvar = async () => {
    if (!nome.trim()) {
      Alert.alert('Atenção', 'Nome do paciente é obrigatório');
      return;
    }

    setSalvando(true);
    try {
      await salvarPaciente({
        id: editando ? (params.id as string) : undefined,
        nome: nome.trim(),
        dataNascimento,
        cartaoSUS,
        telefone,
        endereco,
        microarea,
        hipertensao,
        diabetes,
        gestante,
        observacoes,
      });
      Alert.alert(
        editando ? 'Atualizado!' : 'Cadastrado!',
        editando
          ? 'Dados do paciente atualizados com sucesso'
          : 'Paciente cadastrado com sucesso',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: cores.fundo }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.container, { backgroundColor: cores.fundo }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        <Text style={styles.title}>
          {editando ? '✏️ Editar Paciente' : '📝 Novo Paciente'}
        </Text>

        <Text style={styles.label}>Nome completo *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: cores.inputBg, color: cores.texto, borderColor: cores.borda }]}
          placeholder="Nome do paciente"
          placeholderTextColor={cores.placeholder}
          value={nome}
          onChangeText={setNome}
        />

        <Text style={styles.label}>Data de nascimento</Text>
        <TextInput
          style={[styles.input, { backgroundColor: cores.inputBg, color: cores.texto, borderColor: cores.borda }]}
          placeholder="DD/MM/AAAA"
          placeholderTextColor={cores.placeholder}
          value={dataNascimento}
          onChangeText={setDataNascimento}
        />

        <Text style={styles.label}>Cartão SUS</Text>
        <TextInput
          style={[styles.input, { backgroundColor: cores.inputBg, color: cores.texto, borderColor: cores.borda }]}
          placeholder="Número do cartão SUS"
          placeholderTextColor={cores.placeholder}
          value={cartaoSUS}
          onChangeText={setCartaoSUS}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Telefone</Text>
        <TextInput
          style={[styles.input, { backgroundColor: cores.inputBg, color: cores.texto, borderColor: cores.borda }]}
          placeholder="(11) 99999-9999"
          placeholderTextColor={cores.placeholder}
          value={telefone}
          onChangeText={setTelefone}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Endereço</Text>
        <TextInput
          style={[styles.input, { backgroundColor: cores.inputBg, color: cores.texto, borderColor: cores.borda }]}
          placeholder="Rua, número, bairro"
          placeholderTextColor={cores.placeholder}
          value={endereco}
          onChangeText={setEndereco}
        />

        <Text style={styles.label}>Microárea</Text>
        <TextInput
          style={[styles.input, { backgroundColor: cores.inputBg, color: cores.texto, borderColor: cores.borda }]}
          placeholder="Ex: Área 1, Micro 3"
          placeholderTextColor={cores.placeholder}
          value={microarea}
          onChangeText={setMicroarea}
        />

        <Text style={styles.sectionTitle}>Condições de Saúde</Text>

        <View style={[styles.switchRow, { backgroundColor: cores.inputBg, borderColor: cores.borda }]}>
          <Text style={[styles.switchLabel, { color: cores.texto }]}>Hipertensão</Text>
          <Switch
            value={hipertensao}
            onValueChange={setHipertensao}
            trackColor={{ false: '#DDD', true: '#FFA500' }}
            thumbColor={hipertensao ? '#FF8C00' : '#f4f3f4'}
          />
        </View>

        <View style={[styles.switchRow, { backgroundColor: cores.inputBg, borderColor: cores.borda }]}>
          <Text style={[styles.switchLabel, { color: cores.texto }]}>Diabetes</Text>
          <Switch
            value={diabetes}
            onValueChange={setDiabetes}
            trackColor={{ false: '#DDD', true: '#FFA500' }}
            thumbColor={diabetes ? '#FF8C00' : '#f4f3f4'}
          />
        </View>

        <View style={[styles.switchRow, { backgroundColor: cores.inputBg, borderColor: cores.borda }]}>
          <Text style={[styles.switchLabel, { color: cores.texto }]}>Gestante</Text>
          <Switch
            value={gestante}
            onValueChange={setGestante}
            trackColor={{ false: '#DDD', true: '#FFA500' }}
            thumbColor={gestante ? '#FF8C00' : '#f4f3f4'}
          />
        </View>

        <Text style={styles.label}>Observações</Text>
        <TextInput
          style={[styles.input, styles.observacoes, { backgroundColor: cores.inputBg, color: cores.texto, borderColor: cores.borda }]}
          placeholder="Anotações relevantes sobre o paciente..."
          placeholderTextColor={cores.placeholder}
          value={observacoes}
          onChangeText={setObservacoes}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.button, salvando && styles.buttonDisabled]}
          onPress={handleSalvar}
          disabled={salvando}
        >
          <Text style={styles.buttonText}>
            {salvando ? 'Salvando...' : editando ? 'Atualizar Paciente' : 'Cadastrar Paciente'}
          </Text>
        </TouchableOpacity>

        {/* Espaço extra no final pra garantir que o botão não fique escondido */}
        <View style={{ height: 60 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF8C00',
    marginBottom: 25,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 5,
    marginTop: 5,
  },
  input: {
    height: 48,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  observacoes: {
    height: 100,
    paddingTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF8C00',
    marginTop: 15,
    marginBottom: 10,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#FF8C00',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
});
