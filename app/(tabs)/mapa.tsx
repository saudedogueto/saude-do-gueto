import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Linking, Platform,
  ActivityIndicator, Dimensions
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import { useFamilias } from '@/src/contexts/FamiliaContext';
import { usePacientes } from '@/src/contexts/PacienteContext';
import { useTema } from '@/src/contexts/TemaContext';
import { router } from 'expo-router';
import { geocodificar } from '@/src/services/geocoding';

type FamiliaComCoords = {
  id: string;
  nomeResponsavel: string;
  endereco: string;
  telefone: string;
  latitude: number;
  longitude: number;
  membros: any[];
};

type Condicao = 'hipertensao' | 'diabetes' | 'gestante' | 'menorDoisAnos';

const CORES_PIN: Record<string, string> = {
  hipertensao: '#EF4444',
  diabetes: '#3B82F6',
  gestante: '#EC4899',
  menorDoisAnos: '#10B981',
};

function getCondicoes(p: any): Condicao[] {
  const conds: Condicao[] = [];
  if (p.hipertensao) conds.push('hipertensao');
  if (p.diabetes) conds.push('diabetes');
  if (p.gestante) conds.push('gestante');
  if (p.menorDoisAnos) conds.push('menorDoisAnos');
  return conds;
}

function getCorPin(membros: any[]): string {
  const todas = new Set<Condicao>();
  for (const m of membros) {
    for (const c of getCondicoes(m)) todas.add(c);
  }
  if (todas.has('gestante')) return CORES_PIN.gestante;
  if (todas.has('menorDoisAnos')) return CORES_PIN.menorDoisAnos;
  if (todas.has('hipertensao')) return CORES_PIN.hipertensao;
  if (todas.has('diabetes')) return CORES_PIN.diabetes;
  return '#6B7280'; // cinza — sem condição especial
}

function getLegenda(cor: string): string {
  const entry = Object.entries(CORES_PIN).find(([, c]) => c === cor);
  if (!entry) return 'Sem condição especial';
  const mapa: Record<string, string> = {
    hipertensao: 'Hipertenso',
    diabetes: 'Diabético',
    gestante: 'Gestante',
    menorDoisAnos: '< 2 anos',
  };
  return mapa[entry[0]] || 'Sem condição';
}

function getCondicoesTexto(membros: any[]): string {
  const todas = new Set<string>();
  for (const m of membros) {
    for (const c of getCondicoes(m)) {
      const mapa: Record<string, string> = {
        hipertensao: 'HAS',
        diabetes: 'DM',
        gestante: 'Gestante',
        menorDoisAnos: '<2a',
      };
      todas.add(mapa[c]);
    }
  }
  return Array.from(todas).join(' · ');
}

