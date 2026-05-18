import { Stack } from 'expo-router';

export default function TabsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="login"
        options={{
          title: 'Login',
          headerShown: false
        }}
      />
      <Stack.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          headerBackTitle: 'Voltar',
          headerTintColor: '#FF8C00',
        }}
      />
      <Stack.Screen
        name="cadastro"
        options={{
          title: 'Cadastrar Paciente',
          headerBackTitle: 'Voltar',
          headerTintColor: '#FF8C00',
        }}
      />
      <Stack.Screen
        name="lista"
        options={{
          title: 'Pacientes',
          headerBackTitle: 'Voltar',
          headerTintColor: '#FF8C00',
        }}
      />
      <Stack.Screen
        name="detalhes"
        options={{
          title: 'Detalhes',
          headerBackTitle: 'Voltar',
          headerTintColor: '#FF8C00',
        }}
      />
      <Stack.Screen
        name="visita"
        options={{
          title: 'Registrar Visita',
          headerBackTitle: 'Voltar',
          headerTintColor: '#FF8C00',
        }}
      />
      <Stack.Screen
        name="historico-visitas"
        options={{
          title: 'Histórico de Visitas',
          headerBackTitle: 'Voltar',
          headerTintColor: '#FF8C00',
        }}
      />

      <Stack.Screen
        name="familias"
        options={{
          title: 'Famílias',
          headerBackTitle: 'Voltar',
          headerTintColor: '#FF8C00',
        }}
      />
      <Stack.Screen
        name="backup"
        options={{
          title: 'Backup',
          headerBackTitle: 'Voltar',
          headerTintColor: '#FF8C00',
        }}
      />
      <Stack.Screen
        name="lembretes"
        options={{
          title: 'Lembretes',
          headerBackTitle: 'Voltar',
          headerTintColor: '#FF8C00',
        }}
      />
      <Stack.Screen
        name="config"
        options={{
          title: 'Configurações',
          headerBackTitle: 'Voltar',
          headerTintColor: '#FF8C00',
        }}
      />
      <Stack.Screen
        name="esus-export"
        options={{
          title: '📊 Relatórios & e-SUS',
          headerBackTitle: 'Voltar',
          headerTintColor: '#FF8C00',
        }}
      />
      <Stack.Screen
        name="mapa"
        options={{
          title: '🗺️ Mapa Social',
          headerBackTitle: 'Voltar',
          headerTintColor: '#FF8C00',
        }}
      />
      <Stack.Screen
        name="agente"
        options={{
          title: '🧠 Agente de Saúde',
          headerBackTitle: 'Voltar',
          headerTintColor: '#FF8C00',
          headerStyle: { backgroundColor: '#161b22' },
          headerTitleStyle: { color: '#fff' },
        }}
      />
    </Stack>
  );
}
