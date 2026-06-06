/**
 * MapaLeaflet.tsx — Mapa territorial usando Leaflet + OpenStreetMap via WebView
 *
 * Substitui react-native-maps para funcionar sem chave de API.
 * Usa tiles gratuitos do OpenStreetMap.
 * Suporta pins coloridos por condição, callout, cache de tiles.
 */

import React, { useRef, useCallback, useMemo } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

type Coord = { latitude: number; longitude: number };

export type PinInfo = {
  id: string;
  coordinate: Coord;
  pinColor: string;
  titulo: string;
  endereco: string;
  condicoes: string;
  telefone: string;
};

type Props = {
  pins: PinInfo[];
  initialRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  onPinPress?: (pin: PinInfo) => void;
  showsUserLocation?: boolean;
};

const HTML_TEMPLATE = `
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
  .custom-marker {
    width: 22px; height: 22px; border-radius: 50%; border: 3px solid white;
    box-shadow: 0 1px 4px rgba(0,0,0,0.3); cursor: pointer;
  }
  .leaflet-popup-content-wrapper { border-radius: 10px; padding: 2px; }
  .leaflet-popup-content { margin: 8px 12px; font-family: -apple-system, sans-serif; }
  .popup-nome { font-weight: bold; font-size: 14px; color: #333; }
  .popup-end { font-size: 12px; color: #666; margin-top: 2px; }
  .popup-cond { font-size: 11px; color: #FF8C00; font-weight: 600; margin-top: 4px; }
  .popup-tel { font-size: 11px; color: #666; margin-top: 2px; }
</style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map', {
    zoomControl: true,
    attributionControl: false,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Cache de tiles para navegação offline parcial (Service Worker seria melhor, mas isso já ajuda)
  // Os tiles do OSM são cacheados pelo navegador nativamente via HTTP cache.

  var markers = {};

  function addPins(pins) {
    for (var id in markers) {
      map.removeLayer(markers[id]);
    }
    markers = {};

    if (!pins || pins.length === 0) return;

    for (var i = 0; i < pins.length; i++) {
      var p = pins[i];
      var cor = p.pinColor || '#6B7280';

      var icone = L.divIcon({
        className: '',
        html: '<div class="custom-marker" style="background-color:' + cor + '"></div>',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
        popupAnchor: [0, -14],
      });

      var marker = L.marker([p.coordinate.latitude, p.coordinate.longitude], { icon: icone })
        .addTo(map);

      var condHtml = p.condicoes ? '<div class="popup-cond">' + p.condicoes + '</div>' : '';
      var telHtml = p.telefone ? '<div class="popup-tel">📞 ' + p.telefone + '</div>' : '';

      marker.bindPopup(
        '<div class="popup-nome">' + p.titulo + '</div>' +
        '<div class="popup-end">' + p.endereco + '</div>' +
        condHtml + telHtml
      );

      marker.on('click', function(pinData) {
        return function() {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'pinPress',
              pin: pinData
            }));
          }
        };
      }(p));

      markers[p.id] = marker;
    }

    // Ajusta zoom para caber todos os pins
    if (pins.length > 0) {
      var group = L.featureGroup(Object.values(markers));
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }

  // Recebe pins do React Native
  window.addEventListener('message', function(e) {
    try {
      var data = JSON.parse(e.data);
      if (data.type === 'setPins') {
        addPins(data.pins);
      } else if (data.type === 'setCenter') {
        map.setView([data.latitude, data.longitude], data.zoom || 15);
      }
    } catch(err) {}
  });

  // Sinaliza que o mapa carregou
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
  }
</script>
</body>
</html>
`;

export default function MapaLeaflet({ pins, initialRegion, onPinPress, showsUserLocation }: Props) {
  const webViewRef = useRef<WebView>(null);

  const pinsJson = useMemo(() => JSON.stringify(pins), [pins]);

  const handleMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'ready') {
        // Mapa carregou — envia os pins
        webViewRef.current?.postMessage(JSON.stringify({
          type: 'setPins',
          pins: pins,
        }));
      } else if (data.type === 'pinPress' && data.pin && onPinPress) {
        onPinPress(data.pin);
      }
    } catch {}
  }, [pins, onPinPress]);

  // Se os pins mudarem, atualiza no WebView
  React.useEffect(() => {
    webViewRef.current?.postMessage(JSON.stringify({
      type: 'setPins',
      pins: pins,
    }));
  }, [pinsJson]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        style={styles.webview}
        source={{ html: HTML_TEMPLATE }}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        onMessage={handleMessage}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        // Cache policy pra tiles não expirarem rápido
        cacheEnabled
        cacheMode="LOAD_DEFAULT"
        // Geolocalização pro botão "minha localização"
        geolocationEnabled={showsUserLocation}
        allowFileAccess
        mixedContentMode="always"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
