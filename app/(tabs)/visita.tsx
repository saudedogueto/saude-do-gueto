import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Platform
} from 'react-native';
import { adicionarLembrete } from '@/src/utils/lembretes';
import { usePacientes } from '@/src/contexts/PacienteContext';
import { useVisitas } from '@/src/contexts/VisitaContext';
import { useTema } from '@/src/contexts/TemaContext';
import { router } from 'expo-router';

const MOTIVOS = [
  { key: 'rotina', label: 'Visita de Rotina' },
  { key: 'retorno', label: 'Retorno' },
  { key: 'queixa', label: 'Queixa / Sintomas' },
  { key: 'encaminhamento', label: 'Encaminhamento' },
  { key: 'outro', label: 'Outro' },
];

export default function VisitaScreen() {
  const { pacientes, carregarPacientes } = usePacientes();
  const { salvarVisita } = useVisitas();
  const { cores } = useTema();
  const { showToast } = useToast();
  const [salvando, setSalvando] = useState(false);
  const [mostrarPacientes, setMostrarPacientes] = useState(false);

  const hoje = new Date().toISOString().split('T')[0];

  const [pacienteId, setPacienteId] = useState('');
  const [pacienteNome, setPacienteNome] = useState('');
  const [data, setData] = useState(hoje);
  const [motivo, setMotivo] = useState('rotina');
  const [pressaoSist, setPressaoSist] = useState('');
  const [pressaoDiast, setPressaoDiast] = useState('');
  const [glicemia, setGlicemia] = useState('');
  const [vacinaEmDia, setVacinaEmDia] = useState<boolean | null>(null);
  const [observacoes, setObservacoes] = useState('');
  const [proximaVisita, setProximaVisita] = useState('');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    carregarPacientes();
  }, []);

  const pacientesFiltrados = busca.trim()
    ? pacientes.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()))
    : pacientes;

  const selecionarPaciente = (id: string, nome: string) => {
    setPacienteId(id);
    setPacienteNome(nome);
    setMostrarPacientes(false);
    setBusca('');
  };

  const handleSalvar = async () => {
    if (!pacienteId) {
      showToast('Selecione um paciente', 'warning');
      return;
    }

    setSalvando(true);
    try {
      const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      await salvarVisita({
        pacienteId,
        pacienteNome,
        data,
        hora,
        motivo: motivo as any,
        pressaoSistolica: pressaoSist || undefined,
        pressaoDiastolica: pressaoDiast || undefined,
        glicemia: glicemia || undefined,
        vacinaEmDia: vacinaEmDia ?? undefined,
        observacoes,
        proximaVisita,
      });
      // Se agendou próxima visita, cria lembrete
      if (proximaVisita.trim()) {
        try {
          await adicionarLembrete(pacienteId, pacienteNome, proximaVisita, hora, 'retorno');
        } catch {}
      }
      showToast('Visita registrada com sucesso!');
      setTimeout(() => router.back(), 600);
    } catch (error) {
      showToast('Erro ao salvar visita', 'error');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: cores.fundo }]}>
      <Text style={styles.title}>🏠 Registrar Visita</Text>

      {/* Seletor de Paciente */}
      <Text style={styles.label}>Paciente *</Text>
      <TouchableOpacity
        style={styles.seletorPaciente}
        onPress={() => setMostrarPacientes(!mostrarPacientes)}
      >
        <Text style={pacienteId ? styles.pacienteNome : styles.placeholder}>
          {pacienteId ? pacienteNome : 'Selecione um paciente...'}
        </Text>
        <Text style={styles.seta}>{mostrarPacientes ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {mostrarPacientes && (
        <View style={styles.listaPacientes}>
          <TextInput
            style={styles.buscaInput}
            placeholder="Buscar paciente..."
            value={busca}
            onChangeText={setBusca}
          />
          {pacientesFiltrados.map(p => (
            <TouchableOpacity
              key={p.id}
              style={styles.itemPaciente}
              onPress={() => selecionarPaciente(p.id, p.nome)}
            >
              <Text style={styles.itemNome}>{p.nome}</Text>
              {p.microarea && <Text style={styles.itemMicro}>{p.microarea}</Text>}
            </TouchableOpacity>
          ))}
          {pacientesFiltrados.length === 0 && (
            <Text style={styles.semResultados}>Nenhum paciente encontrado</Text>
          )}
        </View>
      )}

      {/* Data */}
      <Text style={styles.label}>Data da Visita</Text>
      <TextInput
        style={styles.input}
        placeholder="DD/MM/AAAA"
        value={data}
        onChangeText={setData}
      />

      {/* Motivo */}
      <Text style={styles.label}>Motivo da Visita</Text>
      <View style={styles.motivosGrid}>
        {MOTIVOS.map(m => (
          <TouchableOpacity
            key={m.key}
            style={[styles.motivoBtn, motivo === m.key && styles.motivoAtivo]}
            onPress={() => setMotivo(m.key)}
          >
            <Text style={[styles.motivoText, motivo === m.key && styles.motivoTextAtivo]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sinais Vitais */}
      <Text style={styles.sectionTitle}>🩺 Sinais Vitais</Text>

      <View style={styles.pressaoRow}>
        <View style={styles.pressaoItem}>
          <Text style={styles.label}>Pressão Sistólica</Text>
          <TextInput
            style={styles.input}
            placeholder="120"
            value={pressaoSist}
            onChangeText={setPressaoSist}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.pressaoItem}>
          <Text style={styles.label}>Pressão Diastólica</Text>
          <TextInput
            style={styles.input}
            placeholder="80"
            value={pressaoDiast}
            onChangeText={setPressaoDiast}
            keyboardType="numeric"
          />
        </View>
      </View>

      <Text style={styles.label}>Glicemia (mg/dL)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 100"
        value={glicemia}
        onChangeText={setGlicemia}
        keyboardType="numeric"
      />

      {/* Vacina */}
      <Text style={styles.label}>Vacinas em dia?</Text>
      <View style={styles.vacinaRow}>
        <TouchableOpacity
          style={[styles.vacinaBtn, vacinaEmDia === true && styles.vacinaOk]}
          onPress={() => setVacinaEmDia(true)}
        >
          <Text style={[styles.vacinaText, vacinaEmDia === true && styles.vacinaTextOk]}>✅ Sim</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.vacinaBtn, vacinaEmDia === false && styles.vacinaNok]}
          onPress={() => setVacinaEmDia(false)}
        >
          <Text style={[styles.vacinaText, vacinaEmDia === false && styles.vacinaTextNok]}>❌ Não</Text>
        </TouchableOpacity>
      </View>

      {/* Observações */}
      <Text style={styles.label}>Observações</Text>
      <TextInput
        style={[styles.input, styles.obsInput]}
        placeholder="Anotações da visita..."
        value={observacoes}
        onChangeText={setObservacoes}
        multiline
        textAlignVertical="top"
      />

      {/* Próxima Visita */}
      <Text style={styles.label}>Próxima Visita</Text>
      <TextInput
        style={styles.input}
        placeholder="DD/MM/AAAA"
        value={proximaVisita}
        onChangeText={setProximaVisita}
      />

      <TouchableOpacity
        style={[styles.button, salvando && styles.buttonDisabled]}
        onPress={handleSalvar}
        disabled={salvando}
      >
        <Text style={styles.buttonText}>
          {salvando ? 'Salvando...' : '✅ Registrar Visita'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#FAFAFA',
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
  seletorPaciente: {
    height: 48,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FF8C00',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  pacienteNome: {
    fontSize: 16,
    color: '#333',
  },
  placeholder: {
    fontSize: 16,
    color: '#BBB',
  },
  seta: {
    fontSize: 12,
    color: '#FF8C00',
  },
  listaPacientes: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 15,
    maxHeight: 200,
    padding: 10,
  },
  buscaInput: {
    height: 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 14,
    marginBottom: 8,
  },
  itemPaciente: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemNome: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  itemMicro: {
    fontSize: 12,
    color: '#FF8C00',
    marginTop: 2,
  },
  semResultados: {
    textAlign: 'center',
    color: '#999',
    padding: 10,
  },
  motivosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  motivoBtn: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  motivoAtivo: {
    backgroundColor: '#FF8C00',
    borderColor: '#FF8C00',
  },
  motivoText: {
    fontSize: 13,
    color: '#666',
  },
  motivoTextAtivo: {
    color: '#FFF',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF8C00',
    marginTop: 10,
    marginBottom: 10,
  },
  pressaoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pressaoItem: {
    flex: 1,
  },
  vacinaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 15,
  },
  vacinaBtn: {
    flex: 1,
    height: 44,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vacinaOk: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2E7D32',
  },
  vacinaNok: {
    backgroundColor: '#FFEBEE',
    borderColor: '#C62828',
  },
  vacinaText: {
    fontSize: 14,
    color: '#666',
  },
  vacinaTextOk: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  vacinaTextNok: {
    color: '#C62828',
    fontWeight: '600',
  },
  obsInput: {
    height: 100,
    paddingTop: 12,
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
