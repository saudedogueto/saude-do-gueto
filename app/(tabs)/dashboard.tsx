/**
 * dashboard.tsx — Tela Inicial
 *
 * Design profissional com contraste, botões com fundo sólido,
 * tudo alinhado em grid, visual moderno e legível.
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { usePacienteStore } from '@/src/store/pacienteStore';
import { useFamiliaStore } from '@/src/store/familiaStore';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTema } from '@/src/contexts/TemaContext';
import { router } from 'expo-router';
import { DashboardStats } from '@/src/components/DashboardStats';
import { SkeletonList } from '@/src/components/Skeleton';
import { NeonButton } from '@/src/components/NeonButton';
import { useSync } from '@/src/hooks/useSync';

interface BotaoAcao {
  titulo: string;
  icone: string;
  cor: string;
  rota: () => void;
}

export default function DashboardScreen() {
  const pacientes = usePacienteStore(s => s.pacientes);
  const carregarPacientes = usePacienteStore(s => s.carregar);
  const carregandoPacientes = usePacienteStore(s => s.carregando);
  const familias = useFamiliaStore(s => s.familias);
  const carregarFamilias = useFamiliaStore(s => s.carregar);
  const carregandoFamilias = useFamiliaStore(s => s.carregando);
  const { usuario, logout } = useAuth();
  const { cores } = useTema();

  useFocusEffect(
    useCallback(() => {
      carregarPacientes();
      carregarFamilias();
    }, [])
  );

  const onRefresh = useCallback(() => {
    carregarPacientes();
    carregarFamilias();
  }, []);

  const { syncing, lastSync, error, sincronizar } = useSync();

  const handleSync = async () => {
    if (syncing) return;
    await sincronizar();
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  const nomeExibido = usuario?.nome || 'Agente';

  const carregando = carregandoPacientes || carregandoFamilias;

  // Pares lado a lado na ordem solicitada
  const paresBotoes: [BotaoAcao, BotaoAcao][] = [
    [
      { titulo: 'NOVO PACIENTE', icone: '➕', cor: '#FFFFFF', rota: () => router.push('/(tabs)/cadastro') },
      { titulo: 'PACIENTES', icone: '📋', cor: '#FFFFFF', rota: () => router.push('/(tabs)/lista') },
    ],
    [
      { titulo: 'NOVA FAMÍLIA', icone: '➕', cor: '#FFFFFF', rota: () => router.push('/(tabs)/familias') },
      { titulo: 'NOVA VISITA', icone: '🏠', cor: '#FFFFFF', rota: () => router.push('/(tabs)/visita') },
    ],
    [
      { titulo: 'MAPA', icone: '🗺️', cor: '#FFFFFF', rota: () => router.push('/(tabs)/mapa') },
      { titulo: 'AGENTE IA', icone: '🤖', cor: '#FFFFFF', rota: () => router.push('/(tabs)/agente') },
    ],
    [
      { titulo: 'RELATÓRIOS', icone: '📊', cor: '#FFFFFF', rota: () => router.push('/(tabs)/esus-export') },
      { titulo: 'LEMBRETES', icone: '🔔', cor: '#FFFFFF', rota: () => router.push('/(tabs)/lembretes') },
    ],
  ];

  const gestantes = pacientes.filter(p => (p as any).gestante).length;

  const botoesSecundarios: BotaoAcao[] = [
    { titulo: 'CONFIG', icone: '⚙️', cor: '#FFFFFF', rota: () => router.push('/(tabs)/config') },
  ];

  return (
    <View style={[styles.container, { backgroundColor: cores.fundo }]}>
      <StatusBar barStyle="dark-content" backgroundColor={cores.fundo} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={onRefresh}
            tintColor="#00B860"
            colors={['#00B860']}
          />
        }
      >
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.appName, { color: cores.texto }]}>SAÚDE DO GUETO</Text>
            <Text style={[styles.appSub, { color: cores.textoSecundario }]}>
              Agente Inteligente de Saúde
            </Text>
          </View>
          <View style={[styles.avatar, { backgroundColor: cores.primary }]}>
            <Text style={styles.avatarTexto}>
              {nomeExibido.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Saudação */}
        <View style={styles.saudacao}>
          <Text style={[styles.saudacaoTexto, { color: cores.texto }]}>
            {saudacao}, {nomeExibido}!
          </Text>
          <Text style={[styles.saudacaoSub, { color: cores.textoSecundario }]}>
            Seu território está sob controle.
          </Text>
        </View>

        {/* Sincronização */}
        <TouchableOpacity
          style={[
            styles.syncBadge,
            syncing && styles.syncBadgeAtivo,
            error && styles.syncBadgeErro,
            { borderColor: cores.borda },
          ]}
          onPress={handleSync}
        >
          <Text style={[styles.syncBadgeTexto, { color: cores.textoSecundario }]}>
            {syncing ? '⏳ Sincronizando...' : lastSync ? '☁️ Sincronizado' : '☁️ Sincronizar'}
          </Text>
        </TouchableOpacity>

        {carregando ? (
          <SkeletonList count={2} />
        ) : (
          <>
            {/* Cards Inteligentes */}
            <DashboardStats />

            {/* Mini grid de condições */}
            <View style={styles.condGrid}>
              <View style={[styles.condItem, { backgroundColor: cores.card, borderColor: cores.borda }]}>
                <Text style={[styles.condValor, { color: cores.texto }]}>
                  {pacientes.filter(p => (p as any).hipertensao).length}
                </Text>
                <Text style={[styles.condLabel, { color: cores.textoSecundario }]}>Hipertensos</Text>
              </View>
              <View style={[styles.condItem, { backgroundColor: cores.card, borderColor: cores.borda }]}>
                <Text style={[styles.condValor, { color: cores.texto }]}>
                  {pacientes.filter(p => (p as any).diabetes).length}
                </Text>
                <Text style={[styles.condLabel, { color: cores.textoSecundario }]}>Diabéticos</Text>
              </View>
              <View style={[styles.condItem, { backgroundColor: cores.card, borderColor: cores.borda }]}>
                <Text style={[styles.condValor, { color: cores.texto }]}>
                  {pacientes.filter(p => (p as any).menorDoisAnos).length}
                </Text>
                <Text style={[styles.condLabel, { color: cores.textoSecundario }]}>Crianças {'<2a'}</Text>
              </View>
              <View style={[styles.condItem, { backgroundColor: cores.card, borderColor: cores.borda }]}>
                <Text style={[styles.condValor, { color: cores.texto }]}>
                  {gestantes}
                </Text>
                <Text style={[styles.condLabel, { color: cores.textoSecundario }]}>Gestantes</Text>
              </View>
            </View>

            {/* Seção: Ações Rápidas */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionLabel, { color: cores.textoSecundario }]}>AÇÕES RÁPIDAS</Text>
            </View>
            <View style={styles.paresContainer}>
              {paresBotoes.map((par, idx) => (
                <View key={idx} style={styles.parLinha}>
                  <View style={styles.parCol}>
                    <NeonButton
                      titulo={par[0].titulo}
                      icone={par[0].icone}
                      onPress={par[0].rota}
                      cor={par[0].cor}
                    />
                  </View>
                  <View style={styles.parCol}>
                    <NeonButton
                      titulo={par[1].titulo}
                      icone={par[1].icone}
                      onPress={par[1].rota}
                      cor={par[1].cor}
                    />
                  </View>
                </View>
              ))}
            </View>

            {/* Seção: Config (sozinho) */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionLabel, { color: cores.textoSecundario }]}>CONFIGURAÇÕES</Text>
            </View>
            <View style={styles.configContainer}>
              {botoesSecundarios.map((btn, i) => (
                <NeonButton
                  key={i}
                  titulo={btn.titulo}
                  icone={btn.icone}
                  onPress={btn.rota}
                  cor={btn.cor}
                  fullWidth
                />
              ))}
            </View>
          </>
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.logout} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    paddingBottom: 30,
  },

  // Cabeçalho
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 20 : 56,
    paddingBottom: 4,
  },
  headerLeft: {},
  appName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },
  appSub: {
    fontSize: 11,
    marginTop: 1,
    letterSpacing: 0.3,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00B860',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarTexto: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },

  // Saudação
  saudacao: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  saudacaoTexto: {
    fontSize: 24,
    fontWeight: '700',
  },
  saudacaoSub: {
    fontSize: 14,
    marginTop: 2,
  },

  // Sync
  syncBadge: {
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginTop: 4,
    marginBottom: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 184, 96, 0.08)',
    borderWidth: 1,
  },
  syncBadgeAtivo: {
    backgroundColor: 'rgba(224, 136, 0, 0.1)',
  },
  syncBadgeErro: {
    backgroundColor: 'rgba(224, 80, 80, 0.1)',
  },
  syncBadgeTexto: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Condições
  condGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
  },
  condItem: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  condValor: {
    fontSize: 20,
    fontWeight: '800',
  },
  condLabel: {
    fontSize: 8,
    marginTop: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Seções
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },

  // Pares lado a lado
  paresContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  parLinha: {
    flexDirection: 'row',
    gap: 10,
  },
  parCol: {
    flex: 1,
  },

  // Config (sozinho)
  configContainer: {
    paddingHorizontal: 20,
  },

  // Logout
  logout: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(224, 80, 80, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(224, 80, 80, 0.15)',
    alignItems: 'center',
  },
  logoutText: {
    color: 'rgba(224, 80, 80, 0.7)',
    fontSize: 13,
    fontWeight: '600',
  },
});
