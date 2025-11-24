import { TestProfileService, clearTestData } from './testServices';

describe('ProfileService', () => {
  beforeEach(() => {
    // Limpa dados antes de cada teste
    clearTestData();
  });

  describe('Perfil Local', () => {
    it('pode criar um perfil local', async () => {
      const newProfile = {
        name: 'Novo Usuário',
        phone: '987654321',
        email: 'novo@usuario.com',
        profile_image: btoa('profile_img_data'),
        psychologist_name: 'Psicólogo Teste',
        psychologist_phone: '123456789',
        pin_enabled: 0,
        pin_hash: '',
        login_provider: 'local' as const,
      };

      const profileId = await TestProfileService.createProfile(newProfile);
      expect(profileId).toBeGreaterThan(0);
    });

    it('deve buscar um perfil local existente', async () => {
      const newProfile = {
        name: 'Novo Usuário',
        phone: '987654321',
        email: 'novo@usuario.com',
        profile_image: btoa('profile_img_data'),
        psychologist_name: 'Psicólogo Teste',
        psychologist_phone: '123456789',
        pin_enabled: 0,
        pin_hash: '',
        login_provider: 'local' as const,
      };

      const profileId = await TestProfileService.createProfile(newProfile);
      const foundEntry = await TestProfileService.getProfile(profileId);

      expect(foundEntry).not.toBeNull();
      expect(foundEntry?.name).toBe('Novo Usuário');
      expect(foundEntry?.email).toBe('novo@usuario.com');
      expect(foundEntry?.login_provider).toBe('local');
    });

    it('pode atualizar um perfil local existente', async () => {
      const newProfile = {
        name: 'Novo Usuário',
        phone: '987654321',
        email: 'novo@usuario.com',
        profile_image: btoa('profile_img_data'),
        psychologist_name: 'Psicólogo Teste',
        psychologist_phone: '123456789',
        pin_enabled: 0,
        pin_hash: '',
        login_provider: 'local' as const,
      };

      const profileId = await TestProfileService.createProfile(newProfile);
      const changes = await TestProfileService.updateProfile(profileId, {
        name: 'Nome Atualizado',
        email: 'atualizado@usuario.com',
      });

      expect(changes).toBe(true);

      const updatedProfile = await TestProfileService.getProfile(profileId);
      expect(updatedProfile?.name).toBe('Nome Atualizado');
      expect(updatedProfile?.email).toBe('atualizado@usuario.com');
    });

    it('pode deletar um perfil local existente', async () => {
      const newProfile = {
        name: 'Novo Usuário',
        phone: '987654321',
        email: 'novo@usuario.com',
        profile_image: btoa('profile_img_data'),
        psychologist_name: 'Psicólogo Teste',
        psychologist_phone: '123456789',
        pin_enabled: 0,
        pin_hash: '',
        login_provider: 'local' as const,
      };

      const profileId = await TestProfileService.createProfile(newProfile);
      const changes = await TestProfileService.deleteProfile(profileId);

      expect(changes).toBe(true);
      const deletedProfile = await TestProfileService.getProfile(profileId);
      expect(deletedProfile).toBeNull();
    });
  });

  describe('Perfil Google', () => {
    it('pode criar um perfil Google', async () => {
      const googleProfile = {
        name: 'Usuário Google',
        phone: '123456789',
        email: 'google@usuario.com',
        profile_image: btoa('profile_img_data'),
        psychologist_name: 'Psicólogo Google',
        psychologist_phone: '987654321',
        pin_enabled: 0,
        pin_hash: '',
        login_provider: 'google' as const,
        google_id: '123456789',
        google_access_token: 'token-123',
        google_refresh_token: 'refresh-123',
        google_expires_at: Date.now() + 3600000,
      };

      const profileId = await TestProfileService.createProfile(googleProfile);
      expect(profileId).toBeGreaterThan(0);
    });

    it('deve buscar um perfil por Google ID', async () => {
      const googleProfile = {
        name: 'Usuário Google',
        phone: '123456789',
        email: 'google@usuario.com',
        profile_image: btoa('profile_img_data'),
        psychologist_name: 'Psicólogo Google',
        psychologist_phone: '987654321',
        pin_enabled: 0,
        pin_hash: '',
        login_provider: 'google' as const,
        google_id: '123456789',
        google_access_token: 'token-123',
        google_refresh_token: 'refresh-123',
        google_expires_at: Date.now() + 3600000,
      };

      await TestProfileService.createProfile(googleProfile);
      const foundProfile = await TestProfileService.getProfileByGoogleId(googleProfile.google_id);

      expect(foundProfile).not.toBeNull();
      expect(foundProfile?.login_provider).toBe('google');
      expect(foundProfile?.google_id).toBe(googleProfile.google_id);
      expect(foundProfile?.email).toBe(googleProfile.email);
    });

    it('deve retornar null para Google ID inexistente', async () => {
      const foundProfile = await TestProfileService.getProfileByGoogleId('id-inexistente');
      expect(foundProfile).toBeNull();
    });

    it('pode atualizar tokens do Google', async () => {
      const googleProfile = {
        name: 'Usuário Google',
        phone: '123456789',
        email: 'google@usuario.com',
        profile_image: btoa('profile_img_data'),
        psychologist_name: 'Psicólogo Google',
        psychologist_phone: '987654321',
        pin_enabled: 0,
        pin_hash: '',
        login_provider: 'google' as const,
        google_id: '123456789',
        google_access_token: 'token-123',
        google_refresh_token: 'refresh-123',
        google_expires_at: Date.now() + 3600000,
      };

      const profileId = await TestProfileService.createProfile(googleProfile);
      const changes = await TestProfileService.updateProfile(profileId, {
        google_access_token: 'novo-token',
        google_expires_at: Date.now() + 7200000,
      });

      expect(changes).toBe(true);

      const updatedProfile = await TestProfileService.getProfileByGoogleId(googleProfile.google_id);
      expect(updatedProfile?.google_access_token).toBe('novo-token');
    });
  });

  describe('Login com Google', () => {
    it('deve criar novo perfil no primeiro login com Google', async () => {
      const googleUserData = {
        googleId: 'google-login-123',
        name: 'Usuario Login Google',
        email: 'login@google.com',
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        expiresAt: Date.now() + 3600000,
      };

      const result = await TestProfileService.loginWithGoogle(googleUserData);

      expect(result.isNewUser).toBe(true);
      expect(result.profile).not.toBeNull();
      expect(result.profile.login_provider).toBe('google');
      expect(result.profile.google_id).toBe(googleUserData.googleId);
      expect(result.profile.email).toBe(googleUserData.email);
    });

    it('deve retornar perfil existente em login subsequente', async () => {
      const googleUserData = {
        googleId: 'google-login-123',
        name: 'Usuario Login Google',
        email: 'login@google.com',
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        expiresAt: Date.now() + 3600000,
      };

      // Primeiro login
      const firstLogin = await TestProfileService.loginWithGoogle(googleUserData);
      expect(firstLogin.isNewUser).toBe(true);

      // Segundo login com tokens atualizados
      const updatedGoogleData = {
        ...googleUserData,
        accessToken: 'new-access-token',
        expiresAt: Date.now() + 7200000,
      };

      const secondLogin = await TestProfileService.loginWithGoogle(updatedGoogleData);
      expect(secondLogin.isNewUser).toBe(false);
      expect(secondLogin.profile.id).toBe(firstLogin.profile.id);
      expect(secondLogin.profile.google_access_token).toBe('new-access-token');
    });

    it('deve verificar se token expirou', async () => {
      const expiredTokenData = {
        googleId: 'google-login-123',
        name: 'Usuario Login Google',
        email: 'login@google.com',
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        expiresAt: Date.now() - 3600000, // Token já expirado
      };

      const expiredResult = await TestProfileService.loginWithGoogle(expiredTokenData);
      const isExpiredExpired = TestProfileService.isGoogleTokenExpired(expiredResult.profile);
      expect(isExpiredExpired).toBe(true);

      const validTokenData = {
        ...expiredTokenData,
        expiresAt: Date.now() + 3600000, // Token válido
      };

      const validResult = await TestProfileService.loginWithGoogle(validTokenData);
      const isValidExpired = TestProfileService.isGoogleTokenExpired(validResult.profile);
      expect(isValidExpired).toBe(false);
    });

    it('deve atualizar tokens do Google usando função específica', async () => {
      const googleUserData = {
        googleId: 'google-login-123',
        name: 'Usuario Login Google',
        email: 'login@google.com',
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        expiresAt: Date.now() + 3600000,
      };

      const result = await TestProfileService.loginWithGoogle(googleUserData);

      const newTokens = {
        accessToken: 'updated-access-token',
        refreshToken: 'updated-refresh-token',
        expiresAt: Date.now() + 7200000,
      };

      const updateSuccess = await TestProfileService.updateGoogleTokens(result.profile.id, newTokens);
      expect(updateSuccess).toBe(true);

      const updatedProfile = await TestProfileService.getProfile(result.profile.id);
      expect(updatedProfile?.google_access_token).toBe(newTokens.accessToken);
      expect(updatedProfile?.google_refresh_token).toBe(newTokens.refreshToken);
      expect(updatedProfile?.google_expires_at).toBe(newTokens.expiresAt);
    });
  });

  describe('Gerenciamento de Tema', () => {
    it('deve criar perfil com tema padrão light', async () => {
      const newProfile = {
        name: 'Usuário Teste',
        phone: '123456789',
        email: 'tema@test.com',
        profile_image: '',
        psychologist_name: '',
        psychologist_phone: '',
        pin_enabled: 0,
        pin_hash: '',
        login_provider: 'local' as const,
      };

      const profileId = await TestProfileService.createProfile(newProfile);
      const theme = await TestProfileService.getTheme(profileId);

      expect(theme).toBe('light');
    });

    it('deve atualizar tema de light para dark', async () => {
      const newProfile = {
        name: 'Usuário Teste',
        phone: '123456789',
        email: 'tema@test.com',
        profile_image: '',
        psychologist_name: '',
        psychologist_phone: '',
        pin_enabled: 0,
        pin_hash: '',
        login_provider: 'local' as const,
      };

      const profileId = await TestProfileService.createProfile(newProfile);
      
      // Verifica tema inicial
      const initialTheme = await TestProfileService.getTheme(profileId);
      expect(initialTheme).toBe('light');

      // Atualiza para dark
      const updateSuccess = await TestProfileService.updateTheme(profileId, 'dark');
      expect(updateSuccess).toBe(true);

      // Verifica tema atualizado
      const updatedTheme = await TestProfileService.getTheme(profileId);
      expect(updatedTheme).toBe('dark');
    });

    it('deve atualizar tema de dark para light', async () => {
      const newProfile = {
        name: 'Usuário Teste',
        phone: '123456789',
        email: 'tema@test.com',
        profile_image: '',
        psychologist_name: '',
        psychologist_phone: '',
        pin_enabled: 0,
        pin_hash: '',
        login_provider: 'local' as const,
      };

      const profileId = await TestProfileService.createProfile(newProfile);
      
      // Define tema como dark
      await TestProfileService.updateTheme(profileId, 'dark');
      expect(await TestProfileService.getTheme(profileId)).toBe('dark');

      // Volta para light
      const updateSuccess = await TestProfileService.updateTheme(profileId, 'light');
      expect(updateSuccess).toBe(true);

      const finalTheme = await TestProfileService.getTheme(profileId);
      expect(finalTheme).toBe('light');
    });

    it('deve persistir o tema após múltiplas atualizações', async () => {
      const newProfile = {
        name: 'Usuário Teste',
        phone: '123456789',
        email: 'tema@test.com',
        profile_image: '',
        psychologist_name: '',
        psychologist_phone: '',
        pin_enabled: 0,
        pin_hash: '',
        login_provider: 'local' as const,
      };

      const profileId = await TestProfileService.createProfile(newProfile);

      // Múltiplas mudanças de tema
      await TestProfileService.updateTheme(profileId, 'dark');
      expect(await TestProfileService.getTheme(profileId)).toBe('dark');

      await TestProfileService.updateTheme(profileId, 'light');
      expect(await TestProfileService.getTheme(profileId)).toBe('light');

      await TestProfileService.updateTheme(profileId, 'dark');
      expect(await TestProfileService.getTheme(profileId)).toBe('dark');

      // Busca o perfil completo para verificar persistência
      const profile = await TestProfileService.getProfile(profileId);
      expect(profile?.theme).toBe('dark');
    });

    it('deve retornar tema light para perfil inexistente', async () => {
      const theme = await TestProfileService.getTheme(99999);
      expect(theme).toBe('light');
    });

    it('deve manter tema ao atualizar outros campos do perfil', async () => {
      const newProfile = {
        name: 'Usuário Teste',
        phone: '123456789',
        email: 'tema@test.com',
        profile_image: '',
        psychologist_name: '',
        psychologist_phone: '',
        pin_enabled: 0,
        pin_hash: '',
        login_provider: 'local' as const,
      };

      const profileId = await TestProfileService.createProfile(newProfile);
      
      // Define tema como dark
      await TestProfileService.updateTheme(profileId, 'dark');
      expect(await TestProfileService.getTheme(profileId)).toBe('dark');

      // Atualiza outros campos
      await TestProfileService.updateProfile(profileId, {
        name: 'Nome Atualizado',
        phone: '987654321',
      });

      // Verifica que o tema não foi alterado
      const themeAfterUpdate = await TestProfileService.getTheme(profileId);
      expect(themeAfterUpdate).toBe('dark');

      const profile = await TestProfileService.getProfile(profileId);
      expect(profile?.name).toBe('Nome Atualizado');
      expect(profile?.theme).toBe('dark');
    });
  });
});