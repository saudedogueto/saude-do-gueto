import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert,
  TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar
} from 'react-native';
import { useTema } from '@/src/contexts/TemaContext';
import { usePacientes } from '@/src/contexts/PacienteContext';
import { useVisitas } from '@/src/contexts/VisitaContext';
import { useFamilias } from '@/src/contexts/FamiliaContext';
import { router } from 'expo-router';

// --- BOTÕES RÁPIDOS ---
const BOTOES_RAPIDOS = [
  { label: 'Sintomas', icon: '🤒', prompt: 'Estou com dor de cabeça e febre. O que devo fazer?' },
  { label: 'Remédios', icon: '💊', prompt: 'Esqueci de tomar meu remédio para pressão. Qual o risco?' },
  { label: 'Emergência', icon: '🚨', prompt: 'Quais são os sintomas de infarto?' },
  { label: 'Consultas', icon: '📅', prompt: 'Agende uma consulta com clínico geral para mim.' },
];

// --- CHAT MENSAGENS INICIAIS ---
const MSG_BOAS_VINDAS = 'Olá! Sou o assistente virtual do Saúde do Gueto. Como posso ajudar você hoje?';

type Mensagem = {
  id: number;
  texto: string;
  tipo: 'user' | 'bot';
};

export default function AgenteScreen() {
  const { cores } = useTema();
  const { pacientes } = usePacientes();
  const { visitas } = useVisitas();
  const { familias } = useFamilias();

  const [modeloBaixado, setModeloBaixado] = useState(false);
  const [baixando, setBaixando] = useState(false);
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    { id: 0, texto: MSG_BOAS_VINDAS, tipo: 'bot' }
  ]);
  const [inputTexto, setInputTexto] = useState('');
  const [digitando, setDigitando] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Estatísticas
  const hipertensos = pacientes.filter(p => p.hipertensao).length;
  const diabeticos = pacientes.filter(p => p.diabetes).length;
  const gestantes = pacientes.filter(p => p.gestante).length;
  const semVisita90dias = pacientes.filter(p => {
    if (!p.ultimaVisita) return true;
    const dias = Math.floor((Date.now() - new Date(p.ultimaVisita).getTime()) / (1000 * 60 * 60 * 24));
    return dias > 90;
  }).length;

  // Auto-scroll
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [mensagens, digitando]);

  const handleBaixarModelo = () => {
    Alert.alert(
      'Baixar modelo (~700MB)',
      'Recomendo usar WiFi. O download tem ~700MB. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Baixar',
          onPress: () => {
            setBaixando(true);
            setTimeout(() => {
              setBaixando(false);
              setModeloBaixado(true);
              Alert.alert('Pronto!', 'Modelo baixado com sucesso.');
            }, 3000);
          }
        }
      ]
    );
  };

  // Simular resposta do bot
  const responder = async (pergunta: string) => {
    setDigitando(true);
    // Simula delay de processamento
    await new Promise(r => setTimeout(r, 1500));

    const perguntaLower = pergunta.toLowerCase();
    let resposta = '';

    if (perguntaLower.includes('febre') || perguntaLower.includes('dor de cabeça') || perguntaLower.includes('sintoma')) {
      resposta = '🤒 **Sintomas comuns:**\n\n• Febre + dor de cabeça pode ser resfriado, virose ou até dengue.\n• Descanse, hidrate-se bem.\n• Se a febre passar de 3 dias ou aparecerem manchas vermelhas, procure a UBS.\n• ⚠️ Crianças e idosos: atenção redobrada!';
    } else if (perguntaLower.includes('pressão') || perguntaLower.includes('remédio')) {
      resposta = '💊 **Sobre medicamentos:**\n\n• Se esquecer de tomar o remédio para pressão:\n  - Tome assim que lembrar, A MENOS QUE esteja perto do próximo horário\n  - NUNCA dobre a dose\n  - Meça a pressão e fique atento a tontura\n• Consulte seu médico na UBS se isso acontecer com frequência.';
    } else if (perguntaLower.includes('infarto') || perguntaLower.includes('emergência')) {
      resposta = '🚨 **Sinais de infarto (IMPORTANTE):**\n\n• Dor no peito (aperto/queimação)\n• Dor irradiando para braço esquerdo, costas ou mandíbula\n• Falta de ar, suor frio, náusea\n\n⚠️ **LIGUE 192 (SAMU) IMEDIATAMENTE!**\nNão espere os sintomas passarem.';
    } else {
      resposta = '🤖 Entendi sua pergunta! Para te ajudar melhor, gostaria de mais contexto:\n\n• Você é paciente ou acompanha alguém?\n• Já passou na UBS?\n• Quer agendar uma visita com o ACS?\n\nUse os botões rápidos acima ou me explique melhor!';
    }

    setDigitando(false);
    setMensagens(prev => [...prev, {
      id: Date.now(),
      texto: resposta,
      tipo: 'bot'
    }]);
  };

  const enviarMensagem = async () => {
    const texto = inputTexto.trim();
    if (!texto) return;

    setMensagens(prev => [...prev, { id: Date.now(), texto, tipo: 'user' }]);
    setInputTexto('');
    await responder(texto);
  };

  const handleBotaoRapido = async (prompt: string) => {
    setMensagens(prev => [...prev, { id: Date.now(), texto: prompt, tipo: 'user' }]);
    await responder(prompt);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0d1117" />

      {/* HEADER GRADIENTE ROXO */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏥 Saúde do Gueto</Text>
        <Text style={styles.headerSubtitle}>Seu assistente pessoal de saúde</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* STATUS DO MODELO */}
        {!modeloBaixado && (
          <View style={styles.cardStatus}>
            <Text style={styles.statusIcon}>📥</Text>
            <Text style={styles.statusText}>
              Baixe o modelo de IA para usar offline
            </Text>
            {baixando ? (
              <ActivityIndicator size="small" color="#667eea" />
            ) : (
              <TouchableOpacity style={styles.btnBaixar} onPress={handleBaixarModelo}>
                <Text style={styles.btnBaixarText}>Baixar</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* BOTÕES RÁPIDOS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.botoesScroll}
          contentContainerStyle={styles.botoesContent}
        >
          {BOTOES_RAPIDOS.map((btn, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.botaoRapido}
              onPress={() => handleBotaoRapido(btn.prompt)}
            >
              <Text style={styles.botaoIcone}>{btn.icon}</Text>
              <Text style={styles.botaoLabel}>{btn.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ÁREA DO CHAT */}
        <View style={styles.chatContainer}>
          <View style={styles.chatHeader}>
            <View style={styles.statusDot} />
            <Text style={styles.chatHeaderText}>🤖 Agente de Saúde IA (Online)</Text>
          </View>

          <ScrollView
            ref={scrollRef}
            style={styles.chatMessages}
            contentContainerStyle={styles.chatMessagesContent}
          >
            {mensagens.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageBubble,
                  msg.tipo === 'user' ? styles.messageUser : styles.messageBot
                ]}
              >
                <Text style={[
                  styles.messageText,
                  { color: msg.tipo === 'user' ? '#FFF' : '#1a202c' }
                ]}>
                  {msg.texto}
                </Text>
              </View>
            ))}
            {digitando && (
              <View style={[styles.messageBubble, styles.messageBot]}>
                <Text style={styles.typingText}>
                  <Text style={styles.typingDot}>.</Text>
                  <Text style={[styles.typingDot, { animationDelay: '0.2s' }]}>.</Text>
                  <Text style={[styles.typingDot, { animationDelay: '0.4s' }]}>.</Text>
                </Text>
              </View>
            )}
          </ScrollView>

          {/* INPUT */}
          <View style={styles.inputArea}>
            <TextInput
              style={styles.input}
              placeholder="Digite sua dúvida ou use os botões..."
              placeholderTextColor="#a0aec0"
              value={inputTexto}
              onChangeText={setInputTexto}
              onSubmitEditing={enviarMensagem}
              returnKeyType="send"
            />
            <TouchableOpacity style={styles.btnEnviar} onPress={enviarMensagem}>
              <Text style={styles.btnEnviarText}>Enviar</Text>
            </TouchableOpacity>
          </View>

          {/* DISCLAIMER */}
          <Text style={styles.disclaimer}>
            ⚠️ Respostas geradas por IA. Não substituem uma consulta médica real.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f5',
  },
  header: {
    backgroundColor: '#2d3748',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  cardStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    marginHorizontal: 12,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  statusIcon: { fontSize: 24 },
  statusText: { flex: 1, fontSize: 13, color: '#795548' },
  btnBaixar: { backgroundColor: '#FF8C00', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  btnBaixarText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  botoesScroll: {
    maxHeight: 60,
    marginTop: 12,
  },
  botoesContent: {
    paddingHorizontal: 12,
    gap: 10,
    flexDirection: 'row',
  },
  botaoRapido: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  botaoIcone: { fontSize: 16, marginRight: 6 },
  botaoLabel: { fontSize: 13, fontWeight: '600', color: '#2d3748' },
  chatContainer: {
    flex: 1,
    margin: 12,
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#48bb78',
  },
  chatHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  chatMessages: {
    flex: 1,
  },
  chatMessagesContent: {
    padding: 14,
    gap: 12,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 20,
  },
  messageBot: {
    backgroundColor: '#edf2f7',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageUser: {
    backgroundColor: '#667eea',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  typingText: {
    fontSize: 28,
    color: '#666',
    lineHeight: 20,
  },
  typingDot: {
    fontSize: 28,
    opacity: 0.5,
  },
  inputArea: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#FFF',
  },
  input: {
    flex: 1,
    backgroundColor: '#f7fafc',
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    color: '#1a202c',
  },
  btnEnviar: {
    backgroundColor: '#2d3748',
    borderRadius: 25,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  btnEnviarText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  disclaimer: {
    fontSize: 10,
    textAlign: 'center',
    color: '#a0aec0',
    padding: 10,
    backgroundColor: '#FFF',
  },
});
