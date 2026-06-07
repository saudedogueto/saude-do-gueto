/**
 * promptEngine.ts — Montagem de Prompts Estruturados
 *
 * Constrói prompts baseados em dados reais do SQLite + regras fixas.
 * A IA generativa só atua DENTRO dos limites do prompt.
 * Sem pergunta aberta. Sem alucinação livre.
 */

import {
  PromptParams,
  ContextoFamilia,
  ContextoPaciente,
  ContextoVisita,
  ContextoTerritorio,
} from './tipos';

/**
 * Constrói o prompt completo baseado no tipo de consulta.
 */
export function montarPrompt(params: PromptParams): string {
  switch (params.tipo) {
    case 'resumo_familia':
      return montarPromptResumoFamilia(params.familia);
    case 'alerta_visita':
      return montarPromptAlertaVisita(params.familia);
    case 'sugerir_perguntas':
      return montarPromptSugerirPerguntas(params.familia, params.paciente);
    case 'planejar_dia':
      return montarPromptPlanejarDia(params.alertas);
    case 'analise_territorio':
      return montarPromptAnaliseTerritorio(params.territorio);
    case 'pergunta_livre':
      return montarPromptPerguntaLivre(params.perguntaLivre, params.familia, params.alertas, params.territorio);
    default:
      return '';
  }
}

function montarPromptResumoFamilia(familia?: ContextoFamilia): string {
  if (!familia) return '';

  const pacientesStr = familia.pacientes
    .map((p) => formatarPaciente(p))
    .join('\n');

  return [
    `Você é um assistente de APS (Atenção Primária à Saúde).`,
    `Analise APENAS com base nos dados abaixo.`,
    ``,
    `## DADOS DA FAMÍLIA`,
    `Nome: ${familia.nome}`,
    `Bairro: ${familia.bairro}`,
    `Microárea: ${familia.microarea || 'Não informada'}`,
    `Dias desde última visita: ${familia.diasSemVisita}`,
    `Vulnerabilidade social: ${familia.vulnerabilidadeSocial ? 'Sim' : 'Não'}`,
    ``,
    `## MEMBROS`,
    pacientesStr,
    ``,
    `## INSTRUÇÕES`,
    `1. Gere um RESUMO OPERACIONAL desta família em 3-5 frases.`,
    `2. Destaque ALERTAS baseados nos dados (visita atrasada, crônicos sem acompanhamento, vacinas pendentes).`,
    `3. Sugira AÇÕES para o ACS nesta família.`,
    `4. NÃO diagnostique. NÃO prescreva. Use linguagem de sugestão/orientação.`,
    `5. Termine com "Baseado em: dados cadastrais + protocolos de APS".`,
  ].join('\n');
}

function montarPromptAlertaVisita(familia?: ContextoFamilia): string {
  if (!familia) return '';

  const pacientesStr = familia.pacientes
    .map((p) => formatarPaciente(p))
    .join('\n');

  return [
    `Você é um assistente de APS. Gere ALERTAS OPERACIONAIS para esta família.`,
    ``,
    `## DADOS`,
    `Família: ${familia.nome}`,
    `Bairro: ${familia.bairro}`,
    `Dias sem visita: ${familia.diasSemVisita}`,
    `Vulnerabilidade: ${familia.vulnerabilidadeSocial ? 'Sim' : 'Não'}`,
    ``,
    `## MEMBROS`,
    pacientesStr,
    ``,
    `## INSTRUÇÕES`,
    `1. Liste ALERTAS específicos (ex: "idoso hipertenso sem aferição").`,
    `2. Para cada alerta, sugira uma AÇÃO (ex: "aferir PA na próxima visita").`,
    `3. Priorize do mais urgente ao menos urgente.`,
    `4. Use linguagem clara e direta.`,
    `5. NÃO diagnostique.`,
  ].join('\n');
}

function montarPromptSugerirPerguntas(
  familia?: ContextoFamilia,
  paciente?: ContextoPaciente
): string {
  if (!familia) return '';

  const alvo = paciente || familia.pacientes[0];
  if (!alvo) return '';

  return [
    `Você é um assistente de APS. Gere PERGUNTAS SUGERIDAS para o ACS fazer durante a visita.`,
    ``,
    `## CONTEXTO`,
    `Família: ${familia.nome}`,
    `Paciente alvo: ${alvo.nome}, ${alvo.idade} anos`,
    `Condições: ${[
      alvo.hipertenso && 'hipertenso',
      alvo.diabetico && 'diabético',
      alvo.gestante && 'gestante',
      alvo.vacinasAtrasadas && 'vacinação atrasada',
    ]
      .filter(Boolean)
      .join(', ') || 'nenhuma condição especial'}`,
    `Dias desde última visita: ${familia.diasSemVisita}`,
    ``,
    `## INSTRUÇÕES`,
    `1. Gere 3-5 perguntas que o ACS pode fazer.`,
    `2. Baseie as perguntas no perfil de saúde do paciente.`,
    `3. Inclua perguntas sobre: adesão a medicamentos, sintomas, vacinação, acompanhamento.`,
    `4. Use linguagem simples, como um ACS falaria com a família.`,
    `5. Exemplo: "Dona Maria, a senhora está tomando o remédio de pressão todo dia?"`,
  ].join('\n');
}

