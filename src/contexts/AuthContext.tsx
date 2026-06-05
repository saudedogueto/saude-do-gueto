import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  initFirebase, 
  loginFirebase, 
  logoutFirebase, 
  cadastrarUsuario,
  observarAuth
} from '../services/firebase';

type Usuario = {
  uid: string;
  email: string | null;
  nome?: string;
  microarea?: string;
  funcao?: string;
};

type AuthContextType = {
  isLoggedIn: boolean;
  usuario: Usuario | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<{ sucesso: boolean; erro?: string }>;
  logout: () => Promise<void>;
  cadastrar: (email: string, senha: string) => Promise<{ sucesso: boolean; erro?: string }>;
  modoLocal: boolean;
  loginLocal: (senha: string) => Promise<boolean>;
  definirSenhaLocal: (senha: string) => Promise<boolean>;
  temSenhaLocal: boolean;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [modoLocal, setModoLocal] = useState(false);
  const [temSenhaLocal, setTemSenhaLocal] = useState(false);
  const [firebaseReady, setFirebaseReady] = useState(false);

  // Inicializa Firebase e observa auth
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    async function setup() {
      try {
        await initFirebase();
        setFirebaseReady(true);

        // Observa mudanças na autenticação
        const auth = (await import('../services/firebase')).getFirebaseAuth();
        unsubscribe = observarAuth((user) => {
          if (user) {
            setUsuario({
              uid: user.uid,
              email: user.email,
            });
            setIsLoggedIn(true);
            setCarregando(false);
          } else {
            setUsuario(null);
            setIsLoggedIn(false);
            setCarregando(false);
          }
        });
      } catch {
        // Se Firebase não disponível, usa modo local
        console.log('[Auth] Modo local: Firebase indisponível');
        setModoLocal(true);
        setFirebaseReady(false);
        setCarregando(false);
      }
    }

    // Verifica senha local
    AsyncStorage.getItem('@senha_acesso').then(s => {
      setTemSenhaLocal(!!s);
    });

    setup();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // ===== Login Firebase =====
  const login = useCallback(async (email: string, senha: string): Promise<{ sucesso: boolean; erro?: string }> => {
    if (!firebaseReady) {
      return { sucesso: false, erro: 'Sem conexão com a nuvem. Use o modo local.' };
    }

    try {
      await loginFirebase(email, senha);
      return { sucesso: true };
    } catch (error: any) {
      const codigo = error?.code || '';
      if (codigo === 'auth/user-not-found' || codigo === 'auth/invalid-credential') {
        return { sucesso: false, erro: 'Email ou senha incorretos' };
      }
      if (codigo === 'auth/invalid-email') {
        return { sucesso: false, erro: 'Email inválido' };
      }
      if (codigo === 'auth/too-many-requests') {
        return { sucesso: false, erro: 'Muitas tentativas. Tente novamente mais tarde.' };
      }
      return { sucesso: false, erro: 'Erro ao conectar. Verifique sua internet.' };
    }
  }, [firebaseReady]);

  // ===== Cadastro Firebase =====
  const cadastrar = useCallback(async (email: string, senha: string): Promise<{ sucesso: boolean; erro?: string }> => {
    if (!firebaseReady) {
      return { sucesso: false, erro: 'Sem conexão com a nuvem.' };
    }

    try {
      await cadastrarUsuario(email, senha);
      return { sucesso: true };
    } catch (error: any) {
      const codigo = error?.code || '';
      if (codigo === 'auth/email-already-in-use') {
        return { sucesso: false, erro: 'Este email já está cadastrado' };
      }
      if (codigo === 'auth/weak-password') {
        return { sucesso: false, erro: 'Senha muito fraca. Use pelo menos 6 caracteres.' };
      }
      return { sucesso: false, erro: 'Erro ao cadastrar.' };
    }
  }, [firebaseReady]);

  // ===== Logout =====
  const logout = useCallback(async () => {
    if (firebaseReady) {
      try {
        await logoutFirebase();
      } catch {}
    }
    setUsuario(null);
    setIsLoggedIn(false);
  }, [firebaseReady]);

  // ===== Modo local (senha numérica) =====
  const loginLocal = useCallback(async (senha: string): Promise<boolean> => {
    const senhaSalva = await AsyncStorage.getItem('@senha_acesso');
    if (senha === senhaSalva) {
      setIsLoggedIn(true);
      return true;
    }
    return false;
  }, []);

  const definirSenhaLocal = useCallback(async (senha: string): Promise<boolean> => {
    if (senha.length < 4) return false;
    await AsyncStorage.setItem('@senha_acesso', senha);
    setTemSenhaLocal(true);
    setIsLoggedIn(true);
    return true;
  }, []);

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      usuario,
      carregando,
      login,
      logout,
      cadastrar,
      modoLocal,
      loginLocal,
      definirSenhaLocal,
      temSenhaLocal,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
