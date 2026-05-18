/**
 * executor.ts — Bridge entre Prompt Engine e o Modelo Local
 *
 * Abstrai a chamada ao react-native-executorch.
 * Quando o modelo não estiver disponível, usa fallback baseado em regras.
 */

import { PromptParams, RespostaAgente, TipoPrompt } from './tipos';
import { montarPrompt } from './promptEngine';
import { avaliarFamilia, ContextoParaRegra, FamiliaParaRegra, Alerta } from './regras';

// ========== Interface mock enquanto o modelo real não está integrado ==========

/**
 * Executa o prompt contra o modelo local.
 * ATUALMENTE: retorna fallbase baseado em regras.
 * FUTURO: chama react-native-executorch com o modelo carregado.
 */
export async function executarPrompt(params: PromptParams): Promise<RespostaAgente> {
  const prompt = montarPrompt(params);

  // TODO: Substituir por chamada real ao modelo quando react-native-executorch estiver integrado
  const resposta = await executarFallback(params, prompt);

  return {
    tipo: params.tipo,
    texto: resposta,
    alertas: params.alertas,
    timestamp: new Date().toISOString(),
    modelo: 'regras', // muda pra 'ia_local' quando o modelo real rodar
  };
}

/**
 * Fallback baseado em regras fixas.
 * Garante que o Agente funciona mesmo sem o modelo de IA baixado.
 */
async function executarFallback(
  params: PromptParams,
  _prompt: string
): Promise<string> {
  const familia = params.familia;

  if (!familia) {
    return 'Nenhum dado disponível para análise. Cadastre uma família primeiro.';
  }

  // Converte ContextoFamilia → FamiliaParaRegra
  const familiaRegra: FamiliaParaRegra = {
    nome: familia.nome,
    bairro: familia.bairro,
    microarea: familia.microarea,
    diasSemVisita: familia.diasSemVisita,
    vulnerabilidadeSocial: familia.vulnerabilidadeSocial,
    pacientes: familia.pacientes.map((p) => ({
      nome: p.nome,
      idade: p.idade,
      sexo: p.sexo,
      hipertenso: p.hipertenso,
      diabetico: p.diabetico,
      gestante: p.gestante,
      vacinasAtrasadas: p.vacinasAtrasadas,
      ultimaAfericaoPA: p.ultimaAfericaoPA,
      ultimaAfericaoGlicemia: p.ultimaAfericaoGlicemia,
    })),
  };

  const alertas = avaliarFamilia(familiaRegra);

  if (alertas.length === 0) {
    return (
      `✅ Família ${familia.nome} — sem alertas críticos. ` +
      `Última visita: ${familia.diasSemVisita} dias atrás. ` +
      `Nenhum membro com condição prioritária pendente.`
    );
  }

  return formatarRespostaFallback(familia.nome, alertas);
}

function formatarRespostaFallback(nomeFamilia: string, alertas: Alerta[]): string {
  const linhas: string[] = [
    `📋 **Família ${nomeFamilia}**`,
    '',
    '**Alertas detectados:**',
    '',
  ];

  for (const alerta of alertas) {
    const icone =
      alerta.nivel === 'vermelho'
        ? '🔴'
        : alerta.nivel === 'laranja'
          ? '🟠'
          : alerta.nivel === 'amarelo'
            ? '🟡'
            : '🟢';
    linhas.push(`${icone} ${alerta.mensagem}`);
    linhas.push(`   *Baseado em: ${alerta.baseadoEm}*`);
    linhas.push('');
  }

  linhas.push('---');
  linhas.push('🧠 Resposta gerada por regras fixas de APS.');
  linhas.push('⚡ Quando o modelo de IA estiver disponível, as respostas serão mais completas.');

  return linhas.join('\n');
}

/**
 * Verifica se o modelo local está disponível.
 */
export async function modeloDisponivel(): Promise<boolean> {
  // TODO: verificar status real do react-native-executorch
  return false;
}
