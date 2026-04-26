import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Visita = {
  id: string;
  pacienteId: string;
  pacienteNome: string;
  data: string;
  hora: string;
  motivo: 'rotina' | 'retorno' | 'queixa' | 'encaminhamento' | 'outro';
  pressaoSistolica?: string;
  pressaoDiastolica?: string;
  glicemia?: string;
  vacinaEmDia?: boolean;
  observacoes: string;
  proximaVisita: string;
};

type VisitaContextType = {
  visitas: Visita[];
  carregarVisitas: () => Promise<void>;
  salvarVisita: (visita: Omit<Visita, 'id'>) => Promise<void>;
  excluirVisita: (id: string) => Promise<void>;
  buscarVisitasPorPaciente: (pacienteId: string) => Visita[];
  ultimaVisita: (pacienteId: string) => Visita | undefined;
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

  const excluirVisita = async (id: string) => {
    try {
      const dados = await AsyncStorage.getItem('@visitas');
      let lista: Visita[] = dados ? JSON.parse(dados) : [];
      lista = lista.filter(v => v.id !== id);
      await AsyncStorage.setItem('@visitas', JSON.stringify(lista));
      setVisitas(lista);
    } catch (error) {
      console.error('Erro ao excluir visita:', error);
    }
  };

  const buscarVisitasPorPaciente = (pacienteId: string) => {
    return visitas
      .filter(v => v.pacienteId === pacienteId)
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  };

  const ultimaVisita = (pacienteId: string) => {
    const visitasPaciente = buscarVisitasPorPaciente(pacienteId);
    return visitasPaciente[0];
  };

  return (
    <VisitaContext.Provider value={{
      visitas, carregarVisitas, salvarVisita,
      excluirVisita, buscarVisitasPorPaciente, ultimaVisita
    }}>
      {children}
    </VisitaContext.Provider>
  );
}

export const useVisitas = () => useContext(VisitaContext);
