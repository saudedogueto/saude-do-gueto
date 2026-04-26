import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Paciente = {
  id: string;
  nome: string;
  dataNascimento: string;
  cartaoSUS: string;
  telefone: string;
  hipertensao: boolean;
  diabetes: boolean;
  gestante: boolean;
  observacoes: string;
  endereco?: string;
  microarea?: string;
  dataCadastro: string;
  ultimaVisita?: string;
};

type PacienteContextType = {
  pacientes: Paciente[];
  carregarPacientes: () => Promise<void>;
  salvarPaciente: (paciente: Omit<Paciente, 'id' | 'dataCadastro'> & { id?: string }) => Promise<void>;
  excluirPaciente: (id: string) => Promise<void>;
  buscarPaciente: (id: string) => Paciente | undefined;
  pesquisarPacientes: (termo: string) => Paciente[];
};

const PacienteContext = createContext<PacienteContextType>({} as PacienteContextType);

export function PacienteProvider({ children }: { children: React.ReactNode }) {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);

  const carregarPacientes = useCallback(async () => {
    try {
      const dados = await AsyncStorage.getItem('@pacientes');
      if (dados) {
        setPacientes(JSON.parse(dados));
      }
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    }
  }, []);

  const salvarPaciente = async (paciente: Omit<Paciente, 'id' | 'dataCadastro'> & { id?: string }) => {
    try {
      const dados = await AsyncStorage.getItem('@pacientes');
      let lista: Paciente[] = dados ? JSON.parse(dados) : [];

      if (paciente.id) {
        // Editar existente
        const index = lista.findIndex(p => p.id === paciente.id);
        if (index >= 0) {
          lista[index] = { ...lista[index], ...paciente };
        }
      } else {
        // Novo
        const novo: Paciente = {
          ...paciente,
          id: Date.now().toString(),
          dataCadastro: new Date().toISOString().split('T')[0],
        } as Paciente;
        lista.push(novo);
      }

      await AsyncStorage.setItem('@pacientes', JSON.stringify(lista));
      setPacientes(lista);
    } catch (error) {
      console.error('Erro ao salvar paciente:', error);
      throw error;
    }
  };

  const excluirPaciente = async (id: string) => {
    try {
      const dados = await AsyncStorage.getItem('@pacientes');
      let lista: Paciente[] = dados ? JSON.parse(dados) : [];
      lista = lista.filter(p => p.id !== id);
      await AsyncStorage.setItem('@pacientes', JSON.stringify(lista));
      setPacientes(lista);
    } catch (error) {
      console.error('Erro ao excluir paciente:', error);
    }
  };

  const buscarPaciente = (id: string) => {
    return pacientes.find(p => p.id === id);
  };

  const pesquisarPacientes = (termo: string) => {
    if (!termo.trim()) return pacientes;
    const t = termo.toLowerCase().trim();
    return pacientes.filter(p =>
      p.nome.toLowerCase().includes(t) ||
      p.cartaoSUS.includes(t) ||
      p.telefone.includes(t)
    );
  };

  return (
    <PacienteContext.Provider value={{
      pacientes, carregarPacientes, salvarPaciente,
      excluirPaciente, buscarPaciente, pesquisarPacientes
    }}>
      {children}
    </PacienteContext.Provider>
  );
}

export const usePacientes = () => useContext(PacienteContext);
