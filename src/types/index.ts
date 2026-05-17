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
  observacoes?: string;
  dataCadastro: string;
}

export interface Visita {
  id: string;
  pacienteId: string;
  data: string;
  tipo?: string;
  observacoes?: string;
  realizada: boolean;
}

export interface Lembrete {
  id: string;
  titulo: string;
  descricao?: string;
  data: string;
  tipo?: string;
  pacienteId?: string;
  concluido: boolean;
}
