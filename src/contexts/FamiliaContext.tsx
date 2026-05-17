import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Familia = {
  id: string;
  nomeResponsavel: string;
  endereco: string;
  bairro?: string;
  microarea: string;
  telefone: string;
  membros: string[]; // ids dos pacientes
  dataCriacao: string;
};

type FamiliaContextType = {
  familias: Familia[];
  carregarFamilias: () => Promise<void>;
  criarFamilia: (familia: Omit<Familia, 'id' | 'dataCriacao' | 'membros'>) => Promise<string>;
  atualizarFamilia: (id: string, dados: Partial<Omit<Familia, 'id' | 'dataCriacao' | 'membros'>>) => Promise<void>;
  adicionarMembro: (familiaId: string, pacienteId: string) => Promise<void>;
  removerMembro: (familiaId: string, pacienteId: string) => Promise<void>;
  excluirFamilia: (id: string) => Promise<void>;
  buscarFamiliaPorPaciente: (pacienteId: string) => Familia | undefined;
  buscarFamiliasPorMicroarea: (microarea: string) => Familia[];
};

const FamiliaContext = createContext<FamiliaContextType>({} as FamiliaContextType);

export function FamiliaProvider({ children }: { children: React.ReactNode }) {
  const [familias, setFamilias] = useState<Familia[]>([]);

  const carregarFamilias = useCallback(async () => {
    try {
      const dados = await AsyncStorage.getItem('@familias');
      if (dados) setFamilias(JSON.parse(dados));
    } catch (error) {
      console.error('Erro ao carregar famílias:', error);
    }
  }, []);

  const criarFamilia = async (familia: Omit<Familia, 'id' | 'dataCriacao' | 'membros'>): Promise<string> => {
    try {
      const dados = await AsyncStorage.getItem('@familias');
      let lista: Familia[] = dados ? JSON.parse(dados) : [];
      const nova: Familia = {
        ...familia,
        id: Date.now().toString(),
        membros: [],
        dataCriacao: new Date().toISOString().split('T')[0],
      };
      lista.push(nova);
      await AsyncStorage.setItem('@familias', JSON.stringify(lista));
      setFamilias(lista);
      return nova.id;
    } catch (error) {
      console.error('Erro ao criar família:', error);
      throw error;
    }
  };

  const adicionarMembro = async (familiaId: string, pacienteId: string) => {
    try {
      const dados = await AsyncStorage.getItem('@familias');
      let lista: Familia[] = dados ? JSON.parse(dados) : [];
      lista = lista.map(f => {
        if (f.id === familiaId && !f.membros.includes(pacienteId)) {
          return { ...f, membros: [...f.membros, pacienteId] };
        }
        return f;
      });
      await AsyncStorage.setItem('@familias', JSON.stringify(lista));
      setFamilias(lista);
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
    }
  };

  const removerMembro = async (familiaId: string, pacienteId: string) => {
    try {
      const dados = await AsyncStorage.getItem('@familias');
      let lista: Familia[] = dados ? JSON.parse(dados) : [];
      lista = lista.map(f => {
        if (f.id === familiaId) {
          return { ...f, membros: f.membros.filter(id => id !== pacienteId) };
        }
        return f;
      });
      await AsyncStorage.setItem('@familias', JSON.stringify(lista));
      setFamilias(lista);
    } catch (error) {
      console.error('Erro ao remover membro:', error);
    }
  };

  const atualizarFamilia = async (id: string, dados: Partial<Omit<Familia, 'id' | 'dataCriacao' | 'membros'>>) => {
    try {
      const dadosStorage = await AsyncStorage.getItem('@familias');
      let lista: Familia[] = dadosStorage ? JSON.parse(dadosStorage) : [];
      lista = lista.map(f => f.id === id ? { ...f, ...dados } : f);
      await AsyncStorage.setItem('@familias', JSON.stringify(lista));
      setFamilias(lista);
    } catch (error) {
      console.error('Erro ao atualizar família:', error);
      throw error;
    }
  };

const excluirFamilia = async (id: string) => {
    try {
      const dados = await AsyncStorage.getItem('@familias');
      let lista: Familia[] = dados ? JSON.parse(dados) : [];
      lista = lista.filter(f => f.id !== id);
      await AsyncStorage.setItem('@familias', JSON.stringify(lista));
      setFamilias(lista);
    } catch (error) {
      console.error('Erro ao excluir família:', error);
    }
  };

  const buscarFamiliaPorPaciente = (pacienteId: string) => {
    return familias.find(f => f.membros.includes(pacienteId));
  };

  const buscarFamiliasPorMicroarea = (microarea: string) => {
    return familias.filter(f => f.microarea === microarea);
  };

  return (
    <FamiliaContext.Provider value={{
      familias, carregarFamilias, criarFamilia, atualizarFamilia,
      adicionarMembro, removerMembro, excluirFamilia,
      buscarFamiliaPorPaciente, buscarFamiliasPorMicroarea
    }}>
      {children}
    </FamiliaContext.Provider>
  );
}

export const useFamilias = () => useContext(FamiliaContext);
