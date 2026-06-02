import React, { useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, StatusBar, Dimensions
} from 'react-native';
import { usePacientes } from '@/src/contexts/PacienteContext';
import { useFamilias } from '@/src/contexts/FamiliaContext';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTema } from '@/src/contexts/TemaContext';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

// 🎨 PALETA PROFISSIONAL
const C = {
  laranja: '#FF8C00',
  azul: '#2196F3',
  vermelhoSuave: '#FCE4EC',
  azulSuave: '#E3F2FD',
  rosaSuave: '#FCE4EC',
  vermelhoTexto: '#C62828',
  azulTexto: '#1565C0',
  rosaTexto: '#AD1457',
  vermelho: '#E53935',
  bordaClaro: '#E8E8E8',
  bordaEscuro: '#333',
  cardClaro: '#1E1E1E',
};

export default function DashboardScreen() {
  const { pacientes, carregarPacientes } = usePacientes();
  const { familias, carregarFamilias } = useFamilias();
  const { logout } = useAuth();
  const { cores, isEscuro } = useTema();

  useEffect(() => {
    carregarPacientes();
    carregarFamilias();
  }, []);

  const onRefresh = useCallback(() => {
    carregarPacientes();
    carregarFamilias();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const hipertensos = pacientes.filter(p => p.hipertensao).length;
  const diabeticos = pacientes.filter(p => p.diabetes).length;
  const gestantes = pacientes.filter(p => p.gestante).length;

  const barStyle = isEscuro ? 'light-content' : 'dark-content';

  const botoesAcao = [
    { icone: '➕', label: 'Novo Cadastro', rota: '/(tabs)/cadastro' },
    { icone: '🤖', label: 'Agente de Saúde', rota: '/(tabs)/agente' },
    { icone: '📋', label: 'Ver Pacientes', rota: '/(tabs)/lista' },
    { icone: '🏠', label: 'Registrar Visita', rota: '/(tabs)/visita' },
    { icone: '📊', label: 'Histórico de Visitas', rota: '/(tabs)/historico-visitas' },
    { icone: '🔔', label: 'Lembretes', rota: '/(tabs)/lembretes' },
    { icone: '👨‍👩‍👧‍👦', label: 'Famílias', rota: '/(tabs)/familias' },
    { icone: '🗺️', label: 'Mapa Social', rota: '/(tabs)/mapa' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: cores.fundo }}>
      <StatusBar barStyle={barStyle} backgroundColor={cores.fundo} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={onRefresh}
            tintColor={C.laranja}
            colors={[C.laranja]}
          />
        }
      >
        {/* HEADER */}
        <View style={[styles.headerSection, { backgroundColor: cores.fundo }]}>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>ACS</Text>
          </View>
          <Text style={styles.title}>SAÚDE DO GUETO</Text>
          <Text style={styles.subtitle}>DASHBOARD</Text>
          <Text style={[styles.headerDesc, { color: isEscuro ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)' }]}>
            Agente Comunitário de Saúde
          </Text>
        </View>

        {/* MÉTRICAS PRINCIPAIS */}
        <View style={styles.cardsLinha}>
          <View style={[styles.cardMetrica, isEscuro ? { backgroundColor: '#2C1810' } : { backgroundColor: '#FFF3E0' }]}>
            <Text style={[styles.metricaNumero, { color: C.laranja }]}>{familias.length}</Text>
            <Text style={[styles.metricaLabel, { color: isEscuro ? '#FFF' : '#4E342E' }]}>Famílias</Text>
            <Text style={[styles.metricaSublabel, { color: isEscuro ? 'rgba(255,255,255,0.5)' : '#8D6E63' }]}>cadastradas</Text>
          </View>
          <View style={[styles.cardMetrica, isEscuro ? { backgroundColor: '#2C1810' } : { backgroundColor: '#FFF3E0' }]}>
            <Text style={[styles.metricaNumero, { color: C.laranja }]}>{pacientes.length}</Text>
            <Text style={[styles.metricaLabel, { color: isEscuro ? '#FFF' : '#4E342E' }]}>Pacientes</Text>
            <Text style={[styles.metricaSublabel, { color: isEscuro ? 'rgba(255,255,255,0.5)' : '#8D6E63' }]}>acompanhados</Text>
          </View>
        </View>

        {/* INDICADORES DE SAÚDE */}
        <View style={styles.indicadoresContainer}>
          <Text style={[styles.secaoTitulo, { color: isEscuro ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }]}>
            INDICADORES DE SAÚDE
          </Text>
          <View style={styles.indicadoresLinha}>
            <View style={[styles.indicadorCard, isEscuro ? { backgroundColor: '#3D1E1E' } : { backgroundColor: '#E8F5E9' }]}>
              <Text style={[styles.indicadorNumero, { color: isEscuro ? '#66BB6A' : '#2E7D32' }]}>{hipertensos}</Text>
              <Text style={[styles.indicadorLabel, { color: isEscuro ? 'rgba(255,255,255,0.6)' : '#666' }]}>Hipertensos</Text>
            </View>
            <View style={[styles.indicadorCard, isEscuro ? { backgroundColor: '#1A2D3D' } : { backgroundColor: '#E3F2FD' }]}>
              <Text style={[styles.indicadorNumero, { color: isEscuro ? '#42A5F5' : '#1565C0' }]}>{diabeticos}</Text>
              <Text style={[styles.indicadorLabel, { color: isEscuro ? 'rgba(255,255,255,0.6)' : '#666' }]}>Diabéticos</Text>
            </View>
            <View style={[styles.indicadorCard, isEscuro ? { backgroundColor: '#3D1E2E' } : { backgroundColor: '#FCE4EC' }]}>
              <Text style={[styles.indicadorNumero, { color: isEscuro ? '#EC407A' : '#AD1457' }]}>{gestantes}</Text>
              <Text style={[styles.indicadorLabel, { color: isEscuro ? 'rgba(255,255,255,0.6)' : '#666' }]}>Gestantes</Text>
            </View>
          </View>
        </View>

        {/* AÇÕES */}
        <View style={styles.acaoContainer}>
          <Text style={[styles.secaoTitulo, { color: isEscuro ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }]}>
            AÇÕES
          </Text>
          <View style={styles.acoesGrid}>
            {botoesAcao.map((botao, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.botaoAcao, {
                  backgroundColor: isEscuro ? '#3D2E1E' : '#FFE0B2',
                  borderColor: isEscuro ? '#5D4E3E' : '#FFCC80',
                  borderLeftColor: C.laranja,
                }]}
                onPress={() => router.push(botao.rota)}
                activeOpacity={0.7}
              >
                <View style={[styles.botaoIconeBg, isEscuro ? { backgroundColor: 'rgba(255,140,0,0.15)' } : { backgroundColor: '#FFCC80' }]}>
                  <Text style={styles.botaoIcone}>{botao.icone}</Text>
                </View>
                <Text style={[styles.botaoTexto, { color: cores.texto }]}>{botao.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FERRAMENTAS */}
        <View style={styles.acaoContainer}>
          <Text style={[styles.secaoTitulo, { color: isEscuro ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }]}>
            FERRAMENTAS
          </Text>
          <View style={styles.acoesGrid}>
            <TouchableOpacity
              style={[styles.botaoAcao, {
                backgroundColor: isEscuro ? '#3D2E1E' : '#FFF3E0',
                borderColor: isEscuro ? '#5D4E3E' : '#EDE0CC',
                borderLeftColor: C.laranja,
              }]}
              onPress={() => router.push('/(tabs)/dados')}
              activeOpacity={0.7}
            >
              <View style={[styles.botaoIconeBg, isEscuro ? { backgroundColor: 'rgba(255,255,255,0.1)' } : { backgroundColor: '#EDE0CC' }]}>
                <Text style={styles.botaoIcone}>📊</Text>
              </View>
              <Text style={[styles.botaoTexto, { color: cores.texto }]}>Relatórios e Dados</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.botaoAcao, {
                backgroundColor: isEscuro ? '#3D2E1E' : '#FFF3E0',
                borderColor: isEscuro ? '#5D4E3E' : '#EDE0CC',
                borderLeftColor: C.laranja,
              }]}
              onPress={() => router.push('/(tabs)/config')}
              activeOpacity={0.7}
            >
              <View style={[styles.botaoIconeBg, isEscuro ? { backgroundColor: 'rgba(255,255,255,0.1)' } : { backgroundColor: '#EDE0CC' }]}>
                <Text style={styles.botaoIcone}>⚙️</Text>
              </View>
              <Text style={[styles.botaoTexto, { color: cores.texto }]}>Configurações</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SAIR */}
        <TouchableOpacity style={styles.botaoSair} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.botaoSairTexto}>Sair</Text>
        </TouchableOpacity>
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
    fontSize: 28,
    fontWeight: '900',
    color: C.laranja,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 15,
    color: C.azul,
    fontWeight: '700',
    letterSpacing: 5,
    marginTop: 3,
  },
  headerDesc: {
    fontSize: 11,
    marginTop: 5,
    letterSpacing: 1,
  },

  cardsLinha: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    gap: 12,
    marginBottom: 20,
  },
  cardMetrica: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  metricaNumero: { fontSize: 38, fontWeight: '900', lineHeight: 44 },
  metricaLabel: { fontSize: 14, marginTop: 2, fontWeight: '700', letterSpacing: 0.5 },
  metricaSublabel: { fontSize: 10, marginTop: 1, letterSpacing: 0.3 },

  indicadoresContainer: { marginBottom: 20 },
  indicadoresLinha: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    gap: 10,
  },
  indicadorCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  indicadorNumero: { fontSize: 26, fontWeight: '800' },
  indicadorLabel: { fontSize: 11, marginTop: 2, fontWeight: '600' },

  secaoTitulo: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    marginHorizontal: 20,
    marginBottom: 10,
  },

  acaoContainer: { marginBottom: 20 },
  acoesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    gap: 10,
  },
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
    width: (width - 40) / 2,
    minHeight: 76,
  },
  botaoIconeBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  botaoIcone: { fontSize: 20 },
  botaoTexto: { fontSize: 13, fontWeight: '700', flex: 1, lineHeight: 17 },

  botaoSair: {
    alignSelf: 'center',
    marginTop: 6,
    backgroundColor: C.vermelho,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
    elevation: 3,
    shadowColor: C.vermelho,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  botaoSairTexto: { color: '#FFF', fontSize: 14, fontWeight: '700', letterSpacing: 1 },
});
