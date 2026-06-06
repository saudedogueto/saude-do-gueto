/**
 * SeletorMapaLeaflet.tsx — Modal de seleção de ponto no mapa
 *
 * Substitui o SeletorMapa antigo que usava react-native-maps.
 * Usa Leaflet via WebView.
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal,
  Dimensions, Platform
} from 'react-native';
import { WebView } from 'react-native-webview';

type Props = {
  latitude?: number;
  longitude?: number;
  endereco: string;
  onSelecionar: (lat: number, lng: number) => void;
};

const HTML_SELETOR = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body, #map { width: 100%; height: 100%; overflow: hidden; }
  .pin-centro {
    position: absolute; top: 50%; left: 50%;
    width: 30px; height: 30px;
    margin-left: -15px; margin-top: -30px;
    z-index: 1000; pointer-events: none;
  }
  .pin-centro::before {
    content: '📍';
    font-size: 30px;
  }
  .coords-box {
    position: absolute; bottom: 20px; left: 10px; right: 10px;
    background: rgba(255,255,255,0.95);
    border-radius: 10px; padding: 10px;
    text-align: center; font-size: 13px; color: #666;
    font-family: monospace; z-index: 1000;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
</style>
</head>
<body>
<div id="map"></div>
<div class="pin-centro"></div>
<div class="coords-box" id="coords">Arraste o mapa para posicionar o marcador</div>
<script>
  var map = L.map('map', {
    zoomControl: true,
    attributionControl: false,
    center: [-15.7939, -47.8828],
    zoom: 15,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: ''
  }).addTo(map);

  function emitCoords() {
    var center = map.getCenter();
    var msg = JSON.stringify({
      type: 'coordsChanged',
      latitude: center.lat,
      longitude: center.lng
    });
    document.getElementById('coords').textContent =
      center.lat.toFixed(5) + ', ' + center.lng.toFixed(5);
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(msg);
    }
  }

  map.on('moveend', emitCoords);
  map.on('load', function() {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
    }
    emitCoords();
  });

  window.addEventListener('message', function(e) {
    try {
      var data = JSON.parse(e.data);
      if (data.type === 'setCenter') {
        map.setView([data.latitude, data.longitude], 16);
        emitCoords();
      }
    } catch(err) {}
  });
</script>
</body>
</html>
`;

export default function SeletorMapaLeaflet({ latitude, longitude, endereco, onSelecionar }: Props) {
  const [visivel, setVisivel] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const coordRef = useRef({ latitude: latitude || -15.7939, longitude: longitude || -47.8828 });

  const handleMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'coordsChanged') {
        coordRef.current = {
          latitude: data.latitude,
          longitude: data.longitude,
        };
      } else if (data.type === 'ready') {
        if (latitude && longitude) {
          webViewRef.current?.postMessage(JSON.stringify({
            type: 'setCenter',
            latitude,
            longitude,
          }));
        }
      }
    } catch {}
  }, [latitude, longitude]);

  const abrir = () => setVisivel(true);

  const confirmar = () => {
    onSelecionar(coordRef.current.latitude, coordRef.current.longitude);
    setVisivel(false);
  };

  return (
    <>
      <TouchableOpacity style={styles.botao} onPress={abrir}>
        <Text style={styles.botaoTexto}>
          {latitude && longitude ? '📍 Ponto marcado' : '📍 Marcar no mapa'}
        </Text>
        {latitude && longitude && (
          <Text style={styles.coordenadas}>
            {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </Text>
        )}
      </TouchableOpacity>

      <Modal visible={visivel} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Marque a localização</Text>
            <Text style={styles.headerSub}>{endereco || 'Arraste o mapa para posicionar'}</Text>
          </View>

          <View style={styles.mapaContainer}>
            <WebView
              ref={webViewRef}
              style={styles.webview}
              source={{ html: HTML_SELETOR }}
              javaScriptEnabled
              domStorageEnabled
              originWhitelist={['*']}
              onMessage={handleMessage}
              scrollEnabled={false}
              bounces={false}
              overScrollMode="never"
              cacheEnabled
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.coordText}>
              {latitude?.toFixed(5) || '---'}, {longitude?.toFixed(5) || '---'}
            </Text>
            <View style={styles.footerActions}>
              <TouchableOpacity
                style={styles.btnCancelar}
                onPress={() => setVisivel(false)}
              >
                <Text style={styles.btnCancelarText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnConfirmar}
                onPress={confirmar}
              >
                <Text style={styles.btnConfirmarText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  botao: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
  },
  botaoTexto: {
    fontSize: 15,
    color: '#FF8C00',
    fontWeight: '600',
  },
  coordenadas: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSub: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  mapaContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  coordText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  footerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  btnCancelar: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnCancelarText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 15,
  },
  btnConfirmar: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#FF8C00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnConfirmarText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
