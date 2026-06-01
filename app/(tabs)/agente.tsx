import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Linking, ActivityIndicator
} from 'react-native';
import { useTema } from '@/src/contexts/TemaContext';
import { usePacientes } from '@/src/contexts/PacienteContext';
import { useVisitas } from '@/src/contexts/VisitaContext';
import { useFamilias } from '@/src/contexts/FamiliaContext';
import { router } from 'expo-router';

export default function AgenteScreen() {
  const { cores } = useTema();
  const { pacientes } = usePacientes();
  const { visitas } = useVisitas();
  const { familias } = useFamilias();
  const [modeloBaixado, setModeloBaixado] = useState(false);
  const [baixando, setBaixando] = useState(false);

  const hipertensos = pacientes.filter(p => p.hipertensao).length;
  const diabeticos = pacientes.filter(p => p.diabetes).length;
  const gestantes = pacientes.filter(p => p.gestante).length;
  const semVisita90dias = pacientes.filter(p => {
    if (!p.ultimaVisita) return true;
    const dias = Math.floor((Date.now() - new Date(p.ultimaVisita).getTime()) / (1000 * 60 * 60 * 24));
    return dias > 90;
  }).length;

  const handleBaixarModelo = () => {
    Alert.alert(
      'Baixar modelo (~700MB)',
      'Recomendo usar WiFi. O download tem ~700MB. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Baixar',
          onPress: () => {
            setBaixando(true);
            // Simula download - na prática chama MLC LLM ou WebLLM
            setTimeout(() => {
              setBaixando(false);
              setModeloBaixado(true);
              Alert.alert('Pronto!', 'Modelo baixado com sucesso.');
            }, 3000);
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: cores.fundo }]}>
      <Text style={styles.title}>🤖 Agente de Saúde</Text>
      <Text style={styles.subtitle}>Copiloto clínico-territorial offline</Text>

      {/* Status do modelo */}
      <View style={[styles.cardStatus, { backgroundColor: modeloBaixado ? '#E8F5E9' : '#FFF3E0' }]}>
        <Text style={styles.cardStatusIcon}>{modeloBaixado ? '✅' : '📥'}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardStatusTitle}>
            {modeloBaixado ? 'Modelo pronto' : 'Modelo não baixado'}
          </Text>
          <Text style={styles.cardStatusDesc}>
            {modeloBaixado
              ? 'IA local disponível para uso offline'
              : 'Baixe o modelo de IA para usar o Agente de Saúde'}
          </Text>
        </View>
        {baixando ? (
          <ActivityIndicator size="small" color="#FF8C00" />
        ) : (
          !modeloBaixado && (
            <TouchableOpacity style={styles.btnBaixar} onPress={handleBaixarModelo}>
              <Text style={styles.btnBaixarText}>Baixar</Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {/* Resumo do território */}
      <View style={[styles.card, { backgroundColor: cores.card }]}>
        <Text style={styles.cardTitle}>📊 Resumo do Território</Text>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.gridNumero}>{pacientes.length}</Text>
            <Text style={styles.gridLabel}>Pacientes</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridNumero}>{familias.length}</Text>
            <Text style={styles.gridLabel}>Famílias</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={[styles.gridNumero, { color: '#E53935' }]}>{semVisita90dias}</Text>
            <Text style={styles.gridLabel}>Sem visita 90d</Text>
          </View>
        </View>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={[styles.gridNumero, { color: '#E65100' }]}>{hipertensos}</Text>
            <Text style={styles.gridLabel}>Hipertensos</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={[styles.gridNumero, { color: '#1565C0' }]}>{diabeticos}</Text>
            <Text style={styles.gridLabel}>Diabéticos</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={[styles.gridNumero, { color: '#AD1457' }]}>{gestantes}</Text>
            <Text style={styles.gridLabel}>Gestantes</Text>
          </View>
        </View>
      </View>

      {/* Alertas detectados */}
      {modeloBaixado && (
        <View style={[styles.card, { backgroundColor: '#FFEBEE', borderLeftWidth: 4, borderLeftColor: '#E53935' }]}>
          <Text style={styles.cardTitle}>⚠️ Alertas detectados</Text>
          {semVisita90dias > 0 && (
            <Text style={styles.alertaItem}>
              • {semVisita90dias} família(s) sem visita há mais de 90 dias
            </Text>
          )}
          {hipertensos > 0 && (
            <Text style={styles.alertaItem}>
              • {hipertensos} paciente(s) hipertenso(s) — verificar PA
            </Text>
          )}
          {gestantes > 0 && (
            <Text style={styles.alertaItem}>
              • {gestantes} gestante(s) — confirmar pré-natal em dia
            </Text>
          )}
        </View>
      )}

      {/* Ações */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btnAcao, { backgroundColor: '#FF8C00' }]}
          onPress={() => {
            if (!modeloBaixado) {
              Alert.alert('Aviso', 'Baixe o modelo primeiro para usar o chat.');
              return;
            }
            router.push('/agente/chat');
          }}
        >
          <Text style={styles.btnAcaoText}>💬 Iniciar Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btnAcao, { backgroundColor: '#FFF', borderWidth: 2, borderColor: '#FF8C00' }]}
          onPress={() => router.push('/agente/config')}
        >
          <Text style={[styles.btnAcaoText, { color: '#FF8C00' }]}>⚙️ Configurar Modelo</Text>
        </TouchableOpacity>
      </View>

      {/* Disclaimer */}
      <View style={[styles.disclaimer, { backgroundColor: '#FFF8E1' }]}>
        <Text style={styles.disclaimerText}>
          ⚕️ A IA é uma ferramenta de APOIO ao ACS. NUNCA prescreva medicamentos. NUNCA diagnostique. Sempre consulte o enfermeiro/médico da UBS.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FF8C00', textAlign: 'center', marginTop: 20 },
  subtitle: { fontSize: 13, color: '#999', textAlign: 'center', marginBottom: 20 },
  cardStatus: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 15, marginBottom: 16, gap: 12
  },
  cardStatusIcon: { fontSize: 28 },
  cardStatusTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  cardStatusDesc: { fontSize: 12, color: '#666', marginTop: 2 },
  btnBaixar: { backgroundColor: '#FF8C00', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  btnBaixarText: { color: '#FFF', fontWeight: 'bold' },
  card: { borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  grid: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  gridItem: { flex: 1, alignItems: 'center' },
  gridNumero: { fontSize: 24, fontWeight: 'bold', color: '#FF8C00' },
  gridLabel: { fontSize: 11, color: '#666', textAlign: 'center' },
  alertaItem: { fontSize: 14, color: '#C62828', marginBottom: 6, lineHeight: 20 },
  actions: { gap: 12, marginBottom: 20 },
  btnAcao: { height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  btnAcaoText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  disclaimer: { borderRadius: 10, padding: 14, marginBottom: 30 },
  disclaimerText: { fontSize: 12, color: '#795548', lineHeight: 18, textAlign: 'center' },
});
