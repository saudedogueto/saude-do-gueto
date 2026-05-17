import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '@/src/contexts/AuthContext';
import { router } from 'expo-router';

export default function Index() {
  const { temSenha } = useAuth();
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    // Aguarda um tick pra garantir que o router tá pronto
    const timer = setTimeout(() => {
      setPronto(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!pronto) return;
    // Tenta navegar pra rota correta
    if (!temSenha) {
      // App sem senha: vai direto pro dashboard
      router.replace('/(tabs)/dashboard');
    } else {
      // Tem senha: vai pro login
      router.replace('/(tabs)/login');
    }
  }, [pronto, temSenha]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FF8C00" />
      <Text style={styles.text}>Saúde do Gueto</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 16,
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
});
