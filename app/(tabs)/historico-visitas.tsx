import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert
} from 'react-native';
import { usePacientes } from '@/src/contexts/PacienteContext';
import { useVisitas, Visita } from '@/src/contexts/VisitaContext';
import { useTema } from '@/src/contexts/TemaContext';
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
  const [pacientesVisitas, setPacientesVisitas] = useState<PacienteComVisitas[]>([]);
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
          nome: v.pacienteNome,
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
    Alert.alert(
      'Excluir Visita',
      `Excluir visita de ${visita.pacienteNome} em ${visita.data}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await excluirVisita(visita.id);
            carregarVisitas();
          }
        }
      ]
    );
  };

  const formatarMotivo = (motivo: string) => {
    const map: Record<string, string> = {
      rotina: 'Rotina',
      retorno: 'Retorno',
      queixa: 'Queixa',
      encaminhamento: 'Encaminhamento',
      outro: 'Outro',
    };
    return map[motivo] || motivo;
  };

  const renderItem = ({ item }: { item: PacienteComVisitas }) => {
    const expanded = expandido === item.id;
    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => setExpandido(expanded ? null : item.id)}
        >
          <View>
            <Text style={styles.nome}>{item.nome}</Text>
            <Text style={styles.resumo}>
              {item.visitas.length} visita{item.visitas.length !== 1 ? 's' : ''}
              {item.ultimaVisita ? ` • Última: ${item.ultimaVisita.data}` : ''}
            </Text>
          </View>
          <Text style={styles.seta}>{expanded ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {expanded && (
          <View style={styles.visitasLista}>
            {item.visitas.map(v => (
              <TouchableOpacity
                key={v.id}
                style={styles.visitaItem}
                onLongPress={() => handleExcluir(v)}
              >
                <View style={styles.visitaHeader}>
                  <Text style={styles.visitaData}>{v.data}</Text>
                  <Text style={styles.visitaHora}>{v.hora}</Text>
                  <View style={[styles.motivoTag, { backgroundColor: '#FFF3E0' }]}>
                    <Text style={styles.motivoTagText}>
                      {formatarMotivo(v.motivo)}
                    </Text>
                  </View>
                </View>

                {(v.pressaoSistolica || v.glicemia) && (
                  <View style={styles.sinaisRow}>
                    {v.pressaoSistolica && (
                      <Text style={styles.sinal}>
                        PA: {v.pressaoSistolica}/{v.pressaoDiastolica || '?'}
                      </Text>
                    )}
                    {v.glicemia && (
                      <Text style={styles.sinal}>Glic: {v.glicemia}</Text>
                    )}
                  </View>
                )}

                {v.vacinaEmDia !== undefined && (
                  <Text style={styles.vacinaStatus}>
                    Vacinas: {v.vacinaEmDia ? '✅ Em dia' : '❌ Atrasada'}
                  </Text>
                )}

                {v.observacoes ? (
                  <Text style={styles.obs} numberOfLines={2}>{v.observacoes}</Text>
                ) : null}

                {v.proximaVisita ? (
                  <Text style={styles.proxVisita}>📅 Próx: {v.proximaVisita}</Text>
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
          <Text style={styles.emptyText}>Nenhuma visita registrada ainda</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/(tabs)/visita')}
          >
            <Text style={styles.buttonText}>+ Registrar Visita</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    padding: 15,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
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
    color: '#222',
  },
  resumo: {
    fontSize: 13,
    color: '#999',
    marginTop: 3,
  },
  seta: {
    fontSize: 12,
    color: '#FF8C00',
  },
  visitasLista: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  visitaItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
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
    color: '#333',
  },
  visitaHora: {
    fontSize: 12,
    color: '#999',
  },
  motivoTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  motivoTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E65100',
  },
  sinaisRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 4,
  },
  sinal: {
    fontSize: 13,
    color: '#555',
  },
  vacinaStatus: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
  },
  obs: {
    fontSize: 13,
    color: '#777',
    fontStyle: 'italic',
    marginTop: 4,
  },
  proxVisita: {
    fontSize: 12,
    color: '#FF8C00',
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
    color: '#999',
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FF8C00',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
