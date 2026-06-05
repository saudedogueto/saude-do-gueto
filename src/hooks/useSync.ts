import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { initFirebase, sincronizarTudo } from '../services/firebase';
import { 
  listarFamilias, 
  listarPacientes, 
  listarVisitas, 
  listarLembretes 
} from '../services/database';

interface SyncState {
  syncing: boolean;
  lastSync: Date | null;
  error: string | null;
  resultados: any;
}

export function useSync() {
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>({
    syncing: false,
    lastSync: null,
    error: null,
    resultados: null,
  });

  // Inicializa Firebase
  useEffect(() => {
    let mounted = true;

    async function setup() {
      try {
        await initFirebase();
        if (mounted) setFirebaseReady(true);
      } catch (error) {
        console.warn('[Sync] Firebase não disponível (offline ou sem permissão)');
      }
    }

    setup();
    return () => { mounted = false; };
  }, []);

  const sincronizar = useCallback(async () => {
    if (!firebaseReady) {
      setSyncState(prev => ({ ...prev, error: 'Firebase não está disponível' }));
      return;
    }

    setSyncState(prev => ({ ...prev, syncing: true, error: null, resultados: null }));

    try {
      // Pega dados do SQLite local
      const familias = await listarFamilias();
      const pacientes = await listarPacientes();
      const visitas = await listarVisitas();
      const lembretes = await listarLembretes();

      // Sincroniza com Firebase
      const resultados = await sincronizarTudo({
        familias,
        pacientes,
        visitas,
        lembretes,
      });

      setSyncState({
        syncing: false,
        lastSync: new Date(),
        error: null,
        resultados,
      });
    } catch (error: any) {
      setSyncState(prev => ({
        ...prev,
        syncing: false,
        error: error?.message || 'Erro ao sincronizar',
        resultados: null,
      }));
    }
  }, [firebaseReady]);

  return {
    firebaseReady,
    ...syncState,
    sincronizar,
  };
}
