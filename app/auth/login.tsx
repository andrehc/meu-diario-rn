import { useAuth } from '@/src/contexts/AuthContext';
import * as googleAuthService from '@/src/services/googleAuthService';
import * as profileService from '@/src/services/profileService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const handleLocalLogin = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Erro', 'Por favor, digite seu nome');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Erro', 'Por favor, digite seu email');
      return;
    }

    try {
      setIsLoading(true);

      // Cria perfil local
      const localProfileData: profileService.CreateLocalProfileData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        profile_image: '',
        psychologist_name: '',
        psychologist_phone: '',
        pin_enabled: 0,
        pin_hash: '',
        login_provider: 'local',
        google_id: null,
        google_access_token: null,
        google_refresh_token: null,
        google_expires_at: null,
      };

      const profileId = await profileService.createProfile(localProfileData);
      const newProfile = await profileService.getProfile(profileId);

      if (newProfile) {
        await login(newProfile);
        router.replace('/(tabs)');
      } else {
        Alert.alert('Erro', 'Não foi possível criar o perfil');
      }
    } catch (error) {
      console.error('Erro no login local:', error);
      Alert.alert('Erro', 'Não foi possível fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      
      // Configura o Google Sign-In se ainda não foi configurado
      googleAuthService.configureGoogleSignIn();
      
      // Faz login com Google e cria/atualiza perfil
      const result = await googleAuthService.loginWithGoogle();
      
      // Faz login no contexto da aplicação
      await login(result.profile);
      
      // Navega para a tela principal
      router.replace('/(tabs)');
      
    } catch (error: any) {
      console.error('Erro no login com Google:', error);
      
      // Mensagem específica para quando o Google Sign-In não está configurado
      if (error.message?.includes('não configurado')) {
        Alert.alert(
          'Google Sign-In', 
          'O login com Google ainda não está configurado nesta versão. Use o login local por enquanto.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Erro', error.message || 'Não foi possível fazer login com Google');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoEmoji}>📖</Text>
              </View>
              <Text style={styles.title}>Bem-vindo</Text>
              <Text style={styles.subtitle}>
                Entre para começar sua jornada de autoconhecimento
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="Seu nome"
                  placeholderTextColor="#999"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="Seu email"
                  placeholderTextColor="#999"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="Telefone (opcional)"
                  placeholderTextColor="#999"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  keyboardType="phone-pad"
                />
              </View>

              {/* Login Local Button */}
              <TouchableOpacity
                style={[styles.button, styles.localButton]}
                onPress={handleLocalLogin}
                disabled={isLoading}
              >
                <Ionicons name="log-in-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Login Button */}
              <TouchableOpacity
                style={[styles.button, styles.googleButton]}
                onPress={handleGoogleLogin}
                disabled={isLoading}
              >
                <Ionicons name="logo-google" size={20} color="#4285f4" />
                <Text style={[styles.buttonText, styles.googleButtonText]}>
                  Continuar com Google
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Ao entrar, você concorda com nossos termos de uso e política de privacidade
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoEmoji: {
    fontSize: 35,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  localButton: {
    backgroundColor: '#4c6ef5',
  },
  googleButton: {
    backgroundColor: '#ffffff',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  googleButtonText: {
    color: '#333',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginHorizontal: 16,
    fontSize: 14,
  },
  footer: {
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 18,
  },
});