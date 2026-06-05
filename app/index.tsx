import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
  ActivityIndicator, ScrollView
} from 'react-native';
import { useAuth } from '@/src/contexts/AuthContext';
import { router } from 'expo-router';

export default function LoginScreen() {
  const {
    login, cadastrar, carregando,
    modoLocal, loginLocal, definirSenhaLocal, temSenhaLocal,
  } = useAuth();

  // Aba ativa: 'login' | 'cadastro' | 'local'
  const [aba, setAba] = useState<'login' | 'cadastro' | 'local'>(temSenhaLocal ? 'local' : 'login');

  // Campos login/cadastro Firebase
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // Campos cadastro
  const [confirmaSenha, setConfirmaSenha] = useState('');

  // Campos modo local
  const [senhaLocal, setSenhaLocal] = useState('');
  const [confirmaLocal, setConfirmaLocal] = useState('');
  const [definindoLocal, setDefinindoLocal] = useState(false);

  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState('');

  if (carregando) {
    return (
      <View style={[styles.container, styles.centro]}>
        <Text style={styles.logo}>🏥</Text>
        <ActivityIndicator size="large" color="#FF8C00" />
        <Text style={styles.carregandoText}>Carregando...</Text>
      </View>
    );
  }

  // ===== Firebase Login =====
  const handleLogin = async () => {
    setErro('');
    if (!email.trim()) { setErro('Digite seu email'); return; }
    if (!senha) { setErro('Digite sua senha'); return; }

    setProcessando(true);
    const resultado = await login(email.trim(), senha);
    setProcessando(false);

    if (resultado.sucesso) {
      router.replace('/(tabs)/dashboard');
    } else {
      setErro(resultado.erro || 'Erro ao fazer login');
    }
  };

  // ===== Firebase Cadastro =====
  const handleCadastro = async () => {
    setErro('');
    if (!email.trim()) { setErro('Digite seu email'); return; }
    if (senha.length < 6) { setErro('A senha deve ter pelo menos 6 caracteres'); return; }
    if (senha !== confirmaSenha) { setErro('As senhas não conferem'); return; }

    setProcessando(true);
    const resultado = await cadastrar(email.trim(), senha);
    setProcessando(false);

    if (resultado.sucesso) {
      Alert.alert('Conta criada', 'Bem-vindo ao Saúde do Gueto!');
      router.replace('/(tabs)/dashboard');
    } else {
      setErro(resultado.erro || 'Erro ao cadastrar');
    }
  };

  // ===== Modo local =====
  const handleLoginLocal = async () => {
    if (!senhaLocal) { setErro('Digite sua senha'); return; }
    setProcessando(true);
    const ok = await loginLocal(senhaLocal);
    setProcessando(false);

    if (ok) {
      router.replace('/(tabs)/dashboard');
    } else {
      setErro('Senha incorreta');
      setSenhaLocal('');
    }
  };

  const handleDefinirLocal = async () => {
    if (senhaLocal.length < 4) { setErro('A senha deve ter pelo menos 4 dígitos'); return; }
    if (senhaLocal !== confirmaLocal) { setErro('As senhas não conferem'); return; }

    setProcessando(true);
    await definirSenhaLocal(senhaLocal);
    setProcessando(false);
    router.replace('/(tabs)/dashboard');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* Logo */}
        <View style={styles.logoArea}>
          <Text style={styles.logo}>🏥</Text>
          <Text style={styles.title}>Saúde do Gueto</Text>
          <Text style={styles.subtitle}>Agente Comunitário de Saúde</Text>
        </View>

        {/* Abas */}
        <View style={styles.abas}>
          <TouchableOpacity
            style={[styles.aba, aba === 'login' && styles.abaAtiva]}
            onPress={() => { setAba('login'); setErro(''); }}
          >
            <Text style={[styles.abaTexto, aba === 'login' && styles.abaTextoAtiva]}>Entrar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.aba, aba === 'cadastro' && styles.abaAtiva]}
            onPress={() => { setAba('cadastro'); setErro(''); }}
          >
            <Text style={[styles.abaTexto, aba === 'cadastro' && styles.abaTextoAtiva]}>Cadastrar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.aba, aba === 'local' && styles.abaAtiva]}
            onPress={() => { setAba('local'); setErro(''); }}
          >
            <Text style={[styles.abaTexto, aba === 'local' && styles.abaTextoAtiva]}>Local</Text>
          </TouchableOpacity>
        </View>

        {/* Erro */}
        {erro ? (
          <View style={styles.erroBox}>
            <Text style={styles.erroTexto}>{erro}</Text>
          </View>
        ) : null}

        {/* Aba: Login Firebase */}
        {aba === 'login' && (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email do ACS"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={[styles.button, processando && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={processando}
            >
              {processando ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Entrar</Text>
              )}
            </TouchableOpacity>
            <Text style={styles.dica}>
              Já tem conta? Faça login com email e senha.
            </Text>
          </View>
        )}

        {/* Aba: Cadastro Firebase */}
        {aba === 'cadastro' && (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email do ACS"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="Senha (mínimo 6 caracteres)"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="Confirmar senha"
              value={confirmaSenha}
              onChangeText={setConfirmaSenha}
              secureTextEntry
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={[styles.button, processando && styles.buttonDisabled]}
              onPress={handleCadastro}
              disabled={processando}
            >
              {processando ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Criar Conta</Text>
              )}
            </TouchableOpacity>
            <Text style={styles.dica}>
              Crie sua conta para acessar de qualquer dispositivo.
            </Text>
          </View>
        )}

        {/* Aba: Modo Local */}
        {aba === 'local' && (
          <View style={styles.form}>
            {temSenhaLocal && !definindoLocal ? (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Senha numérica"
                  value={senhaLocal}
                  onChangeText={setSenhaLocal}
                  secureTextEntry
                  keyboardType="numeric"
                  maxLength={6}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity
                  style={[styles.button, styles.buttonLocal, processando && styles.buttonDisabled]}
                  onPress={handleLoginLocal}
                  disabled={processando}
                >
                  {processando ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.buttonText}>Acessar</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.link}
                  onPress={() => { setDefinindoLocal(true); setErro(''); }}
                >
                  <Text style={styles.linkTexto}>Redefinir senha</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.instrucoes}>
                  Defina uma senha numérica de 4 a 6 dígitos
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nova senha"
                  value={senhaLocal}
                  onChangeText={setSenhaLocal}
                  secureTextEntry
                  keyboardType="numeric"
                  maxLength={6}
                  placeholderTextColor="#999"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Confirmar senha"
                  value={confirmaLocal}
                  onChangeText={setConfirmaLocal}
                  secureTextEntry
                  keyboardType="numeric"
                  maxLength={6}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity
                  style={[styles.button, styles.buttonLocal, processando && styles.buttonDisabled]}
                  onPress={handleDefinirLocal}
                  disabled={processando}
                >
                  {processando ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.buttonText}>
                      {temSenhaLocal ? 'Alterar Senha' : 'Definir Senha'}
                    </Text>
                  )}
                </TouchableOpacity>
                {temSenhaLocal && (
                  <TouchableOpacity
                    style={styles.link}
                    onPress={() => { setDefinindoLocal(false); setErro(''); }}
                  >
                    <Text style={styles.linkTexto}>Voltar</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
            <Text style={styles.dica}>
              🔒 Modo offline — dados salvos apenas neste dispositivo
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  centro: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  carregandoText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 64,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF8C00',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  // ===== Abas =====
  abas: {
    flexDirection: 'row',
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    padding: 4,
  },
  aba: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  abaAtiva: {
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  abaTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  abaTextoAtiva: {
    color: '#FF8C00',
  },
  // ===== Erro =====
  erroBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  erroTexto: {
    color: '#DC2626',
    fontSize: 13,
    textAlign: 'center',
  },
  // ===== Form =====
  form: {
    width: '100%',
  },
  input: {
    height: 50,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    marginBottom: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111',
  },
  button: {
    backgroundColor: '#FF8C00',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    elevation: 3,
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonLocal: {
    backgroundColor: '#6B7280',
    shadowColor: '#6B7280',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instrucoes: {
    color: '#6B7280',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  link: {
    alignItems: 'center',
    marginTop: 12,
  },
  linkTexto: {
    color: '#FF8C00',
    fontSize: 13,
    fontWeight: '600',
  },
  dica: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
});
