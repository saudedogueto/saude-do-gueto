import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar
} from 'react-native';
import { useTema } from '@/src/contexts/TemaContext';
import { usePacientes } from '@/src/contexts/PacienteContext';
import { useVisitas } from '@/src/contexts/VisitaContext';
import { router } from 'expo-router';

const C = {
  laranja: '#FF8C00',
  azul: '#2196F3',
  vermelho: '#E53935',
};

export default function DadosScreen() {
  const { cores, isEscuro } = useTema();
  const { pacientes } = usePacientes();
  const { visitas } = useVisitas();

  const barStyle = isEscuro ? 'light-content' : 'dark-content';

  const botoes = [
    {
      icone: '📊',
      titulo: 'Relatórios',
      desc: 'Estatísticas, gráficos e exportação CSV',
      rota: '/(tabs)/relatorios',
      corBg: '#FFF3E0',
    },
    {
      icone: '💾',
      titulo: 'Backup',
      desc: 'Exportar e restaurar dados do app',
      rota: '/(tabs)/backup',
      corBg: '#FFF3E0',
    },
    {
      icone: '📋',
      titulo: 'e-SUS / SIS Online',
      desc: 'Exportação para sistemas do SUS',
      rota: '/(tabs)/esus-export',
      corBg: '#E3F2FD',
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: cores.fundo }}>
      <StatusBar barStyle={barStyle} backgroundColor={cores.fundo} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={[styles.headerSection, { backgroundColor: cores.fundo }]}>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>DADOS</Text>
          </View>
          <Text style={styles.title}>Relatórios e Dados</Text>
          <Text style={[styles.headerDesc, { color: isEscuro ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)' }]}>
            Exportação e gestão de informações
          </Text>
        </View>

        {/* MÉTRICAS */}
        <View style={styles.cardsLinha}>
          <View style={[styles.cardInfo, isEscuro ? { backgroundColor: '#0D2137' } : { backgroundColor: '#E3F2FD' }]}>
            <Text style={[styles.cardNumero, { color: C.azul }]}>{pacientes.length}</Text>
            <Text style={[styles.cardLabel, { color: isEscuro ? '#FFF' : '#1A237E' }]}>Pacientes</Text>
          </View>
          <View style={[styles.cardInfo, isEscuro ? { backgroundColor: '#2C1810' } : { backgroundColor: '#FFF3E0' }]}>
            <Text style={[styles.cardNumero, { color: C.laranja }]}>{visitas.length}</Text>
            <Text style={[styles.cardLabel, { color: isEscuro ? '#FFF' : '#4E342E' }]}>Visitas</Text>
          </View>
        </View>

        {/* BOTÕES */}
        {botoes.map((botao, index) => (
          <View key={index} style={styles.botaoWrapper}>
            <TouchableOpacity
              style={[styles.botaoAcao, {
                backgroundColor: isEscuro ? '#1E1E1E' : '#FFFFFF',
                borderColor: isEscuro ? '#333' : '#E8E8E8',
                borderLeftColor: C.laranja,
              }]}
              onPress={() => router.push(botao.rota)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconeBg, { backgroundColor: botao.corBg }]}>
                <Text style={styles.botaoIcone}>{botao.icone}</Text>
              </View>
              <View style={styles.botaoTextoArea}>
                <Text style={[styles.botaoTitulo, { color: cores.texto }]}>{botao.titulo}</Text>
                <Text style={[styles.botaoDesc, { color: isEscuro ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }]}>{botao.desc}</Text>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { paddingBottom: 60 },

  headerSection: {
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerBadge: {
    backgroundColor: C.laranja,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 10,
  },
  headerBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: C.laranja,
    textAlign: 'center',
    letterSpacing: 1,
  },
  headerDesc: {
    fontSize: 12,
    marginTop: 5,
    letterSpacing: 1,
    textAlign: 'center',
  },

  cardsLinha: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    gap: 12,
    marginBottom: 24,
  },
  cardInfo: {
    flex: 1,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardNumero: { fontSize: 30, fontWeight: '900' },
  cardLabel: { fontSize: 13, marginTop: 2, fontWeight: '700' },

  botaoWrapper: { paddingHorizontal: 15, marginBottom: 10 },
  botaoAcao: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconeBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoIcone: { fontSize: 24 },
  botaoTextoArea: { flex: 1, marginLeft: 14 },
  botaoTitulo: { fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
  botaoDesc: { fontSize: 11, marginTop: 2, lineHeight: 15 },
});
