/**
 * regras.ts — Regras Fixas de APS
 *
 * Rodam ANTES da IA generativa.
 * Produzem alertas estruturados que a IA só traduz em linguagem natural.
 * Sem alucinação: se a regra não bater, não tem alerta.
 *
 * Base: PNAB, e-SUS AB, protocolos do Ministério da Saúde
 */

export type NivelAlerta = 'verde' | 'amarelo' | 'laranja' | 'vermelho';

export interface Alerta {
  nivel: NivelAlerta;
  categoria: string;
  mensagem: string;
  diasDesdeUltimoEvento?: number;
  baseadoEm: string;
}

export interface PacienteParaRegra {
  nome: string;
  idade: number;
  sexo?: string;
  hipertenso: boolean;
  diabetico: boolean;
  gestante: boolean;
  vacinasAtrasadas: boolean;
  ultimaAfericaoPA?: number; // dias desde última aferição de PA
  ultimaAfericaoGlicemia?: number; // dias desde última aferição de glicemia
}

export interface FamiliaParaRegra {
  nome: string;
  bairro: string;
  microarea?: string;
  diasSemVisita: number;
  vulnerabilidadeSocial: boolean;
  pacientes: PacienteParaRegra[];
}

export interface ContextoParaRegra {
  familias: FamiliaParaRegra[];
}

/**
 * Avalia todas as regras fixas contra uma família e retorna alertas.
 */
export function avaliarFamilia(familia: FamiliaParaRegra): Alerta[] {
  const alertas: Alerta[] = [];

  // Regra 1: Abandono de família (>90 dias sem visita)
  if (familia.diasSemVisita > 90) {
    alertas.push({
      nivel: 'vermelho',
      categoria: 'abandono',
      mensagem: `Família ${familia.nome} sem visita há ${familia.diasSemVisita} dias.`,
      diasDesdeUltimoEvento: familia.diasSemVisita,
      baseadoEm: 'PNAB — periodicidade mínima de visita domiciliar',
    });
  } else if (familia.diasSemVisita > 60) {
    alertas.push({
      nivel: 'laranja',
      categoria: 'atencao_visita',
      mensagem: `Família ${familia.nome} sem visita há ${familia.diasSemVisita} dias. Atenção.`,
      diasDesdeUltimoEvento: familia.diasSemVisita,
      baseadoEm: 'PNAB — recomendação de visita periódica',
    });
  } else if (familia.diasSemVisita > 30) {
    alertas.push({
      nivel: 'amarelo',
      categoria: 'monitoramento',
      mensagem: `Família ${familia.nome} sem visita há ${familia.diasSemVisita} dias.`,
      diasDesdeUltimoEvento: familia.diasSemVisita,
      baseadoEm: 'Monitoramento de rotina',
    });
  }

  for (const paciente of familia.pacientes) {
    // Regra 2: Hipertenso sem aferição recente
    if (paciente.hipertenso && paciente.ultimaAfericaoPA !== undefined) {
      if (paciente.ultimaAfericaoPA > 60) {
        alertas.push({
          nivel: 'vermelho',
          categoria: 'hipertensao',
          mensagem: `${paciente.nome} (hipertenso) sem aferição de PA há ${paciente.ultimaAfericaoPA} dias.`,
          diasDesdeUltimoEvento: paciente.ultimaAfericaoPA,
          baseadoEm: 'Protocolo de Hipertensão — MS: aferição a cada 60 dias',
        });
      } else if (paciente.ultimaAfericaoPA > 30) {
        alertas.push({
          nivel: 'amarelo',
          categoria: 'hipertensao',
          mensagem: `${paciente.nome} (hipertenso) — última aferição de PA há ${paciente.ultimaAfericaoPA} dias.`,
          diasDesdeUltimoEvento: paciente.ultimaAfericaoPA,
          baseadoEm: 'Protocolo de Hipertensão — MS',
        });
      }
    }

    // Regra 3: Diabético sem aferição recente
    if (paciente.diabetico && paciente.ultimaAfericaoGlicemia !== undefined) {
      if (paciente.ultimaAfericaoGlicemia > 90) {
        alertas.push({
          nivel: 'vermelho',
          categoria: 'diabetes',
          mensagem: `${paciente.nome} (diabético) sem aferição de glicemia há ${paciente.ultimaAfericaoGlicemia} dias.`,
          diasDesdeUltimoEvento: paciente.ultimaAfericaoGlicemia,
          baseadoEm: 'Protocolo de Diabetes — MS: aferição a cada 90 dias',
        });
      } else if (paciente.ultimaAfericaoGlicemia > 60) {
        alertas.push({
          nivel: 'amarelo',
          categoria: 'diabetes',
          mensagem: `${paciente.nome} (diabético) — última aferição de glicemia há ${paciente.ultimaAfericaoGlicemia} dias.`,
          diasDesdeUltimoEvento: paciente.ultimaAfericaoGlicemia,
          baseadoEm: 'Protocolo de Diabetes — MS',
        });
      }
    }

    // Regra 4: Vacinação atrasada
    if (paciente.vacinasAtrasadas) {
      alertas.push({
        nivel: 'laranja',
        categoria: 'vacinacao',
        mensagem: `${paciente.nome} com vacinação atrasada. Verificar caderneta.`,
        baseadoEm: 'PNI — Calendário Nacional de Vacinação',
      });
    }

    // Regra 5: Gestante sem pré-natal
    if (paciente.gestante) {
      alertas.push({
        nivel: 'laranja',
        categoria: 'gestante',
        mensagem: `${paciente.nome} (gestante) — verificar pré-natal.`,
        baseadoEm: 'Rede Cegonha — MS',
      });
    }

    // Regra 6: Idoso isolado (>80 anos, sem visita >60 dias)
    if (paciente.idade >= 80 && familia.diasSemVisita > 60) {
      alertas.push({
        nivel: 'vermelho',
        categoria: 'idoso_isolado',
        mensagem: `${paciente.nome} (${paciente.idade} anos, idoso) sem visita há ${familia.diasSemVisita} dias. Risco de isolamento.`,
        diasDesdeUltimoEvento: familia.diasSemVisita,
        baseadoEm: 'Política Nacional de Saúde da Pessoa Idosa',
      });
    }
  }

  // Regra 7: Vulnerabilidade social
  if (familia.vulnerabilidadeSocial && familia.diasSemVisita > 30) {
    alertas.push({
      nivel: 'laranja',
      categoria: 'vulnerabilidade_social',
      mensagem: `Família ${familia.nome} em situação de vulnerabilidade social — ${familia.diasSemVisita} dias sem visita.`,
      diasDesdeUltimoEvento: familia.diasSemVisita,
      baseadoEm: 'PNAB — equidade e priorização de risco social',
    });
  }

  return alertas;
}

