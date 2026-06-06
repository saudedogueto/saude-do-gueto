import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Tema = 'claro' | 'escuro' | 'sistema';

type Cores = {
  fundo: string;
  card: string;
  texto: string;
  textoSecundario: string;
  borda: string;
  input: string;
  primary: string;
  primaryLight: string;
  verdeSaude: string;
  azulNeon: string;
  glassBg: string;
  glassBorder: string;
};

// Paleta futurista: SUS do Futuro
// Claro = fundo claro, escuro = fundo #0B1220
const paletaEscura: Cores = {
  fundo: '#0B1220',
  card: 'rgba(255, 255, 255, 0.06)',
  texto: '#FFFFFF',
  textoSecundario: 'rgba(255, 255, 255, 0.6)',
  borda: 'rgba(255, 255, 255, 0.1)',
  input: 'rgba(255, 255, 255, 0.08)',
  primary: '#00E676',
  primaryLight: 'rgba(0, 230, 118, 0.15)',
  verdeSaude: '#00E676',
  azulNeon: '#00B0FF',
  glassBg: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',
};

const paletaClara: Cores = {
  fundo: '#F0F2F5',
  card: '#FFFFFF',
  texto: '#1A1A2E',
  textoSecundario: '#4A4A6A',
  borda: '#D0D2DE',
  input: '#FFFFFF',
  primary: '#00B860',
  primaryLight: 'rgba(0, 184, 96, 0.1)',
  verdeSaude: '#00B860',
  azulNeon: '#0088E0',
  glassBg: '#FFFFFF',
  glassBorder: '#E0E2EC',
};

type TemaContextType = {
  tema: Tema;
  cores: Cores;
  setTema: (tema: Tema) => void;
  isEscuro: boolean;
};

const TemaContext = createContext<TemaContextType>({} as TemaContextType);

export function TemaProvider({ children }: { children: React.ReactNode }) {
  const sistema = useColorScheme();
  const [tema, setTemaState] = useState<Tema>('claro');

  useEffect(() => {
    AsyncStorage.getItem('@tema').then(saved => {
      if (saved && ['claro', 'escuro', 'sistema'].includes(saved)) {
        setTemaState(saved as Tema);
      }
    });
  }, []);

  const setTema = (novoTema: Tema) => {
    setTemaState(novoTema);
    AsyncStorage.setItem('@tema', novoTema);
  };

  // Padrão: modo claro. Usuário pode trocar pra escuro ou sistema.
  const isEscuro = tema === 'escuro' || (tema === 'sistema' && sistema === 'dark');
  const cores = isEscuro ? paletaEscura : paletaClara;

  return (
    <TemaContext.Provider value={{ tema, cores, setTema, isEscuro }}>
      {children}
    </TemaContext.Provider>
  );
}

export const useTema = () => useContext(TemaContext);
