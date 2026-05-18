/**
 * tipos.ts — Tipos do Agente de Saúde Offline
 */

// ========== Contexto para o Engine ==========

export interface ContextoFamilia {
  id: string;
  nome: string;
  bairro: string;
  microarea?: string;
  endereco?: string;
  diasSemVisita: number;
  vulnerabilidadeSocial: boolean;
  pacientes: ContextoPaciente[];
}

export interface ContextoPaciente {
  id: string;
  nome: string;
  idade: number;
  sexo?: string;
  hipertenso: boolean;
  diabetico: boolean;
  gestante: boolean;
  vacinasAtrasadas: boolean;
  ultimaAfericaoPA?: number;  // dias
  ultimaAfericaoGlicemia?: number;  // dias
  observacoes?: string;
}

export interface ContextoVisita {
  familiaId: string;
  familiaNome: string;
  data: string;
  motivo?: string;
  observacoes?: string;
}

export interface ContextoTerritorio {
  microareas: ContextoMicroarea[];
}

export interface ContextoMicroarea {
  nome: string;
  totalFamilias: number;
  familiasSemVisita60: number;
  familiasSemVisita90: number;
}

// ========== Tipos de Prompt ==========

export type TipoPrompt =
  | 'resumo_familia'
  | 'alerta_visita'
  | 'sugerir_perguntas'
  | 'planejar_dia'
  | 'analise_territorio'
  | 'pergunta_livre';

export interface PromptParams {
  tipo: TipoPrompt;
  familia?: ContextoFamilia;
  paciente?: ContextoPaciente;
  visita?: ContextoVisita;
  territorio?: ContextoTerritorio;
  perguntaLivre?: string;
  alertas?: string[];
}

// ========== Resposta do Agente ==========

export interface RespostaAgente {
  tipo: TipoPrompt;
  texto: string;
  alertas?: string[];
  sugestoes?: string[];
  baseadoEm?: string;
  timestamp: string;
  modelo: 'regras' | 'ia_local';
}

// ========== Estado do Modelo ==========

export type ModeloStatus =
  | 'nao_baixado'
  | 'baixando'
  | 'pronto'
  | 'erro';

export interface ModeloState {
  status: ModeloStatus;
  progresso: number; // 0-100
  tamanhoMB?: number;
  modeloId?: string;
}

// ========== Mensagens do Chat ==========

export interface MensagemChat {
  id: string;
  papel: 'usuario' | 'agente';
  texto: string;
  timestamp: string;
  alertas?: AlertaChat[];
  carregando?: boolean;
}

export interface AlertaChat {
  nivel: 'verde' | 'amarelo' | 'laranja' | 'vermelho';
  mensagem: string;
  baseadoEm?: string;
}
