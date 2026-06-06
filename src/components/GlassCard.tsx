/**
 * GlassCard.tsx — Card com efeito glassmorphism
 *
 * Fundo translúcido com blur, borda sutil, sombra neon.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  neonColor?: string;
}

export function GlassCard({ children, style, neonColor }: Props) {
  return (
    <View
      style={[
        styles.card,
        neonColor ? { borderColor: neonColor, shadowColor: neonColor } : {},
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});
