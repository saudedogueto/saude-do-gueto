import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Linking
} from 'react-native';
import { useTema } from '@/src/contexts/TemaContext';

export default function AgenteConfigScreen() {
  const { cores } = useTema();
  const [modeloBaixado, setModeloBaixado] = useState(false);
  const [baixando, setBaixando] = useState(false);
  const [progresso, setProgresso] = useState(0);

  const handleBaixarModelo = () => {
    Alert.alert(
      'Baixar modelo de IA',
      'Recomendo usar WiFi. O download tem aproximadamente 700MB.\n\nModelo: Phi-3 Mini (otimizado para dispositivos móveis)\n\nContinuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Baixar',
          onPress: () => {
            setBaixando(true);
            setProgresso(0);
            // Simula progresso de download
            const interval = setInterval(() => {
              setProgresso(prev => {
                const novo = prev + Math.random() * 15;
                if (novo >= 100) {
                  clearInterval(interval);
                  setBaixando(false);
                  setModeloBaixado(true);
                  Alert.alert('Download concluído!', 'Modelo de IA instalado com sucesso. Use o chat do Agente de Saúde.');
                  return 100;
                }
                return novo;
              });
            }, 800);
          }
        }
      ]
    );
  };

  const handleRemoverModelo = () => {
    Alert.alert(
      'Remover modelo',
      'Tem certeza? O modelo será removido e você precisará baixar novamente para usar o Agente de Saúde.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            setModeloBaixado(false);
            setProgresso(0);
            Alert.alert('Modelo removido');
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: cores.fundo }]}>
      {/* Status do modelo */}
      <View style={[styles.card, { backgroundColor: cores.card }]}>
        <Text style={styles.cardTitle}>📦 Modelo de IA Local</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text style={[styles.statusValor, { color: modeloBaixado ? '#2E7D32' : '#E65100' }]}>
            {modeloBaixado ? '✅ Instalado' : '❌ Não instalado'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Modelo:</Text>
          <Text style={styles.statusValor}>Phi-3 Mini (otimizado mobile)</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Tamanho:</Text>
          <Text style={styles.statusValor}>~700 MB</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Tipo:</Text>
          <Text style={styles.statusValor}>Offline (não requer internet)</Text>
        </View>
      </View>

      {/* Barra de progresso */}
      {baixando && (
        <View style={[styles.card, { backgroundColor: cores.card }]}>
          <Text style={styles.cardTitle}>📥 Baixando...</Text>
          <View style={styles.barraContainer}>
            <View style={[styles.barraProgresso, { width: `${Math.min(progresso, 100)}%` }]} />
          </View>
          <Text style={styles.progressoTexto}>{Math.round(progresso)}% concluído</Text>
          <ActivityIndicator size="small" color="#FF8C00" style={{ marginTop: 8 }} />
        </View>
      )}

      {/* Ações */}
      {!modeloBaixado && !baixando && (
        <TouchableOpacity style={styles.btnPrimary} onPress={handleBaixarModelo}>
          <Text style={styles.btnPrimaryText}>📥 Baixar Modelo (~700MB)</Text>
        </TouchableOpacity>
      )}

      {modeloBaixado && (
        <TouchableOpacity style={styles.btnDanger} onPress={handleRemoverModelo}>
          <Text style={styles.btnDangerText}>🗑️ Remover Modelo</Text>
        </TouchableOpacity>
      )}

      {/* Informações */}
      <View style={[styles.card, { backgroundColor: '#FFF8E1' }]}>
        <Text style={styles.cardTitle}>ℹ️ Sobre o Agente de Saúde</Text>
        <Text style={styles.infoTexto}>
          O Agente de Saúde usa um modelo de linguagem pequeno e eficiente (Phi-3 Mini) que roda 100% offline no seu dispositivo.
        </Text>
        <Text style={styles.infoTexto}>
          Ele é treinado com diretrizes da Atenção Primária à Saúde (APS) e protocolos do SUS para auxiliar Agentes Comunitários de Saúde em campo.
        </Text>
        <Text style={styles.infoDestaque}>
          ⚕️ A IA é ferramenta de APOIO ao ACS. NUNCA prescreva medicamentos. NUNCA diagnostique.
        </Text>
      </View>

      {/* Manifesto */}
      <View style={[styles.card, { backgroundColor: '#E8F5E9' }]}>
        <Text style={styles.cardTitle}>📜 Manifesto do Agente de Saúde</Text>
        <Text style={styles.manifestoTexto}>
          "A tecnologia a serviço da saúde comunitária. O Agente de Saúde nasce da necessidade de levar inteligência artificial para onde a internet não chega — o território. Não substituímos o olhar humano do ACS, mas potencializamos sua capacidade de cuidar.
        </Text>
        <Text style={styles.manifestoTexto}>
          Somos offline por princípio. Somos SUS por vocação. Somos território por natureza.
        </Text>
        <Text style={styles.manifestoTexto}>
          — Saúde do Gueto 🐢🔥"
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  card: { borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  statusRow: { flexDirection: 'row', marginBottom: 8 },
  statusLabel: { fontSize: 14, color: '#666', width: 90 },
  statusValor: { fontSize: 14, color: '#333', flex: 1 },
  barraContainer: { height: 12, backgroundColor: '#E0E0E0', borderRadius: 6, overflow: 'hidden' },
  barraProgresso: { height: '100%', backgroundColor: '#FF8C00', borderRadius: 6 },
  progressoTexto: { fontSize: 13, color: '#666', textAlign: 'center', marginTop: 6 },
  btnPrimary: {
    backgroundColor: '#FF8C00', height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 16
  },
  btnPrimaryText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  btnDanger: {
    backgroundColor: '#FFF', height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#E53935', marginBottom: 16
  },
  btnDangerText: { color: '#E53935', fontSize: 16, fontWeight: 'bold' },
  infoTexto: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 10 },
  infoDestaque: { fontSize: 13, color: '#C62828', fontWeight: 'bold', textAlign: 'center', lineHeight: 18, marginTop: 6 },
  manifestoTexto: { fontSize: 14, color: '#2E7D32', lineHeight: 22, fontStyle: 'italic', marginBottom: 8 },
});
