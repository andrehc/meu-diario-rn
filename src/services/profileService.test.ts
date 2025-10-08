import { clearTestData, closeDB, initTestDB } from '../core/database';
import * as profileService from './profileService';
import { CreateProfileData } from './profileService';

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
  const profile: CreateProfileData = {
    name: 'Novo Usuário',
    phone: '987654321',
    email: 'novo@usuario.com',
    profile_image: randomBase64,
    psychologist_name: 'Psicólogo Teste',
    psychologist_phone: '123456789',
    pin_enabled: 0,
    pin_hash: '',
  };

  it('deve criar um perfil', async () => {
    const profileId = await profileService.createProfile(profile);
    expect(profileId).toBeGreaterThan(0);
  });

  it('deve buscar um perfil existente', async () => {
    const profileId = await profileService.createProfile(profile); // cria
    const foundEntry = await profileService.getProfile(profileId); // lista

    expect(foundEntry).not.toBeNull();
    expect(foundEntry?.name).toBe('Novo Usuário');
    expect(foundEntry?.email).toBe('novo@usuario.com');
  });

  it('pode atualizar um perfil existente', async () => {
    const profileId = await profileService.createProfile(profile); // cria
    const changes = await profileService.updateProfile(profileId, {
      name: 'Nome Atualizado',
      email: 'atualizado@usuario.com',
    });

    expect(changes).toBeGreaterThan(0);

    // Verifica se foi atualizado
    const updatedProfile = await profileService.getProfile(profileId);
    expect(updatedProfile?.name).toBe('Nome Atualizado');
    expect(updatedProfile?.email).toBe('atualizado@usuario.com');
  });

  it('pode deletar um perfil existente', async () => {
    const profileId = await profileService.createProfile(profile); // cria
    const changes = await profileService.deleteProfile(profileId);

    expect(changes).toBeGreaterThan(0);

    // Verifica se foi deletado
    const deletedProfile = await profileService.getProfile(profileId);
    expect(deletedProfile).toBeNull();
  });
});
