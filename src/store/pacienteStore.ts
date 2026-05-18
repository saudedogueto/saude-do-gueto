import { create } from 'zustand';
import * as db from '../services/database';

export interface Paciente {
  id: string;
  nome: string;
  dataNascimento?: string;
  cpf?: string;
  sus?: string;
  microarea?: string;
  endereco?: string;
  telefone?: string;
  responsavel?: string;
  comorbidades?: string;
  foto?: string;
  observacoes?: string;
  dataCadastro: string;
}

interface PacienteStore {
  pacientes: Paciente[];
  carregando: boolean;
  erro: string | null;

  carregar: () => Promise<void>;
  criar: (dados: Omit<Paciente, 'id' | 'dataCadastro'>) => Promise<string>;
  atualizar: (id: string, dados: Partial<Omit<Paciente, 'id' | 'dataCadastro'>>) => Promise<void>;
  excluir: (id: string) => Promise<void>;
  limparErro: () => void;
}

export const usePacienteStore = create<PacienteStore>((set, get) => ({
  pacientes: [],
  carregando: false,
  erro: null,

  carregar: async () => {
    set({ carregando: true, erro: null });
    try {
      const pacientes = await db.listarPacientes();
      set({ pacientes, carregando: false });
    } catch (e: any) {
      set({ erro: `Erro ao carregar pacientes: ${e.message}`, carregando: false });
    }
  },

  criar: async (dados) => {
    set({ erro: null });
    try {
      const id = await db.criarPaciente(dados);
      await get().carregar();
      return id;
    } catch (e: any) {
      set({ erro: `Erro ao cadastrar paciente: ${e.message}` });
      throw e;
    }
  },

  atualizar: async (id, dados) => {
    set({ erro: null });
    try {
      await db.atualizarPaciente(id, dados);
      await get().carregar();
    } catch (e: any) {
      set({ erro: `Erro ao atualizar paciente: ${e.message}` });
      throw e;
    }
  },

  excluir: async (id) => {
    set({ erro: null });
    try {
      await db.excluirPaciente(id);
      await get().carregar();
    } catch (e: any) {
      set({ erro: `Erro ao excluir paciente: ${e.message}` });
    }
  },

  limparErro: () => set({ erro: null }),
}));
