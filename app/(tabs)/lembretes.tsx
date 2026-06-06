import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, RefreshControl
} from 'react-native';
import { useTema } from '@/src/contexts/TemaContext';
import { carregarLembretes, concluirLembrete, excluirLembrete, Lembrete } from '@/src/utils/lembretes';
import { router } from 'expo-router';
import { useToast } from '@/src/components/Toast';
import { ConfirmDialog } from '@/src/components/ConfirmDialog';
import { NeonButton } from '../../src/components/NeonButton';

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
      style={{ flex: 1, padding: 15, backgroundColor: cores.fundo }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text
        style={{
          fontSize: 22,
          fontWeight: 'bold',
          textAlign: 'center',
          marginTop: 15,
          marginBottom: 20,
          color: cores.primary,
        }}
      >
        🔔 Lembretes
      </Text>

      {pendentes.length === 0 && concluidos.length === 0 && (
        <View style={{ alignItems: 'center', paddingVertical: 50 }}>
          <Text style={{ fontSize: 16, color: cores.textoSecundario }}>Nenhum lembrete</Text>
          <Text
            style={{
              fontSize: 13,
              textAlign: 'center',
              marginTop: 8,
              paddingHorizontal: 40,
              color: cores.textoSecundario,
            }}
          >
            Os lembretes são criados automaticamente quando você agenda uma próxima visita
          </Text>
        </View>
      )}

      {/* Pendentes */}
      {pendentes.length > 0 && (
        <>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              marginBottom: 12,
              color: cores.texto,
            }}
          >
            📌 Pendentes ({pendentes.length})
          </Text>
          {pendentes.map(item => {
            const isToday = item.data === hojeStr;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  {
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 10,
                    elevation: 2,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.3,
                    shadowRadius: 3,
                    backgroundColor: cores.card,
                  },
                  isToday && {
                    borderLeftWidth: 4,
                    borderLeftColor: '#FF5252',
                  },
                ]}
                onLongPress={() => handleExcluir(item)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '600',
                        marginBottom: 4,
                        color: cores.texto,
                      }}
                    >
                      {item.pacienteNome}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        marginBottom: 2,
                        color: cores.textoSecundario,
                      }}
                    >
                      📅 {item.data} às {item.hora}
                      {isToday ? ' 🔴 Hoje!' : ''}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: cores.textoSecundario,
                      }}
                    >
                      {item.motivo === 'retorno' ? '🔙 Retorno' : item.motivo}
                    </Text>
                  </View>
                  <NeonButton
                    titulo="✓"
                    cor={cores.primary}
                    onPress={() => handleConcluir(item.id)}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      marginLeft: 10,
                      paddingVertical: 0,
                      paddingHorizontal: 0,
                    }}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </>
      )}

      {/* Concluídos */}
      {concluidos.length > 0 && (
        <>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              marginBottom: 12,
              marginTop: 20,
              color: cores.texto,
            }}
          >
            ✅ Concluídos ({concluidos.length})
          </Text>
          {concluidos.map(item => (
            <View
              key={item.id}
              style={{
                borderRadius: 12,
                padding: 14,
                marginBottom: 10,
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.3,
                shadowRadius: 3,
                backgroundColor: cores.card,
                opacity: 0.5,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  marginBottom: 4,
                  color: cores.texto,
                  textDecorationLine: 'line-through',
                }}
              >
                {item.pacienteNome}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  marginBottom: 2,
                  color: cores.textoSecundario,
                }}
              >
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
