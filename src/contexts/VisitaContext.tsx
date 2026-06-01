import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Visita = {
  id: string;
  pacienteId: string;
  data: string;
  pressaoSistolica?: string;
  pressaoDiastolica?: string;
  glicemia?: string;
  medicamentos?: string;
  observacoes?: string;
};

type VisitaContextType = {
  visitas: Visita[];
  carregarVisitas: () => Promise<void>;
  salvarVisita: (visita: Omit<Visita, 'id'>) => Promise<void>;
  visitasPorPaciente: (pacienteId: string) => Visita[];
};

const VisitaContext = createContext<VisitaContextType>({} as VisitaContextType);

export function VisitaProvider({ children }: { children: React.ReactNode }) {
  const [visitas, setVisitas] = useState<Visita[]>([]);

  const carregarVisitas = useCallback(async () => {
    try {
      const dados = await AsyncStorage.getItem('@visitas');
      if (dados) setVisitas(JSON.parse(dados));
    } catch (error) {
      console.error('Erro ao carregar visitas:', error);
    }
  }, []);

  const salvarVisita = async (visita: Omit<Visita, 'id'>) => {
    try {
      const dados = await AsyncStorage.getItem('@visitas');
      let lista: Visita[] = dados ? JSON.parse(dados) : [];
      const nova: Visita = { ...visita, id: Date.now().toString() };
      lista.push(nova);
      await AsyncStorage.setItem('@visitas', JSON.stringify(lista));
      setVisitas(lista);
    } catch (error) {
      console.error('Erro ao salvar visita:', error);
      throw error;
    }
  };

  const visitasPorPaciente = (pacienteId: string) => {
    return visitas
      .filter(v => v.pacienteId === pacienteId)
      .sort((a, b) => b.data.localeCompare(a.data));
  };

  return (
    <VisitaContext.Provider value={{
      visitas, carregarVisitas, salvarVisita, visitasPorPaciente
    }}>
      {children}
    </VisitaContext.Provider>
  );
}

export const useVisitas = () => useContext(VisitaContext);
