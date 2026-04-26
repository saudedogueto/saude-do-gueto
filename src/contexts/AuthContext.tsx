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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [temSenha, setTemSenha] = useState(false);

  useEffect(() => {
    verificarSenha();
  }, []);

  const verificarSenha = async () => {
    const senha = await AsyncStorage.getItem('@senha_acesso');
    setTemSenha(!!senha);
  };

  const login = async (senha: string): Promise<boolean> => {
    const senhaSalva = await AsyncStorage.getItem('@senha_acesso');
    if (senha === senhaSalva) {
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = async () => {
    setIsLoggedIn(false);
  };

  const definirSenha = async (senha: string): Promise<boolean> => {
    if (senha.length < 4) return false;
    await AsyncStorage.setItem('@senha_acesso', senha);
    setTemSenha(true);
    setIsLoggedIn(true);
    return true;
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, definirSenha, temSenha }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
