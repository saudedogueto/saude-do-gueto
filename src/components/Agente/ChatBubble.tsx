/**
 * ChatBubble.tsx — Bolha de mensagem do chat do Agente
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MensagemChat } from '../../ai/tipos';

interface Props {
  mensagem: MensagemChat;
}

export function ChatBubble({ mensagem }: Props) {
  const isAgente = mensagem.papel === 'agente';
  const isCarregando = mensagem.carregando;

  return (
    <View
      style={[
        styles.container,
        isAgente ? styles.agenteContainer : styles.usuarioContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isAgente ? styles.agenteBubble : styles.usuarioBubble,
          isCarregando && styles.carregandoBubble,
        ]}
      >
        {isCarregando ? (
          <Text style={styles.carregandoTexto}>🧠 Pensando...</Text>
        ) : (
          <Text
            style={[
              styles.texto,
              isAgente ? styles.agenteTexto : styles.usuarioTexto,
            ]}
          >
            {mensagem.texto}
          </Text>
        )}
      </View>
      <Text style={[styles.horario, isAgente && styles.agenteHorario]}>
        {new Date(mensagem.timestamp).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: '85%',
  },
  agenteContainer: {
    alignSelf: 'flex-start',
  },
  usuarioContainer: {
    alignSelf: 'flex-end',
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 0,
  },
  agenteBubble: {
    backgroundColor: '#1a1a2e',
    borderBottomLeftRadius: 4,
    borderColor: '#333',
    borderWidth: 1,
  },
  usuarioBubble: {
    backgroundColor: '#e67e22',
    borderBottomRightRadius: 4,
  },
  carregandoBubble: {
    backgroundColor: '#1a1a2e',
    opacity: 0.7,
  },
  texto: {
    fontSize: 15,
    lineHeight: 22,
  },
  agenteTexto: {
    color: '#e0e0e0',
  },
  usuarioTexto: {
    color: '#fff',
  },
  horario: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
    marginHorizontal: 4,
  },
  agenteHorario: {
    textAlign: 'left',
  },
  carregandoTexto: {
    color: '#e67e22',
    fontStyle: 'italic',
    fontSize: 14,
  },
});
