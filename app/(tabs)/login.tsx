import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { useAuth } from '@/src/contexts/AuthContext';
import { router } from 'expo-router';
import { useTema } from '@/src/contexts/TemaContext';
import { NeonButton } from '../../src/components/NeonButton';

export default function LoginScreen() {
  const { cores } = useTema();
  const { loginLocal, temSenha, definirSenha } = useAuth();
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [modoDefinir, setModoDefinir] = useState(false);

  const handleLogin = async () => {
    if (!senha) {
      Alert.alert('Atenção', 'Digite sua senha');
      return;
    }

    if (!temSenha) {
      setModoDefinir(true);
      return;
    }

    const ok = await loginLocal(senha);
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
      style={[styles.container, { backgroundColor: cores.fundo }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>🏥</Text>
        <Text style={[styles.title, { color: cores.primary }]}>Saúde do Gueto</Text>
        <Text style={[styles.subtitle, { color: cores.textoSecundario }]}>Agente Comunitário de Saúde</Text>
        <Text style={[styles.desc, { color: cores.textoSecundario }]}>Ferramenta de acompanhamento de pacientes da comunidade</Text>

        <View style={styles.form}>
          {!modoDefinir ? (
            <>
              <TextInput
                style={[styles.input, { backgroundColor: cores.input, borderColor: cores.borda, color: cores.texto }]}
                placeholder="Digite sua senha"
                placeholderTextColor={cores.textoSecundario}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
                keyboardType="numeric"
                maxLength={6}
              />
              <NeonButton
                titulo={temSenha ? 'Acessar' : 'Primeiro Acesso'}
                onPress={handleLogin}
                cor="#FFFFFF"
                fullWidth
              />
            </>
          ) : (
            <>
              <Text style={[styles.instructions, { color: cores.textoSecundario }]}>
                Defina uma senha numérica de 4 a 6 dígitos
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: cores.input, borderColor: cores.borda, color: cores.texto }]}
                placeholder="Nova senha"
                placeholderTextColor={cores.textoSecundario}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
                keyboardType="numeric"
                maxLength={6}
              />
              <TextInput
                style={[styles.input, { backgroundColor: cores.input, borderColor: cores.borda, color: cores.texto }]}
                placeholder="Confirme a senha"
                placeholderTextColor={cores.textoSecundario}
                value={confirmaSenha}
                onChangeText={setConfirmaSenha}
                secureTextEntry
                keyboardType="numeric"
                maxLength={6}
              />
              <NeonButton
                titulo="Definir Senha"
                onPress={handleDefinirSenha}
                cor="#FFFFFF"
                fullWidth
              />
            </>
          )}
        </View>

        {!temSenha && (
          <Text style={[styles.aviso, { color: cores.textoSecundario }]}>
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
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 5,
  },
  desc: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    width: '100%',
    maxWidth: 320,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 16,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 4,
  },
  instructions: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  aviso: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 30,
    paddingHorizontal: 20,
  },
});
