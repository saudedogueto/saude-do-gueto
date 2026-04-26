import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTema, Tema } from '@/src/contexts/TemaContext';
import { useAuth } from '@/src/contexts/AuthContext';
import { router } from 'expo-router';

export default function ConfigScreen() {
  const { tema, cores, setTema, isEscuro } = useTema();
  const { logout } = useAuth();

  const opcoesTema: { label: string; value: Tema }[] = [
    { label: '☀️ Claro', value: 'claro' },
    { label: '🌙 Escuro', value: 'escuro' },
    { label: '📱 Sistema', value: 'sistema' },
  ];

  const limparDados = () => {
    Alert.alert(
      'Limpar Todos os Dados',
      'Isso apagará TODOS os pacientes, visitas e famílias. A senha será mantida. Tem certeza?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar Tudo',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove(['@pacientes', '@visitas', '@familias', '@ultimo_backup']);
            Alert.alert('Dados limpos!', 'Todos os dados foram removidos.');
          }
        }
      ]
    );
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: cores.fundo }]}>
      <Text style={[styles.title, { color: cores.primary }]}>⚙️ Configurações</Text>

      {/* Tema */}
      <View style={[styles.card, { backgroundColor: cores.card }]}>
        <Text style={[styles.sectionTitle, { color: cores.primary }]}>🎨 Tema</Text>
        <Text style={[styles.desc, { color: cores.textoSecundario }]}>
          Escolha o tema do aplicativo
        </Text>
        <View style={styles.temaRow}>
          {opcoesTema.map(op => (
            <TouchableOpacity
              key={op.value}
              style={[
                styles.temaBtn,
                { borderColor: cores.borda },
                tema === op.value && { borderColor: cores.primary, backgroundColor: cores.primaryLight }
              ]}
              onPress={() => setTema(op.value)}
            >
              <Text style={[
                styles.temaText,
                { color: cores.texto },
                tema === op.value && { color: cores.primary, fontWeight: 'bold' }
              ]}>
                {op.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Informações */}
      <View style={[styles.card, { backgroundColor: cores.card }]}>
        <Text style={[styles.sectionTitle, { color: cores.primary }]}>ℹ️ Sobre</Text>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: cores.textoSecundario }]}>App:</Text>
          <Text style={[styles.infoValor, { color: cores.texto }]}>Saúde do Gueto</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: cores.textoSecundario }]}>Versão:</Text>
          <Text style={[styles.infoValor, { color: cores.texto }]}>2.0</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: cores.textoSecundario }]}>Desenvolvido para:</Text>
          <Text style={[styles.infoValor, { color: cores.texto }]}>ACS - Saúde da Família</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: cores.textoSecundario }]}>Armazenamento:</Text>
          <Text style={[styles.infoValor, { color: cores.texto }]}>Local (offline)</Text>
        </View>
      </View>

      {/* Perigo */}
      <View style={[styles.card, { backgroundColor: cores.card }]}>
        <Text style={[styles.sectionTitle, { color: '#E53935' }]}>⚠️ Área de Risco</Text>
        <Text style={[styles.desc, { color: cores.textoSecundario }]}>
          Limpa todos os pacientes, visitas e famílias. A senha permanece.
        </Text>
        <TouchableOpacity
          style={styles.btnDanger}
          onPress={limparDados}
        >
          <Text style={styles.btnDangerText}>🗑️ Limpar Todos os Dados</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={[styles.logoutText, { color: cores.textoSecundario }]}>Sair da Conta</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  desc: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  temaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  temaBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 2,
    borderRadius: 8,
    alignItems: 'center',
  },
  temaText: {
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValor: {
    fontSize: 14,
    fontWeight: '500',
  },
  btnDanger: {
    backgroundColor: '#FFEBEE',
    borderWidth: 2,
    borderColor: '#E53935',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnDangerText: {
    color: '#E53935',
    fontWeight: 'bold',
    fontSize: 15,
  },
  logoutBtn: {
    alignSelf: 'center',
    padding: 15,
  },
  logoutText: {
    fontSize: 15,
  },
});
