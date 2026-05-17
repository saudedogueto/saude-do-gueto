import React from 'react';
import { Stack } from 'expo-router';
import { TemaProvider } from '@/src/contexts/TemaContext';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { PacienteProvider } from '@/src/contexts/PacienteContext';
import { VisitaProvider } from '@/src/contexts/VisitaContext';
import { FamiliaProvider } from '@/src/contexts/FamiliaContext';

export default function RootLayout() {
  return (
    <TemaProvider>
    <AuthProvider>
      <PacienteProvider>
        <VisitaProvider>
        <FamiliaProvider>
        <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
        </Stack>
        </FamiliaProvider>
        </VisitaProvider>
      </PacienteProvider>
    </AuthProvider>
    </TemaProvider>
  );
}
