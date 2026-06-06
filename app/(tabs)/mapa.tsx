/**
 * mapa.tsx — Mapa Territorial (Leaflet + OpenStreetMap)
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Linking, Platform,
  ActivityIndicator, useWindowDimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useFamilias } from '@/src/contexts/FamiliaContext';
import { usePacientes } from '@/src/contexts/PacienteContext';
import { useTema } from '@/src/contexts/TemaContext';
import { router } from 'expo-router';
import { geocodificar } from '@/src/services/geocoding';
import MapaLeaflet, { PinInfo } from '@/src/components/MapaLeaflet';
import { NeonButton } from '../../src/components/NeonButton';

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
  return '#6B7280';
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
  return Array.from(todas).join(' • ');
}

export default function MapaSocialScreen() {
  const { familias, carregarFamilias } = useFamilias();
  const { pacientes, carregarPacientes } = usePacientes();
  const { cores } = useTema();
  const [pins, setPins] = useState<PinInfo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [pinSelecionado, setPinSelecionado] = useState<PinInfo | null>(null);
  const { width, height } = useWindowDimensions();

  useFocusEffect(useCallback(() => {
    carregarFamilias();
    carregarPacientes();
  }, []));

  useEffect(() => {
    async function geolocalizar() {
      setCarregando(true);
      setPins([]);

      const resultados: PinInfo[] = [];

      for (const familia of familias) {
        if (!familia.endereco) continue;

        let coord: { latitude: number; longitude: number } | null = null;

        if ((familia as any).latitude && (familia as any).longitude) {
          coord = { latitude: (familia as any).latitude, longitude: (familia as any).longitude };
        }

        if (!coord) {
          coord = await geocodificar(
            `${familia.endereco}, ${familia.bairro || ''}, Brasil`
          );
        }

        if (coord) {
          const membros = (familia.membros || [])
            .map((id: string) => pacientes.find(p => p.id === id))
            .filter(Boolean);

          const corPin = getCorPin(membros);

          resultados.push({
            id: familia.id,
            coordinate: coord,
            pinColor: corPin,
            titulo: familia.nomeResponsavel,
            endereco: familia.endereco,
            condicoes: membros.length > 0 ? getCondicoesTexto(membros) : '',
            telefone: familia.telefone || '',
          });
        }

        if (!(familia as any).latitude && familias.indexOf(familia) < familias.length - 1) {
          await new Promise(r => setTimeout(r, 150));
        }
      }

      setPins(resultados);
      setCarregando(false);
    }

    if (familias.length > 0) {
      geolocalizar();
    } else {
      setCarregando(false);
    }
  }, [familias, pacientes]);

  const handlePinPress = useCallback((pin: PinInfo) => {
    setPinSelecionado(pin);
  }, []);

  const abrirRota = (pin: PinInfo) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${pin.coordinate.latitude},${pin.coordinate.longitude}`,
      android: `geo:0,0?q=${pin.coordinate.latitude},${pin.coordinate.longitude}(${encodeURIComponent(pin.endereco)})`,
    });
    if (url) {
      Linking.openURL(url).catch(() => {
        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${pin.coordinate.latitude},${pin.coordinate.longitude}`);
      });
    }
  };

  const initialRegion = {
    latitude: pins.length > 0 ? pins[0].coordinate.latitude : -15.7939,
    longitude: pins.length > 0 ? pins[0].coordinate.longitude : -47.8828,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={[styles.container, { backgroundColor: cores.fundo }]}>
      {carregando ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={cores.primary} />
          <Text style={[styles.loadingText, { color: cores.texto }]}>Geolocalizando famílias...</Text>
          <Text style={[styles.loadingSub, { color: cores.textoSecundario }]}>Isso pode levar alguns segundos</Text>
        </View>
      ) : (
        <>
          <MapaLeaflet
            pins={pins}
            initialRegion={initialRegion}
            onPinPress={handlePinPress}
            showsUserLocation
          />

          {/* Legenda */}
          <View style={[styles.legenda, { backgroundColor: cores.card, borderColor: cores.borda }]}>
            {Object.entries(CORES_PIN).map(([cond, cor]) => (
              <View key={cond} style={styles.legendaItem}>
                <View style={[styles.legendaBolinha, { backgroundColor: cor }]} />
                <Text style={[styles.legendaTexto, { color: cores.texto }]}>{getLegenda(cor)}</Text>
              </View>
            ))}
            <View style={styles.legendaItem}>
              <View style={[styles.legendaBolinha, { backgroundColor: '#6B7280' }]} />
              <Text style={[styles.legendaTexto, { color: cores.texto }]}>Sem condição</Text>
            </View>
          </View>

          {/* Contador */}
          <View style={[styles.contador, { backgroundColor: cores.card, borderColor: cores.borda }]}>
            <Text style={[styles.contadorTexto, { color: cores.texto }]}>
              🏠 {pins.length} de {familias.length} famílias
            </Text>
          </View>

          {/* Card inferior */}
          {pinSelecionado && (
            <View style={[styles.card, { backgroundColor: cores.card }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitulo, { color: cores.texto }]}>
                  {pinSelecionado.titulo}
                </Text>
                <TouchableOpacity onPress={() => setPinSelecionado(null)}>
                  <Text style={[styles.cardFechar, { color: cores.textoSecundario }]}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.cardSub, { color: cores.textoSecundario }]}>
                {pinSelecionado.endereco}
              </Text>

              {pinSelecionado.condicoes ? (
                <View style={styles.cardCondicoes}>
                  <Text style={[styles.condicoesTexto, { color: cores.primary }]}>
                    {pinSelecionado.condicoes}
                  </Text>
                </View>
              ) : null}

              <View style={styles.cardBotoes}>
                <NeonButton
                  titulo="📍 Ver Rota"
                  onPress={() => abrirRota(pinSelecionado)}
                  cor="#FFFFFF"
                  fullWidth
                />
                <NeonButton
                  titulo="Detalhes"
                  onPress={() => router.push('/(tabs)/familias')}
                  cor="#FFFFFF"
                  fullWidth
                />
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
}

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
  },
  loadingSub: {
    marginTop: 4,
    fontSize: 13,
  },
  // Legenda
  legenda: {
    position: 'absolute',
    top: 50,
    right: 10,
    borderRadius: 10,
    padding: 10,
    gap: 6,
    borderWidth: 1,
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
    fontWeight: '500',
  },
  // Contador
  contador: {
    position: 'absolute',
    top: 50,
    left: 10,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  contadorTexto: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Card inferior
  card: {
    position: 'absolute',
    bottom: 20,
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
    flex: 1,
  },
  cardFechar: {
    fontSize: 18,
    paddingLeft: 12,
  },
  cardSub: {
    fontSize: 13,
    marginTop: 2,
  },
  cardCondicoes: {
    marginTop: 8,
  },
  condicoesTexto: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardBotoes: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
});