function montarPromptPlanejarDia(alertas?: string[]): string {
  if (!alertas || alertas.length === 0) {
    return 'Não há alertas pendentes no momento. Nenhuma prioridade para hoje.';
  }

  return [
    `Você é um assistente de APS. Ajude o ACS a planejar as visitas de HOJE.`,
    ``,
    `## ALERTAS DO TERRITÓRIO`,
    alertas.slice(0, 10).map((a, i) => `${i + 1}. ${a}`).join('\n'),
    ``,
    `## INSTRUÇÕES`,
    `1. Sugira uma ORDEM de visitas, da mais urgente para a menos urgente.`,
    `2. Para cada família, diga o principal motivo da prioridade.`,
    `3. Máximo de 5 famílias sugeridas.`,
    `4. Se não houver alertas urgentes, sugira visitas de rotina.`,
  ].join('\n');
}

function montarPromptAnaliseTerritorio(territorio?: ContextoTerritorio): string {
  if (!territorio || territorio.microareas.length === 0) {
    return 'Não há dados territoriais suficientes para análise.';
  }

  const areasStr = territorio.microareas
    .map(
      (m) =>
        `- ${m.nome}: ${m.totalFamilias} famílias, ${m.familiasSemVisita60} sem visita há 60+ dias, ${m.familiasSemVisita90} sem visita há 90+ dias`
    )
    .join('\n');

  return [
    `Você é um assistente de APS. Analise o TERRITÓRIO abaixo.`,
    ``,
    `## MICROÁREAS`,
    areasStr,
    ``,
    `## INSTRUÇÕES`,
    `1. Identifique as microáreas mais críticas.`,
    `2. Sugira ações para cada área crítica.`,
    `3. Destaque tendências (ex: aumento de abandono).`,
    `4. Máximo de 5 parágrafos curtos.`,
  ].join('\n');
}

function montarPromptPerguntaLivre(
  pergunta?: string,
  familia?: ContextoFamilia,
  alertas?: string[],
  territorio?: ContextoTerritorio
): string {
  if (!pergunta) return '';

  const partes: string[] = [
    `Você é um assistente de APS (Atenção Primária à Saúde).`,
    `Responda APENAS com base nos dados disponíveis e em protocolos oficiais do SUS.`,
    '',
  ];

  // Contexto do território (dados reais do app)
  if (territorio && territorio.microareas.length > 0) {
    const area = territorio.microareas[0];
    partes.push(`## PANORAMA DO TERRITÓRIO`);
    partes.push(`Famílias cadastradas: ${area.totalFamilias}`);
    if (alertas && alertas.length > 0) {
      partes.push(`Condições especiais no território:`);
      alertas.forEach(a => partes.push(`- ${a}`));
    }
    partes.push('');
  }

  if (familia) {
    partes.push(`## CONTEXTO DA FAMÍLIA ATUAL`);
    partes.push(`Nome: ${familia.nome}`);
    partes.push(`Membros: ${familia.pacientes.length}`);
    partes.push(`Dias sem visita: ${familia.diasSemVisita}`);
    const condicoes = familia.pacientes
      .filter((p) => p.hipertenso || p.diabetico || p.gestante)
      .map((p) => p.nome)
      .join(', ') || 'N/A';
    partes.push(`Condições: ${condicoes}`);
    partes.push('');
  }

  partes.push(`## PERGUNTA DO ACS`);
  partes.push(pergunta);
  partes.push('');
  partes.push(`## INSTRUÇÕES`);
  partes.push(`1. Responda de forma clara, direta e acionável.`);
  partes.push(`2. Se a pergunta exigir diagnóstico, diga "Isso requer avaliação médica. Recomendo encaminhamento à UBS."`);
  partes.push(`3. Se não souber a resposta, diga "Não tenho dados suficientes para responder. Consulte a UBS."`);
  partes.push(`4. Use os dados do território acima para contextualizar sua resposta.`);
  partes.push(`5. NUNCA prescreva medicamentos. NUNCA diagnostique.`);

  return partes.join('\n');
}

// ========== Utilitários ==========

function formatarPaciente(p: ContextoPaciente): string {
  const condicoes: string[] = [];
  if (p.hipertenso) condicoes.push('hipertenso');
  if (p.diabetico) condicoes.push('diabético');
  if (p.gestante) condicoes.push('gestante');
  if (p.vacinasAtrasadas) condicoes.push('vacinação atrasada');

  const extras: string[] = [];
  if (p.ultimaAfericaoPA !== undefined)
    extras.push(`PA aferida há ${p.ultimaAfericaoPA} dias`);
  if (p.ultimaAfericaoGlicemia !== undefined)
    extras.push(`glicemia aferida há ${p.ultimaAfericaoGlicemia} dias`);

  return (
    `- ${p.nome}, ${p.idade} anos${p.sexo ? `, ${p.sexo}` : ''}` +
    (condicoes.length ? ` | Condições: ${condicoes.join(', ')}` : '') +
    (extras.length ? ` | ${extras.join('; ')}` : '') +
    (p.observacoes ? ` | Obs: ${p.observacoes}` : '')
  );
}
