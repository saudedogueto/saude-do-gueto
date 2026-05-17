import { create } from 'zustand';
import * as db from '../services/database';

export interface Familia {
  id: string;
  nomeResponsavel: string;
  endereco: string;
  bairro?: string;
  microarea: string;
  telefone: string;
  membros: string[];
  dataCriacao: string;
}

interface FamiliaStore {
  familias: Familia[];
  carregando: boolean;
  erro: string | null;

  // Ações
  carregar: () => Promise<void>;
  criar: (dados: Omit<Familia, 'id' | 'dataCriacao' | 'membros'>) => Promise<string>;
  atualizar: (id: string, dados: Partial<Omit<Familia, 'id' | 'dataCriacao' | 'membros'>>) => Promise<void>;
  excluir: (id: string) => Promise<void>;
  adicionarMembro: (familiaId: string, pacienteId: string) => Promise<void>;
  removerMembro: (familiaId: string, pacienteId: string) => Promise<void>;
  buscarPorPaciente: (pacienteId: string) => Familia | undefined;
  buscarPorMicroarea: (microarea: string) => Familia[];
  limparErro: () => void;
}

export const useFamiliaStore = create<FamiliaStore>((set, get) => ({
  familias: [],
  carregando: false,
  erro: null,

  carregar: async () => {
    set({ carregando: true, erro: null });
    try {
      const familias = await db.listarFamilias();
      set({ familias, carregando: false });
    } catch (e: any) {
      set({ erro: `Erro ao carregar famílias: ${e.message}`, carregando: false });
    }
  },

  criar: async (dados) => {
    set({ erro: null });
    try {
      const id = await db.criarFamilia(dados);
      await get().carregar(); // Recarrega a lista
      return id;
    } catch (e: any) {
      set({ erro: `Erro ao criar família: ${e.message}` });
      throw e;
    }
  },

  atualizar: async (id, dados) => {
    set({ erro: null });
    try {
      await db.atualizarFamilia(id, dados);
      await get().carregar();
    } catch (e: any) {
      set({ erro: `Erro ao atualizar família: ${e.message}` });
      throw e;
    }
  },

  excluir: async (id) => {
    set({ erro: null });
    try {
      await db.excluirFamilia(id);
      await get().carregar();
    } catch (e: any) {
      set({ erro: `Erro ao excluir família: ${e.message}` });
    }
  },

  adicionarMembro: async (familiaId, pacienteId) => {
    try {
      await db.adicionarMembroFamilia(familiaId, pacienteId);
      await get().carregar();
    } catch (e: any) {
      set({ erro: `Erro ao adicionar membro: ${e.message}` });
    }
  },

  removerMembro: async (familiaId, pacienteId) => {
    try {
      await db.removerMembroFamilia(familiaId, pacienteId);
      await get().carregar();
    } catch (e: any) {
      set({ erro: `Erro ao remover membro: ${e.message}` });
    }
  },

  buscarPorPaciente: (pacienteId) => {
    return get().familias.find(f => f.membros.includes(pacienteId));
  },

  buscarPorMicroarea: (microarea) => {
    return get().familias.filter(f => f.microarea === microarea);
  },

  limparErro: () => set({ erro: null }),
}));
