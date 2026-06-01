import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';

export default function HomePage() {
  const { temSenha } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>🏥</Text>
        <Text style={styles.title}>Saúde do Gueto</Text>
        <Text style={styles.subtitle}>Agente Comunitário de Saúde</Text>

        <View style={styles.divider} />

        <Text style={styles.desc}>
          Cuidar de quem precisa, onde mais precisa.
        </Text>
        <Text style={styles.descSub}>
          Cadastro e acompanhamento de pacientes da comunidade
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/(tabs)/login')}
        >
          <Text style={styles.buttonText}>
            {temSenha ? 'Acessar o Sistema' : 'Primeiro Acesso'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          Saúde do Gueto v3 • {new Date().getFullYear()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  logo: {
    fontSize: 72,
    marginBottom: 15,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FF8C00',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 5,
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: '#FF8C00',
    borderRadius: 2,
    marginVertical: 25,
  },
  desc: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
  },
  descSub: {
    fontSize: 13,
    color: '#AAA',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#FF8C00',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    color: '#CCC',
    fontSize: 12,
  },
});
