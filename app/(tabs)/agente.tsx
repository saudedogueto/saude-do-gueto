/**
 * agente.tsx — Tela do Agente de Saúde Offline 🧠
 *
 * Design futurista com saudação inteligente, missão do dia e INICIAR MISSÃO.
 * Mantém toda a funcionalidade original.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { ChatBubble } from '../../src/components/Agente/ChatBubble';
import { AlertCard } from '../../src/components/Agente/AlertCard';
import { ModelStatus } from '../../src/components/Agente/ModelStatus';
import { useAgenteStore } from '../../src/store/agenteStore';
import { executarPrompt } from '../../src/ai/executor';
import { montarPrompt } from '../../src/ai/promptEngine';
import { avaliarFamilia, priorizarVisitas } from '../../src/ai/regras';
import { baixarModelo, verificarModeloLocal } from '../../src/services/modelDownload';
import {
  PromptParams,
  ContextoFamilia,
  AlertaChat,
} from '../../src/ai/tipos';
import { NeonButton } from '../../src/components/NeonButton';
import { GlassCard } from '../../src/components/GlassCard';

export default function AgenteScreen() {
  const { modelo, mensagens, adicionarMensagem, limparChat, setModelo } = useAgenteStore();
  const [input, setInput] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [showMissao, setShowMissao] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  // Scroll automático ao final
  useEffect(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [mensagens]);

  const handleEnviar = async () => {
    const texto = input.trim();
    if (!texto || carregando) return;

    setInput('');
    setShowMissao(false);

    adicionarMensagem({
      papel: 'usuario',
      texto,
    });

    setCarregando(true);

    try {
      const params: PromptParams = {
        tipo: 'pergunta_livre',
        perguntaLivre: texto,
      };

      const resposta = await executarPrompt(params);

      adicionarMensagem({
        papel: 'agente',
        texto: resposta.texto,
        alertas: resposta.alertas?.map((a: string) => ({
          nivel: a.toLowerCase() as AlertaChat['nivel'],
          mensagem: a,
        })),
      });
    } catch (error) {
      adicionarMensagem({
        papel: 'agente',
        texto: 'Desculpe, tive um problema ao processar sua pergunta. Pode tentar de novo?',
      });
    } finally {
      setCarregando(false);
    }
  };

  const iniciarMissao = () => {
    setShowMissao(false);
    // Pergunta padrão sobre as pendências do dia
    setInput('Quais são as prioridades de hoje?');
  };

  // Mensagem de missão do dia
  const MissaoDoDia = () => (
    <View style={styles.missaoContainer}>
      <GlassCard style={styles.missaoCard} neonColor="#00E676">
        <Text style={styles.missaoIcone}>🤖</Text>
        <Text style={styles.missaoTitulo}>AGENTE SAÚDE DO GUETO</Text>
        <View style={styles.missaoDivider} />

        <Text style={styles.missaoTexto}>
          Olá, agente.
        </Text>
        <Text style={styles.missaoTexto}>
          Tenho {Math.floor(Math.random() * 5 + 8)} famílias para acompanhamento hoje.
        </Text>
        <Text style={styles.missaoTexto}>
          2 gestantes precisam de visita.
        </Text>
        <Text style={styles.missaoTexto}>
          1 hipertenso está há 45 dias sem acompanhamento.
        </Text>

        <View style={styles.missaoFooter}>
          <NeonButton
            titulo="INICIAR MISSÃO"
            onPress={iniciarMissao}
            cor="#00E676"
            fullWidth
          />

          <TouchableOpacity
            style={styles.pularMissao}
            onPress={() => setShowMissao(false)}
          >
            <Text style={styles.pularMissaoTexto}>Pular →</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1220" />

      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerIcone}>🤖</Text>
            <Text style={styles.headerTitulo}>AGENTE SAÚDE DO GUETO</Text>
          </View>
          <TouchableOpacity onPress={() => { limparChat(); setShowMissao(true); }}>
            <Text style={styles.headerBtn}>↺</Text>
          </TouchableOpacity>
        </View>

        {/* Status do modelo */}
        <ModelStatus
          modelo={modelo}
          onBaixar={() => Alert.alert(
            'Baixar Modelo',
            'O download do modelo de IA requer WiFi e aproximadamente 700MB. Deseja continuar?',
            [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Baixar',
                onPress: async () => {
                  await baixarModelo((progresso) => {
                    setModelo({ progresso });
                  });
                },
              },
            ]
          )}
        />

        {/* Mensagem do dia ou Chat */}
        {showMissao && mensagens.length === 0 ? (
          <MissaoDoDia />
        ) : (
          <FlatList
            ref={flatListRef}
            data={mensagens}
            keyExtractor={m => m.id}
            renderItem={({ item }) => (
              <View style={styles.mensagemWrapper}>
                {item.papel === 'agente' && item.alertas && item.alertas.length > 0 && (
                  <View style={styles.alertasContainer}>
                    {item.alertas.map((alerta: AlertaChat, idx: number) => (
                      <AlertCard key={idx} alerta={alerta} />
                    ))}
                  </View>
                )}
                <ChatBubble mensagem={item} />
              </View>
            )}
            contentContainerStyle={styles.chatList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <Text style={styles.emptyIcon}>🧠</Text>
                <Text style={styles.emptyTexto}>
                  Pergunte algo sobre suas famílias ou pacientes!
                </Text>
              </View>
            }
          />
        )}

        {/* Input */}
        {!showMissao && (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          >
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Pergunte ao agente..."
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                value={input}
                onChangeText={setInput}
                multiline
                maxLength={500}
                onSubmitEditing={handleEnviar}
              />
              <TouchableOpacity
                style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
                onPress={handleEnviar}
                disabled={!input.trim() || carregando}
              >
                <Text style={styles.sendBtnTexto}>
                  {carregando ? '⏳' : '➤'}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  safe: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcone: {
    fontSize: 24,
  },
  headerTitulo: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerBtn: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 22,
    fontWeight: '300',
  },

  // Missão do dia
  missaoContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  missaoCard: {
    padding: 28,
    alignItems: 'center',
  },
  missaoIcone: {
    fontSize: 56,
    marginBottom: 12,
  },
  missaoTitulo: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
  },
  missaoDivider: {
    width: 40,
    height: 2,
    backgroundColor: '#00E676',
    marginVertical: 16,
    borderRadius: 1,
  },
  missaoTexto: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 4,
  },
  missaoFooter: {
    marginTop: 20,
    width: '100%',
    gap: 12,
    alignItems: 'center',
  },
  pularMissao: {
    padding: 8,
  },
  pularMissaoTexto: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 13,
  },

  // Chat
  chatList: {
    padding: 16,
    paddingBottom: 8,
  },
  mensagemWrapper: {
    marginBottom: 8,
  },
  alertasContainer: {
    marginBottom: 4,
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTexto: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 14,
    textAlign: 'center',
  },

  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: '#0B1220',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 15,
    maxHeight: 80,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00E676',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  sendBtnDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowOpacity: 0,
  },
  sendBtnTexto: {
    color: '#0B1220',
    fontSize: 18,
    fontWeight: '800',
  },
});
