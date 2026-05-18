/**
 * agenteStore.ts — Estado Global do Agente de Saúde (Zustand)
 *
 * Gerencia:
 * - Status do modelo (baixado/não/baixando)
 * - Mensagens do chat
 * - Alertas proativos do território
 * - Contexto atual selecionado
 */

import { create } from 'zustand';
import {
  MensagemChat,
  AlertaChat,
  ModeloState,
  ContextoFamilia,
} from '../ai/tipos';
import { getModeloState } from '../services/modelDownload';

// ========== Geração de IDs ==========

let _idCounter = 0;
function gerarId(): string {
  _idCounter++;
  return `agente_${Date.now()}_${_idCounter}`;
}

// ========== Store ==========

interface AgenteStore {
  // Modelo
  modelo: ModeloState;
  setModelo: (state: Partial<ModeloState>) => void;

  // Chat
  mensagens: MensagemChat[];
  adicionarMensagem: (msg: Omit<MensagemChat, 'id' | 'timestamp'>) => void;
  limparChat: () => void;

  // Alertas
  alertasProativos: AlertaChat[];
  setAlertasProativos: (alertas: AlertaChat[]) => void;
  totalAlertasCriticos: () => number;

  // Contexto
  contextoAtual: ContextoFamilia | null;
  setContextoAtual: (familia: ContextoFamilia | null) => void;

  // UI
  chatCarregando: boolean;
  setChatCarregando: (loading: boolean) => void;
}

export const useAgenteStore = create<AgenteStore>((set, get) => ({
  // Modelo
  modelo: getModeloState(),
  setModelo: (patch) =>
    set((state) => ({ modelo: { ...state.modelo, ...patch } })),

  // Chat
  mensagens: [],
  adicionarMensagem: (msg) =>
    set((state) => ({
      mensagens: [
        ...state.mensagens,
        {
          ...msg,
          id: gerarId(),
          timestamp: new Date().toISOString(),
        },
      ],
    })),
  limparChat: () => set({ mensagens: [] }),

  // Alertas
  alertasProativos: [],
  setAlertasProativos: (alertas) => set({ alertasProativos: alertas }),
  totalAlertasCriticos: () => {
    const state = get();
    return state.alertasProativos.filter(
      (a) => a.nivel === 'vermelho' || a.nivel === 'laranja'
    ).length;
  },

  // Contexto
  contextoAtual: null,
  setContextoAtual: (familia) => set({ contextoAtual: familia }),

  // UI
  chatCarregando: false,
  setChatCarregando: (loading) => set({ chatCarregando: loading }),
}));
