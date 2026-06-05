import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

type Props = {
  latitude?: number;
  longitude?: number;
  endereco: string;
  onSelecionar: (lat: number, lng: number) => void;
};

export default function SeletorMapa({ latitude, longitude, endereco, onSelecionar }: Props) {
  const [visivel, setVisivel] = useState(false);
  const [tempLat, setTempLat] = useState(latitude || -15.7939);
  const [tempLng, setTempLng] = useState(longitude || -47.8828);

  const abrir = () => {
    if (latitude && longitude) {
      setTempLat(latitude);
      setTempLng(longitude);
    }
    setVisivel(true);
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
            <Text style={styles.headerSub}>{endereco || 'Toque no mapa para marcar'}</Text>
          </View>

          <MapView
            style={styles.mapa}
            initialRegion={{
              latitude: tempLat,
              longitude: tempLng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation
            onPress={(e) => {
              setTempLat(e.nativeEvent.coordinate.latitude);
              setTempLng(e.nativeEvent.coordinate.longitude);
            }}
          >
            <Marker
              coordinate={{ latitude: tempLat, longitude: tempLng }}
              draggable
              onDragEnd={(e) => {
                setTempLat(e.nativeEvent.coordinate.latitude);
                setTempLng(e.nativeEvent.coordinate.longitude);
              }}
            />
          </MapView>

          <View style={styles.footer}>
            <Text style={styles.coordText}>
              {tempLat.toFixed(5)}, {tempLng.toFixed(5)}
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
                onPress={() => {
                  onSelecionar(tempLat, tempLng);
                  setVisivel(false);
                }}
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

const { height } = Dimensions.get('window');

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
    paddingTop: 20,
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
  mapa: {
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
