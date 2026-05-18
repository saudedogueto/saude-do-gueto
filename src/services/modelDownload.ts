/**
 * modelDownload.ts — Download e Cache do Modelo de IA
 *
 * Gerencia o download do modelo quantizado (Phi-3 Mini Q4 ~700MB).
 * Baixado uma vez via WiFi, armazenado no cache do app.
 *
 * TODO: Integrar com react-native-executorch quando disponível.
 */

import { ModeloState, ModeloStatus } from '../ai/tipos';

// ========== Config ==========

const MODELO_URL = 'https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-q4.gguf';
const MODELO_FILENAME = 'phi-3-mini-q4.gguf';
const MODELO_HASH_ESPERADO = ''; // TODO: preencher após download de teste

// ========== Estado ==========

let _state: ModeloState = {
  status: 'nao_baixado',
  progresso: 0,
};

export function getModeloState(): ModeloState {
  return { ..._state };
}

// ========== Verificação ==========

/**
 * Verifica se o modelo já está baixado no dispositivo.
 */
export async function verificarModeloLocal(): Promise<boolean> {
  try {
    // TODO: usar expo-file-system para checar FileSystem.documentDirectory + MODELO_FILENAME
    // const fileInfo = await FileSystem.getInfoAsync(
    //   `${FileSystem.documentDirectory}${MODELO_FILENAME}`
    // );
    // return fileInfo.exists;
    return false;
  } catch {
    return false;
  }
}

/**
 * Calcula o hash SHA-256 de um arquivo local.
 * Usado para verificar integridade do download.
 */
export async function verificarIntegridade(_caminho: string): Promise<boolean> {
  if (!MODELO_HASH_ESPERADO) return true; // skip se não configurado
  // TODO: implementar hash check com expo-crypto ou módulo nativo
  return true;
}

// ========== Download ==========

/**
 * Inicia o download do modelo.
 * Retorna true se completo, false se falhou.
 */
export async function baixarModelo(
  onProgress?: (progresso: number) => void
): Promise<boolean> {
  _state.status = 'baixando';
  _state.progresso = 0;
  _state.tamanhoMB = 700; // estimativa

  try {
    // TODO: Implementar download com expo-file-system
    // const downloadResumable = FileSystem.createDownloadResumable(
    //   MODELO_URL,
    //   `${FileSystem.documentDirectory}${MODELO_FILENAME}`,
    //   {},
    //   (downloadProgress) => {
    //     const progress =
    //       downloadProgress.totalBytesExpectedToWrite > 0
    //         ? Math.round(
    //             (downloadProgress.totalBytesWritten /
    //               downloadProgress.totalBytesExpectedToWrite) *
    //               100
    //           )
    //         : 0;
    //     _state.progresso = progress;
    //     onProgress?.(progress);
    //   }
    // );
    // const result = await downloadResumable.downloadAsync();

    // Simulação de progresso
    for (let i = 0; i <= 100; i += 10) {
      _state.progresso = i;
      onProgress?.(i);
      await new Promise((r) => setTimeout(r, 100));
    }

    _state.status = 'pronto';
    _state.progresso = 100;
    return true;
  } catch (error) {
    _state.status = 'erro';
    _state.progresso = 0;
    console.error('[ModelDownload] Erro no download:', error);
    return false;
  }
}

/**
 * Remove o modelo baixado (libera espaço).
 */
export async function removerModelo(): Promise<boolean> {
  try {
    // TODO: FileSystem.deleteAsync(`${FileSystem.documentDirectory}${MODELO_FILENAME}`);
    _state.status = 'nao_baixado';
    _state.progresso = 0;
    return true;
  } catch {
    _state.status = 'erro';
    return false;
  }
}

/**
 * Retorna o tamanho estimado do modelo.
 */
export function getTamanhoModeloMB(): number {
  return _state.tamanhoMB || 700;
}
