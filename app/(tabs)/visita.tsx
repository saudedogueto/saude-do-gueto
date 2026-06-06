import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView
} from 'react-native';
import { adicionarLembrete } from '@/src/utils/lembretes';
import { usePacientes } from '@/src/contexts/PacienteContext';
import { useVisitas } from '@/src/contexts/VisitaContext';
import { useTema } from '@/src/contexts/TemaContext';
import { useToast } from '@/src/components/Toast';
import { NeonButton } from '../../src/components/NeonButton';
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

  const handleSalvarVisita = async () => {
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
        realizada: true,
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
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: 40, backgroundColor: cores.fundo }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', color: cores.primary, marginBottom: 25, textAlign: 'center' }}>
        🏠 Registrar Visita
      </Text>

      {/* Seletor de Paciente */}
      <Text style={{ fontSize: 14, fontWeight: '600', color: cores.textoSecundario, marginBottom: 5, marginTop: 5 }}>
        Paciente *
      </Text>
      <TouchableOpacity
        style={{
          height: 48,
          backgroundColor: cores.card,
          borderWidth: 1,
          borderColor: cores.primary,
          borderRadius: 8,
          paddingHorizontal: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 5,
        }}
        onPress={() => setMostrarPacientes(!mostrarPacientes)}
      >
        <Text style={{ fontSize: 16, color: pacienteId ? cores.texto : cores.textoSecundario }}>
          {pacienteId ? pacienteNome : 'Selecione um paciente...'}
        </Text>
        <Text style={{ fontSize: 12, color: cores.primary }}>{mostrarPacientes ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {mostrarPacientes && (
        <View style={{
          backgroundColor: cores.card,
          borderWidth: 1,
          borderColor: cores.borda,
          borderRadius: 8,
          marginBottom: 15,
          maxHeight: 200,
          padding: 10,
        }}>
          <TextInput
            style={{
              height: 40,
              backgroundColor: cores.card,
              borderRadius: 6,
              paddingHorizontal: 12,
              fontSize: 14,
              marginBottom: 8,
              color: cores.texto,
              borderWidth: 1,
              borderColor: cores.borda,
            }}
            placeholder="Buscar paciente..."
            placeholderTextColor={cores.textoSecundario}
            value={busca}
            onChangeText={setBusca}
          />
          {pacientesFiltrados.map(p => (
            <TouchableOpacity
              key={p.id}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 8,
                borderBottomWidth: 1,
                borderBottomColor: cores.borda,
              }}
              onPress={() => selecionarPaciente(p.id, p.nome)}
            >
              <Text style={{ fontSize: 15, color: cores.texto, fontWeight: '500' }}>{p.nome}</Text>
              {p.microarea && <Text style={{ fontSize: 12, color: cores.primary, marginTop: 2 }}>{p.microarea}</Text>}
            </TouchableOpacity>
          ))}
          {pacientesFiltrados.length === 0 && (
            <Text style={{ textAlign: 'center', color: cores.textoSecundario, padding: 10 }}>
              Nenhum paciente encontrado
            </Text>
          )}
        </View>
      )}

      {/* Data */}
      <Text style={{ fontSize: 14, fontWeight: '600', color: cores.textoSecundario, marginBottom: 5, marginTop: 5 }}>
        Data da Visita
      </Text>
      <TextInput
        style={{
          height: 48,
          backgroundColor: cores.card,
          borderWidth: 1,
          borderColor: cores.borda,
          borderRadius: 8,
          marginBottom: 15,
          paddingHorizontal: 14,
          fontSize: 16,
          color: cores.texto,
        }}
        placeholder="DD/MM/AAAA"
        placeholderTextColor={cores.textoSecundario}
        value={data}
        onChangeText={setData}
      />

      {/* Motivo */}
      <Text style={{ fontSize: 14, fontWeight: '600', color: cores.textoSecundario, marginBottom: 5, marginTop: 5 }}>
        Motivo da Visita
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 }}>
        {MOTIVOS.map(m => (
          <TouchableOpacity
            key={m.key}
            style={{
              backgroundColor: motivo === m.key ? cores.primary : cores.card,
              borderWidth: 1,
              borderColor: motivo === m.key ? cores.primary : cores.borda,
              borderRadius: 8,
              paddingVertical: 8,
              paddingHorizontal: 14,
            }}
            onPress={() => setMotivo(m.key)}
          >
            <Text style={{
              fontSize: 13,
              color: motivo === m.key ? '#FFF' : cores.textoSecundario,
              fontWeight: motivo === m.key ? '600' : '400',
            }}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sinais Vitais */}
      <Text style={{ fontSize: 16, fontWeight: 'bold', color: cores.primary, marginTop: 10, marginBottom: 10 }}>
        🩺 Sinais Vitais
      </Text>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: cores.textoSecundario, marginBottom: 5, marginTop: 5 }}>
            Pressão Sistólica
          </Text>
          <TextInput
            style={{
              height: 48,
              backgroundColor: cores.card,
              borderWidth: 1,
              borderColor: cores.borda,
              borderRadius: 8,
              marginBottom: 15,
              paddingHorizontal: 14,
              fontSize: 16,
              color: cores.texto,
            }}
            placeholder="120"
            placeholderTextColor={cores.textoSecundario}
            value={pressaoSist}
            onChangeText={setPressaoSist}
            keyboardType="numeric"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: cores.textoSecundario, marginBottom: 5, marginTop: 5 }}>
            Pressão Diastólica
          </Text>
          <TextInput
            style={{
              height: 48,
              backgroundColor: cores.card,
              borderWidth: 1,
              borderColor: cores.borda,
              borderRadius: 8,
              marginBottom: 15,
              paddingHorizontal: 14,
              fontSize: 16,
              color: cores.texto,
            }}
            placeholder="80"
            placeholderTextColor={cores.textoSecundario}
            value={pressaoDiast}
            onChangeText={setPressaoDiast}
            keyboardType="numeric"
          />
        </View>
      </View>

      <Text style={{ fontSize: 14, fontWeight: '600', color: cores.textoSecundario, marginBottom: 5, marginTop: 5 }}>
        Glicemia (mg/dL)
      </Text>
      <TextInput
        style={{
          height: 48,
          backgroundColor: cores.card,
          borderWidth: 1,
          borderColor: cores.borda,
          borderRadius: 8,
          marginBottom: 15,
          paddingHorizontal: 14,
          fontSize: 16,
          color: cores.texto,
        }}
        placeholder="Ex: 100"
        placeholderTextColor={cores.textoSecundario}
        value={glicemia}
        onChangeText={setGlicemia}
        keyboardType="numeric"
      />

      {/* Vacina */}
      <Text style={{ fontSize: 14, fontWeight: '600', color: cores.textoSecundario, marginBottom: 5, marginTop: 5 }}>
        Vacinas em dia?
      </Text>
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 15 }}>
        <TouchableOpacity
          style={{
            flex: 1,
            height: 44,
            backgroundColor: vacinaEmDia === true ? cores.primary : cores.card,
            borderWidth: 1,
            borderColor: vacinaEmDia === true ? cores.primary : cores.borda,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => setVacinaEmDia(true)}
        >
          <Text style={{
            fontSize: 14,
            color: vacinaEmDia === true ? '#FFF' : cores.textoSecundario,
            fontWeight: vacinaEmDia === true ? '600' : '400',
          }}>
            ✅ Sim
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            height: 44,
            backgroundColor: vacinaEmDia === false ? 'rgba(198,40,40,0.15)' : cores.card,
            borderWidth: 1,
            borderColor: vacinaEmDia === false ? '#EF5350' : cores.borda,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => setVacinaEmDia(false)}
        >
          <Text style={{
            fontSize: 14,
            color: vacinaEmDia === false ? '#EF5350' : cores.textoSecundario,
            fontWeight: vacinaEmDia === false ? '600' : '400',
          }}>
            ❌ Não
          </Text>
        </TouchableOpacity>
      </View>

      {/* Observações */}
      <Text style={{ fontSize: 14, fontWeight: '600', color: cores.textoSecundario, marginBottom: 5, marginTop: 5 }}>
        Observações
      </Text>
      <TextInput
        style={{
          height: 100,
          backgroundColor: cores.card,
          borderWidth: 1,
          borderColor: cores.borda,
          borderRadius: 8,
          marginBottom: 15,
          paddingHorizontal: 14,
          fontSize: 16,
          color: cores.texto,
          paddingTop: 12,
        }}
        placeholder="Anotações da visita..."
        placeholderTextColor={cores.textoSecundario}
        value={observacoes}
        onChangeText={setObservacoes}
        multiline
        textAlignVertical="top"
      />

      {/* Próxima Visita */}
      <Text style={{ fontSize: 14, fontWeight: '600', color: cores.textoSecundario, marginBottom: 5, marginTop: 5 }}>
        Próxima Visita
      </Text>
      <TextInput
        style={{
          height: 48,
          backgroundColor: cores.card,
          borderWidth: 1,
          borderColor: cores.borda,
          borderRadius: 8,
          marginBottom: 15,
          paddingHorizontal: 14,
          fontSize: 16,
          color: cores.texto,
        }}
        placeholder="DD/MM/AAAA"
        placeholderTextColor={cores.textoSecundario}
        value={proximaVisita}
        onChangeText={setProximaVisita}
      />

      <NeonButton titulo={salvando ? 'Salvando...' : 'Finalizar Visita'} onPress={handleSalvarVisita} cor="#FFFFFF" fullWidth />
    </ScrollView>
  );
}
