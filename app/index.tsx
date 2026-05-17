import { router } from 'expo-router';
import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

export default function Index() {
  useEffect(() => {
    router.replace('/(tabs)/dashboard');
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#FF8C00" />
      <Text style={{ marginTop: 12, color: '#666' }}>Carregando...</Text>
    </View>
  );
}
