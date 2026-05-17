import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, RefreshControl
} from 'react-native';
import { useTema } from '@/src/contexts/TemaContext';
import { carregarLembretes, concluirLembrete, excluirLembrete, Lembrete } from '@/src/utils/lembretes';
import { router } from 'expo-router';

export default function LembretesScreen() {
  const { cores } = useTema();
  const { showToast } = useToast();
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [excluirConfirm, setExcluirConfirm] = useState<Lembrete | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const todos = await carregarLembretes();
    // Ordenar: pendentes primeiro, depois por data
    const ordenados = todos.sort((a, b) => {
      if (a.concluido !== b.concluido) return a.concluido ? 1 : -1;
      const da = a.data.split('/').reverse().join('-');
      const db = b.data.split('/').reverse().join('-');
      return da.localeCompare(db) || a.hora.localeCompare(b.hora);
    });
    setLembretes(ordenados);
  }, []);

  useEffect(() => { load(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleConcluir = async (id: string) => {
    await concluirLembrete(id);
    load();
    showToast('Lembrete concluído!');
  };

  const handleExcluir = (item: Lembrete) => {
    setExcluirConfirm(item);
  };

  const hoje = new Date();
  const hojeStr = `${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`;

  const pendentes = lembretes.filter(l => !l.concluido);
  const concluidos = lembretes.filter(l => l.concluido);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: cores.fundo }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>🔔 Lembretes</Text>

      {pendentes.length === 0 && concluidos.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Nenhum lembrete</Text>
          <Text style={styles.emptySub}>
            Os lembretes são criados automaticamente quando você agenda uma próxima visita
          </Text>
        </View>
      )}

      {/* Pendentes */}
      {pendentes.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>📌 Pendentes ({pendentes.length})</Text>
          {pendentes.map(item => {
            const isToday = item.data === hojeStr;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.card, { backgroundColor: cores.card }, isToday && styles.cardHoje]}
                onLongPress={() => handleExcluir(item)}
              >
                <View style={styles.cardRow}>
                  <View style={styles.cardInfo}>
                    <Text style={[styles.pacienteNome, { color: cores.texto }]}>
                      {item.pacienteNome}
                    </Text>
                    <Text style={[styles.data, { color: cores.textoSecundario }]}>
                      📅 {item.data} às {item.hora}
                      {isToday ? ' 🔴 Hoje!' : ''}
                    </Text>
                    <Text style={[styles.motivo, { color: cores.textoSecundario }]}>
                      {item.motivo === 'retorno' ? '🔙 Retorno' : item.motivo}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.checkBtn}
                    onPress={() => handleConcluir(item.id)}
                  >
                    <Text style={styles.checkText}>✓</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </>
      )}

      {/* Concluídos */}
      {concluidos.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
            ✅ Concluídos ({concluidos.length})
          </Text>
          {concluidos.map(item => (
            <View key={item.id} style={[styles.card, { backgroundColor: cores.card, opacity: 0.5 }]}>
              <Text style={[styles.pacienteNome, { color: cores.texto, textDecorationLine: 'line-through' }]}>
                {item.pacienteNome}
              </Text>
              <Text style={[styles.data, { color: cores.textoSecundario }]}>
                📅 {item.data} às {item.hora}
              </Text>
            </View>
          ))}
        </>
      )}

      <View style={{ height: 40 }} />

      <ConfirmDialog
        visivel={excluirConfirm !== null}
        titulo="Excluir Lembrete"
        mensagem={`Excluir lembrete de ${excluirConfirm?.pacienteNome}?`}
        confirmarTexto="Excluir"
        tipo="danger"
        onConfirmar={async () => {
          if (excluirConfirm) {
            await excluirLembrete(excluirConfirm.id);
            load();
            showToast('Lembrete excluído');
          }
          setExcluirConfirm(null);
        }}
        onCancelar={() => setExcluirConfirm(null)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF8C00',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHoje: {
    borderLeftWidth: 4,
    borderLeftColor: '#E53935',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  pacienteNome: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  data: {
    fontSize: 13,
    marginBottom: 2,
  },
  motivo: {
    fontSize: 13,
  },
  checkBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  checkText: {
    fontSize: 20,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  emptySub: {
    fontSize: 13,
    color: '#CCC',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
});
