import { Platform } from 'react-native';

let SQLite: any = null;
let db: any = null;

// Só importa expo-sqlite em plataformas nativas (não web)
async function getSQLite() {
  if (!SQLite) {
    if (Platform.OS === 'web') {
      const { getWebDb } = await import('./storage-web');
      return getWebDb();
    }
    SQLite = await import('expo-sqlite');
  }
  return SQLite;
}

export async function getDb(): Promise<any> {
  if (db) return db;

  if (Platform.OS === 'web') {
    const storage = await import('./storage-web');
    db = storage.getWebDb();
    return db;
  }

  const sqlite = await import('expo-sqlite');
  db = await sqlite.openDatabaseAsync('saudegueto.db');
  await initTables(db);
  return db;
}

async function initTables(database: any) {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS familias (
      id TEXT PRIMARY KEY,
      nomeResponsavel TEXT NOT NULL,
      endereco TEXT NOT NULL,
      bairro TEXT,
      microarea TEXT NOT NULL,
      telefone TEXT NOT NULL,
      membros TEXT DEFAULT '[]',
      dataCriacao TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pacientes (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      dataNascimento TEXT,
      cpf TEXT,
      sus TEXT,
      microarea TEXT,
      endereco TEXT,
      telefone TEXT,
      responsavel TEXT,
      comorbidades TEXT,
      observacoes TEXT,
      dataCadastro TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS visitas (
      id TEXT PRIMARY KEY,
      pacienteId TEXT NOT NULL,
      data TEXT NOT NULL,
      tipo TEXT,
      observacoes TEXT,
      realizada INTEGER DEFAULT 0,
      FOREIGN KEY (pacienteId) REFERENCES pacientes(id)
    );

    CREATE TABLE IF NOT EXISTS lembretes (
      id TEXT PRIMARY KEY,
      titulo TEXT NOT NULL,
      descricao TEXT,
      data TEXT NOT NULL,
      tipo TEXT,
      pacienteId TEXT,
      concluido INTEGER DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_visitas_paciente ON visitas(pacienteId);
    CREATE INDEX IF NOT EXISTS idx_visitas_data ON visitas(data);
    CREATE INDEX IF NOT EXISTS idx_pacientes_microarea ON pacientes(microarea);
    CREATE INDEX IF NOT EXISTS idx_familias_microarea ON familias(microarea);
  `);
}

// ===== Famílias =====

export async function listarFamilias(): Promise<any[]> {
  const database = await getDb();
  const rows = await database.getAllAsync('SELECT * FROM familias ORDER BY nomeResponsavel ASC');
  return rows.map((r: any) => ({
    ...r,
    membros: typeof r.membros === 'string' ? JSON.parse(r.membros) : r.membros,
  }));
}

export async function criarFamilia(familia: any): Promise<string> {
  const database = await getDb();
  const id = Date.now().toString();
  const dataCriacao = new Date().toISOString().split('T')[0];
  await database.runAsync(
    'INSERT INTO familias (id, nomeResponsavel, endereco, bairro, microarea, telefone, membros, dataCriacao) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, familia.nomeResponsavel, familia.endereco, familia.bairro || null, familia.microarea, familia.telefone, '[]', dataCriacao]
  );
  return id;
}

export async function atualizarFamilia(id: string, dados: any): Promise<void> {
  const database = await getDb();
  const campos: string[] = [];
  const valores: any[] = [];

  if (dados.nomeResponsavel !== undefined) { campos.push('nomeResponsavel = ?'); valores.push(dados.nomeResponsavel); }
  if (dados.endereco !== undefined) { campos.push('endereco = ?'); valores.push(dados.endereco); }
  if (dados.bairro !== undefined) { campos.push('bairro = ?'); valores.push(dados.bairro); }
  if (dados.microarea !== undefined) { campos.push('microarea = ?'); valores.push(dados.microarea); }
  if (dados.telefone !== undefined) { campos.push('telefone = ?'); valores.push(dados.telefone); }

  if (campos.length === 0) return;
  valores.push(id);
  await database.runAsync(`UPDATE familias SET ${campos.join(', ')} WHERE id = ?`, valores);
}

export async function adicionarMembroFamilia(familiaId: string, pacienteId: string): Promise<void> {
  const database = await getDb();
  const row = await database.getFirstAsync('SELECT membros FROM familias WHERE id = ?', [familiaId]) as any;
  if (!row) return;
  const membros = JSON.parse(row.membros);
  if (!membros.includes(pacienteId)) {
    membros.push(pacienteId);
    await database.runAsync('UPDATE familias SET membros = ? WHERE id = ?', [JSON.stringify(membros), familiaId]);
  }
}

export async function removerMembroFamilia(familiaId: string, pacienteId: string): Promise<void> {
  const database = await getDb();
  const row = await database.getFirstAsync('SELECT membros FROM familias WHERE id = ?', [familiaId]) as any;
  if (!row) return;
  const membros = JSON.parse(row.membros).filter((id: string) => id !== pacienteId);
  await database.runAsync('UPDATE familias SET membros = ? WHERE id = ?', [JSON.stringify(membros), familiaId]);
}

export async function excluirFamilia(id: string): Promise<void> {
  const database = await getDb();
  await database.runAsync('DELETE FROM familias WHERE id = ?', [id]);
}

export async function buscarFamiliaPorPaciente(pacienteId: string): Promise<any> {
  const database = await getDb();
  const rows = await database.getAllAsync('SELECT * FROM familias WHERE membros LIKE ?', [`%"${pacienteId}"%`]);
  if (rows.length === 0) return null;
  const r = rows[0] as any;
  return { ...r, membros: JSON.parse(r.membros) };
}

export async function buscarFamiliasPorMicroarea(microarea: string): Promise<any[]> {
  const database = await getDb();
  const rows = await database.getAllAsync('SELECT * FROM familias WHERE microarea = ? ORDER BY nomeResponsavel ASC', [microarea]);
  return rows.map((r: any) => ({ ...r, membros: JSON.parse(r.membros) }));
}

// ===== Pacientes =====

export async function listarPacientes(): Promise<any[]> {
  const database = await getDb();
  return database.getAllAsync('SELECT * FROM pacientes ORDER BY nome ASC');
}

export async function criarPaciente(paciente: any): Promise<string> {
  const database = await getDb();
  const id = Date.now().toString();
  const dataCadastro = new Date().toISOString().split('T')[0];
  await database.runAsync(
    `INSERT INTO pacientes (id, nome, dataNascimento, cpf, sus, microarea, endereco, telefone, responsavel, comorbidades, observacoes, dataCadastro)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, paciente.nome, paciente.dataNascimento || null, paciente.cpf || null, paciente.sus || null,
     paciente.microarea || null, paciente.endereco || null, paciente.telefone || null,
     paciente.responsavel || null, paciente.comorbidades || null, paciente.observacoes || null, dataCadastro]
  );
  return id;
}

export async function atualizarPaciente(id: string, dados: any): Promise<void> {
  const database = await getDb();
  const campos: string[] = [];
  const valores: any[] = [];

  for (const [key, value] of Object.entries(dados)) {
    if (value !== undefined) {
      campos.push(`${key} = ?`);
      valores.push(value);
    }
  }
  if (campos.length === 0) return;
  valores.push(id);
  await database.runAsync(`UPDATE pacientes SET ${campos.join(', ')} WHERE id = ?`, valores);
}

export async function excluirPaciente(id: string): Promise<void> {
  const database = await getDb();
  await database.runAsync('DELETE FROM pacientes WHERE id = ?', [id]);
}

// ===== Visitas =====

export async function listarVisitas(pacienteId?: string): Promise<any[]> {
  const database = await getDb();
  if (pacienteId) {
    return database.getAllAsync('SELECT * FROM visitas WHERE pacienteId = ? ORDER BY data DESC', [pacienteId]);
  }
  return database.getAllAsync('SELECT * FROM visitas ORDER BY data DESC');
}

export async function criarVisita(visita: any): Promise<string> {
  const database = await getDb();
  const id = Date.now().toString();
  await database.runAsync(
    'INSERT INTO visitas (id, pacienteId, data, tipo, observacoes, realizada) VALUES (?, ?, ?, ?, ?, ?)',
    [id, visita.pacienteId, visita.data, visita.tipo || null, visita.observacoes || null, visita.realizada ? 1 : 0]
  );
  return id;
}

// ===== Lembretes =====

export async function listarLembretes(): Promise<any[]> {
  const database = await getDb();
  return database.getAllAsync('SELECT * FROM lembretes ORDER BY data ASC');
}

export async function criarLembrete(lembrete: any): Promise<string> {
  const database = await getDb();
  const id = Date.now().toString();
  await database.runAsync(
    'INSERT INTO lembretes (id, titulo, descricao, data, tipo, pacienteId, concluido) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, lembrete.titulo, lembrete.descricao || null, lembrete.data, lembrete.tipo || null, lembrete.pacienteId || null, 0]
  );
  return id;
}

// ===== Migração do AsyncStorage =====

export async function migrarDoAsyncStorage(): Promise<{ familias: number; pacientes: number; visitas: number; lembretes: number }> {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  const database = await getDb();
  const counts = { familias: 0, pacientes: 0, visitas: 0, lembretes: 0 };

  try {
    // Famílias
    const famData = await AsyncStorage.getItem('@familias');
    if (famData) {
      const familias = JSON.parse(famData);
      for (const f of familias) {
        await database.runAsync(
          'INSERT OR IGNORE INTO familias (id, nomeResponsavel, endereco, bairro, microarea, telefone, membros, dataCriacao) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [f.id, f.nomeResponsavel, f.endereco, f.bairro || null, f.microarea, f.telefone, JSON.stringify(f.membros || []), f.dataCriacao]
        );
        counts.familias++;
      }
    }

    // Pacientes
    const pacData = await AsyncStorage.getItem('@pacientes');
    if (pacData) {
      const pacientes = JSON.parse(pacData);
      for (const p of pacientes) {
        await database.runAsync(
          'INSERT OR IGNORE INTO pacientes (id, nome, dataNascimento, cpf, sus, microarea, endereco, telefone, responsavel, comorbidades, observacoes, dataCadastro) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [p.id, p.nome, p.dataNascimento || null, p.cpf || null, p.sus || null, p.microarea || null, p.endereco || null, p.telefone || null, p.responsavel || null, p.comorbidades || null, p.observacoes || null, p.dataCadastro]
        );
        counts.pacientes++;
      }
    }

    // Visitas
    const visData = await AsyncStorage.getItem('@visitas');
    if (visData) {
      const visitas = JSON.parse(visData);
      for (const v of visitas) {
        await database.runAsync(
          'INSERT OR IGNORE INTO visitas VALUES (?, ?, ?, ?, ?, ?)',
          [v.id, v.pacienteId, v.data, v.tipo || null, v.observacoes || null, v.realizada ? 1 : 0]
        );
        counts.visitas++;
      }
    }

    // Lembretes
    const lemData = await AsyncStorage.getItem('@lembretes');
    if (lemData) {
      const lembretes = JSON.parse(lemData);
      for (const l of lembretes) {
        await database.runAsync(
          'INSERT OR IGNORE INTO lembretes VALUES (?, ?, ?, ?, ?, ?, ?)',
          [l.id, l.titulo, l.descricao || null, l.data, l.tipo || null, l.pacienteId || null, l.concluido ? 1 : 0]
        );
        counts.lembretes++;
      }
    }
  } catch (e) {
    console.error('Erro na migração:', e);
  }

  return counts;
}
