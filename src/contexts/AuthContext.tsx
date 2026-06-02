import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextType = {
  isLoggedIn: boolean;
  login: (senha: string) => Promise<boolean>;
  logout: () => Promise<void>;
  definirSenha: (senha: string) => Promise<boolean>;
  temSenha: boolean;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Senha padrão para web (primeiro acesso)
const SENHA_DEFAULT = '1234';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [temSenha, setTemSenha] = useState(false);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    verificarSenha();
  }, []);

  const verificarSenha = async () => {
    try {
      const senha = await AsyncStorage.getItem('@senha_acesso');
      setTemSenha(!!senha);
    } catch {
      // Web fallback: primeira vez, não tem senha
      setTemSenha(false);
    }
    setCarregado(true);
  };

  const login = async (senha: string): Promise<boolean> => {
    try {
      const senhaSalva = await AsyncStorage.getItem('@senha_acesso');
      if (senha === senhaSalva) {
        setIsLoggedIn(true);
        return true;
      }
    } catch {
      // Web: qualquer senha funciona se tiver configurada
      if (temSenha) {
        setIsLoggedIn(true);
        return true;
      }
    }
    return false;
  };

  const logout = async () => {
    setIsLoggedIn(false);
  };

  const definirSenha = async (senha: string): Promise<boolean> => {
    if (senha.length < 4) return false;
    try {
      await AsyncStorage.setItem('@senha_acesso', senha);
    } catch {
      // Web: não persiste, mas continua
    }
    setTemSenha(true);
    setIsLoggedIn(true);
    return true;
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, definirSenha, temSenha }}>
      {carregado ? children : null}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
