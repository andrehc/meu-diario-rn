import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeColor } from '@/src/hooks';
import { useAuth } from '@/src/contexts';
import { ThemedText, ThemedView, PinToggle, PinVerification } from '../../../src/components';
import * as googleAuthService from '@/src/services/googleAuthService';
import { ProfileService } from '@/src/services/profileService';
import { type CreateLocalProfileData } from '@/src/types/database';
import { hashPin } from '@/src/utils/pinService';

interface RegisterFormData {
  name: string;
  email: string;
  phone: string;
  psychologist_name: string;
  psychologist_phone: string;
  pin_enabled: boolean;
  pin_hash: string;
}

function placeholderTelefone(telefone: string) {
  if (!telefone) return '';
  return telefone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
}

export function RegisterForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    phone: '',
    psychologist_name: '',
    psychologist_phone: '',
    pin_enabled: false,
    pin_hash: '',
  });
  
  // Estados para controlar o PinVerification
  const [showPinVerification, setShowPinVerification] = useState(false);
  const [pinStep, setPinStep] = useState<'create' | 'confirm'>('create');
  const [tempPin, setTempPin] = useState('');

  // Função para cancelar criação de PIN
  const handlePinCancel = () => {
    setShowPinVerification(false);
    setPinStep('create');
    setTempPin('');
    // Desabilita o toggle também
    setFormData({ ...formData, pin_enabled: false, pin_hash: '' });
  };

  // Função para sucesso na criação/confirmação do PIN
  const handlePinSuccess = async (pin?: string) => {
    if (!pin) return;
    if (pinStep === 'create') {
      // Primeiro passo: armazena temporariamente e pede confirmação
      setTempPin(pin);
      setPinStep('confirm');
    } else {
      // Segundo passo: confirma se o PIN é igual
      if (pin === tempPin) {
        // PINs coincidem, gera o hash e salva
        const hashedPin = await hashPin(pin);
        setFormData({ 
          ...formData, 
          pin_hash: hashedPin,
          pin_enabled: true
        });
        setShowPinVerification(false);
        setPinStep('create');
        setTempPin('');
        Alert.alert('Sucesso', 'PIN criado com sucesso!');
      } else {
        // PINs diferentes, volta para o primeiro passo
        Alert.alert('Erro', 'PINs não coincidem. Tente novamente.');
        setPinStep('create');
        setTempPin('');
      }
    }
  };

  // Registro local
  const handleLocalRegister = async () => {
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
      console.log('🚀 [REGISTER] Iniciando registro local...');

      // Verifica se o email já existe
      const existingUser = await ProfileService.getProfileByEmail(formData.email);
      if (existingUser) {
        Alert.alert(
          'Email já cadastrado',
          'Este email já está em uso. Deseja fazer login?',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Fazer Login',
              onPress: () => router.push('/auth/login')
            }
          ]
        );
        return;
      }

      // Validação do PIN: só habilita se tiver hash válido
      const shouldEnablePin = formData.pin_enabled && formData.pin_hash.length > 0;
      
      console.log('🔐 [REGISTER] Estado do PIN:', {
        pin_enabled_form: formData.pin_enabled,
        pin_hash_exists: !!formData.pin_hash,
        pin_hash_length: formData.pin_hash.length,
        final_pin_enabled: shouldEnablePin
      });

      // Cria perfil local
      const localProfileData: CreateLocalProfileData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim().toLowerCase(),
        profile_image: '',
        psychologist_name: formData.psychologist_name.trim(),
        psychologist_phone: formData.psychologist_phone.trim(),
        pin_enabled: shouldEnablePin ? 1 : 0,
        pin_hash: shouldEnablePin ? formData.pin_hash : '',
        login_provider: 'local',
      };

      console.log('📝 [REGISTER] Dados do perfil:', localProfileData);

      const profileId = await ProfileService.createProfile(localProfileData);
      console.log('✅ [REGISTER] Perfil criado com ID:', profileId);

      // Busca o perfil criado
      const newProfile = await ProfileService.getProfile(profileId);
      if (!newProfile) {
        throw new Error('Erro ao recuperar perfil criado');
      }

      console.log('👤 [REGISTER] Perfil recuperado:', newProfile);

      // Faz login automaticamente
      await login(newProfile);

      console.log('🏠 [REGISTER] Navegando para home...');
      router.replace('/');

    } catch (error: any) {
      console.error('❌ [REGISTER] Erro:', error);
      Alert.alert('Erro', error.message || 'Erro ao registrar usuário');
    } finally {
      setIsLoading(false);
    }
  };

  // Registro com Google
  const handleGoogleRegister = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 [GOOGLE REGISTER] Iniciando registro com Google...');

      await googleAuthService.configureGoogleSignIn();
      console.log('📲 [GOOGLE REGISTER] Fazendo login...');

      const result = await googleAuthService.loginWithGoogle();

      console.log('✅ [GOOGLE REGISTER] Registro realizado:', result);

      // Faz login no contexto da aplicação
      console.log('🔐 [GOOGLE REGISTER] Logando no contexto da aplicação...');
      await login(result.profile);

      console.log('🏠 [GOOGLE REGISTER] Navegando para home...');
      router.replace('/');

    } catch (error: any) {
      console.error('❌ [GOOGLE REGISTER] Erro detalhado:', error);
      Alert.alert('Erro no registro', error.message || 'Erro ao registrar com Google');
    } finally {
      setIsLoading(false);
    }
  };

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBackgroundColor = useThemeColor({}, 'cardBackground');
  const iconColor = useThemeColor({}, 'icon');

  return (
    <ScrollView style={[styles.container, { backgroundColor }]} contentContainerStyle={styles.contentContainer}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Criar Conta</ThemedText>
        <ThemedText style={styles.subtitle}>Registre-se para começar a usar o app</ThemedText>
      </ThemedView>

      <ThemedView style={styles.form}>
        {/* Nome Input */}
        <ThemedView style={[styles.inputContainer, { backgroundColor: cardBackgroundColor }]}>
          <Ionicons name="person-outline" size={20} color={iconColor} />
          <TextInput
            style={[styles.input, { color: textColor }]}
            placeholder="Seu nome completo"
            placeholderTextColor={iconColor}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            autoCapitalize="words"
            autoComplete="name"
          />
        </ThemedView>

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

        {/* Telefone Input */}
        <ThemedView style={[styles.inputContainer, { backgroundColor: cardBackgroundColor }]}>
          <Ionicons name="call-outline" size={20} color={iconColor} />
          <TextInput
            style={[styles.input, { color: textColor }]}
            placeholder="Seu telefone (opcional)"
            placeholderTextColor={iconColor}
            value={placeholderTelefone(formData.phone)}
            onChangeText={(text) => {
              const numbers = text.replace(/\D/g, '');
              setFormData({ ...formData, phone: numbers });
            }}
            keyboardType="phone-pad"
            maxLength={15}
            autoComplete="tel"
          />
        </ThemedView>

        {/* Nome Input Psicologo */}
        <ThemedView style={[styles.inputContainer, { backgroundColor: cardBackgroundColor }]}>
          <Ionicons name="person-outline" size={20} color={iconColor} />
          <TextInput
            style={[styles.input, { color: textColor }]}
            placeholder="Nome do psicólogo (opcional)"
            placeholderTextColor={iconColor}
            value={formData.psychologist_name}
            onChangeText={(text) => setFormData({ ...formData, psychologist_name: text })}
            autoCapitalize="words"
            autoComplete="name"
          />
        </ThemedView>

        {/* Telefone Psicologo Input */}
        <ThemedView style={[styles.inputContainer, { backgroundColor: cardBackgroundColor }]}>
          <Ionicons name="call-outline" size={20} color={iconColor} />
          <TextInput
            style={[styles.input, { color: textColor }]}
            placeholder="Telefone do psicólogo (opcional)"
            placeholderTextColor={iconColor}
            value={placeholderTelefone(formData.psychologist_phone)}
            onChangeText={(text) => {
              const numbers = text.replace(/\D/g, '');
              setFormData({ ...formData, psychologist_phone: numbers });
            }}
            keyboardType="phone-pad"
            maxLength={15}
            autoComplete="tel"
          />
        </ThemedView>

        {/* PIN Toggle */}
        <PinToggle
          value={formData.pin_enabled}
          onToggle={(enabled) => {
            if (!enabled) {
              // Se desabilitar, limpa o hash
              setFormData({ 
                ...formData, 
                pin_enabled: enabled,
                pin_hash: '' 
              });
            } else {
              // Se habilitar, mostra o PinVerification para criar o PIN
              setShowPinVerification(true);
              setPinStep('create');
              setTempPin('');
            }
          }}
          title="Ativar PIN de Segurança"
          description="Habilita um Código PIN de 4 dígitos"
        />

        {/* Register Button */}
        <TouchableOpacity
          style={[styles.button, styles.registerButton]}
          onPress={handleLocalRegister}
          disabled={isLoading}
        >
          <Ionicons name="person-add-outline" size={20} color="#fff" />
          <ThemedText style={styles.buttonText}>
            {isLoading ? 'Registrando...' : 'Criar Conta'}
          </ThemedText>
        </TouchableOpacity>

        {/* Divider */}
        <ThemedView style={styles.divider}>
          <ThemedView style={[styles.dividerLine, { backgroundColor: iconColor }]} />
          <ThemedText style={styles.dividerText}>ou</ThemedText>
          <ThemedView style={[styles.dividerLine, { backgroundColor: iconColor }]} />
        </ThemedView>

        {/* Google Register Button */}
        <TouchableOpacity
          style={[styles.button, styles.googleButton]}
          onPress={handleGoogleRegister}
          disabled={true}
        >
          <Ionicons name="logo-google" size={20} color="#4285f4" />
          <ThemedText style={[styles.buttonText, styles.googleButtonText]}>
            Registrar com Google
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Login Link */}
      <ThemedView style={styles.footer}>
        <ThemedText style={styles.footerText}>Já tem uma conta? </ThemedText>
        <TouchableOpacity onPress={() => router.push('/auth/login')}>
          <ThemedText style={styles.linkText}>Fazer Login</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Terms */}
      <ThemedView style={styles.terms}>
        <ThemedText style={styles.termsText}>
          Ao se registrar, você concorda com nossos termos de uso e política de privacidade
        </ThemedText>
      </ThemedView>

      {/* Modal de Criação de PIN */}
      <PinVerification
        visible={showPinVerification}
        mode={pinStep === 'create' ? 'create' : 'confirm'}
        title={pinStep === 'create' ? 'Criar PIN de Segurança' : 'Confirmar PIN'}
        description={pinStep === 'create' ? 'Digite um PIN de 4 dígitos' : 'Digite o PIN novamente para confirmar'}
        onCancel={handlePinCancel}
        onSuccess={handlePinSuccess}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
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
  registerButton: {
    backgroundColor: '#28a745',
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
    marginBottom: 20,
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
  terms: {
    paddingHorizontal: 20,
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.6,
  },
});

export default RegisterForm;