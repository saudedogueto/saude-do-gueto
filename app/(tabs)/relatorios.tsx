import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Share, Platform
} from 'react-native';
import { usePacientes, Paciente } from '@/src/contexts/PacienteContext';
import { useVisitas, Visita } from '@/src/contexts/VisitaContext';
import { useTema } from '@/src/contexts/TemaContext';
import { useToast } from '@/src/components/Toast';
import { router } from 'expo-router';

export default function RelatoriosScreen() {
  const { pacientes, carregarPacientes } = usePacientes();
  const { visitas, carregarVisitas } = useVisitas();
  const { cores } = useTema();
  const { showToast } = useToast();
  const [periodo, setPeriodo] = useState<'geral' | 'mes' | 'semana'>('geral');

  useEffect(() => {
    carregarPacientes();
    carregarVisitas();
  }, []);

  const hipertensos = pacientes.filter(p => p.hipertensao).length;
  const diabeticos = pacientes.filter(p => p.diabetes).length;
  const gestantes = pacientes.filter(p => p.gestante).length;

  // Visitas do período
  const visitasFiltradas = () => {
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
  };

  const visitasPeriodo = visitasFiltradas();
  const pacientesComVisitas = new Set(visitasPeriodo.map(v => v.pacienteId)).size;
  const visitasPorMotivo = (motivo: string) =>
    visitasPeriodo.filter(v => v.motivo === motivo).length;

  const gerarDataHora = () => {
    const agora = new Date();
    return agora.toLocaleString('pt-BR');
  };

  const periodoLabel = periodo === 'geral' ? 'GERAL' : periodo === 'mes' ? 'ÚLTIMOS 30 DIAS' : 'ÚLTIMOS 7 DIAS';

  const exportarDados = async () => {
    try {
      const agora = gerarDataHora();
      const pacientesVis = visitasPeriodo.length;
      const totalHipertensos = pacientes.filter(p => p.hipertensao).length;
      const totalDiabeticos = pacientes.filter(p => p.diabetes).length;
      const totalGestantes = pacientes.filter(p => p.gestante).length;

      const cabecalhoGeral = [
        '=== RELATÓRIO SAÚDE DO GUETO ===',
        `Gerado em: ${agora}`,
        `Período: ${periodoLabel}`,
        '',
        '--- RESUMO ---',
        `Total de pacientes;${pacientes.length}`,
        `Total de visitas;${pacientesVis}`,
        `Hipertensos;${totalHipertensos}`,
        `Diabéticos;${totalDiabeticos}`,
        `Gestantes;${totalGestantes}`,
        '',
        '--- PACIENTES ---',
        'Nome;CPF;Cartão SUS;Telefone;Endereço;Número;Bairro;Microárea;Data Nasc;Idade;Hipertensão;Diabetes;Gestante;Observações;Data Cadastro'
      ].join('\n');

      const calcIdade = (dn: string) => {
        if (!dn) return '';
        const diff = new Date().getTime() - new Date(dn.split('/').reverse().join('-')).getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)).toString();
      };

      const linhasPacientes = pacientes.map(p =>
        [
          `"${p.nome}"`,
          p.cpf || '',
          p.cartaoSUS || '',
          p.telefone || '',
          `"${p.endereco || ''}"`,
          p.numero || '',
          `"${p.bairro || ''}"`,
          p.microarea || '',
          p.dataNascimento || '',
          calcIdade(p.dataNascimento || ''),
          p.hipertensao ? 'Sim' : 'Não',
          p.diabetes ? 'Sim' : 'Não',
          p.gestante ? 'Sim' : 'Não',
          `"${p.observacoes || ''}"`,
          p.dataCadastro || ''
        ].join(';')
      ).join('\n');

      const csv = cabecalhoGeral + '\n' + linhasPacientes;

      await Share.share({
        message: csv,
        title: 'Relatório Saúde do Gueto - Completo',
      });
    } catch {
      showToast('Erro ao exportar dados', 'error');
    }
  };

  const exportarVisitas = async () => {
    try {
      const agora = gerarDataHora();
      const filtradas = visitasPeriodo;
      const rotina = filtradas.filter(v => v.motivo === 'rotina').length;
      const retorno = filtradas.filter(v => v.motivo === 'retorno').length;
      const queixa = filtradas.filter(v => v.motivo === 'queixa').length;
      const enc = filtradas.filter(v => v.motivo === 'encaminhamento').length;

      const cabecalhoGeral = [
        '=== RELATÓRIO DE VISITAS - SAÚDE DO GUETO ===',
        `Gerado em: ${agora}`,
        `Período: ${periodoLabel}`,
        '',
        '--- RESUMO DE VISITAS ---',
        `Total de visitas;${filtradas.length}`,
        `Pacientes visitados;${new Set(filtradas.map(v => v.pacienteId)).size}`,
        `Visitas de Rotina;${rotina}`,
        `Visitas de Retorno;${retorno}`,
        `Visitas por Queixa;${queixa}`,
        `Encaminhamentos;${enc}`,
        '',
        '--- DETALHAMENTO ---',
        'Data;Hora;Paciente;Motivo;PA Sistólica;PA Diastólica;Glicemia;Vacinas;Peso;Altura;Observações;Encaminhado para;Próxima Visita'
      ].join('\n');

      const motivonome = (m: string) => {
        const map: Record<string, string> = { rotina: 'Rotina', retorno: 'Retorno', queixa: 'Queixa', encaminhamento: 'Encaminhamento' };
        return map[m] || m;
      };

      const linhasVisitas = filtradas.map(v =>
        [
          v.data || '',
          v.hora || '',
          `"${v.pacienteNome || ''}"`,
          motivonome(v.motivo || ''),
          v.pressaoSistolica || '',
          v.pressaoDiastolica || '',
          v.glicemia || '',
          v.vacinaEmDia === undefined ? '' : v.vacinaEmDia ? 'Sim' : 'Não',
          v.peso || '',
          v.altura || '',
          `"${v.observacoes || ''}"`,
          `"${v.encaminhamento || ''}"`,
          v.proximaVisita || ''
        ].join(';')
      ).join('\n');

      const csv = cabecalhoGeral + '\n' + linhasVisitas;

      await Share.share({
        message: csv,
        title: 'Relatório de Visitas - Saúde do Gueto - Completo',
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível exportar os dados');
    }
  };

  const exportarRelatorioCompleto = async () => {
    try {
      const agora = gerarDataHora();
      const p = pacientes.length;
      const hv = pacientes.filter(p => p.hipertensao).length;
      const dv = pacientes.filter(p => p.diabetes).length;
      const gv = pacientes.filter(p => p.gestante).length;
      const totVis = visitasPeriodo.length;
      const pacVis = new Set(visitasPeriodo.map(v => v.pacienteId)).size;

      const cabecalho = [
        '=== RELATÓRIO COMPLETO - SAÚDE DO GUETO ===',
        `Gerado em: ${agora}`,
        `Período: ${periodoLabel}`,
        '',
        '--- RESUMO GERAL ---',
        `Pacientes cadastrados;${p}`,
        `Hipertensos;${hv}`,
        `Diabéticos;${dv}`,
        `Gestantes;${gv}`,
        `Total de visitas;${totVis}`,
        `Pacientes visitados;${pacVis}`,
        '',
        '--- PACIENTES ---',
        'Nome;CPF;Cartão SUS;Telefone;Endereço;Número;Bairro;Microárea;Data Nasc;Idade;Hipertensão;Diabetes;Gestante;Observações;Data Cadastro',
      ].join('\n');

      const calcIdade = (dn: string) => {
        if (!dn) return '';
        const diff = new Date().getTime() - new Date(dn.split('/').reverse().join('-')).getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)).toString();
      };

      const linhasP = pacientes.map(p =>
        [`"${p.nome}"`, p.cpf || '', p.cartaoSUS || '', p.telefone || '', `"${p.endereco || ''}"`, p.numero || '', `"${p.bairro || ''}"`, p.microarea || '', p.dataNascimento || '', calcIdade(p.dataNascimento || ''), p.hipertensao ? 'Sim' : 'Não', p.diabetes ? 'Sim' : 'Não', p.gestante ? 'Sim' : 'Não', `"${p.observacoes || ''}"`, p.dataCadastro || ''].join(';')
      ).join('\n');

      const motivonome = (m: string) => {
        const map: Record<string, string> = { rotina: 'Rotina', retorno: 'Retorno', queixa: 'Queixa', encaminhamento: 'Encaminhamento' };
        return map[m] || m;
      };

      const secVisitas = '\n\n--- VISITAS ---\nData;Hora;Paciente;Motivo;PA Sistólica;PA Diastólica;Glicemia;Vacinas;Peso;Altura;Observações;Encaminhado para;Próxima Visita';

      const linhasV = visitasPeriodo.map(v =>
        [v.data || '', v.hora || '', `"${v.pacienteNome || ''}"`, motivonome(v.motivo || ''), v.pressaoSistolica || '', v.pressaoDiastolica || '', v.glicemia || '', v.vacinaEmDia === undefined ? '' : v.vacinaEmDia ? 'Sim' : 'Não', v.peso || '', v.altura || '', `"${v.observacoes || ''}"`, `"${v.encaminhamento || ''}"`, v.proximaVisita || ''].join(';')
      ).join('\n');

      const csv = cabecalho + '\n' + linhasP + secVisitas + '\n' + linhasV;

      await Share.share({
        message: csv,
        title: 'Relatório Completo - Saúde do Gueto',
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível exportar os dados');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: cores.fundo }]}>
      <Text style={styles.title}>📊 Relatórios</Text>

      {/* Seletor de Período */}
      <View style={styles.periodoRow}>
        {['geral', 'mes', 'semana'].map(p => (
          <TouchableOpacity
            key={p}
            style={[styles.periodoBtn, periodo === p && styles.periodoAtivo]}
            onPress={() => setPeriodo(p as any)}
          >
            <Text style={[styles.periodoText, periodo === p && styles.periodoTextAtivo]}>
              {p === 'geral' ? 'Geral' : p === 'mes' ? 'Último Mês' : 'Última Semana'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Card Principal */}
      <View style={styles.cardTotal}>
        <Text style={styles.cardTotalNumero}>{pacientes.length}</Text>
        <Text style={styles.cardTotalLabel}>Pacientes Cadastrados</Text>
      </View>

      {/* Grid Condições */}
      <Text style={styles.sectionTitle}>🩺 Condições de Saúde</Text>
      <View style={styles.grid}>
        <View style={[styles.card, { backgroundColor: '#FFF3E0' }]}>
          <Text style={styles.cardNumero}>{hipertensos}</Text>
          <Text style={styles.cardLabel}>Hipertensos</Text>
          <Text style={styles.cardPct}>
            {pacientes.length > 0 ? Math.round((hipertensos / pacientes.length) * 100) : 0}%
          </Text>
        </View>
        <View style={[styles.card, { backgroundColor: '#E8F5E9' }]}>
          <Text style={styles.cardNumero}>{diabeticos}</Text>
          <Text style={styles.cardLabel}>Diabéticos</Text>
          <Text style={styles.cardPct}>
            {pacientes.length > 0 ? Math.round((diabeticos / pacientes.length) * 100) : 0}%
          </Text>
        </View>
        <View style={[styles.card, { backgroundColor: '#FCE4EC' }]}>
          <Text style={styles.cardNumero}>{gestantes}</Text>
          <Text style={styles.cardLabel}>Gestantes</Text>
          <Text style={styles.cardPct}>
            {pacientes.length > 0 ? Math.round((gestantes / pacientes.length) * 100) : 0}%
          </Text>
        </View>
      </View>

      {/* Visitas */}
      <Text style={styles.sectionTitle}>🏠 Visitas Domiciliares</Text>
      <View style={styles.visitasCard}>
        <View style={styles.visitaRow}>
          <Text style={styles.visitaLabel}>Total de visitas:</Text>
          <Text style={styles.visitaValor}>{visitasPeriodo.length}</Text>
        </View>
        <View style={styles.visitaRow}>
          <Text style={styles.visitaLabel}>Pacientes visitados:</Text>
          <Text style={styles.visitaValor}>{pacientesComVisitas}</Text>
        </View>
        <View style={styles.divisor} />
        <Text style={styles.subSectionTitle}>Por motivo:</Text>
        <View style={styles.visitaRow}>
          <Text style={styles.visitaLabel}>🔄 Rotina</Text>
          <Text style={styles.visitaValor}>{visitasPorMotivo('rotina')}</Text>
        </View>
        <View style={styles.visitaRow}>
          <Text style={styles.visitaLabel}>🔙 Retorno</Text>
          <Text style={styles.visitaValor}>{visitasPorMotivo('retorno')}</Text>
        </View>
        <View style={styles.visitaRow}>
          <Text style={styles.visitaLabel}>🤒 Queixa</Text>
          <Text style={styles.visitaValor}>{visitasPorMotivo('queixa')}</Text>
        </View>
        <View style={styles.visitaRow}>
          <Text style={styles.visitaLabel}>📋 Encaminhamento</Text>
          <Text style={styles.visitaValor}>{visitasPorMotivo('encaminhamento')}</Text>
        </View>
      </View>

      {/* Exportação */}
      <Text style={styles.sectionTitle}>📤 Exportar Dados</Text>
      <View style={styles.exportRow}>
        <TouchableOpacity style={styles.exportBtn} onPress={exportarDados}>
          <Text style={styles.exportText}>📋 Pacientes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exportBtn} onPress={exportarVisitas}>
          <Text style={styles.exportText}>🏠 Visitas</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.exportBtnCompleto} onPress={exportarRelatorioCompleto}>
        <Text style={styles.exportTextCompleto}>📑 Relatório Completo (CSV)</Text>
      </TouchableOpacity>
      <Text style={styles.exportInfo}>
        CSV profissional com resumo + dados — compatível com Excel, Google Sheets e e-SUS
      </Text>

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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF8C00',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
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
  grid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 25,
  },
  card: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  cardNumero: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  cardLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  cardPct: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  visitasCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  visitaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  visitaLabel: {
    fontSize: 14,
    color: '#555',
  },
  visitaValor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  divisor: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 8,
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
  exportBtnCompleto: {
    backgroundColor: '#FF8C00',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  exportTextCompleto: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  exportInfo: {
    fontSize: 12,
    color: '#AAA',
    textAlign: 'center',
    marginBottom: 10,
  },
});
