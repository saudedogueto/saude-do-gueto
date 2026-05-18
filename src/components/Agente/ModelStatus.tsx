/**
 * ModelStatus.tsx — Indicador de status do modelo de IA
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ModeloState } from '../../ai/tipos';

interface Props {
  modelo: ModeloState;
  onBaixar?: () => void;
}

const STATUS_LABEL: Record<string, { texto: string; cor: string; icone: string }> = {
  nao_baixado: { texto: 'IA não disponível', cor: '#e74c3c', icone: '🔴' },
  baixando: { texto: 'Baixando modelo...', cor: '#e67e22', icone: '🟡' },
  pronto: { texto: 'IA Local pronta', cor: '#2ecc71', icone: '🟢' },
  erro: { texto: 'Erro no download', cor: '#e74c3c', icone: '🔴' },
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
    backgroundColor: '#16213e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icone: {
    fontSize: 16,
    marginRight: 8,
  },
  texto: {
    fontSize: 14,
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
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#e67e22',
    borderRadius: 3,
  },
  progressText: {
    color: '#888',
    fontSize: 12,
    marginLeft: 8,
    minWidth: 36,
    textAlign: 'right',
  },
  botao: {
    marginTop: 10,
    backgroundColor: '#e67e22',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
