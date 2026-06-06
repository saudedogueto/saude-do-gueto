/**
 * ModelStatus.tsx — Indicador de status do modelo de IA
 *
 * Design futurista com glassmorphism.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ModeloState } from '../../ai/tipos';

interface Props {
  modelo: ModeloState;
  onBaixar?: () => void;
}

const STATUS_LABEL: Record<string, { texto: string; cor: string; icone: string }> = {
  nao_baixado: { texto: 'IA não disponível', cor: '#FF6B6B', icone: '🔴' },
  baixando: { texto: 'Baixando modelo...', cor: '#FFA726', icone: '🟡' },
  pronto: { texto: 'IA Local pronta', cor: '#00E676', icone: '🟢' },
  erro: { texto: 'Erro no download', cor: '#FF6B6B', icone: '🔴' },
};

export function ModelStatus({ modelo, onBaixar }: Props) {
  const status = STATUS_LABEL[modelo.status] || STATUS_LABEL.nao_baixado;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.icone}>{status.icone}</Text>
        <Text style={[styles.texto, { color: status.cor }]}>{status.texto}</Text>
      </View>

      {modelo.status === 'baixando' && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBg}>
            <View
              style={[styles.progressFill, { width: `${modelo.progresso}%` }]}
            />
          </View>
          <Text style={styles.progressText}>{modelo.progresso}%</Text>
        </View>
      )}

      {modelo.status === 'nao_baixado' && onBaixar && (
        <TouchableOpacity style={styles.botao} onPress={onBaixar}>
          <Text style={styles.botaoTexto}>
            Baixar modelo (~{modelo.tamanhoMB || 700}MB | WiFi recomendado)
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icone: {
    fontSize: 14,
    marginRight: 8,
  },
  texto: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBg: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00E676',
    borderRadius: 3,
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
    marginLeft: 8,
    minWidth: 36,
    textAlign: 'right',
  },
  botao: {
    marginTop: 10,
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  botaoTexto: {
    color: '#00E676',
    fontSize: 12,
    fontWeight: '600',
  },
});
