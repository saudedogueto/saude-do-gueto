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
      <Text style={styles.title}>💾 Backup & Sincronia</Text>

      {/* Status */}
      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>📊 Tamanho dos dados:</Text>
          <Text style={styles.statusValor}>{tamanhoDados}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>🕐 Último backup:</Text>
          <Text style={styles.statusValor}>{ultimoBackup || 'Nunca'}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>📍 Armazenamento:</Text>
          <Text style={styles.statusValor}>Local (offline)</Text>
        </View>
      </View>

      {/* Backup Manual */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📤 Backup Manual</Text>
        <Text style={styles.sectionDesc}>
          Exporta todos os dados (pacientes, visitas, famílias) como arquivo JSON.
          Salve em um local seguro (Google Drive, email, nuvem).
        </Text>
        <TouchableOpacity
          style={[styles.button, salvando && styles.buttonDisabled]}
          onPress={fazerBackup}
          disabled={salvando}
        >
          <Text style={styles.buttonText}>
            {salvando ? 'Exportando...' : '📦 Fazer Backup Agora'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Restaurar */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📥 Restaurar Backup</Text>
        <Text style={styles.sectionDesc}>
          Restaura dados a partir de um arquivo de backup anterior.
          ATENÇÃO: substitui todos os dados atuais.
        </Text>
        <TouchableOpacity
          style={[styles.button, styles.buttonOutline]}
          onPress={restaurarBackup}
        >
          <Text style={[styles.buttonText, { color: '#FF8C00' }]}>
            🔄 Restaurar Dados
          </Text>
        </TouchableOpacity>
      </View>

      {/* Dicas */}
      <View style={styles.dicasCard}>
        <Text style={styles.dicasTitle}>💡 Dicas</Text>
        <Text style={styles.dica}>• Faça backup pelo menos 1x por semana</Text>
        <Text style={styles.dica}>• Salve o arquivo no Google Drive ou email</Text>
        <Text style={styles.dica}>• O backup contém TODOS os dados do app</Text>
        <Text style={styles.dica}>• Para restaurar, use um computador para copiar o JSON</Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    padding: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF8C00',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  statusCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statusLabel: {
    fontSize: 14,
    color: '#555',
  },
  statusValor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  sectionDesc: {
    fontSize: 13,
    color: '#888',
    lineHeight: 20,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#FF8C00',
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonOutline: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#FF8C00',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dicasCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  dicasTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 8,
  },
  dica: {
    fontSize: 13,
    color: '#795548',
    lineHeight: 22,
    paddingLeft: 8,
  },
});
