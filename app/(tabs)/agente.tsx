/**
 * agente.tsx — Tela do Agente de Saúde Offline 🧠
 *
 * Chat contextual com o Agente.
 * Suporta: resumo de família, perguntas livres, alertas.
 * Fallback para regras fixas quando o modelo de IA não está disponível.
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
  FamiliaParaRegra,
  AlertaChat,
} from '../../src/ai/tipos';

export default function AgenteScreen() {
  const {
    mensagens,
    adicionarMensagem,
    limparChat,
    chatCarregando,
    setChatCarregando,
    modelo,
    setModelo,
    alertasProativos,
    setAlertasProativos,
    contextoAtual,
    setContextoAtual,
  } = useAgenteStore();

  const [inputTexto, setInputTexto] = useState('');
  const [modo, setModo] = useState<'chat' | 'alertas'>('chat');
  const flatListRef = useRef<FlatList>(null);

  // Simula dados de exemplo para teste
  useEffect(() => {
    if (mensagens.length === 0) {
      const msgBoasVindas: PromptParams = {
        tipo: 'resumo_familia',
        familia: {
          id: 'exemplo',
          nome: 'Exemplo — Silva',
          bairro: 'Centro',
          microarea: '01',
          diasSemVisita: 92,
          vulnerabilidadeSocial: true,
          pacientes: [
            {
              id: 'p1',
              nome: 'Dona Maria',
              idade: 72,
              sexo: 'F',
              hipertenso: true,
              diabetico: false,
              gestante: false,
              vacinasAtrasadas: false,
              ultimaAfericaoPA: 60,
            },
            {
              id: 'p2',
              nome: 'João',
              idade: 8,
              sexo: 'M',
              hipertenso: false,
              diabetico: false,
              gestante: false,
              vacinasAtrasadas: true,
            },
          ],
        },
      };

      executarPrompt(msgBoasVindas).then((res) => {
        adicionarMensagem({
          papel: 'agente',
          texto:
            '🧠 **Agente de Saúde Offline**\n\n' +
            'Olá! Sou seu copiloto clínico-territorial. Posso:\n\n' +
            '📋 Resumir uma família\n' +
            '⚠️ Gerar alertas de visita\n' +
            '❓ Sugerir perguntas\n' +
            '📅 Planejar o dia\n\n' +
            '*Exemplo abaixo:*\n\n' +
            '---\n' +
            res.texto,
        });
      });
    }
  }, []);

  // Rola pra baixo quando chega mensagem nova
  useEffect(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [mensagens]);

  const enviarMensagem = useCallback(async () => {
    const texto = inputTexto.trim();
    if (!texto || chatCarregando) return;

    setInputTexto('');
    adicionarMensagem({ papel: 'usuario', texto });

    setChatCarregando(true);
    try {
      const params: PromptParams = {
        tipo: 'pergunta_livre',
        perguntaLivre: texto,
        familia: contextoAtual || undefined,
      };

      const resposta = await executarPrompt(params);
      adicionarMensagem({ papel: 'agente', texto: resposta.texto });
    } catch (error) {
      adicionarMensagem({
        papel: 'agente',
        texto: '❌ Erro ao processar. Tente novamente.',
      });
    } finally {
      setChatCarregando(false);
    }
  }, [inputTexto, chatCarregando, contextoAtual]);

  const handleResumoFamilia = useCallback(async () => {
    if (!contextoAtual) {
      Alert.alert(
        'Sem contexto',
        'Selecione uma família primeiro na tela de Detalhes.'
      );
      return;
    }

    setChatCarregando(true);
    try {
      const params: PromptParams = {
        tipo: 'resumo_familia',
        familia: contextoAtual,
      };
      const resposta = await executarPrompt(params);
      adicionarMensagem({ papel: 'usuario', texto: `📋 Resumo da família ${contextoAtual.nome}` });
      adicionarMensagem({ papel: 'agente', texto: resposta.texto });
    } finally {
      setChatCarregando(false);
    }
  }, [contextoAtual]);

  const handlePlanejarDia = useCallback(async () => {
    setChatCarregando(true);
    try {
      const params: PromptParams = {
        tipo: 'planejar_dia',
        alertas: alertasProativos.map((a) => a.mensagem),
      };
      const resposta = await executarPrompt(params);
      adicionarMensagem({ papel: 'usuario', texto: '📅 Planejar visitas de hoje' });
      adicionarMensagem({ papel: 'agente', texto: resposta.texto });
    } finally {
      setChatCarregando(false);
    }
  }, [alertasProativos]);

  const handleBaixarModelo = useCallback(async () => {
    Alert.alert(
      'Baixar Modelo',
      'Recomendo usar WiFi. O download tem ~700MB. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Baixar',
          onPress: async () => {
            setModelo({ status: 'baixando', progresso: 0 });
            const ok = await baixarModelo((progresso) => {
              setModelo({ progresso });
            });
            if (ok) {
              setModelo({ status: 'pronto', progresso: 100 });
              adicionarMensagem({
                papel: 'agente',
                texto: '✅ Modelo de IA baixado com sucesso! Agora posso responder com mais precisão.',
              });
            } else {
              setModelo({ status: 'erro' });
              adicionarMensagem({
                papel: 'agente',
                texto: '❌ Erro ao baixar o modelo. Verifique sua conexão e tente novamente.',
              });
            }
          },
        },
      ]
    );
  }, []);

  const renderHeader = () => (
    <View>
      <ModelStatus modelo={modelo} onBaixar={handleBaixarModelo} />

      {/* Botões de ação rápida */}
      <View style={styles.acoesContainer}>
        <TouchableOpacity
          style={styles.botaoAcao}
          onPress={handleResumoFamilia}
        >
          <Text style={styles.botaoAcaoIcone}>📋</Text>
          <Text style={styles.botaoAcaoTexto}>Resumo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoAcao} onPress={handlePlanejarDia}>
          <Text style={styles.botaoAcaoIcone}>📅</Text>
          <Text style={styles.botaoAcaoTexto}>Planejar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.botaoAcao}
          onPress={() => setModo(modo === 'chat' ? 'alertas' : 'chat')}
        >
          <Text style={styles.botaoAcaoIcone}>
            {modo === 'chat' ? '⚠️' : '💬'}
          </Text>
          <Text style={styles.botaoAcaoTexto}>
            {modo === 'chat' ? 'Alertas' : 'Chat'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoAcao} onPress={limparChat}>
          <Text style={styles.botaoAcaoIcone}>🗑️</Text>
          <Text style={styles.botaoAcaoTexto}>Limpar</Text>
        </TouchableOpacity>
      </View>

      {/* Seção de alertas */}
      {modo === 'alertas' && (
        <View style={styles.alertasSection}>
          <Text style={styles.alertasTitulo}>
            ⚠️ Alertas do Território
          </Text>
          {alertasProativos.length === 0 ? (
            <Text style={styles.semAlertas}>
              Nenhum alerta no momento. Cadastre mais famílias para ativar a análise.
            </Text>
          ) : (
            alertasProativos.map((alerta, i) => (
              <AlertCard key={i} alerta={alerta} />
            ))
          )}
        </View>
      )}

      {contextoAtual && (
        <View style={styles.contextoBar}>
          <Text style={styles.contextoTexto}>
            🏠 Contexto: {contextoAtual.nome}
          </Text>
          <TouchableOpacity onPress={() => setContextoAtual(null)}>
            <Text style={styles.contextoLimpar}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitulo}>🧠 Agente de Saúde</Text>
          <Text style={styles.headerSubtitulo}>
            {modelo.status === 'pronto' ? 'IA Local 🟢' : 'Modo regras ⚡'}
          </Text>
        </View>

        {/* Lista de mensagens */}
        <FlatList
          ref={flatListRef}
          data={mensagens}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatBubble mensagem={item} />}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={<View style={{ height: 16 }} />}
          contentContainerStyle={styles.listaContent}
          showsVerticalScrollIndicator={false}
        />

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Pergunte sobre uma família, território..."
            placeholderTextColor="#666"
            value={inputTexto}
            onChangeText={setInputTexto}
            multiline
            maxLength={500}
            editable={!chatCarregando}
          />
          <TouchableOpacity
            style={[styles.botaoEnviar, (!inputTexto.trim() || chatCarregando) && styles.botaoEnviarDisabled]}
            onPress={enviarMensagem}
            disabled={!inputTexto.trim() || chatCarregando}
          >
            <Text style={styles.botaoEnviarTexto}>
              {chatCarregando ? '...' : '➤'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#161b22',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitulo: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitulo: {
    color: '#2ecc71',
    fontSize: 12,
    fontWeight: '600',
  },
  listaContent: {
    padding: 16,
    flexGrow: 1,
  },
  acoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  botaoAcao: {
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    minWidth: 64,
    borderWidth: 1,
    borderColor: '#333',
  },
  botaoAcaoIcone: {
    fontSize: 20,
  },
  botaoAcaoTexto: {
    color: '#aaa',
    fontSize: 11,
    marginTop: 4,
  },
  alertasSection: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  alertasTitulo: {
    color: '#e67e22',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  semAlertas: {
    color: '#666',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  contextoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#16213e',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e67e22',
  },
  contextoTexto: {
    color: '#e0e0e0',
    fontSize: 13,
  },
  contextoLimpar: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: 'bold',
    paddingLeft: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#161b22',
    borderTopWidth: 1,
    borderTopColor: '#333',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#0d1117',
    color: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#333',
  },
  botaoEnviar: {
    backgroundColor: '#e67e22',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  botaoEnviarDisabled: {
    backgroundColor: '#333',
    opacity: 0.5,
  },
  botaoEnviarTexto: {
    color: '#fff',
    fontSize: 18,
  },
});
