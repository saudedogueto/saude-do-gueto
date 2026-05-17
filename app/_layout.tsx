import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { TemaProvider } from '@/src/contexts/TemaContext';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { PacienteProvider } from '@/src/contexts/PacienteContext';
import { VisitaProvider } from '@/src/contexts/VisitaContext';
import { FamiliaProvider } from '@/src/contexts/FamiliaContext';
import { ToastProvider } from '@/src/components/Toast';
import { useFamiliaStore } from '@/src/store/familiaStore';
import { usePacienteStore } from '@/src/store/pacienteStore';
import { useMigracao } from '@/src/hooks/useMigracao';

function DataLoader({ children }: { children: React.ReactNode }) {
  const carregarFamilias = useFamiliaStore(s => s.carregar);
  const carregarPacientes = usePacienteStore(s => s.carregar);
  const { status } = useMigracao();

  useEffect(() => {
    if (status === 'pronto') {
      carregarFamilias();
      carregarPacientes();
    }
  }, [status]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <TemaProvider>
    <AuthProvider>
      <PacienteProvider>
        <VisitaProvider>
        <FamiliaProvider>
        <ToastProvider>
        <DataLoader>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
        </Stack>
        </DataLoader>
        </ToastProvider>
        </FamiliaProvider>
        </VisitaProvider>
      </PacienteProvider>
    </AuthProvider>
    </TemaProvider>
  );
}
