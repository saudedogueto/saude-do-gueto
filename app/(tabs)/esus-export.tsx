import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Share
} from 'react-native';
import { usePacientes } from '@/src/contexts/PacienteContext';
import { useVisitas } from '@/src/contexts/VisitaContext';
import { useTema } from '@/src/contexts/TemaContext';
import { router } from 'expo-router';

export default function ESUSExportScreen() {
  const { pacientes, carregarPacientes } = usePacientes();
  const { visitas, carregarVisitas } = useVisitas();
  const { cores } = useTema();
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth());
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());

  useEffect(() => {
    carregarPacientes();
    carregarVisitas();
  }, []);

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const visitasDoMes = visitas.filter(v => {
    const data = new Date(v.data);
    return data.getMonth() === mesSelecionado && data.getFullYear() === anoSelecionado;
  });

  const pacientesVisitados = new Set(visitasDoMes.map(v => v.pacienteId));

  // Dados para o SIS Online / e-SUS
  const relatorio = {
    competencia: `${String(mesSelecionado + 1).padStart(2, '0')}/${anoSelecionado}`,
    totalPacientes: pacientes.length,
    pacientesVisitados: pacientesVisitados.size,
    totalVisitas: visitasDoMes.length,
    visitasPorMotivo: {
      rotina: visitasDoMes.filter(v => v.motivo === 'rotina').length,
      retorno: visitasDoMes.filter(v => v.motivo === 'retorno').length,
      queixa: visitasDoMes.filter(v => v.motivo === 'queixa').length,
      encaminhamento: visitasDoMes.filter(v => v.motivo === 'encaminhamento').length,
    },
    hipertensos: pacientes.filter(p => p.hipertensao).length,
    diabeticos: pacientes.filter(p => p.diabetes).length,
    gestantes: pacientes.filter(p => p.gestante).length,
    hipertensosVisitados: [...pacientesVisitados].filter(id => {
      const p = pacientes.find(pa => pa.id === id);
      return p?.hipertensao;
    }).length,
    diabeticosVisitados: [...pacientesVisitados].filter(id => {
      const p = pacientes.find(pa => pa.id === id);
      return p?.diabetes;
    }).length,
  };

  const exportarTexto = () => {
    const texto = `
=== RELATÓRIO DE PRODUÇÃO - SAÚDE DO GUETO ===
Competência: ${relatorio.competencia}
Gerado em: ${new Date().toLocaleString('pt-BR')}

--- PACIENTES ---
Total cadastrados: ${relatorio.totalPacientes}
Hipertensos: ${relatorio.hipertensos}
Diabéticos: ${relatorio.diabeticos}
Gestantes: ${relatorio.gestantes}

--- VISITAS DOMICILIARES ---
Total de visitas: ${relatorio.totalVisitas}
Pacientes visitados: ${relatorio.pacientesVisitados}
Hipertensos visitados: ${relatorio.hipertensosVisitados}
Diabéticos visitados: ${relatorio.diabeticosVisitados}

--- DETALHAMENTO DAS VISITAS ---
Visitas de Rotina: ${relatorio.visitasPorMotivo.rotina}
Visitas de Retorno: ${relatorio.visitasPorMotivo.retorno}
Visitas por Queixa: ${relatorio.visitasPorMotivo.queixa}
Encaminhamentos: ${relatorio.visitasPorMotivo.encaminhamento}
`.trim();

    Share.share({ message: texto, title: `Relatório ${relatorio.competencia}` });
  };

  const exportarCSV_esus = () => {
    // Formato CSV para lançamento no SIS Online
    const linhas: string[] = [];
    linhas.push('"Competência";"Paciente";"Tipo";"Valor"');

    visitasDoMes.forEach(v => {
      linhas.push(`"${relatorio.competencia}";"${v.pacienteNome}";"Visita_${v.motivo}";"1"`);
      if (v.hipertensao !== undefined) {
        linhas.push(`"${relatorio.competencia}";"${v.pacienteNome}";"Hipertensao";"${v.hipertensao ? 'Sim' : 'Não'}"`);
      }
    });

    const csv = linhas.join('\n');
    Share.share({ message: csv, title: `esus_${relatorio.competencia.replace('/', '_')}.csv` });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: cores.fundo }]}>
      <Text style={styles.title}>📋 e-SUS / SIS Online</Text>
      <Text style={styles.subtitle}>Exportar dados para os sistemas oficiais do SUS</Text>

      {/* Seletor de mês */}
      <View style={styles.mesRow}>
        <TouchableOpacity
          style={styles.mesBtn}
          onPress={() => {
            if (mesSelecionado === 0) {
              setMesSelecionado(11);
              setAnoSelecionado(anoSelecionado - 1);
            } else {
              setMesSelecionado(mesSelecionado - 1);
            }
          }}
        >
          <Text style={styles.mesBtnText}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.mesLabel}>{meses[mesSelecionado]} {anoSelecionado}</Text>
        <TouchableOpacity
          style={styles.mesBtn}
          onPress={() => {
            if (mesSelecionado === 11) {
              setMesSelecionado(0);
              setAnoSelecionado(anoSelecionado + 1);
            } else {
              setMesSelecionado(mesSelecionado + 1);
            }
          }}
        >
          <Text style={styles.mesBtnText}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* Resumo */}
      <View style={styles.cardTotal}>
        <Text style={styles.cardTitle}>{relatorio.competencia}</Text>
      </View>

      <View style={styles.grid}>
        <View style={[styles.card, { backgroundColor: '#FFF3E0' }]}>
          <Text style={styles.cardNum}>{relatorio.totalVisitas}</Text>
          <Text style={styles.cardLabel}>Visitas no mês</Text>
        </View>
        <View style={[styles.card, { backgroundColor: '#E8F5E9' }]}>
          <Text style={styles.cardNum}>{relatorio.pacientesVisitados}</Text>
          <Text style={styles.cardLabel}>Pacientes visitados</Text>
        </View>
      </View>

      {/* Detalhamento SIS */}
      <View style={styles.sisCard}>
        <Text style={styles.sisTitle}>📊 Dados para SIS Online</Text>
        <View style={styles.sisRow}>
          <Text style={styles.sisLabel}>Total de Pacientes:</Text>
          <Text style={styles.sisValor}>{relatorio.totalPacientes}</Text>
        </View>
        <View style={styles.sisRow}>
          <Text style={styles.sisLabel}>Hipertensos:</Text>
          <Text style={styles.sisValor}>{relatorio.hipertensos}</Text>
        </View>
        <View style={styles.sisRow}>
          <Text style={styles.sisLabel}>Diabéticos:</Text>
          <Text style={styles.sisValor}>{relatorio.diabeticos}</Text>
        </View>
        <View style={styles.sisRow}>
          <Text style={styles.sisLabel}>Gestantes:</Text>
          <Text style={styles.sisValor}>{relatorio.gestantes}</Text>
        </View>
        <View style={styles.divisor} />
        <View style={styles.sisRow}>
          <Text style={styles.sisLabel}>Visitas de Rotina:</Text>
          <Text style={styles.sisValor}>{relatorio.visitasPorMotivo.rotina}</Text>
        </View>
        <View style={styles.sisRow}>
          <Text style={styles.sisLabel}>Visitas de Retorno:</Text>
          <Text style={styles.sisValor}>{relatorio.visitasPorMotivo.retorno}</Text>
        </View>
        <View style={styles.sisRow}>
          <Text style={styles.sisLabel}>Visitas por Queixa:</Text>
          <Text style={styles.sisValor}>{relatorio.visitasPorMotivo.queixa}</Text>
        </View>
        <View style={styles.sisRow}>
          <Text style={styles.sisLabel}>Encaminhamentos:</Text>
          <Text style={styles.sisValor}>{relatorio.visitasPorMotivo.encaminhamento}</Text>
        </View>
      </View>

      {/* Botões de exportação */}
      <TouchableOpacity style={styles.btnPrimary} onPress={exportarTexto}>
        <Text style={styles.btnText}>📄 Relatório de Produção (Texto)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnSecondary} onPress={exportarCSV_esus}>
        <Text style={styles.btnSecondaryText}>📊 CSV para SIS Online</Text>
      </TouchableOpacity>

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
    marginBottom: 20,
  },
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
  cardTotal: {
    backgroundColor: '#FF8C00',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
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
  sisCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  sisTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
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
});
