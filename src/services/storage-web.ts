/**
 * Web fallback: usa AsyncStorage quando SQLite não está disponível (navegador)
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORE_PREFIX = '@sqlite_';

async function getItem(key: string): Promise<string | null> {
  return AsyncStorage.getItem(STORE_PREFIX + key);
}

async function setItem(key: string, value: string): Promise<void> {
  await AsyncStorage.setItem(STORE_PREFIX + key, value);
}

async function removeItem(key: string): Promise<void> {
  await AsyncStorage.removeItem(STORE_PREFIX + key);
}

// Simula a API do SQLite para web
export function getWebDb(): { execAsync: Function; runAsync: Function; getAllAsync: (sql: string, params?: any[]) => Promise<any[]>; getFirstAsync: (sql: string, params?: any[]) => Promise<any> } {
  return {
    execAsync: async (sql: string) => {
      // Na web, ignoramos DDL (CREATE TABLE) e usamos AsyncStorage
      console.log('[WebDB] SQL ignorado (DDL):', sql.substring(0, 50));
    },
    runAsync: async (sql: string, params?: any[]) => {
      const operation = sql.trim().substring(0, 6).toUpperCase();
      const tableMatch = sql.match(/FROM\s+(\w+)|INTO\s+(\w+)/i);
      const table = tableMatch?.[1] || tableMatch?.[2] || 'unknown';

      if (operation === 'INSERT') {
        const data = await getItem(table) || '[]';
        const rows = JSON.parse(data);
        const id = params?.[0] || Date.now().toString();
        const newRow: any = { id };
        const columns = sql.match(/\(([^)]+)\)/)?.[1]?.split(',').map(c => c.trim()) || [];
        columns.forEach((col: string, i: number) => {
          newRow[col] = params?.[i];
        });
        rows.push(newRow);
        await setItem(table, JSON.stringify(rows));
        return { lastInsertRowId: parseInt(id) };
      }

      if (operation === 'UPDATE') {
        const data = await getItem(table) || '[]';
        let rows = JSON.parse(data);
        const idIndex = sql.indexOf('WHERE id = ?');
        if (idIndex >= 0) {
          const id = params?.[params.length - 1];
          const setClause = sql.substring(sql.indexOf('SET') + 3, idIndex).trim();
          const updates = setClause.split(',').map((s: string) => {
            const [col] = s.split('=').map((c: string) => c.trim());
            return col;
          });
          rows = rows.map((r: any) => {
            if (r.id === id) {
              updates.forEach((col: string, i: number) => {
                r[col] = params?.[i];
              });
            }
            return r;
          });
        }
        await setItem(table, JSON.stringify(rows));
        return;
      }

      if (operation === 'DELETE') {
        const data = await getItem(table) || '[]';
        let rows = JSON.parse(data);
        const idIndex = sql.indexOf('WHERE id = ?');
        if (idIndex >= 0) {
          const id = params?.[0];
          rows = rows.filter((r: any) => r.id !== id);
        }
        await setItem(table, JSON.stringify(rows));
        return;
      }

      if (operation === 'SELECT') {
        const data = await getItem(table) || '[]';
        return JSON.parse(data);
      }
    },
    getAllAsync: async (sql: string, params?: any[]) => {
      const tableMatch = sql.match(/FROM\s+(\w+)/i);
      const table = tableMatch?.[1] || 'unknown';
      const data = await getItem(table) || '[]';
      let rows = JSON.parse(data);

      // Filtro simples por WHERE ... = ?
      const whereMatch = sql.match(/WHERE\s+(\w+)\s*=\s*\?/i);
      if (whereMatch && params?.length) {
        const col = whereMatch[1];
        rows = rows.filter((r: any) => r[col] === params[0]);
      }

      // LIKE
      const likeMatch = sql.match(/WHERE\s+(\w+)\s+LIKE\s+\?/i);
      if (likeMatch && params?.length) {
        const col = likeMatch[1];
        const pattern = params[0].replace(/%/g, '');
        rows = rows.filter((r: any) => {
          const val = r[col];
          if (typeof val === 'string') return val.includes(pattern);
          if (Array.isArray(val)) return val.some((v: any) => String(v).includes(pattern));
          return false;
        });
      }

      // ORDER BY
      const orderMatch = sql.match(/ORDER\s+BY\s+(\w+)\s+(ASC|DESC)/i);
      if (orderMatch) {
        const col = orderMatch[1];
        const dir = orderMatch[2].toUpperCase();
        rows.sort((a: any, b: any) => {
          if (dir === 'ASC') return a[col] > b[col] ? 1 : -1;
          return a[col] < b[col] ? 1 : -1;
        });
      }

      return rows;
    },
    getFirstAsync: async (sql: string, params?: any[]) => {
      const rows = await this.getAllAsync(sql, params);
      return rows[0] || null;
    },
  };
}
