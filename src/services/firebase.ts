import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc,
  query,
  where,
  Timestamp,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyARikLUJl5tdYqlATP0yEnEVwwdJ2-HXf4",
  authDomain: "saude-do-gueto-bdf5b.firebaseapp.com",
  databaseURL: "https://saude-do-gueto-bdf5b-default-rtdb.firebaseio.com",
  projectId: "saude-do-gueto-bdf5b",
  storageBucket: "saude-do-gueto-bdf5b.firebasestorage.app",
  messagingSenderId: "402541236464",
  appId: "1:402541236464:web:15f01b87972ced6d06f235",
  measurementId: "G-P0KJFQPFCX"
};

let app: any = null;
let db: any = null;
let auth: any = null;

export async function initFirebase() {
  if (app) return { app, db, auth };
  
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    console.log('[Firebase] Inicializado com sucesso');
    return { app, db, auth };
  } catch (error) {
    console.error('[Firebase] Erro ao inicializar:', error);
    throw error;
  }
}

export function getFirebaseDb() {
  if (!db) throw new Error('Firebase não inicializado. Chame initFirebase() primeiro.');
  return db;
}

export function getFirebaseAuth() {
  if (!auth) throw new Error('Firebase não inicializado. Chame initFirebase() primeiro.');
  return auth;
}

// ===== Autenticação =====

export async function loginFirebase(email: string, senha: string) {
  const authInstance = getFirebaseAuth();
  return signInWithEmailAndPassword(authInstance, email, senha);
}

export async function cadastrarUsuario(email: string, senha: string) {
  const authInstance = getFirebaseAuth();
  return createUserWithEmailAndPassword(authInstance, email, senha);
}

export async function logoutFirebase() {
  const authInstance = getFirebaseAuth();
  return firebaseSignOut(authInstance);
}

export function observarAuth(callback: (user: User | null) => void) {
  const authInstance = getFirebaseAuth();
  return onAuthStateChanged(authInstance, callback);
}

// ===== Utilitários de data =====

function paraFirestoreDate(data: string): Timestamp {
  return Timestamp.fromDate(new Date(data));
}

function deFirestoreDate(timestamp: any): string {
  if (!timestamp) return new Date().toISOString().split('T')[0];
  if (timestamp.toDate) return timestamp.toDate().toISOString().split('T')[0];
  return timestamp;
}

// ===== Sincronização =====

export async function syncParaFirestore(colecao: string, dados: any[]) {
  const dbInstance = getFirebaseDb();
  
  try {
    const batch = writeBatch(dbInstance);
    let count = 0;

    for (const item of dados) {
      if (!item.id) continue;
      
      const ref = doc(dbInstance, colecao, item.id);
      const dadosLimpos = { ...item };
      
      // Converte datas string pra Timestamp
      if (dadosLimpos.dataCriacao) dadosLimpos.dataCriacao = paraFirestoreDate(dadosLimpos.dataCriacao);
      if (dadosLimpos.dataCadastro) dadosLimpos.dataCadastro = paraFirestoreDate(dadosLimpos.dataCadastro);
      if (dadosLimpos.data) dadosLimpos.data = paraFirestoreDate(dadosLimpos.data);
      if (dadosLimpos.dataNascimento) dadosLimpos.dataNascimento = paraFirestoreDate(dadosLimpos.dataNascimento);
      
      dadosLimpos.syncAt = serverTimestamp();
      
      batch.set(ref, dadosLimpos, { merge: true });
      count++;
    }

    await batch.commit();
    console.log(`[Firebase] Sync concluído: ${count} registros em "${colecao}"`);
    return { success: true, count };
  } catch (error) {
    console.error(`[Firebase] Erro no sync de "${colecao}":`, error);
    return { success: false, error, count: 0 };
  }
}

export async function syncDoFirestore(colecao: string): Promise<any[]> {
  const dbInstance = getFirebaseDb();
  
  try {
    const querySnapshot = await getDocs(collection(dbInstance, colecao));
    const dados: any[] = [];
    
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const item = { id: docSnap.id, ...data };
      
      // Converte Timestamps de volta pra string
      if (item.dataCriacao) item.dataCriacao = deFirestoreDate(item.dataCriacao);
      if (item.dataCadastro) item.dataCadastro = deFirestoreDate(item.dataCadastro);
      if (item.data) item.data = deFirestoreDate(item.data);
      if (item.dataNascimento) item.dataNascimento = deFirestoreDate(item.dataNascimento);
      
      delete item.syncAt;
      
      dados.push(item);
    });
    
    console.log(`[Firebase] Download concluído: ${dados.length} registros de "${colecao}"`);
    return dados;
  } catch (error) {
    console.error(`[Firebase] Erro no download de "${colecao}":`, error);
    return [];
  }
}

export async function sincronizarTudo(
  dadosLocais: { familias: any[]; pacientes: any[]; visitas: any[]; lembretes: any[] }
): Promise<{ 
  familias: { enviados: number }; 
  pacientes: { enviados: number }; 
  visitas: { enviados: number }; 
  lembretes: { enviados: number };
}> {
  const resultados = {
    familias: { enviados: 0 },
    pacientes: { enviados: 0 },
    visitas: { enviados: 0 },
    lembretes: { enviados: 0 },
  };

  // Envia dados locais pra nuvem
  const rFamilias = await syncParaFirestore('familias', dadosLocais.familias);
  const rPacientes = await syncParaFirestore('pacientes', dadosLocais.pacientes);
  const rVisitas = await syncParaFirestore('visitas', dadosLocais.visitas);
  const rLembretes = await syncParaFirestore('lembretes', dadosLocais.lembretes);

  resultados.familias.enviados = rFamilias.count;
  resultados.pacientes.enviados = rPacientes.count;
  resultados.visitas.enviados = rVisitas.count;
  resultados.lembretes.enviados = rLembretes.count;

  return resultados;
}
