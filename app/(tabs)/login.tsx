import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { useAuth } from '@/src/contexts/AuthContext';
import { router } from 'expo-router';

export default function LoginScreen() {
  const { login, temSenha, definirSenha } = useAuth();
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [modoDefinir, setModoDefinir] = useState(false);

  const handleLogin = async () => {
    if (!senha) {
      Alert.alert('Atenção', 'Digite sua senha');
      return;
    }

    if (!temSenha) {
      // Primeiro acesso - definir senha
      setModoDefinir(true);
      return;
    }

    const ok = await login(senha);
    if (ok) {
      router.replace('/(tabs)/dashboard');
    } else {
      Alert.alert('Erro', 'Senha incorreta');
    }
  };

  const handleDefinirSenha = async () => {
    if (senha !== confirmaSenha) {
      Alert.alert('Erro', 'As senhas não conferem');
      return;
    }
    if (senha.length < 4) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 4 dígitos');
      return;
    }
    await definirSenha(senha);
    router.replace('/(tabs)/dashboard');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>🏥</Text>
        <Text style={styles.title}>Saúde do Gueto</Text>
        <Text style={styles.subtitle}>Agente Comunitário de Saúde</Text>
        <Text style={styles.desc}>Ferramenta de acompanhamento de pacientes da comunidade</Text>

        <View style={styles.form}>
          {!modoDefinir ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Digite sua senha"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
                keyboardType="numeric"
                maxLength={6}
              />
              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>
                  {temSenha ? 'Acessar' : 'Primeiro Acesso'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.instructions}>
                Defina uma senha numérica de 4 a 6 dígitos
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Nova senha"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
                keyboardType="numeric"
                maxLength={6}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirme a senha"
                value={confirmaSenha}
                onChangeText={setConfirmaSenha}
                secureTextEntry
                keyboardType="numeric"
                maxLength={6}
              />
              <TouchableOpacity style={styles.button} onPress={handleDefinirSenha}>
                <Text style={styles.buttonText}>Definir Senha</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {!temSenha && (
          <Text style={styles.aviso}>
            🔒 Primeiro acesso: defina uma senha para proteger os dados dos pacientes
          </Text>
        )}
      </View>
    </KeyboardAvoidingView>
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
    padding: 30,
  },
  logo: {
    fontSize: 64,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF8C00',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  desc: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    width: '100%',
    maxWidth: 320,
  },
  input: {
    height: 52,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FFA500',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 16,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 4,
  },
  button: {
    backgroundColor: '#FF8C00',
    height: 52,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  instructions: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  aviso: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 30,
    paddingHorizontal: 20,
  },
});
