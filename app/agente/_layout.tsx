import { Stack } from 'expo-router';

export default function AgenteLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="chat"
        options={{
          title: 'Agente de Saúde',
          headerStyle: { backgroundColor: '#FF8C00' },
          headerTintColor: '#FFF',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Stack.Screen
        name="config"
        options={{
          title: 'Configurar Modelo',
          headerStyle: { backgroundColor: '#FF8C00' },
          headerTintColor: '#FFF',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
    </Stack>
  );
}
