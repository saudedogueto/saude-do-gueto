import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList, Alert, Share, Platform
} from 'react-native';
import { usePacientes, Paciente } from '@/src/contexts/PacienteContext';
import { useVisitas, Visita } from '@/src/contexts/VisitaContext';
import { useTema } from '@/src/contexts/TemaContext';
import { useToast } from '@/src/components/Toast';
import { router } from 'expo-router';

type Periodo = 'geral' | 'mes' | 'semana';

export default function RelatoriosScreen() {
  const { pacientes, carregarPacientes } = usePacientes();
  const { visitas, carregarVisitas } = useVisitas();
  const { cores } = useTema();
  const { showToast } = useToast();
  const [periodo, setPeriodo] = useState<Periodo>('geral');
  const [aba, setAba] = useState<'geral' | 'historico'>('geral');
  const [expandido, setExpandido] = useState<string | null>(null);

  useEffect(() => {
    carregarPacientes();
    carregarVisitas();
  }, []);

  const hipertensos = pacientes.filter(p => p.hipertensao).length;
  const diabeticos = pacientes.filter(p => p.diabetes).length;
  const gestantes = pacientes.filter(p => p.gestante).length;

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

  // Agrupa visitas por paciente para o historico
  const visitasAgrupadas = useMemo(() => {
    const mapa = new Map<string, { pacienteNome: string; visitas: Visita[] }>();
    [...visitas].reverse().forEach(v => {
      if (!mapa.has(v.pacienteId)) {
        mapa.set(v.pacienteId, { pacienteNome: v.pacienteNome || 'Desconhecido', visitas: [] });
      }
      mapa.get(v.pacienteId)!.visitas.push(v);
    });
    return Array.from(mapa.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.visitas.length - a.visitas.length);
  }, [visitas]);

  const visitasPorMotivo = (motivo: string) =>
    visitasPeriodo.filter(v => v.motivo === motivo).length;

  const gerarDataHora = () => {
    const agora = new Date();
    return agora.toLocaleString('pt-BR');
  };

  const periodoLabel = periodo === 'geral' ? 'GERAL' : periodo === 'mes' ? 'ULTIMOS 30 DIAS' : 'ULTIMOS 7 DIAS';

  const exportarDados = async () => {
    try {
      const agora = gerarDataHora();
      const pacientesVis = visitasPeriodo.length;
      const totalHipertensos = pacientes.filter(p => p.hipertensao).length;
      const totalDiabeticos = pacientes.filter(p => p.diabetes).length;
      const totalGestantes = pacientes.filter(p => p.gestante).length;

      const cabecalhoGeral = [
        '=== RELATORIO SAUDE DO GUETO ===',
        `Gerado em: ${agora}`,
        `Periodo: ${periodoLabel}`,
        '',
        '--- RESUMO ---',
        `Total de pacientes;${pacientes.length}`,
        `Total de visitas;${pacientesVis}`,
        `Hipertensos;${totalHipertensos}`,
        `Diabeticos;${totalDiabeticos}`,
        `Gestantes;${totalGestantes}`,
        '',
        '--- PACIENTES ---',
        'Nome;CPF;Carta SUS;Telefone;Endereco;Numero;Bairro;Microarea;Data Nasc;Idade;Hipertensao;Diabetes;Gestante;Observacoes;Data Cadastro'
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
          p.hipertensao ? 'Sim' : 'Nao',
          p.diabetes ? 'Sim' : 'Nao',
          p.gestante ? 'Sim' : 'Nao',
          `"${p.observacoes || ''}"`,
          p.dataCadastro || ''
        ].join(';')
      ).join('\n');

      const csv = cabecalhoGeral + '\n' + linhasPacientes;

      await Share.share({
        message: csv,
        title: 'Relatorio Saude do Gueto - Completo',
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
        '=== RELATORIO DE VISITAS - SAUDE DO GUETO ===',
        `Gerado em: ${agora}`,
        `Periodo: ${periodoLabel}`,
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
        'Data;Hora;Paciente;Motivo;PA Sistolica;PA Diastolica;Glicemia;Vacinas;Peso;Altura;Observacoes;Encaminhado para;Proxima Visita'
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
          v.vacinaEmDia === undefined ? '' : v.vacinaEmDia ? 'Sim' : 'Nao',
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
        title: 'Relatorio de Visitas - Saude do Gueto - Completo',
      });
    } catch (error) {
      Alert.alert('Erro', 'Nao foi possivel exportar os dados');
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
        '=== RELATORIO COMPLETO - SAUDE DO GUETO ===',
        `Gerado em: ${agora}`,
        `Periodo: ${periodoLabel}`,
        '',
        '--- RESUMO GERAL ---',
        `Pacientes cadastrados;${p}`,
        `Hipertensos;${hv}`,
        `Diabeticos;${dv}`,
        `Gestantes;${gv}`,
        `Total de visitas;${totVis}`,
        `Pacientes visitados;${pacVis}`,
        '',
        '--- PACIENTES ---',
        'Nome;CPF;Carta SUS;Telefone;Endereco;Numero;Bairro;Microarea;Data Nasc;Idade;Hipertensao;Diabetes;Gestante;Observacoes;Data Cadastro',
      ].join('\n');

      const calcIdade = (dn: string) => {
        if (!dn) return '';
        const diff = new Date().getTime() - new Date(dn.split('/').reverse().join('-')).getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)).toString();
      };

      const linhasP = pacientes.map(p =>
        [`"${p.nome}"`, p.cpf || '', p.cartaoSUS || '', p.telefone || '', `"${p.endereco || ''}"`, p.numero || '', `"${p.bairro || ''}"`, p.microarea || '', p.dataNascimento || '', calcIdade(p.dataNascimento || ''), p.hipertensao ? 'Sim' : 'Nao', p.diabetes ? 'Sim' : 'Nao', p.gestante ? 'Sim' : 'Nao', `"${p.observacoes || ''}"`, p.dataCadastro || ''].join(';')
      ).join('\n');

      const motivonome = (m: string) => {
        const map: Record<string, string> = { rotina: 'Rotina', retorno: 'Retorno', queixa: 'Queixa', encaminhamento: 'Encaminhamento' };
        return map[m] || m;
      };

      const secVisitas = '\n\n--- VISITAS ---\nData;Hora;Paciente;Motivo;PA Sistolica;PA Diastolica;Glicemia;Vacinas;Peso;Altura;Observacoes;Encaminhado para;Proxima Visita';

      const linhasV = visitasPeriodo.map(v =>
        [v.data || '', v.hora || '', `"${v.pacienteNome || ''}"`, motivonome(v.motivo || ''), v.pressaoSistolica || '', v.pressaoDiastolica || '', v.glicemia || '', v.vacinaEmDia === undefined ? '' : v.vacinaEmDia ? 'Sim' : 'Nao', v.peso || '', v.altura || '', `"${v.observacoes || ''}"`, `"${v.encaminhamento || ''}"`, v.proximaVisita || ''].join(';')
      ).join('\n');

      const csv = cabecalho + '\n' + linhasP + secVisitas + '\n' + linhasV;

      await Share.share({
        message: csv,
        title: 'Relatorio Completo - Saude do Gueto',
      });
    } catch (error) {
      Alert.alert('Erro', 'Nao foi possivel exportar os dados');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: cores.fundo }]}>
      <Text style={[styles.title, { color: cores.primary }]}>Relatorios</Text>

      {/* Abas: Geral | Historico de Visitas */}
      <View style={styles.abaRow}>
        <TouchableOpacity
          style={[styles.abaBtn, aba === 'geral' && styles.abaAtiva]}
          onPress={() => setAba('geral')}
        >
          <Text style={[styles.abaText, aba === 'geral' && styles.abaTextAtiva]}>Geral</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.abaBtn, aba === 'historico' && styles.abaAtiva]}
          onPress={() => setAba('historico')}
        >
          <Text style={[styles.abaText, aba === 'historico' && styles.abaTextAtiva]}>Historico de Visitas</Text>
        </TouchableOpacity>
      </View>

      {/* Seletor de Periodo */}
      <View style={styles.periodoRow}>
        {(['geral', 'mes', 'semana'] as const).map(p => (
          <TouchableOpacity
            key={p}
            style={[styles.periodoBtn, periodo === p && styles.periodoAtivo]}
            onPress={() => setPeriodo(p)}
          >
            <Text style={[styles.periodoText, periodo === p && styles.periodoTextAtivo]}>
              {p === 'geral' ? 'Geral' : p === 'mes' ? 'Ultimo Mes' : 'Ultima Semana'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ABA GERAL */}
      {aba === 'geral' && (
        <>
          <View style={styles.cardTotal}>
            <Text style={styles.cardTotalNumero}>{pacientes.length}</Text>
            <Text style={styles.cardTotalLabel}>Pacientes Cadastrados</Text>
          </View>

          <Text style={styles.sectionTitle}>Condicoes de Saude</Text>
          <View style={styles.grid}>
            <View style={[styles.card, { backgroundColor: cores.primaryLight }]}>
              <Text style={styles.cardNumero}>{hipertensos}</Text>
              <Text style={styles.cardLabel}>Hipertensos</Text>
              <Text style={styles.cardPct}>
                {pacientes.length > 0 ? Math.round((hipertensos / pacientes.length) * 100) : 0}%
              </Text>
            </View>
            <View style={[styles.card, { backgroundColor: 'rgba(0, 230, 118, 0.12)' }]}>
              <Text style={styles.cardNumero}>{diabeticos}</Text>
              <Text style={styles.cardLabel}>Diabeticos</Text>
              <Text style={styles.cardPct}>
                {pacientes.length > 0 ? Math.round((diabeticos / pacientes.length) * 100) : 0}%
              </Text>
            </View>
            <View style={[styles.card, { backgroundColor: 'rgba(0, 176, 255, 0.12)' }]}>
              <Text style={styles.cardNumero}>{gestantes}</Text>
              <Text style={styles.cardLabel}>Gestantes</Text>
              <Text style={styles.cardPct}>
                {pacientes.length > 0 ? Math.round((gestantes / pacientes.length) * 100) : 0}%
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Visitas Domiciliares</Text>
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
              <Text style={styles.visitaLabel}>Rotina</Text>
              <Text style={styles.visitaValor}>{visitasPorMotivo('rotina')}</Text>
            </View>
            <View style={styles.visitaRow}>
              <Text style={styles.visitaLabel}>Retorno</Text>
              <Text style={styles.visitaValor}>{visitasPorMotivo('retorno')}</Text>
            </View>
            <View style={styles.visitaRow}>
              <Text style={styles.visitaLabel}>Queixa</Text>
              <Text style={styles.visitaValor}>{visitasPorMotivo('queixa')}</Text>
            </View>
            <View style={styles.visitaRow}>
              <Text style={styles.visitaLabel}>Encaminhamento</Text>
              <Text style={styles.visitaValor}>{visitasPorMotivo('encaminhamento')}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Exportar Dados</Text>
          <View style={styles.exportRow}>
            <TouchableOpacity style={styles.exportBtn} onPress={exportarDados}>
              <Text style={styles.exportText}>Pacientes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportBtn} onPress={exportarVisitas}>
              <Text style={styles.exportText}>Visitas</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.exportBtnCompleto} onPress={exportarRelatorioCompleto}>
            <Text style={styles.exportTextCompleto}>Relatorio Completo (CSV)</Text>
          </TouchableOpacity>
          <Text style={styles.exportInfo}>
            CSV profissional com resumo + dados - compativel com Excel, Google Sheets e e-SUS
          </Text>
        </>
      )}

      {/* ABA HISTORICO DE VISITAS */}
      {aba === 'historico' && (
        <>
          <Text style={styles.sectionTitle}>Historico de Visitas</Text>
          <Text style={styles.exportInfo}>
            Pacientes com visitas registradas - toque para expandir e ver detalhes
          </Text>

          {visitasAgrupadas.length === 0 ? (
            <View style={[styles.visitasCard, { padding: 30, alignItems: 'center' }]}>
              <Text style={{ fontSize: 32, marginBottom: 10 }}>Vazio</Text>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, textAlign: 'center' }}>
                Nenhuma visita registrada ainda
              </Text>
            </View>
          ) : (
            visitasAgrupadas.map((grupo) => (
              <View key={grupo.id} style={[styles.visitasCard, { marginBottom: 12 }]}>
                <TouchableOpacity
                  onPress={() => setExpandido(expandido === grupo.id ? null : grupo.id)}
                  style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>{grupo.pacienteNome}</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 2 }}>
                      {grupo.visitas.length} visita(s)
                    </Text>
                  </View>
                  <Text style={{ color: '#00E676', fontSize: 18 }}>{expandido === grupo.id ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {expandido === grupo.id && (
                  <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 10 }}>
                    {grupo.visitas.map((v, i) => (
                      <View key={v.id || i} style={{
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 8,
                      }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={{ color: '#00E676', fontWeight: '600' }}>{v.data || '-'}</Text>
                          <Text style={{ color: 'rgba(255,255,255,0.5)' }}>{v.hora || '-'}</Text>
                        </View>
                        {v.motivo && (
                          <Text style={{ color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                            Motivo: {v.motivo}
                          </Text>
                        )}
                        {(v.pressaoSistolica || v.glicemia) && (
                          <Text style={{ color: 'rgba(255,255,255,0.5)', marginTop: 2, fontSize: 13 }}>
                            {v.pressaoSistolica ? `PA: ${v.pressaoSistolica}/${v.pressaoDiastolica || '-'}` : ''}
                            {v.pressaoSistolica && v.glicemia ? ' | ' : ''}
                            {v.glicemia ? `Glicemia: ${v.glicemia}` : ''}
                          </Text>
                        )}
                        {v.observacoes && (
                          <Text style={{ color: 'rgba(255,255,255,0.5)', marginTop: 4, fontSize: 13, fontStyle: 'italic' }}>
                            {v.observacoes}
                          </Text>
                        )}
                        {v.encaminhamento && (
                          <Text style={{ color: '#FF9800', marginTop: 4, fontSize: 13 }}>
                            Encaminhado para: {v.encaminhamento}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))
          )}

          <Text style={styles.sectionTitle}>Exportar</Text>
          <TouchableOpacity style={styles.exportBtnCompleto} onPress={exportarVisitas}>
            <Text style={styles.exportTextCompleto}>Relatorio de Visitas (CSV)</Text>
          </TouchableOpacity>
          <Text style={styles.exportInfo}>
            CSV detalhado com todas as visitas do periodo
          </Text>
        </>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00E676',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  abaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  abaBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    alignItems: 'center',
  },
  abaAtiva: {
    backgroundColor: '#00E676',
    borderColor: '#00E676',
  },
  abaText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  abaTextAtiva: {
    color: '#0B1220',
  },
  periodoRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  periodoBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    alignItems: 'center',
  },
  periodoAtivo: {
    backgroundColor: '#00E676',
    borderColor: '#00E676',
  },
  periodoText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  periodoTextAtivo: {
    color: '#0B1220',
  },
  cardTotal: {
    backgroundColor: '#00E676',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardTotalNumero: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#0B1220',
  },
  cardTotalLabel: {
    fontSize: 15,
    color: 'rgba(0,0,0,0.8)',
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    marginTop: 5,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 5,
  },
  grid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
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
    color: '#FFFFFF',
  },
  cardLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  cardPct: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  visitasCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  visitaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  visitaLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  visitaValor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  divisor: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 8,
  },
  exportRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  exportBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 2,
    borderColor: '#00E676',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  exportText: {
    color: '#00E676',
    fontWeight: 'bold',
    fontSize: 14,
  },
  exportBtnCompleto: {
    backgroundColor: '#00E676',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  exportTextCompleto: {
    color: '#0B1220',
    fontWeight: 'bold',
    fontSize: 15,
  },
  exportInfo: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginBottom: 10,
  },
});
