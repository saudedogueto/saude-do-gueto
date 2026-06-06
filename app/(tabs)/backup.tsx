import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Share
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTema } from '@/src/contexts/TemaContext';
import { useToast } from '@/src/components/Toast';

export default function BackupScreen() {
  const { cores } = useTema();
  const { showToast } = useToast();
  const [ultimoBackup, setUltimoBackup] = useState<string | null>(null);
  const [tamanhoDados, setTamanhoDados] = useState('0 KB');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarInfo();
  }, []);

  const carregarInfo = async () => {
    const ultimo = await AsyncStorage.getItem('@ultimo_backup');
    setUltimoBackup(ultimo);

    // Calcular tamanho dos dados
    const chaves = ['@pacientes', '@visitas', '@familias', '@senha_acesso'];
    let total = 0;
    for (const chave of chaves) {
      const valor = await AsyncStorage.getItem(chave);
      if (valor) total += valor.length;
    }
    setTamanhoDados(total > 1024 ? `${(total / 1024).toFixed(1)} KB` : `${total} bytes`);
  };

  const fazerBackup = async () => {
    setSalvando(true);
    try {
      // Coletar todos os dados
      const dados = {
        pacientes: JSON.parse(await AsyncStorage.getItem('@pacientes') || '[]'),
        visitas: JSON.parse(await AsyncStorage.getItem('@visitas') || '[]'),
        familias: JSON.parse(await AsyncStorage.getItem('@familias') || '[]'),
        exportadoEm: new Date().toISOString(),
        versao: '2.0',
      };

      const jsonString = JSON.stringify(dados, null, 2);

      await Share.share({
        message: jsonString,
        title: 'Backup Saúde do Gueto',
      });

      const agora = new Date().toLocaleString('pt-BR');
      await AsyncStorage.setItem('@ultimo_backup', agora);
      setUltimoBackup(agora);
      showToast('Backup realizado com sucesso!');
    } catch (error) {
      showToast('Backup cancelado ou falhou', 'error');
    } finally {
      setSalvando(false);
    }
  };

  const restaurarBackup = async () => {
    Alert.alert(
      'Restaurar Backup',
      'Isso substituirá TODOS os dados atuais do app pelos dados do backup. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Como restaurar',
              'Para restaurar, cole o JSON do backup no campo abaixo. Você precisa de um computador para isso. Por enquanto, mantenha o arquivo salvo.',
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: cores.fundo }]}>
      <Text style={[styles.title, { color: cores.primary }]}>💾 Backup & Sincronia</Text>

      {/* Status */}
      <View style={[styles.statusCard, { backgroundColor: cores.card, borderColor: cores.borda }]}>
        <View style={[styles.statusRow, { borderBottomColor: cores.borda }]}>
          <Text style={[styles.statusLabel, { color: cores.textoSecundario }]}>📊 Tamanho dos dados:</Text>
          <Text style={[styles.statusValor, { color: cores.texto }]}>{tamanhoDados}</Text>
        </View>
        <View style={[styles.statusRow, { borderBottomColor: cores.borda }]}>
          <Text style={[styles.statusLabel, { color: cores.textoSecundario }]}>🕐 Último backup:</Text>
          <Text style={[styles.statusValor, { color: cores.texto }]}>{ultimoBackup || 'Nunca'}</Text>
        </View>
        <View style={[styles.statusRow, { borderBottomColor: cores.borda }]}>
          <Text style={[styles.statusLabel, { color: cores.textoSecundario }]}>📍 Armazenamento:</Text>
          <Text style={[styles.statusValor, { color: cores.texto }]}>Local (offline)</Text>
        </View>
      </View>

      {/* Backup Manual */}
      <View style={[styles.section, { backgroundColor: cores.card, borderColor: cores.borda }]}>
        <Text style={[styles.sectionTitle, { color: cores.texto }]}>📤 Backup Manual</Text>
        <Text style={[styles.sectionDesc, { color: cores.textoSecundario }]}>
          Exporta todos os dados (pacientes, visitas, famílias) como arquivo JSON.
          Salve em um local seguro (Google Drive, email, nuvem).
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: cores.primary }, salvando && styles.buttonDisabled]}
          onPress={fazerBackup}
          disabled={salvando}
        >
          <Text style={[styles.buttonText, { color: '#0B1220' }]}>
            {salvando ? 'Exportando...' : '📦 Fazer Backup Agora'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Restaurar */}
      <View style={[styles.section, { backgroundColor: cores.card, borderColor: cores.borda }]}>
        <Text style={[styles.sectionTitle, { color: cores.texto }]}>📥 Restaurar Backup</Text>
        <Text style={[styles.sectionDesc, { color: cores.textoSecundario }]}>
          Restaura dados a partir de um arquivo de backup anterior.
          ATENÇÃO: substitui todos os dados atuais.
        </Text>
        <TouchableOpacity
          style={[styles.button, styles.buttonOutline, { borderColor: cores.primary, backgroundColor: 'transparent' }]}
          onPress={restaurarBackup}
        >
          <Text style={[styles.buttonText, { color: cores.primary }]}>
            🔄 Restaurar Dados
          </Text>
        </TouchableOpacity>
      </View>

      {/* Dicas */}
      <View style={[styles.dicasCard, { backgroundColor: cores.card, borderColor: cores.borda }]}>
        <Text style={[styles.dicasTitle, { color: cores.primary }]}>💡 Dicas</Text>
        <Text style={[styles.dica, { color: cores.textoSecundario }]}>• Faça backup pelo menos 1x por semana</Text>
        <Text style={[styles.dica, { color: cores.textoSecundario }]}>• Salve o arquivo no Google Drive ou email</Text>
        <Text style={[styles.dica, { color: cores.textoSecundario }]}>• O backup contém TODOS os dados do app</Text>
        <Text style={[styles.dica, { color: cores.textoSecundario }]}>• Para restaurar, use um computador para copiar o JSON</Text>
      </View>

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
  statusCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  statusLabel: {
    fontSize: 14,
  },
  statusValor: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  sectionDesc: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 15,
  },
  button: {
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonOutline: {
    borderWidth: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dicasCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  dicasTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dica: {
    fontSize: 13,
    lineHeight: 22,
    paddingLeft: 8,
  },
});
