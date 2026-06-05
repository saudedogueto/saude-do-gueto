let cacheCoordenadas = new Map<string, { latitude: number; longitude: number }>();

export async function geocodificar(endereco: string): Promise<{ latitude: number; longitude: number } | null> {
  if (!endereco) return null;

  const chave = endereco.trim().toLowerCase();
  if (cacheCoordenadas.has(chave)) {
    return cacheCoordenadas.get(chave)!;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(endereco)}&format=json&limit=1&countrycodes=br`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'SaudeDoGueto/2.1 (saudedogueto@gmail.com)' }
    });
    const data = await response.json();

    if (data && data.length > 0) {
      const coord = {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
      cacheCoordenadas.set(chave, coord);
      return coord;
    }
    return null;
  } catch {
    return null;
  }
}

export function limparCache() {
  cacheCoordenadas = new Map();
}
