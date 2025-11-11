import { Image } from 'expo-image';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/src/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair do aplicativo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/auth/login');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível fazer logout');
            }
          },
        },
      ]
    );
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Olá, {user?.name || 'Usuário'}!</ThemedText>
        <HelloWave />
      </ThemedView>

      {/* Informações do usuário */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Seu perfil</ThemedText>
        <ThemedView style={styles.userInfo}>
          <ThemedText>
            <ThemedText type="defaultSemiBold">Nome:</ThemedText> {user?.name}
          </ThemedText>
          <ThemedText>
            <ThemedText type="defaultSemiBold">Email:</ThemedText> {user?.email}
          </ThemedText>
          <ThemedText>
            <ThemedText type="defaultSemiBold">Tipo de login:</ThemedText>{' '}
            {user?.login_provider === 'google' ? 'Google' : 'Local'}
          </ThemedText>
          {user?.phone && (
            <ThemedText>
              <ThemedText type="defaultSemiBold">Telefone:</ThemedText> {user.phone}
            </ThemedText>
          )}
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Bem-vindo ao Meu Diário!</ThemedText>
        <ThemedText>
          Este é seu espaço pessoal para reflexões e autoconhecimento. 
          Explore as abas para começar a escrever seus pensamentos.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Configurações</ThemedText>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ff4757" />
          <ThemedText style={styles.logoutText}>Sair da conta</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  userInfo: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 16,
    borderRadius: 8,
    gap: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff4757',
    gap: 8,
  },
  logoutText: {
    color: '#ff4757',
    fontWeight: '600',
  },
});
