/**
 * esus-export.tsx — e-SUS / SIS Online + Relatórios 📊
 *
 * Tela unificada: estatísticas, relatórios e exportação
 * para sistemas oficiais do SUS.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Share
} from 'react-native';
import { usePacientes } from '@/src/contexts/PacienteContext';
import { useFamilias } from '@/src/contexts/FamiliaContext';
import { useVisitas } from '@/src/contexts/VisitaContext';
import { useTema } from '@/src/contexts/TemaContext';
import { router } from 'expo-router';

type Periodo = 'geral' | 'mes' | 'semana';

export default function ESUSExportScreen() {
  const { pacientes, carregarPacientes } = usePacientes();
  const { familias, carregarFamilias } = useFamilias();
  const { visitas, carregarVisitas } = useVisitas();
  const { cores } = useTema();
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth());
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
  const [periodo, setPeriodo] = useState<Periodo>('mes');
  const [aba, setAba] = useState<'esus' | 'relatorios'>('esus');

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  useEffect(() => {
    carregarPacientes();
    carregarFamilias();
    carregarVisitas();
  }, []);

  // ===== Filtros =====

  const visitasDoMes = useMemo(() =>
    visitas.filter(v => {
      const data = new Date(v.data);
      return data.getMonth() === mesSelecionado && data.getFullYear() === anoSelecionado;
    }),
    [visitas, mesSelecionado, anoSelecionado]
  );

  const visitasFiltradas = useMemo(() => {
    const hoje = new Date();
    let corte: Date;
    if (periodo === 'semana') {
      corte = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (periodo === 'mes') {
      corte = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      return visitas;
    }
    return visitas.filter(v => new Date(v.data) >= corte);
  }, [visitas, periodo]);

  // ===== Estatísticas =====

  const pacientesVisitadosMes = new Set(visitasDoMes.map(v => v.pacienteId));
  const pacientesVisitadosPeriodo = new Set(visitasFiltradas.map(v => v.pacienteId));

  const hipertensos = pacientes.filter(p => p.hipertensao).length;
  const diabeticos = pacientes.filter(p => p.diabetes).length;
  const gestantes = pacientes.filter(p => p.gestante).length;

  const visitasPorMotivo = (lista: typeof visitas, motivo: string) =>
    lista.filter(v => (v as any).motivo === motivo).length;

  const periodoLabel =
    periodo === 'geral' ? 'GERAL' : periodo === 'mes' ? 'ÚLTIMOS 30 DIAS' : 'ÚLTIMOS 7 DIAS';

  // ===== Exportação =====

  const gerarDataHora = () => new Date().toLocaleString('pt-BR');

  const calcIdade = (dn: string) => {
    if (!dn) return '';
    const diff = new Date().getTime() - new Date(dn.split('/').reverse().join('-')).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)).toString();
  };

  const motivonome = (m: string) => {
    const map: Record<string, string> = {
      rotina: 'Rotina', retorno: 'Retorno', queixa: 'Queixa', encaminhamento: 'Encaminhamento',
    };
    return map[m] || m;
  };

  const limparCSV = (v: any): string => {
    if (v === null || v === undefined || v === '') return '';
    const s = String(v).replace(/"/g, '""');
    return `"${s}"`;
  };

  const simNao = (v: any): string => v ? 'Sim' : 'Não';

  // Helper para campos que podem não existir nos types
  const campo = (obj: any, campo: string): any => obj && (obj as any)[campo];

  // ===== Exportação SIS Online (formato e-SUS AB compatível) =====

  const exportarFichaIndividual = () => {
    // Ficha de Cadastro Individual — e-SUS AB PEC
    const cabecalho = [
      '=== FICHA DE CADASTRO INDIVIDUAL - SIS ONLINE ===',
      `Exportado em: ${gerarDataHora()}`,
      `Origem: Saúde do Gueto v3`,
      `Formato compatível com e-SUS AB / SISS Eicon`,
      '',
    ].join('\n');

    const cols = [
      'Nome', 'CPF', 'CartaoSUS', 'DataNascimento', 'Idade', 'Sexo',
      'NomeMae', 'Telefone', 'Endereco', 'Numero', 'Complemento', 'Bairro',
      'Microarea', 'Hipertensao', 'Diabetes', 'Gestante', 'Menor2Anos',
      'Observacoes', 'DataCadastro'
    ].join(';');

    const linhas = pacientes.map(p => {
      const pp = p as any;
      return [
        limparCSV(pp.nome), limparCSV(pp.cpf), limparCSV(pp.cartaoSUS),
        limparCSV(pp.dataNascimento), calcIdade(pp.dataNascimento || ''),
        limparCSV(pp.sexo), limparCSV(pp.nomeMae),
        limparCSV(pp.telefone), limparCSV(pp.endereco), limparCSV(pp.numero),
        limparCSV(pp.complemento), limparCSV(pp.bairro), limparCSV(pp.microarea),
        simNao(pp.hipertensao), simNao(pp.diabetes),
        simNao(pp.gestante), simNao(pp.menorDoisAnos),
        limparCSV(pp.observacoes), limparCSV(pp.dataCadastro),
      ].join(';');
    }).join('\n');

    const texto = cabecalho + 'Campos;' + cols + '\n' + linhas;
    Share.share({ message: texto, title: `Ficha_Individual_SIS_${new Date().toISOString().split('T')[0]}.csv` });
  };

  const exportarFichaDomiciliar = () => {
    // Ficha de Cadastro Domiciliar — e-SUS AB PEC
    const cabecalho = [
      '=== FICHA DE CADASTRO DOMICILIAR - SIS ONLINE ===',
      `Exportado em: ${gerarDataHora()}`,
      '',
    ].join('\n');

    const cols = [
      'Responsavel', 'Endereco', 'Numero', 'Complemento', 'Bairro',
      'Microarea', 'Telefone', 'Latitude', 'Longitude',
      'QtdMembros', 'MembrosIDs', 'DataCriacao'
    ].join(';');

    const linhas = familias.map(f => {
      const membrosNomes = (f.membros || [])
        .map(id => pacientes.find(p => p.id === id))
        .filter(Boolean)
        .map(p => p!.nome)
        .join('; ');

      return [
        limparCSV(f.nomeResponsavel),
        limparCSV(f.endereco),
        limparCSV((f as any).numero),
        limparCSV((f as any).complemento),
        limparCSV(f.bairro),
        limparCSV(f.microarea),
        limparCSV(f.telefone),
        f.latitude != null ? String(f.latitude) : '',
        f.longitude != null ? String(f.longitude) : '',
        String((f.membros || []).length),
        limparCSV(membrosNomes),
        limparCSV(f.dataCriacao),
      ].join(';');
    }).join('\n');

    const texto = cabecalho + 'Campos;' + cols + '\n' + linhas;
    Share.share({ message: texto, title: `Ficha_Domiciliar_SIS_${new Date().toISOString().split('T')[0]}.csv` });
  };

  const exportarFichaVisita = () => {
    // Ficha de Visita Domiciliar — e-SUS AB PEC
    const vFiltradas = visitasFiltradas;

    const cabecalho = [
      '=== FICHA DE VISITA DOMICILIAR - SIS ONLINE ===',
      `Exportado em: ${gerarDataHora()}`,
      `Periodo: ${periodoLabel}`,
      '',
    ].join('\n');

    const cols = [
      'Data', 'Hora', 'PacienteNome', 'PacienteCPF', 'PacienteSUS',
      'Motivo', 'PA_Sistolica', 'PA_Diastolica', 'Glicemia',
      'Peso', 'Altura', 'VacinaEmDia', 'Medicamentos',
      'Observacoes', 'Encaminhamento', 'ProximaVisita', 'Realizada'
    ].join(';');

    const linhas = vFiltradas.map(v => [
      limparCSV(v.data),
      limparCSV((v as any).hora),
      limparCSV((v as any).pacienteNome),
      limparCSV((v as any).pacienteCPF),
      limparCSV((v as any).pacienteSUS),
      motivonome((v as any).motivo || ''),
      limparCSV((v as any).pressaoSistolica),
      limparCSV((v as any).pressaoDiastolica),
      limparCSV((v as any).glicemia),
      limparCSV((v as any).peso),
      limparCSV((v as any).altura),
      simNao((v as any).vacinaEmDia),
      limparCSV((v as any).medicamentos),
      limparCSV(v.observacoes),
      limparCSV((v as any).encaminhamento),
      limparCSV((v as any).proximaVisita),
      simNao((v as any).realizada),
    ].join(';')).join('\n');

    const resumo = [
      '', '--- RESUMO ---',
      `Total de visitas;${vFiltradas.length}`,
      `Pacientes visitados;${visitasFiltradas.length > 0 ? new Set(vFiltradas.map(v => (v as any).pacienteNome || v.pacienteId)).size : 0}`,
      `Rotina;${vFiltradas.filter(v => (v as any).motivo === 'rotina').length}`,
      `Retorno;${vFiltradas.filter(v => (v as any).motivo === 'retorno').length}`,
      `Queixa;${vFiltradas.filter(v => (v as any).motivo === 'queixa').length}`,
      `Encaminhamento;${vFiltradas.filter(v => (v as any).motivo === 'encaminhamento').length}`,
    ].join('\n');

    const texto = cabecalho + 'Campos;' + cols + '\n' + linhas + resumo;
    Share.share({ message: texto, title: `Ficha_Visita_SIS_${new Date().toISOString().split('T')[0]}.csv` });
  };

  const exportarTudoSIS = () => {
    // Exportação completa — todas as 3 fichas num único arquivo
    const data = new Date().toISOString().split('T')[0];

    const cabecalho = [
      '=== EXPORTACAO COMPLETA SIS ONLINE ===',
      `Exportado em: ${gerarDataHora()}`,
      `Origem: Saude do Gueto v3`,
      `Formato: CSV compativel com e-SUS AB / SISS Eicon`,
      '',
      `--- FICHA DE CADASTRO INDIVIDUAL ---`,
      'Nome;CPF;CartaoSUS;DataNascimento;Idade;Sexo;NomeMae;Telefone;Endereco;Numero;Bairro;Microarea;Hipertensao;Diabetes;Gestante;Menor2Anos;Observacoes;DataCadastro',
    ].join('\n');

    const individuais = pacientes.map(p => {
      const pp = p as any;
      return [
        limparCSV(pp.nome), limparCSV(pp.cpf), limparCSV(pp.cartaoSUS),
        limparCSV(pp.dataNascimento), calcIdade(pp.dataNascimento || ''),
        limparCSV(pp.sexo), limparCSV(pp.nomeMae),
        limparCSV(pp.telefone), limparCSV(pp.endereco), limparCSV(pp.numero),
        limparCSV(pp.bairro), limparCSV(pp.microarea),
        simNao(pp.hipertensao), simNao(pp.diabetes),
        simNao(pp.gestante), simNao(pp.menorDoisAnos),
        limparCSV(pp.observacoes), limparCSV(pp.dataCadastro),
      ].join(';');
    }).join('\n');

    const domiciliares = familias.map(f => {
      const membrosNomes = (f.membros || [])
        .map(id => pacientes.find(p => p.id === id))
        .filter(Boolean).map(p => p!.nome).join('; ');
      return [
        limparCSV(f.nomeResponsavel), limparCSV(f.endereco),
        limparCSV((f as any).numero), limparCSV((f as any).complemento),
        limparCSV(f.bairro), limparCSV(f.microarea), limparCSV(f.telefone),
        f.latitude != null ? String(f.latitude) : '',
        f.longitude != null ? String(f.longitude) : '',
        String((f.membros || []).length), limparCSV(membrosNomes),
        limparCSV(f.dataCriacao),
      ].join(';');
    }).join('\n');

    const vFiltradas = visitasFiltradas;
    const visitasCSV = vFiltradas.map(v => [
      limparCSV(v.data), limparCSV((v as any).hora),
      limparCSV((v as any).pacienteNome), limparCSV((v as any).pacienteCPF),
      limparCSV((v as any).motivo), limparCSV((v as any).pressaoSistolica),
      limparCSV((v as any).pressaoDiastolica), limparCSV((v as any).glicemia),
      limparCSV((v as any).peso), limparCSV((v as any).altura),
      simNao((v as any).vacinaEmDia), limparCSV(v.observacoes),
      limparCSV((v as any).encaminhamento), limparCSV((v as any).proximaVisita),
    ].join(';')).join('\n');

    const texto = [
      cabecalho,
      individuais,
      '',
      `--- FICHA DE CADASTRO DOMICILIAR ---`,
      'Responsavel;Endereco;Numero;Complemento;Bairro;Microarea;Telefone;Latitude;Longitude;QtdMembros;Membros;DataCriacao',
      domiciliares,
      '',
      `--- FICHA DE VISITA DOMICILIAR ---`,
      'Data;Hora;Paciente;CPF;Motivo;PA_Sist;PA_Diast;Glicemia;Peso;Altura;Vacinas;Observacoes;Encaminhamento;ProxVisita',
      visitasCSV,
    ].join('\n');

    Share.share({ message: texto, title: `SIS_Online_Completo_${data}.csv` });
  };

  const exportarRelatorioTexto = () => {
    const texto = [
      '=== RELATÓRIO DE PRODUÇÃO - SAÚDE DO GUETO ===',
      `Competência: ${String(mesSelecionado + 1).padStart(2, '0')}/${anoSelecionado}`,
      `Gerado em: ${gerarDataHora()}`,
      '',
      '--- PACIENTES ---',
      `Total cadastrados: ${pacientes.length}`,
      `Hipertensos: ${hipertensos}`,
      `Diabéticos: ${diabeticos}`,
      `Gestantes: ${gestantes}`,
      '',
      '--- VISITAS DOMICILIARES ---',
      `Total de visitas: ${visitasDoMes.length}`,
      `Pacientes visitados: ${pacientesVisitadosMes.size}`,
      '',
      '--- DETALHAMENTO DAS VISITAS ---',
      `Visitas de Rotina: ${visitasPorMotivo(visitasDoMes, 'rotina')}`,
      `Visitas de Retorno: ${visitasPorMotivo(visitasDoMes, 'retorno')}`,
      `Visitas por Queixa: ${visitasPorMotivo(visitasDoMes, 'queixa')}`,
      `Encaminhamentos: ${visitasPorMotivo(visitasDoMes, 'encaminhamento')}`,
    ].join('\n');

    Share.share({ message: texto, title: `Relatório ${String(mesSelecionado + 1).padStart(2, '0')}/${anoSelecionado}` });
  };

  const exportarCSV_esus = () => {
    const linhas: string[] = [];
    linhas.push('"Competência";"Paciente";"Tipo";"Valor"');

    visitasDoMes.forEach(v => {
      linhas.push(`"${String(mesSelecionado + 1).padStart(2, '0')}/${anoSelecionado}";"${v.pacienteNome}";"Visita_${v.motivo}";"1"`);
    });

    const csv = linhas.join('\n');
    Share.share({ message: csv, title: `esus_${String(mesSelecionado + 1).padStart(2, '0')}_${anoSelecionado}.csv` });
  };

  const exportarPacientesCSV = () => {
    const cabecalho = [
      '=== RELATÓRIO SAÚDE DO GUETO ===',
      `Gerado em: ${gerarDataHora()}`,
      `Período: ${periodoLabel}`,
      '',
      '--- RESUMO ---',
      `Total de pacientes;${pacientes.length}`,
      `Total de visitas;${visitasFiltradas.length}`,
      `Hipertensos;${hipertensos}`,
      `Diabéticos;${diabeticos}`,
      `Gestantes;${gestantes}`,
      '',
      '--- PACIENTES ---',
      'Nome;CPF;Cartão SUS;Telefone;Endereço;Número;Bairro;Microárea;Data Nasc;Idade;Hipertensão;Diabetes;Gestante;Observações;Data Cadastro'
    ].join('\n');

    const linhas = pacientes.map(p =>
      [
        `"${p.nome}"`, p.cpf || '', p.cartaoSUS || '', p.telefone || '',
        `"${p.endereco || ''}"`, p.numero || '', `"${p.bairro || ''}"`, p.microarea || '',
        p.dataNascimento || '', calcIdade(p.dataNascimento || ''),
        p.hipertensao ? 'Sim' : 'Não', p.diabetes ? 'Sim' : 'Não',
        p.gestante ? 'Sim' : 'Não', `"${p.observacoes || ''}"`, p.dataCadastro || ''
      ].join(';')
    ).join('\n');

    Share.share({ message: cabecalho + '\n' + linhas, title: 'Relatório Pacientes - Saúde do Gueto' });
  };

  const exportarVisitasCSV = () => {
    const cabecalho = [
      '=== RELATÓRIO DE VISITAS - SAÚDE DO GUETO ===',
      `Gerado em: ${gerarDataHora()}`,
      `Período: ${periodoLabel}`,
      '',
      '--- RESUMO DE VISITAS ---',
      `Total de visitas;${visitasFiltradas.length}`,
      `Pacientes visitados;${pacientesVisitadosPeriodo.size}`,
      `Visitas de Rotina;${visitasPorMotivo(visitasFiltradas, 'rotina')}`,
      `Visitas de Retorno;${visitasPorMotivo(visitasFiltradas, 'retorno')}`,
      `Visitas por Queixa;${visitasPorMotivo(visitasFiltradas, 'queixa')}`,
      `Encaminhamentos;${visitasPorMotivo(visitasFiltradas, 'encaminhamento')}`,
      '',
      '--- DETALHAMENTO ---',
      'Data;Hora;Paciente;Motivo;PA Sistólica;PA Diastólica;Glicemia;Vacinas;Peso;Altura;Observações;Encaminhado para;Próxima Visita'
    ].join('\n');

    const linhas = visitasFiltradas.map(v =>
      [
        v.data || '', v.hora || '', `"${v.pacienteNome || ''}"`, motivonome(v.motivo || ''),
        v.pressaoSistolica || '', v.pressaoDiastolica || '', v.glicemia || '',
        v.vacinaEmDia === undefined ? '' : v.vacinaEmDia ? 'Sim' : 'Não',
        v.peso || '', v.altura || '', `"${v.observacoes || ''}"`,
        `"${v.encaminhamento || ''}"`, v.proximaVisita || ''
      ].join(';')
    ).join('\n');

    Share.share({ message: cabecalho + '\n' + linhas, title: 'Relatório de Visitas - Saúde do Gueto' });
  };

  const exportarRelatorioCompleto = () => {
    const cabecalho = [
      '=== RELATÓRIO COMPLETO - SAÚDE DO GUETO ===',
      `Gerado em: ${gerarDataHora()}`,
      `Período: ${periodoLabel}`,
      '',
      '--- RESUMO GERAL ---',
      `Pacientes cadastrados;${pacientes.length}`,
      `Hipertensos;${hipertensos}`,
      `Diabéticos;${diabeticos}`,
      `Gestantes;${gestantes}`,
      `Total de visitas;${visitasFiltradas.length}`,
      `Pacientes visitados;${pacientesVisitadosPeriodo.size}`,
      '',
      '--- PACIENTES ---',
      'Nome;CPF;Cartão SUS;Telefone;Endereço;Número;Bairro;Microárea;Data Nasc;Idade;Hipertensão;Diabetes;Gestante;Observações;Data Cadastro',
    ].join('\n');

    const linhasP = pacientes.map(p =>
      [
        `"${p.nome}"`, p.cpf || '', p.cartaoSUS || '', p.telefone || '',
        `"${p.endereco || ''}"`, p.numero || '', `"${p.bairro || ''}"`, p.microarea || '',
        p.dataNascimento || '', calcIdade(p.dataNascimento || ''),
        p.hipertensao ? 'Sim' : 'Não', p.diabetes ? 'Sim' : 'Não',
        p.gestante ? 'Sim' : 'Não', `"${p.observacoes || ''}"`, p.dataCadastro || ''
      ].join(';')
    ).join('\n');

    const secVisitas = '\n\n--- VISITAS ---\nData;Hora;Paciente;Motivo;PA Sistólica;PA Diastólica;Glicemia;Vacinas;Peso;Altura;Observações;Encaminhado para;Próxima Visita';

    const linhasV = visitasFiltradas.map(v =>
      [
        v.data || '', v.hora || '', `"${v.pacienteNome || ''}"`, motivonome(v.motivo || ''),
        v.pressaoSistolica || '', v.pressaoDiastolica || '', v.glicemia || '',
        v.vacinaEmDia === undefined ? '' : v.vacinaEmDia ? 'Sim' : 'Não',
        v.peso || '', v.altura || '', `"${v.observacoes || ''}"`,
        `"${v.encaminhamento || ''}"`, v.proximaVisita || ''
      ].join(';')
    ).join('\n');

    Share.share({ message: cabecalho + '\n' + linhasP + secVisitas + '\n' + linhasV, title: 'Relatório Completo - Saúde do Gueto' });
  };

  // ===== Render =====

  const renderESUS = () => (
    <>
      {/* Seletor de mês */}
      <View style={styles.mesRow}>
        <TouchableOpacity
          style={styles.mesBtn}
          onPress={() => {
            if (mesSelecionado === 0) { setMesSelecionado(11); setAnoSelecionado(anoSelecionado - 1); }
            else { setMesSelecionado(mesSelecionado - 1); }
          }}
        >
          <Text style={styles.mesBtnText}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.mesLabel}>{meses[mesSelecionado]} {anoSelecionado}</Text>
        <TouchableOpacity
          style={styles.mesBtn}
          onPress={() => {
            if (mesSelecionado === 11) { setMesSelecionado(0); setAnoSelecionado(anoSelecionado + 1); }
            else { setMesSelecionado(mesSelecionado + 1); }
          }}
        >
          <Text style={styles.mesBtnText}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* Card de competência */}
      <View style={styles.cardTotal}>
        <Text style={styles.cardTitle}>{String(mesSelecionado + 1).padStart(2, '0')}/{anoSelecionado}</Text>
      </View>

      {/* Grid resumo */}
      <View style={styles.grid}>
        <View style={[styles.card, { backgroundColor: '#FFF3E0' }]}>
          <Text style={styles.cardNum}>{visitasDoMes.length}</Text>
          <Text style={styles.cardLabel}>Visitas no mês</Text>
        </View>
        <View style={[styles.card, { backgroundColor: '#E8F5E9' }]}>
          <Text style={styles.cardNum}>{pacientesVisitadosMes.size}</Text>
          <Text style={styles.cardLabel}>Pacientes visitados</Text>
        </View>
      </View>

      {/* Dados SIS */}
      <View style={styles.sisCard}>
        <Text style={styles.sisTitle}>📊 Dados para SIS Online</Text>
        <View style={styles.sisRow}><Text style={styles.sisLabel}>Total de Pacientes:</Text><Text style={styles.sisValor}>{pacientes.length}</Text></View>
        <View style={styles.sisRow}><Text style={styles.sisLabel}>Hipertensos:</Text><Text style={styles.sisValor}>{hipertensos}</Text></View>
        <View style={styles.sisRow}><Text style={styles.sisLabel}>Diabéticos:</Text><Text style={styles.sisValor}>{diabeticos}</Text></View>
        <View style={styles.sisRow}><Text style={styles.sisLabel}>Gestantes:</Text><Text style={styles.sisValor}>{gestantes}</Text></View>
        <View style={styles.divisor} />
        <View style={styles.sisRow}><Text style={styles.sisLabel}>Visitas de Rotina:</Text><Text style={styles.sisValor}>{visitasPorMotivo(visitasDoMes, 'rotina')}</Text></View>
        <View style={styles.sisRow}><Text style={styles.sisLabel}>Visitas de Retorno:</Text><Text style={styles.sisValor}>{visitasPorMotivo(visitasDoMes, 'retorno')}</Text></View>
        <View style={styles.sisRow}><Text style={styles.sisLabel}>Visitas por Queixa:</Text><Text style={styles.sisValor}>{visitasPorMotivo(visitasDoMes, 'queixa')}</Text></View>
        <View style={styles.sisRow}><Text style={styles.sisLabel}>Encaminhamentos:</Text><Text style={styles.sisValor}>{visitasPorMotivo(visitasDoMes, 'encaminhamento')}</Text></View>
      </View>

      {/* Botões de exportação SIS Online */}
      <Text style={styles.sectionTitle}>📤 Exportar para SIS Online</Text>
      <Text style={styles.exportInfo}>
        Gera arquivo CSV compatível com e-SUS AB para importar no SIS Online (SISS Eicon) de Guarulhos.
        Compartilhe o arquivo por email ou salve no celular e faça upload no portal da prefeitura.
      </Text>

      <TouchableOpacity style={styles.btnPrimary} onPress={exportarFichaIndividual}>
        <Text style={styles.btnText}>👤 Cadastro Individual (pacientes)</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btnPrimary} onPress={exportarFichaDomiciliar}>
        <Text style={styles.btnText}>🏠 Cadastro Domiciliar (famílias)</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btnPrimary} onPress={exportarFichaVisita}>
        <Text style={styles.btnText}>🚪 Visita Domiciliar</Text>
      </TouchableOpacity>

      <View style={styles.divisor} />

      <TouchableOpacity style={styles.sisExportBtn} onPress={exportarTudoSIS}>
        <Text style={styles.sisExportBtnText}>📦 EXPORTAR TUDO PRA SIS ONLINE</Text>
        <Text style={styles.sisExportBtnSub}>Gera CSV com todas as fichas num arquivo só</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnSecondary} onPress={exportarRelatorioTexto}>
        <Text style={styles.btnSecondaryText}>📄 Relatório de Produção (Texto)</Text>
      </TouchableOpacity>
    </>
  );

  const renderRelatorios = () => (
    <>
      {/* Seletor de período */}
      <View style={styles.periodoRow}>
        {(['geral', 'mes', 'semana'] as Periodo[]).map(p => (
          <TouchableOpacity
            key={p}
            style={[styles.periodoBtn, periodo === p && styles.periodoAtivo]}
            onPress={() => setPeriodo(p)}
          >
            <Text style={[styles.periodoText, periodo === p && styles.periodoTextAtivo]}>
              {p === 'geral' ? 'Geral' : p === 'mes' ? 'Último Mês' : 'Última Semana'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Card principal */}
      <View style={styles.cardTotal}>
        <Text style={styles.cardTotalNumero}>{pacientes.length}</Text>
        <Text style={styles.cardTotalLabel}>Pacientes Cadastrados</Text>
      </View>

      {/* Condições */}
      <Text style={styles.sectionTitle}>🩺 Condições de Saúde</Text>
      <View style={styles.grid}>
        <View style={[styles.card, { backgroundColor: '#FFF3E0' }]}>
          <Text style={styles.cardNum}>{hipertensos}</Text>
          <Text style={styles.cardLabel}>Hipertensos</Text>
          <Text style={styles.cardPct}>{pacientes.length > 0 ? Math.round((hipertensos / pacientes.length) * 100) : 0}%</Text>
        </View>
        <View style={[styles.card, { backgroundColor: '#E8F5E9' }]}>
          <Text style={styles.cardNum}>{diabeticos}</Text>
          <Text style={styles.cardLabel}>Diabéticos</Text>
          <Text style={styles.cardPct}>{pacientes.length > 0 ? Math.round((diabeticos / pacientes.length) * 100) : 0}%</Text>
        </View>
        <View style={[styles.card, { backgroundColor: '#FCE4EC' }]}>
          <Text style={styles.cardNum}>{gestantes}</Text>
          <Text style={styles.cardLabel}>Gestantes</Text>
          <Text style={styles.cardPct}>{pacientes.length > 0 ? Math.round((gestantes / pacientes.length) * 100) : 0}%</Text>
        </View>
      </View>

      {/* Visitas */}
      <Text style={styles.sectionTitle}>🏠 Visitas Domiciliares</Text>
      <View style={styles.sisCard}>
        <View style={styles.sisRow}><Text style={styles.sisLabel}>Total de visitas:</Text><Text style={styles.sisValor}>{visitasFiltradas.length}</Text></View>
        <View style={styles.sisRow}><Text style={styles.sisLabel}>Pacientes visitados:</Text><Text style={styles.sisValor}>{pacientesVisitadosPeriodo.size}</Text></View>
        <View style={styles.divisor} />
        <Text style={styles.subSectionTitle}>Por motivo:</Text>
        <View style={styles.sisRow}><Text style={styles.sisLabel}>🔄 Rotina</Text><Text style={styles.sisValor}>{visitasPorMotivo(visitasFiltradas, 'rotina')}</Text></View>
        <View style={styles.sisRow}><Text style={styles.sisLabel}>🔙 Retorno</Text><Text style={styles.sisValor}>{visitasPorMotivo(visitasFiltradas, 'retorno')}</Text></View>
        <View style={styles.sisRow}><Text style={styles.sisLabel}>🤒 Queixa</Text><Text style={styles.sisValor}>{visitasPorMotivo(visitasFiltradas, 'queixa')}</Text></View>
        <View style={styles.sisRow}><Text style={styles.sisLabel}>📋 Encaminhamento</Text><Text style={styles.sisValor}>{visitasPorMotivo(visitasFiltradas, 'encaminhamento')}</Text></View>
      </View>

      {/* Exportação */}
      <Text style={styles.sectionTitle}>📤 Exportar Dados</Text>
      <View style={styles.exportRow}>
        <TouchableOpacity style={styles.exportBtn} onPress={exportarPacientesCSV}>
          <Text style={styles.exportText}>📋 Pacientes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exportBtn} onPress={exportarVisitasCSV}>
          <Text style={styles.exportText}>🏠 Visitas</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.btnPrimary} onPress={exportarRelatorioCompleto}>
        <Text style={styles.btnText}>📑 Relatório Completo (CSV)</Text>
      </TouchableOpacity>
      <Text style={styles.exportInfo}>CSV profissional com resumo + dados — compatível com Excel, Google Sheets e e-SUS</Text>
    </>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: cores.fundo }]}>
      {/* Título */}
      <Text style={styles.title}>📊 Relatórios & e-SUS</Text>
      <Text style={styles.subtitle}>Estatísticas + Exportação para sistemas oficiais</Text>

      {/* Abas */}
      <View style={styles.abaRow}>
        <TouchableOpacity
          style={[styles.abaBtn, aba === 'esus' && styles.abaAtiva]}
          onPress={() => setAba('esus')}
        >
          <Text style={[styles.abaTexto, aba === 'esus' && styles.abaTextoAtiva]}>
            💻 e-SUS / SIS
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.abaBtn, aba === 'relatorios' && styles.abaAtiva]}
          onPress={() => setAba('relatorios')}
        >
          <Text style={[styles.abaTexto, aba === 'relatorios' && styles.abaTextoAtiva]}>
            📊 Relatórios
          </Text>
        </TouchableOpacity>
      </View>

      {aba === 'esus' ? renderESUS() : renderRelatorios()}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    padding: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF8C00',
    textAlign: 'center',
    marginTop: 15,
  },
  subtitle: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginBottom: 15,
  },
  // Abas
  abaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  abaBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    alignItems: 'center',
  },
  abaAtiva: {
    backgroundColor: '#FF8C00',
    borderColor: '#FF8C00',
  },
  abaTexto: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  abaTextoAtiva: {
    color: '#FFF',
  },
  // Período (relatórios)
  periodoRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  periodoBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    alignItems: 'center',
  },
  periodoAtivo: {
    backgroundColor: '#FF8C00',
    borderColor: '#FF8C00',
  },
  periodoText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  periodoTextAtivo: {
    color: '#FFF',
  },
  // Mês (e-SUS)
  mesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginBottom: 20,
  },
  mesBtn: {
    backgroundColor: '#FF8C00',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mesBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mesLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 180,
    textAlign: 'center',
  },
  // Cards
  cardTotal: {
    backgroundColor: '#FF8C00',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  cardTotalNumero: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFF',
  },
  cardTotalLabel: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 5,
  },
  grid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  cardNum: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  cardLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  cardPct: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  // SIS card
  sisCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sisTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginTop: 5,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 5,
  },
  sisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  sisLabel: {
    fontSize: 14,
    color: '#555',
  },
  sisValor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  divisor: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 6,
  },
  // Botões
  btnPrimary: {
    backgroundColor: '#FF8C00',
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  btnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnSecondary: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#FF8C00',
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  btnSecondaryText: {
    color: '#FF8C00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  exportRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  exportBtn: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#FF8C00',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  exportText: {
    color: '#FF8C00',
    fontWeight: 'bold',
    fontSize: 14,
  },
  exportInfo: {
    fontSize: 12,
    color: '#AAA',
    textAlign: 'center',
    marginBottom: 10,
  },
  sisExportBtn: {
    backgroundColor: '#1A73E8',
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  sisExportBtnText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  sisExportBtnSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginTop: 2,
  },
});
