export interface Familia {
  id: string;
  nomeResponsavel: string;
  endereco: string;
  bairro?: string;
  microarea: string;
  telefone: string;
  membros: string[];
  dataCriacao: string;
  latitude?: number;
  longitude?: number;
  numero?: string;
  complemento?: string;
}

export interface Paciente {
  id: string;
  nome: string;
  dataNascimento?: string;
  cpf?: string;
  cartaoSUS?: string;
  sus?: string;
  sexo?: string;
  nomeMae?: string;
  telefone?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  microarea?: string;
  hipertensao?: boolean;
  diabetes?: boolean;
  gestante?: boolean;
  menorDoisAnos?: boolean;
  responsavel?: string;
  comorbidades?: string;
  observacoes?: string;
  dataCadastro: string;
}

export interface Visita {
  id: string;
  pacienteId: string;
  pacienteNome?: string;
  pacienteCPF?: string;
  pacienteSUS?: string;
  data: string;
  hora?: string;
  tipo?: string;
  motivo?: string;
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
