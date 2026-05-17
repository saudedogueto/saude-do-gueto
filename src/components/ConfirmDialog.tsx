import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';

interface ConfirmDialogProps {
  visivel: boolean;
  titulo: string;
  mensagem: string;
  confirmarTexto?: string;
  cancelarTexto?: string;
  tipo?: 'danger' | 'normal';
  onConfirmar: () => void;
  onCancelar: () => void;
}

export function ConfirmDialog({
  visivel,
  titulo,
  mensagem,
  confirmarTexto = 'Confirmar',
  cancelarTexto = 'Cancelar',
  tipo = 'normal',
  onConfirmar,
  onCancelar,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onCancelar}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.titulo}>{titulo}</Text>
          <Text style={styles.mensagem}>{mensagem}</Text>
          <View style={styles.botoes}>
            <TouchableOpacity style={[styles.botao, styles.botaoCancelar]} onPress={onCancelar}>
              <Text style={styles.textoCancelar}>{cancelarTexto}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.botao, tipo === 'danger' ? styles.botaoDanger : styles.botaoConfirmar]}
              onPress={onConfirmar}
            >
              <Text style={styles.textoConfirmar}>{confirmarTexto}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
  },
  titulo: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  mensagem: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  botoes: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  botao: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  botaoCancelar: {
    backgroundColor: '#374151',
  },
  botaoConfirmar: {
    backgroundColor: '#3B82F6',
  },
  botaoDanger: {
    backgroundColor: '#EF4444',
  },
  textoCancelar: {
    color: '#9CA3AF',
    fontWeight: '600',
  },
  textoConfirmar: {
    color: '#fff',
    fontWeight: '600',
  },
});
