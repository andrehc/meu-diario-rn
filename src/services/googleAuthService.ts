// Google Auth Service - Versão corrigida para Expo Go e Build Nativo
import { Platform } from 'react-native';
import { type GoogleAuthData, type Profile } from '../types/database';
import { ProfileService } from './profileService';

export interface GoogleUserInfo {
  googleId: string;
  email: string;
  name: string;
  photo?: string;
}

export interface GoogleAuthResult {
  user: GoogleUserInfo;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

// Configuração do Google Sign-In com Android Client ID
const ANDROID_CLIENT_ID = process.env.ANDROID_CLIENT_ID || '559202373446-69j5hanfkbdt49c36rqakjcpm166mvpu.apps.googleusercontent.com';

// Tentativa de carregar Google Sign-In nativo
let GoogleSignin: any = null;
let isNativeBuild = false;

try {
  const { GoogleSignin: RealGoogleSignin } = require('@react-native-google-signin/google-signin');
  GoogleSignin = RealGoogleSignin;
  isNativeBuild = true;
  console.log('✅ Google Sign-In nativo carregado - Build nativo detectado');
} catch (error) {
  console.log('📱 Google Sign-In nativo não disponível - Expo Go detectado');
  console.log('💡 Para usar Google REAL, execute: npx expo run:android');
}

// Mock para desenvolvimento e Expo Go
const mockGoogleAuth = {
  configure: () => {
    console.log('🔧 Mock: Configurando com Client ID:', ANDROID_CLIENT_ID?.slice(0, 20) + '...');
    return { clientId: ANDROID_CLIENT_ID };
  },
  signIn: () => {
    const mockUser = {
      id: 'mock_user_' + Date.now(),
      email: 'usuario.mock@gmail.com',
      name: 'Usuário Mock (Expo Go)',
      photo: 'https://via.placeholder.com/100',
    };
    
    console.log('✅ Login Mock realizado:', mockUser.email);
    console.log('💡 Este é um login simulado. Para login REAL, use: npx expo run:android');
    
    return Promise.resolve({
      user: mockUser,
      accessToken: 'mock_token_' + Date.now(),
      refreshToken: 'mock_refresh_' + Date.now(),
    });
  },
  signOut: () => {
    console.log('✅ Logout Mock realizado');
    return Promise.resolve();
  },
  getCurrentUser: () => Promise.resolve(null),
  hasPlayServices: () => Promise.resolve(true),
  getTokens: () => Promise.resolve({
    accessToken: 'mock_token',
    refreshToken: 'mock_refresh'
  }),
};

// Configurar Google Sign-In
export const configureGoogleSignIn = async () => {
  console.log('🔧 Configurando Google Sign-In...');
  
  // Se temos Google Sign-In nativo, usar ele
  if (isNativeBuild && GoogleSignin) {
    console.log('🚀 Build nativo detectado - configurando Google Sign-In REAL');
    try {
      await GoogleSignin.configure({
        androidClientId: ANDROID_CLIENT_ID,
        offlineAccess: true,
        forceCodeForRefreshToken: true,
      });
      console.log('✅ Google Sign-In REAL configurado com sucesso!');
      return;
    } catch (error) {
      console.error('❌ Erro ao configurar Google Sign-In real:', error);
      throw new Error('Falha ao configurar Google Sign-In real');
    }
  }
  
  // Fallback para mock (Expo Go ou web)
  console.log('📱 Usando configuração Mock');
  if (Platform.OS === 'android') {
    console.log('💡 Para Google REAL no Android, execute: npx expo run:android');
  }
  mockGoogleAuth.configure();
};

// Login
export const signIn = async (): Promise<GoogleAuthResult> => {
  console.log('🚀 Iniciando login Google...');
  
  // Se temos Google Sign-In nativo, usar ele
  if (isNativeBuild && GoogleSignin) {
    console.log('🚀 Fazendo login REAL...');
    try {
      await GoogleSignin.hasPlayServices();
      console.log('✅ Google Play Services disponível');
      
      // Logout para permitir escolha de conta
      await GoogleSignin.signOut();
      console.log('🔄 Logout prévio realizado');
      
      // Login real
      console.log('🌐 Abrindo página de login do Google...');
      const userInfo = await GoogleSignin.signIn();
      console.log('✅ Login REAL bem-sucedido com:', userInfo.user.email);
      
      const tokens = await GoogleSignin.getTokens();
      console.log('✅ Tokens reais obtidos');
      
      return {
        user: {
          googleId: userInfo.user.id,
          email: userInfo.user.email,
          name: userInfo.user.name || 'Usuário',
          photo: userInfo.user.photo || undefined,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken || undefined,
        expiresAt: Date.now() + 3600000,
      };
    } catch (error: any) {
      console.error('❌ Erro no login REAL:', error);
      
      if (error.code === 'SIGN_IN_CANCELLED') {
        throw new Error('Login cancelado pelo usuário');
      } else if (error.code === 'IN_PROGRESS') {
        throw new Error('Login já em progresso');
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        throw new Error('Google Play Services não disponível');
      } else {
        throw new Error(`Erro no Google Sign-In real: ${error.message}`);
      }
    }
  }
  
  // Login mock para Expo Go
  console.log('📱 Fazendo login Mock (Expo Go)...');
  try {
    const result = await mockGoogleAuth.signIn();
    
    return {
      user: {
        googleId: result.user.id,
        email: result.user.email,
        name: result.user.name,
        photo: result.user.photo,
      },
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresAt: Date.now() + 3600000,
    };
  } catch (error) {
    console.error('❌ Erro no login mock:', error);
    throw new Error('Erro no login com Google');
  }
};

// Logout
export const signOut = async (): Promise<void> => {
  if (isNativeBuild && GoogleSignin) {
    console.log('📱 Fazendo logout real...');
    try {
      await GoogleSignin.signOut();
      console.log('✅ Logout real bem-sucedido');
    } catch (error) {
      console.error('❌ Erro no logout real:', error);
    }
  } else {
    console.log('📱 Fazendo logout mock...');
    await mockGoogleAuth.signOut();
  }
};

// Verificar se está logado
export const isSignedIn = async (): Promise<boolean> => {
  if (isNativeBuild && GoogleSignin) {
    try {
      return await GoogleSignin.isSignedIn();
    } catch (error) {
      console.error('❌ Erro ao verificar login:', error);
      return false;
    }
  } else {
    const user = await mockGoogleAuth.getCurrentUser();
    return user !== null;
  }
};

// Obter usuário atual
export const getCurrentUser = async (): Promise<GoogleUserInfo | null> => {
  if (isNativeBuild && GoogleSignin) {
    try {
      const userInfo = await GoogleSignin.getCurrentUser();
      if (userInfo) {
        return {
          googleId: userInfo.user.id,
          email: userInfo.user.email,
          name: userInfo.user.name || 'Usuário',
          photo: userInfo.user.photo || undefined,
        };
      }
    } catch (error) {
      console.error('❌ Erro ao obter usuário atual:', error);
    }
  }
  return null;
};

// Função para testar a configuração
export const testGoogleConfig = () => {
  console.log('🧪 Testando configuração do Google Auth:');
  console.log('  Platform:', Platform.OS);
  console.log('  ANDROID_CLIENT_ID:', ANDROID_CLIENT_ID ? '✅ Configurado' : '❌ Não encontrado');
  console.log('  Build nativo:', isNativeBuild ? '✅ SIM' : '❌ NÃO (Expo Go)');
  console.log('  Google Sign-In:', GoogleSignin ? '✅ Disponível' : '❌ Não disponível');
  
  let authType = '❓ Desconhecido';
  if (isNativeBuild && GoogleSignin) {
    authType = '🚀 Google Sign-In REAL';
  } else {
    authType = '📱 Mock (Expo Go)';
  }
  
  console.log('  Usando:', authType);
  
  return {
    platform: Platform.OS,
    androidClientId: ANDROID_CLIENT_ID,
    isNativeBuild: isNativeBuild,
    hasRealGoogleSignIn: !!GoogleSignin,
    authType: authType,
    configured: !!ANDROID_CLIENT_ID
  };
};

// Integração com ProfileService
export const loginWithGoogle = async (): Promise<{ profile: Profile; isNewUser: boolean }> => {
  console.log('🔗 Integrando com ProfileService...');
  
  const googleResult = await signIn();
  
  const googleUserData: GoogleAuthData = {
    googleId: googleResult.user.googleId,
    email: googleResult.user.email,
    name: googleResult.user.name,
    accessToken: googleResult.accessToken,
    refreshToken: googleResult.refreshToken,
    expiresAt: googleResult.expiresAt,
  };

  try {
    console.log('🔄 [GOOGLE] Chamando ProfileService.loginWithGoogle...');
    console.log('🔄 [GOOGLE] Dados enviados:', googleUserData);
    
    const result = await ProfileService.loginWithGoogle(googleUserData);
    
    console.log('✅ [GOOGLE] ProfileService retornou:', result);
    return result;
  } catch (error: any) {
    console.error('❌ [GOOGLE] ERRO DETALHADO:', error);
    console.error('❌ [GOOGLE] Error message:', error?.message);
    console.error('❌ [GOOGLE] Error stack:', error?.stack);
    console.error('❌ [GOOGLE] Error name:', error?.name);
    console.error('❌ [GOOGLE] Error toString:', error?.toString());
    
    throw error;
  }
};