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
};

export const coresClaro: Cores = {
  fundo: '#FAFAFA',
  card: '#FFFFFF',
  texto: '#222222',
  textoSecundario: '#666666',
  borda: '#E0E0E0',
  input: '#FFFFFF',
  primary: '#FF8C00',
  primaryLight: '#FFF3E0',
};

export const coresEscuro: Cores = {
  fundo: '#121212',
  card: '#1E1E1E',
  texto: '#E0E0E0',
  textoSecundario: '#999999',
  borda: '#333333',
  input: '#2C2C2C',
  primary: '#FFA726',
  primaryLight: '#3E2723',
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

  const isEscuro = tema === 'escuro' || (tema === 'sistema' && sistema === 'dark');
  const cores = isEscuro ? coresEscuro : coresClaro;

  return (
    <TemaContext.Provider value={{ tema, cores, setTema, isEscuro }}>
      {children}
    </TemaContext.Provider>
  );
}

export const useTema = () => useContext(TemaContext);