/**
 * Avalia todas as famílias e retorna alertas consolidados por nível.
 */
export function avaliarTerritorio(contexto: ContextoParaRegra): {
  criticos: Alerta[];
  atencao: Alerta[];
  informativos: Alerta[];
  totalFamiliasComAlerta: number;
} {
  const todosAlertas = contexto.familias.flatMap(avaliarFamilia);
  const familiasComAlerta = new Set(
    todosAlertas.map((a) => a.categoria + a.mensagem)
  ).size;

  return {
    criticos: todosAlertas.filter((a) => a.nivel === 'vermelho'),
    atencao: todosAlertas.filter((a) => a.nivel === 'laranja' || a.nivel === 'amarelo'),
    informativos: todosAlertas.filter((a) => a.nivel === 'verde'),
    totalFamiliasComAlerta: familiasComAlerta,
  };
}

/**
 * Retorna quais famílias priorizar hoje (máximo de 5).
 */
export function priorizarVisitas(contexto: ContextoParaRegra): FamiliaParaRegra[] {
  const comAlerta = contexto.familias
    .map((f) => ({
      familia: f,
      alertas: avaliarFamilia(f),
    }))
    .filter((f) => f.alertas.length > 0);

  // Ordena: vermelho > laranja > amarelo > mais dias sem visita
  comAlerta.sort((a, b) => {
    const pesoA = a.alertas.filter((al) => al.nivel === 'vermelho').length * 100
      + a.alertas.filter((al) => al.nivel === 'laranja').length * 50
      + a.alertas.filter((al) => al.nivel === 'amarelo').length * 10;
    const pesoB = b.alertas.filter((al) => al.nivel === 'vermelho').length * 100
      + b.alertas.filter((al) => al.nivel === 'laranja').length * 50
      + b.alertas.filter((al) => al.nivel === 'amarelo').length * 10;
    return pesoB - pesoA;
  });

  return comAlerta.slice(0, 5).map((f) => f.familia);
}
