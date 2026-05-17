import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { migrarDoAsyncStorage } from '../services/database';

const MIGRATION_KEY = '@migracao_sqlite_ok';

export function useMigracao() {
  const [status, setStatus] = useState<'idle' | 'migrando' | 'pronto' | 'erro'>('idle');
  const [counts, setCounts] = useState<{ familias: number; pacientes: number; visitas: number; lembretes: number } | null>(null);

  useEffect(() => {
    async function checkAndMigrate() {
      try {
        const jaMigrou = await AsyncStorage.getItem(MIGRATION_KEY);
        if (jaMigrou === 'true') {
          setStatus('pronto');
          return;
        }

        // Verifica se tem dados pra migrar
        const famData = await AsyncStorage.getItem('@familias');
        const pacData = await AsyncStorage.getItem('@pacientes');
        const visData = await AsyncStorage.getItem('@visitas');
        const lemData = await AsyncStorage.getItem('@lembretes');

        if (!famData && !pacData && !visData && !lemData) {
          await AsyncStorage.setItem(MIGRATION_KEY, 'true');
          setStatus('pronto');
          return;
        }

        setStatus('migrando');
        const result = await migrarDoAsyncStorage();
        await AsyncStorage.setItem(MIGRATION_KEY, 'true');
        setCounts(result);
        setStatus('pronto');
      } catch (e) {
        console.error('Erro na migração:', e);
        setStatus('erro');
      }
    }

    checkAndMigrate();
  }, []);

  return { status, counts };
}
