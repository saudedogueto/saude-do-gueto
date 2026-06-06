/**
 * NeonButton.tsx — Botão com fundo sólido e brilho
 *
 * Design profissional: fundo na cor, texto branco, sombra.
 */

import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Platform,
  Vibration,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface Props {
  titulo: string;
  icone?: string;
  onPress: () => void;
  cor?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function NeonButton({
  titulo,
  icone,
  onPress,
  cor = '#00B860',
  style,
  textStyle,
  fullWidth = false,
}: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
    if (Platform.OS !== 'web') {
      Vibration.vibrate(10);
    }
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, fullWidth && styles.fullWidth]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.button,
          cor === '#FFFFFF'
            ? { backgroundColor: '#FFFFFF', borderColor: '#D0D2DE' }
            : { backgroundColor: cor + '15', borderColor: cor + '40' },
          style,
        ]}
      >
        {icone && <Text style={styles.icone}>{icone}</Text>}
        <Text style={[styles.texto, { color: cor === '#FFFFFF' ? '#1A1A2E' : cor }, textStyle]}>
          {titulo}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  icone: {
    fontSize: 18,
    marginRight: 8,
  },
  texto: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
