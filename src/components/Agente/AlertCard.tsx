/**
 * AlertCard.tsx — Card de alerta do Agente
 *
 * Design futurista com indicadores neon.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertaChat } from '../../ai/tipos';

interface Props {
  alerta: AlertaChat;
}

const ICONES: Record<string, string> = {
  vermelho: '🔴',
  laranja: '🟠',
  amarelo: '🟡',
  verde: '🟢',
};

const CORES: Record<string, string> = {
  vermelho: '#FF6B6B',
  laranja: '#FFA726',
  amarelo: '#FFD54F',
  verde: '#00E676',
};

export function AlertCard({ alerta }: Props) {
  const cor = CORES[alerta.nivel] || 'rgba(255,255,255,0.4)';

  return (
    <View style={[styles.card, { borderLeftColor: cor }]}>
      <View style={styles.header}>
        <Text style={styles.icone}>{ICONES[alerta.nivel] || '⚪'}</Text>
        <Text style={[styles.nivel, { color: cor }]}>
          {alerta.nivel.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.mensagem}>{alerta.mensagem}</Text>
      {alerta.baseadoEm && (
        <Text style={styles.base}>📋 {alerta.baseadoEm}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: 14,
    marginVertical: 4,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icone: {
    fontSize: 14,
    marginRight: 8,
  },
  nivel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  mensagem: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    lineHeight: 20,
  },
  base: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 11,
    marginTop: 6,
    fontStyle: 'italic',
  },
});
