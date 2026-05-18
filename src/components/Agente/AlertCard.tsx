/**
 * AlertCard.tsx — Card de alerta do Agente
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
  vermelho: '#e74c3c',
  laranja: '#e67e22',
  amarelo: '#f1c40f',
  verde: '#2ecc71',
};

export function AlertCard({ alerta }: Props) {
  const cor = CORES[alerta.nivel] || '#666';

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
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 14,
    marginVertical: 4,
    borderLeftWidth: 4,
    borderColor: '#333',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icone: {
    fontSize: 16,
    marginRight: 8,
  },
  nivel: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  mensagem: {
    color: '#e0e0e0',
    fontSize: 14,
    lineHeight: 20,
  },
  base: {
    color: '#888',
    fontSize: 11,
    marginTop: 6,
    fontStyle: 'italic',
  },
});
