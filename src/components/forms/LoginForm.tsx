import React, { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeColor } from '@/src/hooks';
import { useAuth } from '@/src/contexts/AuthContext';
import { ThemedText, ThemedView, PinVerification } from '@/src/components';
import * as googleAuthService from '@/src/services/googleAuthService';
import { ProfileService } from '@/src/services/profileService';
import { type Profile } from '@/src/types/database';

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  
  // Estados para verificação de PIN
  const [showPinVerification, setShowPinVerification] = useState(false);
  const [userAwaitingPinVerification, setUserAwaitingPinVerification] = useState<Profile | null>(null);

  // Função para cancelar verificação de PIN
  const handlePinCancel = () => {
    setShowPinVerification(false);
    setUserAwaitingPinVerification(null);
    setIsLoading(false);
  };

  // Login por email/senha (busca usuário existente)
  const handleEmailLogin = async () => {
    if (!formData.email.trim()) {
      Alert.alert('Erro', 'Por favor, digite seu email');
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔍 [LOGIN] Buscando usuário por email:', formData.email);

      // Busca usuário existente por email
      const existingUser = await ProfileService.getProfileByEmail(formData.email);

      if (!existingUser) {
        Alert.alert(
          'Usuário não encontrado',
          'Este email não está cadastrado. Deseja se registrar?',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Registrar',
              onPress: () => router.push('/auth/register')
            }
          ]
        );
        return;
      }

      console.log('✅ [LOGIN] Usuário encontrado:', existingUser.email);
      
      // Verifica se o usuário tem PIN habilitado
      if (existingUser.pin_enabled === 1 && existingUser.pin_hash) {
        console.log('🔐 [LOGIN] Usuário tem PIN habilitado, solicitando verificação...');
        
        // Armazena o usuário e mostra tela de verificação de PIN
        setUserAwaitingPinVerification(existingUser);
        setShowPinVerification(true);
        
        // Não prosseguir com login ainda - aguardar verificação de PIN
        return;
      } else {
        // Usuário sem PIN, fazer login direto
        console.log('✅ [LOGIN] Usuário sem PIN, fazendo login direto...');
        await login(existingUser);
        
        console.log('🏠 [LOGIN] Navegando para home...');
        router.replace('/');
      }

    } catch (error) {
      console.error('❌ [LOGIN] Erro:', error);
      Alert.alert('Erro', 'Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Login com Google
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 [GOOGLE] Iniciando login com Google...');

      await googleAuthService.configureGoogleSignIn();
      console.log('📲 [GOOGLE] Fazendo login...');

      const result = await googleAuthService.loginWithGoogle();

      console.log('✅ [GOOGLE] Login realizado:', result);

      // Faz login no contexto da aplicação
      console.log('🔐 [GOOGLE] Logando no contexto da aplicação...');
      await login(result.profile);

      console.log('🏠 [GOOGLE] Navegando para home...');
      router.replace('/');

    } catch (error: any) {
      console.error('❌ [GOOGLE] Erro detalhado:', error);
      Alert.alert('Erro no login', error.message || 'Erro ao fazer login com Google');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para quando PIN for verificado com sucesso
  const handlePinSuccess = async () => {
    if (!userAwaitingPinVerification) return;
    
    try {
      console.log('✅ [PIN] PIN válido, fazendo login...');
      
      // PIN válido, prosseguir com o login
      await login(userAwaitingPinVerification);
      
      // Fechar tela de PIN e navegar para home
      setShowPinVerification(false);
      setUserAwaitingPinVerification(null);
      console.log('🏠 [LOGIN] Navegando para home...');
      router.replace('/');
    } catch (error) {
      console.error('❌ [LOGIN] Erro ao fazer login após PIN:', error);
      Alert.alert('Erro', 'Erro ao fazer login. Tente novamente.');
    }
  };

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBackgroundColor = useThemeColor({}, 'cardBackground');
  const iconColor = useThemeColor({}, 'icon');

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Entrar</ThemedText>
        <ThemedText style={styles.subtitle}>Entre com sua conta existente</ThemedText>
      </ThemedView>

      <ThemedView style={styles.form}>
        {/* Email Input */}
        <ThemedView style={[styles.inputContainer, { backgroundColor: cardBackgroundColor }]}>
          <Ionicons name="mail-outline" size={20} color={iconColor} />
          <TextInput
            style={[styles.input, { color: textColor }]}
            placeholder="Seu email"
            placeholderTextColor={iconColor}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </ThemedView>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.button, styles.loginButton]}
          onPress={handleEmailLogin}
          disabled={isLoading}
        >
          <Ionicons name="log-in-outline" size={20} color="#fff" />
          <ThemedText style={styles.buttonText}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </ThemedText>
        </TouchableOpacity>

        {/* Divider */}
        <ThemedView style={styles.divider}>
          <ThemedView style={[styles.dividerLine, { backgroundColor: iconColor }]} />
          <ThemedText style={styles.dividerText}>ou</ThemedText>
          <ThemedView style={[styles.dividerLine, { backgroundColor: iconColor }]} />
        </ThemedView>

        {/* Google Login Button */}
        <TouchableOpacity
          style={[styles.button, styles.googleButton]}
          onPress={handleGoogleLogin}
          disabled={true}
        >
          <Ionicons name="logo-google" size={20} color="#4285f4" />
          <ThemedText style={[styles.buttonText, styles.googleButtonText]}>
            Continuar com Google
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Register Link */}
      <ThemedView style={styles.footer}>
        <ThemedText style={styles.footerText}>Não tem uma conta? </ThemedText>
        <TouchableOpacity onPress={() => router.push('/auth/register')}>
          <ThemedText style={styles.linkText}>Registrar-se</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      
      {/* PIN Verification Modal */}
      <PinVerification
        visible={showPinVerification}
        storedPinHash={userAwaitingPinVerification?.pin_hash || ''}
        onSuccess={handlePinSuccess}
        onCancel={handlePinCancel}
        title="Digite seu PIN"
        description="Digite o PIN de 4 dígitos para acessar sua conta"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    marginLeft: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 12,
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: '#4c6ef5',
  },
  googleButton: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#fff',
  },
  googleButtonText: {
    color: '#666',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    opacity: 0.6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    opacity: 0.7,
  },
  linkText: {
    color: '#4c6ef5',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LoginForm;