export default function MapaSocialScreen() {
  const { familias, carregarFamilias } = useFamilias();
  const { pacientes, carregarPacientes } = usePacientes();
  const { cores } = useTema();
  const [familiasMapa, setFamiliasMapa] = useState<FamiliaComCoords[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [familiaSelecionada, setFamiliaSelecionada] = useState<FamiliaComCoords | null>(null);
  const mapRef = useRef<MapView>(null);

  useFocusEffect(useCallback(() => {
    carregarFamilias();
    carregarPacientes();
  }, []));

  useEffect(() => {
    async function geolocalizar() {
      setCarregando(true);
      setFamiliasMapa([]);

      const resultados: FamiliaComCoords[] = [];

      for (const familia of familias) {
        if (!familia.endereco) continue;

        let coord: { latitude: number; longitude: number } | null = null;

        // 1. Usa coordenada manual se existir
        if (familia.latitude && familia.longitude) {
          coord = { latitude: familia.latitude, longitude: familia.longitude };
        }

        // 2. Fallback: tenta geocodificar endereço
        if (!coord) {
          coord = await geocodificar(
            `${familia.endereco}, ${familia.bairro || ''}, Brasil`
          );
        }

        if (coord) {
          const membros = (familia.membros || [])
            .map((id: string) => pacientes.find(p => p.id === id))
            .filter(Boolean);

          resultados.push({
            id: familia.id,
            nomeResponsavel: familia.nomeResponsavel,
            endereco: familia.endereco,
            telefone: familia.telefone || '',
            ...coord,
            membros,
          });
        }

        // Pequena pausa pra não sobrecarregar Nominatim
        if (!familia.latitude && familias.indexOf(familia) < familias.length - 1) {
          await new Promise(r => setTimeout(r, 150));
        }
      }

      setFamiliasMapa(resultados);
      setCarregando(false);
    }

    if (familias.length > 0) {
      geolocalizar();
    } else {
      setCarregando(false);
    }
  }, [familias, pacientes]);

  const abrirRota = (familia: FamiliaComCoords) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${familia.latitude},${familia.longitude}`,
      android: `geo:0,0?q=${familia.latitude},${familia.longitude}(${encodeURIComponent(familia.endereco)})`,
    });
    if (url) {
      Linking.openURL(url).catch(() => {
        // Fallback pro Google Maps web
        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${familia.latitude},${familia.longitude}`);
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: cores.fundo }]}>
      {carregando ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#FF8C00" />
          <Text style={styles.loadingText}>Geolocalizando famílias...</Text>
          <Text style={styles.loadingSub}>Isso pode levar alguns segundos</Text>
        </View>
      ) : (
        <>
          <MapView
            ref={mapRef}
            style={styles.mapa}
            provider={undefined} // Usa Apple Maps no iOS, Google Maps no Android
            initialRegion={{
              latitude: familiasMapa.length > 0 ? familiasMapa[0].latitude : -15.7939,
              longitude: familiasMapa.length > 0 ? familiasMapa[0].longitude : -47.8828,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            showsUserLocation
            showsCompass
          >
            {familiasMapa.map((fam) => {
              const corPin = getCorPin(fam.membros);
              return (
                <Marker
                  key={fam.id}
                  coordinate={{ latitude: fam.latitude, longitude: fam.longitude }}
                  pinColor={corPin}
                  onPress={() => setFamiliaSelecionada(fam)}
                >
                  <Callout>
                    <View style={styles.callout}>
                      <Text style={styles.calloutNome}>{fam.nomeResponsavel}</Text>
                      <Text style={styles.calloutEnd}>{fam.endereco}</Text>
                      {fam.membros.length > 0 && (
                        <Text style={styles.calloutCond}>
                          {getCondicoesTexto(fam.membros)}
                        </Text>
                      )}
                      {fam.telefone ? (
                        <Text style={styles.calloutTel}>📞 {fam.telefone}</Text>
                      ) : null}
                    </View>
                  </Callout>
                </Marker>
              );
            })}
          </MapView>

          {/* Card inferior */}
          {familiaSelecionada && (
            <View style={[styles.card, { backgroundColor: cores.card }]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitulo}>{familiaSelecionada.nomeResponsavel}</Text>
                <TouchableOpacity onPress={() => setFamiliaSelecionada(null)}>
                  <Text style={styles.cardFechar}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.cardSub}>{familiaSelecionada.endereco}</Text>

              {/* Tags de condições */}
              {familiaSelecionada.membros.length > 0 && (
                <View style={styles.cardTags}>
                  {Array.from(new Set(familiaSelecionada.membros.flatMap(m =>
                    getCondicoes(m)
                  ))).map((cond, i) => (
                    <View key={i} style={[styles.tag, { backgroundColor: CORES_PIN[cond] + '20' }]}>
                      <View style={[styles.tagBolinha, { backgroundColor: CORES_PIN[cond] }]} />
                      <Text style={[styles.tagTexto, { color: CORES_PIN[cond] }]}>
                        {getLegenda(CORES_PIN[cond])}
                      </Text>
                    </View>
                  ))}
                  {familiaSelecionada.membros.filter(m =>
                    getCondicoes(m).length === 0
                  ).length > 0 && (
                    <View style={[styles.tag, { backgroundColor: '#6B728020' }]}>
                      <View style={[styles.tagBolinha, { backgroundColor: '#6B7280' }]} />
                      <Text style={[styles.tagTexto, { color: '#6B7280' }]}>
                        Sem condição
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Botões */}
              <View style={styles.cardBotoes}>
                <TouchableOpacity
                  style={styles.botaoRota}
                  onPress={() => abrirRota(familiaSelecionada)}
                >
                  <Text style={styles.botaoRotaTexto}>🗺️ Ver Rota</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.botaoDetalhes}
                  onPress={() => router.push('/(tabs)/familias')}
                >
                  <Text style={styles.botaoDetalhesTexto}>Detalhes</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Legenda */}
          <View style={styles.legenda}>
            {Object.entries(CORES_PIN).map(([cond, cor]) => (
              <View key={cond} style={styles.legendaItem}>
                <View style={[styles.legendaBolinha, { backgroundColor: cor }]} />
                <Text style={styles.legendaTexto}>{getLegenda(cor)}</Text>
              </View>
            ))}
            <View style={styles.legendaItem}>
              <View style={[styles.legendaBolinha, { backgroundColor: '#6B7280' }]} />
              <Text style={styles.legendaTexto}>Sem condição</Text>
            </View>
          </View>

          {/* Contador */}
          <View style={styles.contador}>
            <Text style={styles.contadorTexto}>
              📍 {familiasMapa.length} de {familias.length} famílias no mapa
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  loadingSub: {
    marginTop: 4,
    fontSize: 13,
    color: '#999',
  },
  mapa: {
    flex: 1,
  },
  // ===== Callout =====
  callout: {
    minWidth: 160,
    padding: 4,
  },
  calloutNome: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111',
  },
  calloutEnd: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  calloutCond: {
    fontSize: 11,
    color: '#FF8C00',
    fontWeight: '600',
    marginTop: 4,
  },
  calloutTel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  // ===== Card inferior =====
  card: {
    position: 'absolute',
    bottom: 80,
    left: 12,
    right: 12,
    borderRadius: 16,
    padding: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF8C00',
    flex: 1,
  },
  cardFechar: {
    fontSize: 18,
    color: '#999',
    paddingLeft: 12,
  },
  cardSub: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  cardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  tagBolinha: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tagTexto: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardBotoes: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  botaoRota: {
    flex: 1,
    backgroundColor: '#FF8C00',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  botaoRotaTexto: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  botaoDetalhes: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  botaoDetalhesTexto: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 14,
  },
  // ===== Legenda =====
  legenda: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    padding: 10,
    gap: 6,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  legendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendaBolinha: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendaTexto: {
    fontSize: 11,
    color: '#444',
    fontWeight: '500',
  },
  // ===== Contador =====
  contador: {
    position: 'absolute',
    top: 50,
    left: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contadorTexto: {
    fontSize: 12,
    color: '#444',
    fontWeight: '500',
  },
});
