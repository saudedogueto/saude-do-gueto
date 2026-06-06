import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert
} from 'react-native';
import { usePacientes } from '@/src/contexts/PacienteContext';
import { useVisitas, Visita } from '@/src/contexts/VisitaContext';
import { useTema } from '@/src/contexts/TemaContext';
import { useToast } from '@/src/components/Toast';
import { ConfirmDialog } from '@/src/components/ConfirmDialog';
import { router } from 'expo-router';

type PacienteComVisitas = {
  id: string;
  nome: string;
  microarea?: string;
  visitas: Visita[];
  ultimaVisita?: Visita;
};

export default function HistoricoVisitasScreen() {
  const { carregarPacientes } = usePacientes();
  const { visitas, carregarVisitas, excluirVisita } = useVisitas();
  const { cores } = useTema();
  const { showToast } = useToast();
  const [pacientesVisitas, setPacientesVisitas] = useState<PacienteComVisitas[]>([]);
  const [excluirConfirm, setExcluirConfirm] = useState<Visita | null>(null);
  const [expandido, setExpandido] = useState<string | null>(null);

  useEffect(() => {
    carregarPacientes();
    carregarVisitas();
  }, []);

  useEffect(() => {
    // Agrupar visitas por paciente
    const mapa = new Map<string, PacienteComVisitas>();
    visitas.forEach(v => {
      if (!mapa.has(v.pacienteId)) {
        mapa.set(v.pacienteId, {
          id: v.pacienteId,
          nome: v.pacienteNome || 'Paciente',
          visitas: [],
        });
      }
      mapa.get(v.pacienteId)!.visitas.push(v);
    });

    // Ordenar: quem tem mais visitas primeiro
    const lista = Array.from(mapa.values())
      .map(p => ({
        ...p,
        visitas: p.visitas.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()),
        ultimaVisita: p.visitas[0],
      }))
      .sort((a, b) => b.visitas.length - a.visitas.length);

    setPacientesVisitas(lista);
  }, [visitas]);

  const handleExcluir = (visita: Visita) => {
    setExcluirConfirm(visita);
  };

  const formatarMotivo = (motivo: string | undefined) => {
    const map: Record<string, string> = {
      rotina: 'Rotina',
      retorno: 'Retorno',
      queixa: 'Queixa',
      encaminhamento: 'Encaminhamento',
      outro: 'Outro',
    };
    return map[motivo || ''] || motivo || '';
  };

  const renderItem = ({ item }: { item: PacienteComVisitas }) => {
    const expanded = expandido === item.id;
    return (
      <View style={[styles.card, { backgroundColor: cores.card, borderColor: cores.borda }]}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => setExpandido(expanded ? null : item.id)}
        >
          <View>
            <Text style={[styles.nome, { color: cores.texto }]}>{item.nome}</Text>
            <Text style={[styles.resumo, { color: cores.textoSecundario }]}>
              {item.visitas.length} visita{item.visitas.length !== 1 ? 's' : ''}
              {item.ultimaVisita ? ` • Última: ${item.ultimaVisita.data}` : ''}
            </Text>
          </View>
          <Text style={[styles.seta, { color: cores.primary }]}>{expanded ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {expanded && (
          <View style={[styles.visitasLista, { borderTopColor: cores.borda }]}>
            {item.visitas.map(v => (
              <TouchableOpacity
                key={v.id}
                style={[styles.visitaItem, { borderBottomColor: cores.borda }]}
                onLongPress={() => handleExcluir(v)}
              >
                <View style={styles.visitaHeader}>
                  <Text style={[styles.visitaData, { color: cores.texto }]}>{v.data}</Text>
                  <Text style={[styles.visitaHora, { color: cores.textoSecundario }]}>{v.hora}</Text>
                  <View style={[styles.motivoTag, { backgroundColor: 'rgba(0, 230, 118, 0.15)' }]}>
                    <Text style={[styles.motivoTagText, { color: cores.primary }]}>
                      {formatarMotivo(v.motivo)}
                    </Text>
                  </View>
                </View>

                {(v.pressaoSistolica || v.glicemia) && (
                  <View style={styles.sinaisRow}>
                    {v.pressaoSistolica && (
                      <Text style={[styles.sinal, { color: cores.textoSecundario }]}>
                        PA: {v.pressaoSistolica}/{v.pressaoDiastolica || '?'}
                      </Text>
                    )}
                    {v.glicemia && (
                      <Text style={[styles.sinal, { color: cores.textoSecundario }]}>Glic: {v.glicemia}</Text>
                    )}
                  </View>
                )}

                {v.vacinaEmDia !== undefined && (
                  <Text style={[styles.vacinaStatus, { color: cores.textoSecundario }]}>
                    Vacinas: {v.vacinaEmDia ? '✅ Em dia' : '❌ Atrasada'}
                  </Text>
                )}

                {v.observacoes ? (
                  <Text style={[styles.obs, { color: cores.textoSecundario }]} numberOfLines={2}>{v.observacoes}</Text>
                ) : null}

                {v.proximaVisita ? (
                  <Text style={[styles.proxVisita, { color: cores.primary }]}>📅 Próx: {v.proximaVisita}</Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: cores.fundo }]}>
      {pacientesVisitas.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🏠</Text>
          <Text style={[styles.emptyText, { color: cores.textoSecundario }]}>Nenhuma visita registrada ainda</Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: cores.primary }]}
            onPress={() => router.push('/(tabs)/visita')}
          >
            <Text style={[styles.buttonText, { color: '#0B1220' }]}>+ Registrar Visita</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={pacientesVisitas}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <ConfirmDialog
        visivel={excluirConfirm !== null}
        titulo="Excluir Visita"
        mensagem={`Excluir visita de ${excluirConfirm?.pacienteNome} em ${excluirConfirm?.data}?`}
        confirmarTexto="Excluir"
        tipo="danger"
        onConfirmar={async () => {
          if (excluirConfirm) {
            await excluirVisita(excluirConfirm.id);
            carregarVisitas();
            showToast('Visita excluída');
          }
          setExcluirConfirm(null);
        }}
        onCancelar={() => setExcluirConfirm(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  nome: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  resumo: {
    fontSize: 13,
    marginTop: 3,
  },
  seta: {
    fontSize: 12,
  },
  visitasLista: {
    borderTopWidth: 1,
  },
  visitaItem: {
    padding: 14,
    borderBottomWidth: 1,
  },
  visitaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  visitaData: {
    fontSize: 14,
    fontWeight: '600',
  },
  visitaHora: {
    fontSize: 12,
  },
  motivoTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  motivoTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sinaisRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 4,
  },
  sinal: {
    fontSize: 13,
  },
  vacinaStatus: {
    fontSize: 13,
    marginBottom: 4,
  },
  obs: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
  },
  proxVisita: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
