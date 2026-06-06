import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
  ActivityIndicator, ScrollView
} from 'react-native';
import { useAuth } from '@/src/contexts/AuthContext';
import { router } from 'expo-router';
import { useTema } from '@/src/contexts/TemaContext';
import { NeonButton } from '../src/components/NeonButton';

export default function LoginScreen() {
  const { cores } = useTema();
  const {
    login, cadastrar, carregando,
    modoLocal, loginLocal, definirSenhaLocal, temSenhaLocal,
  } = useAuth();

  const [aba, setAba] = useState<'login' | 'cadastro' | 'local'>(temSenhaLocal ? 'local' : 'login');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [senhaLocal, setSenhaLocal] = useState('');
  const [confirmaLocal, setConfirmaLocal] = useState('');
  const [definindoLocal, setDefinindoLocal] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState('');

  if (carregando) {
    return (
      <View style={[styles.container, styles.centro]}>
        <Text style={styles.logo}>🏥</Text>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.carregandoText}>Carregando...</Text>
      </View>
    );
  }

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
      style={[styles.container, { backgroundColor: cores.fundo }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logoArea}>
          <Text style={styles.logo}>🏥</Text>
          <Text style={[styles.title, { color: cores.primary }]}>Saúde do Gueto</Text>
          <Text style={[styles.subtitle, { color: cores.textoSecundario }]}>Agente Comunitário de Saúde</Text>
        </View>

        {/* Abas */}
        <View style={[styles.abas, { backgroundColor: cores.card, borderColor: cores.borda }]}>
          {(['login', 'cadastro', 'local'] as const).map((a) => (
            <TouchableOpacity
              key={a}
              style={[styles.aba, aba === a && [styles.abaAtiva, { backgroundColor: cores.input, borderColor: cores.borda }]]}
              onPress={() => { setAba(a); setErro(''); }}
            >
              <Text style={[styles.abaTexto, { color: cores.textoSecundario }, aba === a && { color: cores.primary }]}>
                {a === 'login' ? 'Entrar' : a === 'cadastro' ? 'Cadastrar' : 'Local'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {erro ? (
          <View style={[styles.erroBox, { backgroundColor: 'rgba(255, 82, 82, 0.1)', borderColor: 'rgba(255, 82, 82, 0.2)' }]}>
            <Text style={styles.erroTexto}>{erro}</Text>
          </View>
        ) : null}

        {/* Aba: Login */}
        {aba === 'login' && (
          <View style={styles.form}>
            <TextInput
              style={[styles.input, { backgroundColor: cores.input, borderColor: cores.borda, color: cores.texto }]}
              placeholder="Email do ACS"
              placeholderTextColor={cores.textoSecundario}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={[styles.input, { backgroundColor: cores.input, borderColor: cores.borda, color: cores.texto }]}
              placeholder="Senha"
              placeholderTextColor={cores.textoSecundario}
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
            />
            <NeonButton
              titulo="Entrar"
              onPress={handleLogin}
              cor="#FFFFFF"
              fullWidth
            />
          </View>
        )}

        {/* Aba: Cadastro */}
        {aba === 'cadastro' && (
          <View style={styles.form}>
            <TextInput
              style={[styles.input, { backgroundColor: cores.input, borderColor: cores.borda, color: cores.texto }]}
              placeholder="Email do ACS"
              placeholderTextColor={cores.textoSecundario}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={[styles.input, { backgroundColor: cores.input, borderColor: cores.borda, color: cores.texto }]}
              placeholder="Senha (mínimo 6 caracteres)"
              placeholderTextColor={cores.textoSecundario}
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
            />
            <TextInput
              style={[styles.input, { backgroundColor: cores.input, borderColor: cores.borda, color: cores.texto }]}
              placeholder="Confirmar senha"
              placeholderTextColor={cores.textoSecundario}
              value={confirmaSenha}
              onChangeText={setConfirmaSenha}
              secureTextEntry
            />
            <NeonButton
              titulo="Criar Conta"
              onPress={handleCadastro}
              cor="#FFFFFF"
              fullWidth
            />
          </View>
        )}

        {/* Aba: Local */}
        {aba === 'local' && (
          <View style={styles.form}>
            {temSenhaLocal && !definindoLocal ? (
              <>
                <TextInput
                  style={[styles.input, { backgroundColor: cores.input, borderColor: cores.borda, color: cores.texto }]}
                  placeholder="Senha numérica"
                  placeholderTextColor={cores.textoSecundario}
                  value={senhaLocal}
                  onChangeText={setSenhaLocal}
                  secureTextEntry
                  keyboardType="numeric"
                  maxLength={6}
                />
                <NeonButton
                  titulo="Acessar"
                  onPress={handleLoginLocal}
                  cor="#FFFFFF"
                  fullWidth
                />
                <TouchableOpacity style={styles.link} onPress={() => { setDefinindoLocal(true); setErro(''); }}>
                  <Text style={[styles.linkTexto, { color: cores.primary }]}>Redefinir senha</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={[styles.instrucoes, { color: cores.textoSecundario }]}>
                  Defina uma senha numérica de 4 a 6 dígitos
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: cores.input, borderColor: cores.borda, color: cores.texto }]}
                  placeholder="Nova senha"
                  placeholderTextColor={cores.textoSecundario}
                  value={senhaLocal}
                  onChangeText={setSenhaLocal}
                  secureTextEntry
                  keyboardType="numeric"
                  maxLength={6}
                />
                <TextInput
                  style={[styles.input, { backgroundColor: cores.input, borderColor: cores.borda, color: cores.texto }]}
                  placeholder="Confirmar senha"
                  placeholderTextColor={cores.textoSecundario}
                  value={confirmaLocal}
                  onChangeText={setConfirmaLocal}
                  secureTextEntry
                  keyboardType="numeric"
                  maxLength={6}
                />
                <NeonButton
                  titulo={temSenhaLocal ? 'Alterar Senha' : 'Definir Senha'}
                  onPress={handleDefinirLocal}
                  cor="#FFFFFF"
                  fullWidth
                />
                {temSenhaLocal && (
                  <TouchableOpacity style={styles.link} onPress={() => { setDefinindoLocal(false); setErro(''); }}>
                    <Text style={[styles.linkTexto, { color: cores.primary }]}>Voltar</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centro: { justifyContent: 'center', alignItems: 'center' },
  carregandoText: { marginTop: 12, color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoArea: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 64, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 4 },
  abas: { flexDirection: 'row', marginBottom: 24, borderRadius: 12, padding: 4, borderWidth: 1 },
  aba: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  abaAtiva: { borderWidth: 1 },
  abaTexto: { fontSize: 13, fontWeight: '600' },
  erroBox: { borderRadius: 8, padding: 12, marginBottom: 16, borderWidth: 1 },
  erroTexto: { color: '#FF5252', fontSize: 13, textAlign: 'center' },
  form: { width: '100%' },
  input: { height: 50, borderWidth: 1, borderRadius: 10, marginBottom: 12, paddingHorizontal: 16, fontSize: 16 },
  link: { alignItems: 'center', marginTop: 12 },
  linkTexto: { fontSize: 13, fontWeight: '600' },
  instrucoes: { fontSize: 13, textAlign: 'center', marginBottom: 16 },
});
