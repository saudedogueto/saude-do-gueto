/**
 * ChatBubble.tsx — Bolha de mensagem do chat do Agente
 *
 * Design futurista: fundo escuro, bordas sutis, cores neon.
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
    padding: 14,
    borderRadius: 18,
  },
  agenteBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  usuarioBubble: {
    backgroundColor: '#00E676',
    borderBottomRightRadius: 4,
  },
  carregandoBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    opacity: 0.7,
  },
  texto: {
    fontSize: 15,
    lineHeight: 22,
  },
  agenteTexto: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  usuarioTexto: {
    color: '#0B1220',
    fontWeight: '500',
  },
  horario: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.3)',
    marginTop: 2,
    marginHorizontal: 4,
  },
  agenteHorario: {
    textAlign: 'left',
  },
  carregandoTexto: {
    color: '#00E676',
    fontStyle: 'italic',
    fontSize: 14,
  },
});
