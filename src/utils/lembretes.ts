import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Lembrete {
  id: string;
  pacienteId: string;
  pacienteNome: string;
  data: string;
  hora: string;
  motivo: string;
  criadoEm: string;
  concluido: boolean;
}

const STORAGE_KEY = '@lembretes';

// Carregar lembretes
export async function carregarLembretes(): Promise<Lembrete[]> {
  try {
    const dados = await AsyncStorage.getItem(STORAGE_KEY);
    return dados ? JSON.parse(dados) : [];
  } catch {
    return [];
  }
}

// Salvar lembretes
export async function salvarLembretes(lembretes: Lembrete[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lembretes));
}

// Adicionar lembrete
export async function adicionarLembrete(
  pacienteId: string,
  pacienteNome: string,
  data: string,
  hora: string,
  motivo: string
): Promise<string> {
  const lembretes = await carregarLembretes();
  const novo: Lembrete = {
    id: Date.now().toString(),
    pacienteId,
    pacienteNome,
    data,
    hora,
    motivo,
    criadoEm: new Date().toISOString(),
    concluido: false,
  };
  lembretes.push(novo);
  await salvarLembretes(lembretes);

  // Tenta agendar notificação local se expo-notifications estiver disponível
  try {
    const scheduling = { day: parseInt(data.split('/')[0]), month: parseInt(data.split('/')[1]) - 1, year: parseInt(data.split('/')[2]), hour: parseInt(hora.split(':')[0]), minute: parseInt(hora.split(':')[1]) };
    if (Platform.OS !== 'web') {
      const Notifications = require('expo-notifications');
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 Visita Agendada',
          body: `${pacienteNome} — ${motivo}`,
          data: { pacienteId, lembreteId: novo.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(scheduling.year, scheduling.month, scheduling.day, scheduling.hour, scheduling.minute),
        },
      });
    }
  } catch (e) {
    // expo-notifications não instalado, só salva localmente
    console.log('Notificações não disponíveis:', e);
  }

  return novo.id;
}

// Marcar como concluído
export async function concluirLembrete(id: string): Promise<void> {
  const lembretes = await carregarLembretes();
  const atualizados = lembretes.map(l =>
    l.id === id ? { ...l, concluido: true } : l
  );
  await salvarLembretes(atualizados);
}

// Excluir lembrete
export async function excluirLembrete(id: string): Promise<void> {
  const lembretes = await carregarLembretes();
  await salvarLembretes(lembretes.filter(l => l.id !== id));
}

// Lembretes pendentes (não concluídos e com data futura ou hoje)
export async function lembretesPendentes(): Promise<Lembrete[]> {
  const lembretes = await carregarLembretes();
  const hoje = new Date();
  return lembretes.filter(l => {
    if (l.concluido) return false;
    const partes = l.data.split('/');
    const dataLembrete = new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
    return dataLembrete >= new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  }).sort((a, b) => {
    const da = a.data.split('/').reverse().join('-');
    const db = b.data.split('/').reverse().join('-');
    return da.localeCompare(db) || a.hora.localeCompare(b.hora);
  });
}
