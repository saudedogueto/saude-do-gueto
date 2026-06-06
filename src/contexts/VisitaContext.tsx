import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Visita = {
  id: string;
  pacienteId: string;
  pacienteNome?: string;
  pacienteCPF?: string;
  pacienteSUS?: string;
  data: string;
  hora?: string;
  motivo?: string;
  tipo?: string;
  pressaoSistolica?: string;
  pressaoDiastolica?: string;
  glicemia?: string;
  peso?: string;
  altura?: string;
  vacinaEmDia?: boolean;
  medicamentos?: string;
  observacoes?: string;
  encaminhamento?: string;
  proximaVisita?: string;
  realizada: boolean;
};

type VisitaContextType = {
  visitas: Visita[];
  carregarVisitas: () => Promise<void>;
  salvarVisita: (visita: Omit<Visita, 'id'>) => Promise<void>;
  visitasPorPaciente: (pacienteId: string) => Visita[];
  excluirVisita: (id: string) => Promise<void>;
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

  const excluirVisita = useCallback(async (id: string) => {
    try {
      const dados = await AsyncStorage.getItem('@visitas');
      if (!dados) return;
      const lista: Visita[] = JSON.parse(dados).filter((v: Visita) => v.id !== id);
      await AsyncStorage.setItem('@visitas', JSON.stringify(lista));
      setVisitas(lista);
    } catch (error) {
      console.error('Erro ao excluir visita:', error);
      throw error;
    }
  }, []);

  return (
    <VisitaContext.Provider value={{
      visitas, carregarVisitas, salvarVisita, visitasPorPaciente, excluirVisita
    }}>
      {children}
    </VisitaContext.Provider>
  );
}

export const useVisitas = () => useContext(VisitaContext);
