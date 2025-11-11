// Mock básico sempre disponível
let GoogleSignin: any = {
  configure: () => {},
  hasPlayServices: () => Promise.resolve(false),
  signIn: () => Promise.reject(new Error('Google Sign-In não configurado')),
  signOut: () => Promise.resolve(),
  revokeAccess: () => Promise.resolve(),
  getCurrentUser: () => Promise.resolve(null),
  getTokens: () => Promise.reject(new Error('Google Sign-In não configurado')),
};

let statusCodes: any = {
  SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
  IN_PROGRESS: 'IN_PROGRESS',
  PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
};

let isGoogleSignInLoaded = false;

// Função para carregar o módulo real apenas quando necessário
const loadGoogleSignIn = async () => {
  if (isGoogleSignInLoaded) return isGoogleSignInLoaded;
  
  // Só tenta carregar se não estivermos na web ou em desenvolvimento sem o módulo
  try {
    // Usa dynamic import para evitar bundling automático
    const googleSigninModule = await import('@react-native-google-signin/google-signin');
    GoogleSignin = googleSigninModule.GoogleSignin;
    statusCodes = googleSigninModule.statusCodes;
    isGoogleSignInLoaded = true;
    console.log('Google Sign-In module loaded successfully');
    return true;
  } catch (error) {
    console.warn('Google Sign-In não disponível:', error);
    return false;
  }
};
import * as profileService from './profileService';

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

// Configurar Google Sign-In
export const configureGoogleSignIn = async () => {
  const available = await loadGoogleSignIn();
  if (!available) return;
  
  GoogleSignin.configure({
    webClientId: 'YOUR_WEB_CLIENT_ID', // Configure este valor no app.json ou aqui
    offlineAccess: true,
    hostedDomain: '',
    forceCodeForRefreshToken: true,
  });
};

// Verificar se o usuário já está logado
export const isSignedIn = async (): Promise<boolean> => {
  try {
    const available = await loadGoogleSignIn();
    if (!available) return false;
    
    const user = await GoogleSignin.getCurrentUser();
    return user !== null;
  } catch (error) {
    return false;
  }
};

// Fazer login com Google
export const signIn = async (): Promise<GoogleAuthResult> => {
  try {
    const available = await loadGoogleSignIn();
    if (!available) {
      throw new Error('Google Sign-In não disponível nesta plataforma');
    }
    
    // Configura antes de usar
    GoogleSignin.configure({
      webClientId: 'YOUR_WEB_CLIENT_ID',
      offlineAccess: true,
      hostedDomain: '',
      forceCodeForRefreshToken: true,
    });
    
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const tokens = await GoogleSignin.getTokens();

    if (!userInfo || !tokens.accessToken) {
      throw new Error('Informações do usuário não encontradas');
    }

    // A API do Google Sign-In retorna dados direto no userInfo, não em userInfo.user
    return {
      user: {
        googleId: (userInfo as any).id || (userInfo as any).user?.id || '',
        email: (userInfo as any).email || (userInfo as any).user?.email || '',
        name: (userInfo as any).name || (userInfo as any).user?.name || '',
        photo: (userInfo as any).photo || (userInfo as any).user?.photo || undefined,
      },
      accessToken: tokens.accessToken,
      refreshToken: (tokens as any).refreshToken || undefined,
      expiresAt: Date.now() + 3600000, // 1 hora por padrão
    };
  } catch (error: any) {
    console.error('Erro no login com Google:', error);
    
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      throw new Error('Login cancelado pelo usuário');
    } else if (error.code === statusCodes.IN_PROGRESS) {
      throw new Error('Login em progresso');
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      throw new Error('Google Play Services não disponível');
    } else {
      throw new Error('Erro no login com Google');
    }
  }
};

// Fazer logout
export const signOut = async (): Promise<void> => {
  try {
    const available = await loadGoogleSignIn();
    if (!available) return;
    
    await GoogleSignin.signOut();
  } catch (error) {
    console.error('Erro no logout do Google:', error);
  }
};

// Revogar acesso
export const revokeAccess = async (): Promise<void> => {
  try {
    await GoogleSignin.revokeAccess();
  } catch (error) {
    console.error('Erro ao revogar acesso do Google:', error);
  }
};

// Obter informações do usuário atual
export const getCurrentUser = async (): Promise<GoogleUserInfo | null> => {
  try {
    const available = await loadGoogleSignIn();
    if (!available) return null;
    
    const userInfo = await GoogleSignin.getCurrentUser();
    
    if (!userInfo) {
      return null;
    }

    return {
      googleId: (userInfo as any).id || (userInfo as any).user?.id || '',
      email: (userInfo as any).email || (userInfo as any).user?.email || '',
      name: (userInfo as any).name || (userInfo as any).user?.name || '',
      photo: (userInfo as any).photo || (userInfo as any).user?.photo || undefined,
    };
  } catch (error) {
    console.error('Erro ao obter usuário atual:', error);
    return null;
  }
};

// Atualizar tokens
export const refreshTokens = async (): Promise<{ accessToken: string; refreshToken?: string; expiresAt: number } | null> => {
  try {
    const tokens = await GoogleSignin.getTokens();
    
    return {
      accessToken: tokens.accessToken,
      refreshToken: (tokens as any).refreshToken || undefined,
      expiresAt: Date.now() + 3600000, // 1 hora por padrão
    };
  } catch (error) {
    console.error('Erro ao atualizar tokens:', error);
    return null;
  }
};

// Integração com profileService - Login completo
export const loginWithGoogle = async (): Promise<{ profile: profileService.Profile; isNewUser: boolean }> => {
  const googleResult = await signIn();
  
  const googleUserData = {
    googleId: googleResult.user.googleId,
    email: googleResult.user.email,
    name: googleResult.user.name,
    accessToken: googleResult.accessToken,
    refreshToken: googleResult.refreshToken,
    expiresAt: googleResult.expiresAt,
  };

  return await profileService.loginWithGoogle(googleUserData);
};