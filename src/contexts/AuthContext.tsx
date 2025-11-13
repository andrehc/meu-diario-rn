import * as googleAuthService from '@/src/services/googleAuthService';
import { ProfileService } from '@/src/services/profileService';
import { type Profile } from '@/src/types/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (profile: Profile) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = '@meu_diario:user';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Carrega usuário do storage, configura Google Sign-In apenas quando necessário
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      console.log('🔄 [AUTH] Carregando usuário do storage...');
      setIsLoading(true);
      const storedUser = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (storedUser) {
        console.log('🔄 [AUTH] Usuário encontrado no storage');
        const userData = JSON.parse(storedUser);
        console.log('🔄 [AUTH] Dados do storage:', { id: userData.id, name: userData.name, email: userData.email });
        
        // Busca dados atualizados do banco de dados
        console.log('🔄 [AUTH] Buscando dados atualizados no banco...');
        const currentUser = await ProfileService.getProfile(userData.id);
        
        if (currentUser) {
          console.log('✅ [AUTH] Usuário encontrado no banco:', { id: currentUser.id, name: currentUser.name, email: currentUser.email });
          setUser(currentUser);
        } else {
          console.log('❌ [AUTH] Usuário não encontrado no banco, removendo do storage');
          // Usuário não existe mais no banco, remove do storage
          await AsyncStorage.removeItem(STORAGE_KEY);
        }
      } else {
        console.log('ℹ️ [AUTH] Nenhum usuário no storage');
      }
    } catch (error) {
      console.error('❌ [AUTH] Erro ao carregar usuário:', error);
      await AsyncStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (profile: Profile) => {
    try {
      setUser(profile);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 [LOGOUT] Iniciando logout...');
      console.log('🚪 [LOGOUT] Usuário atual:', user?.name, user?.email);
      
      // Se for usuário Google, faz logout do Google também
      if (user?.login_provider === 'google') {
        console.log('🚪 [LOGOUT] Fazendo logout do Google...');
        await googleAuthService.signOut();
      }
      
      console.log('🚪 [LOGOUT] Removendo usuário do estado...');
      setUser(null);
      
      console.log('🚪 [LOGOUT] Removendo dados do AsyncStorage...');
      await AsyncStorage.removeItem(STORAGE_KEY);
      
      console.log('✅ [LOGOUT] Logout concluído com sucesso');
    } catch (error) {
      console.error('❌ [LOGOUT] Erro ao fazer logout:', error);
      throw error;
    }
  };

  const updateUser = async (updates: Partial<Profile>) => {
    if (!user) return;

    try {
      const success = await ProfileService.updateProfile(user.id, updates);
      
      if (success) {
        const updatedUser = await ProfileService.getProfile(user.id);
        if (updatedUser) {
          setUser(updatedUser);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

// Hook para verificar se tokens do Google expiraram
export function useGoogleTokenStatus() {
  const { user } = useAuth();
  
  const isGoogleUser = user?.login_provider === 'google';
  const isTokenExpired = user ? ProfileService.isGoogleTokenExpired(user) : false;
  
  return {
    isGoogleUser,
    isTokenExpired,
    needsTokenRefresh: isGoogleUser && isTokenExpired,
  };
}