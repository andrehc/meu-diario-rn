import { clearTestData, closeDB, initTestDB } from '../core/database';
import * as profileService from './profileService';

describe('ProfileService', () => {
  beforeAll(() => {
    // Inicializa banco de teste em memória (isolado)
    initTestDB();
  });

  afterAll(() => {
    // Fecha o banco após todos os testes
    closeDB();
  });

  beforeEach(() => {
    // Limpa todos os dados antes de cada teste
    clearTestData();
  });

  const randomBase64 = Buffer.from(
    Math.random().toString(36).substring(2)
  ).toString('base64');

  // Perfil Local para testes
  const localProfile: profileService.CreateLocalProfileData = {
    name: 'Novo Usuário',
    phone: '987654321',
    email: 'novo@usuario.com',
    profile_image: randomBase64,
    psychologist_name: 'Psicólogo Teste',
    psychologist_phone: '123456789',
    pin_enabled: 0,
    pin_hash: '',
    login_provider: 'local',
    google_id: null,
    google_access_token: null,
    google_refresh_token: null,
    google_expires_at: null
  };

  // Perfil Google para testes
  const googleProfile: profileService.CreateGoogleProfileData = {
    name: 'Usuário Google',
    phone: '123456789',
    email: 'google@usuario.com',
    profile_image: randomBase64,
    psychologist_name: 'Psicólogo Google',
    psychologist_phone: '987654321',
    pin_enabled: 0,
    pin_hash: '',
    login_provider: 'google',
    google_id: '123456789',
    google_access_token: 'token-123',
    google_refresh_token: 'refresh-123',
    google_expires_at: Date.now() + 3600000 // expira em 1 hora
  };

  describe('Perfil Local', () => {
    it('deve criar um perfil local', async () => {
      const profileId = await profileService.createProfile(localProfile);
      expect(profileId).toBeGreaterThan(0);
    });

    it('deve buscar um perfil local existente', async () => {
      const profileId = await profileService.createProfile(localProfile);
      const foundEntry = await profileService.getProfile(profileId);

      expect(foundEntry).not.toBeNull();
      expect(foundEntry?.name).toBe('Novo Usuário');
      expect(foundEntry?.email).toBe('novo@usuario.com');
      expect(foundEntry?.login_provider).toBe('local');
    });

    it('pode atualizar um perfil local existente', async () => {
      const profileId = await profileService.createProfile(localProfile);
      const changes = await profileService.updateProfile(profileId, {
        name: 'Nome Atualizado',
        email: 'atualizado@usuario.com',
      });

      expect(changes).toBeGreaterThan(0);

      const updatedProfile = await profileService.getProfile(profileId);
      expect(updatedProfile?.name).toBe('Nome Atualizado');
      expect(updatedProfile?.email).toBe('atualizado@usuario.com');
    });

    it('pode deletar um perfil local existente', async () => {
      const profileId = await profileService.createProfile(localProfile);
      const changes = await profileService.deleteProfile(profileId);

      expect(changes).toBeGreaterThan(0);
      const deletedProfile = await profileService.getProfile(profileId);
      expect(deletedProfile).toBeNull();
    });
  });

  describe('Perfil Google', () => {
    it('deve criar um perfil com Google', async () => {
      const profileId = await profileService.createProfile(googleProfile);
      expect(profileId).toBeGreaterThan(0);
    });

    it('deve buscar um perfil por Google ID', async () => {
      await profileService.createProfile(googleProfile);
      const foundProfile = await profileService.getProfileByGoogleId(googleProfile.google_id);

      expect(foundProfile).not.toBeNull();
      expect(foundProfile?.login_provider).toBe('google');
      expect(foundProfile?.google_id).toBe(googleProfile.google_id);
      expect(foundProfile?.email).toBe(googleProfile.email);
    });

    it('deve retornar null para Google ID inexistente', async () => {
      const foundProfile = await profileService.getProfileByGoogleId('id-inexistente');
      expect(foundProfile).toBeNull();
    });

    it('pode atualizar tokens do Google', async () => {
      const profileId = await profileService.createProfile(googleProfile);
      const changes = await profileService.updateProfile(profileId, {
        google_access_token: 'novo-token',
        google_expires_at: Date.now() + 7200000 // 2 horas
      });

      expect(changes).toBeGreaterThan(0);

      const updatedProfile = await profileService.getProfileByGoogleId(googleProfile.google_id);
      expect(updatedProfile?.google_access_token).toBe('novo-token');
    });
  });

  describe('Login com Google', () => {
    const googleUserData = {
      googleId: 'google-login-123',
      email: 'login@google.com',
      name: 'Usuario Login Google',
      accessToken: 'access-token-123',
      refreshToken: 'refresh-token-123',
      expiresAt: Date.now() + 3600000 // 1 hora
    };

    it('deve criar novo perfil no primeiro login com Google', async () => {
      const result = await profileService.loginWithGoogle(googleUserData);

      expect(result.isNewUser).toBe(true);
      expect(result.profile).not.toBeNull();
      expect(result.profile.login_provider).toBe('google');
      expect(result.profile.google_id).toBe(googleUserData.googleId);
      expect(result.profile.email).toBe(googleUserData.email);
      expect(result.profile.name).toBe(googleUserData.name);
      expect(result.profile.google_access_token).toBe(googleUserData.accessToken);
    });

    it('deve retornar perfil existente em login subsequente', async () => {
      // Primeiro login
      const firstLogin = await profileService.loginWithGoogle(googleUserData);
      expect(firstLogin.isNewUser).toBe(true);

      // Segundo login com tokens atualizados
      const updatedGoogleData = {
        ...googleUserData,
        accessToken: 'new-access-token',
        expiresAt: Date.now() + 7200000 // 2 horas
      };

      const secondLogin = await profileService.loginWithGoogle(updatedGoogleData);
      expect(secondLogin.isNewUser).toBe(false);
      expect(secondLogin.profile.id).toBe(firstLogin.profile.id);
      expect(secondLogin.profile.google_access_token).toBe('new-access-token');
    });

    it('deve verificar se token expirou', async () => {
      const expiredTokenData = {
        ...googleUserData,
        expiresAt: Date.now() - 1000 // Expirado há 1 segundo
      };

      const result = await profileService.loginWithGoogle(expiredTokenData);
      const isExpired = profileService.isGoogleTokenExpired(result.profile);
      expect(isExpired).toBe(true);

      const validTokenData = {
        ...googleUserData,
        expiresAt: Date.now() + 3600000 // Válido por 1 hora
      };

      const validResult = await profileService.loginWithGoogle(validTokenData);
      const isValidExpired = profileService.isGoogleTokenExpired(validResult.profile);
      expect(isValidExpired).toBe(false);
    });

    it('deve atualizar tokens do Google usando função específica', async () => {
      const result = await profileService.loginWithGoogle(googleUserData);
      
      const newTokens = {
        accessToken: 'updated-access-token',
        refreshToken: 'updated-refresh-token',
        expiresAt: Date.now() + 7200000
      };

      const updateSuccess = await profileService.updateGoogleTokens(result.profile.id, newTokens);
      expect(updateSuccess).toBe(true);

      const updatedProfile = await profileService.getProfile(result.profile.id);
      expect(updatedProfile?.google_access_token).toBe(newTokens.accessToken);
      expect(updatedProfile?.google_refresh_token).toBe(newTokens.refreshToken);
    });
  });
});
