import { TestDiaryService, TestProfileService, clearTestData } from './testServices';

describe('DiaryService', () => {
  let testProfileId: number;

  beforeAll(async () => {
    // Cria um perfil de teste para usar nas entradas
    testProfileId = await TestProfileService.createProfile({
      name: 'Usuário Teste',
      phone: '11999999999',
      email: 'teste@email.com',
      profile_image: '',
      psychologist_name: '',
      psychologist_phone: '',
      pin_enabled: 0,
      pin_hash: '',
      login_provider: 'local',
    });
  });

  beforeEach(() => {
    // Limpa dados antes de cada teste
    clearTestData();
  });

  it('pode criar uma entrada no diário', async () => {
    const newEntry = {
      profile_id: testProfileId,
      title: `Diário - ${new Date().toISOString()}`,
      event: 'Evento de teste',
      feelings: ['feliz', 'ansioso'],
      intensity: 5,
      thoughts: 'Estou me sentindo bem hoje.',
      reactions: 'Sorriso',
      alternative: 'Fazer uma caminhada',
      current_mood: 'Feliz',
    };

    const entryId = await TestDiaryService.createDiaryEntry(newEntry);
    expect(entryId).toBeGreaterThan(0);
  });

  it('pode buscar uma entrada criada', async () => {
    const newEntry = {
      profile_id: testProfileId,
      title: 'Teste de busca',
      event: 'Evento para buscar',
      feelings: ['calmo', 'confiante'],
      intensity: 7,
      thoughts: 'Pensamento de teste',
      reactions: 'Reação de teste',
      alternative: 'Alternativa de teste',
      current_mood: 'Bem',
    };

    const entryId = await TestDiaryService.createDiaryEntry(newEntry);
    const foundEntry = await TestDiaryService.getEntryById(entryId);

    expect(foundEntry).not.toBeNull();
    expect(foundEntry?.title).toBe('Teste de busca');
    expect(foundEntry?.profile_id).toBe(testProfileId);
    expect(foundEntry?.intensity).toBe(7);
    expect(foundEntry?.feelings).toEqual(['calmo', 'confiante']);
  });

  it('retorna null para entrada inexistente', async () => {
    const foundEntry = await TestDiaryService.getEntryById(99999);
    expect(foundEntry).toBeNull();
  });

  it('pode buscar todas as entradas de um perfil', async () => {
    // Criar algumas entradas
    const entries = [
      {
        profile_id: testProfileId,
        title: 'Entrada 1',
        event: 'Evento 1',
        feelings: ['feliz'],
        intensity: 5,
        thoughts: 'Pensamento 1',
        reactions: 'Reação 1',
        alternative: 'Alternativa 1',
        current_mood: 'Bem',
      },
      {
        profile_id: testProfileId,
        title: 'Entrada 2',
        event: 'Evento 2',
        feelings: ['triste', 'ansioso'],
        intensity: 3,
        thoughts: 'Pensamento 2',
        reactions: 'Reação 2',
        alternative: 'Alternativa 2',
        current_mood: 'Preocupado',
      },
    ];

    await Promise.all(entries.map(entry => TestDiaryService.createDiaryEntry(entry)));
    
    const allEntries = await TestDiaryService.getEntriesByProfile(testProfileId);
    expect(allEntries.length).toBeGreaterThanOrEqual(2);
    
    // Verifica se as entradas foram criadas corretamente
    const entry1 = allEntries.find(e => e.title === 'Entrada 1');
    const entry2 = allEntries.find(e => e.title === 'Entrada 2');
    
    expect(entry1).toBeDefined();
    expect(entry1?.feelings).toEqual(['feliz']);
    expect(entry2).toBeDefined();
    expect(entry2?.feelings).toEqual(['triste', 'ansioso']);
  });

  it('pode atualizar uma entrada existente', async () => {
    const newEntry = {
      profile_id: testProfileId,
      title: 'Entrada para atualizar',
      event: 'Evento original',
      feelings: ['neutro'],
      intensity: 5,
      thoughts: 'Pensamento original',
      reactions: 'Reação original',
      alternative: 'Alternativa original',
      current_mood: 'Normal',
    };

    const entryId = await TestDiaryService.createDiaryEntry(newEntry);
    
    const updateSuccess = await TestDiaryService.updateEntry(entryId, {
      title: 'Entrada atualizada',
      event: 'Evento atualizado',
      feelings: ['feliz', 'satisfeito'],
      intensity: 8,
    });

    expect(updateSuccess).toBe(true);

    const updatedEntry = await TestDiaryService.getEntryById(entryId);
    expect(updatedEntry?.title).toBe('Entrada atualizada');
    expect(updatedEntry?.event).toBe('Evento atualizado');
    expect(updatedEntry?.feelings).toEqual(['feliz', 'satisfeito']);
    expect(updatedEntry?.intensity).toBe(8);
    // Campos não atualizados devem permanecer iguais
    expect(updatedEntry?.thoughts).toBe('Pensamento original');
  });

  it('pode deletar uma entrada existente', async () => {
    const newEntry = {
      profile_id: testProfileId,
      title: 'Entrada para deletar',
      event: 'Evento para deletar',
      feelings: ['indiferente'],
      intensity: 5,
      thoughts: 'Pensamento para deletar',
      reactions: 'Reação para deletar',
      alternative: 'Alternativa para deletar',
      current_mood: 'Normal',
    };

    const entryId = await TestDiaryService.createDiaryEntry(newEntry);
    
    // Verificar que existe antes de deletar
    const entryBeforeDelete = await TestDiaryService.getEntryById(entryId);
    expect(entryBeforeDelete).not.toBeNull();

    const deleteSuccess = await TestDiaryService.deleteEntry(entryId);
    expect(deleteSuccess).toBe(true);

    // Verificar que foi deletada
    const entryAfterDelete = await TestDiaryService.getEntryById(entryId);
    expect(entryAfterDelete).toBeNull();
  });

  it('pode buscar entradas recentes', async () => {
    // Criar várias entradas
    const entries = [];
    for (let i = 1; i <= 5; i++) {
      entries.push({
        profile_id: testProfileId,
        title: `Entrada Recente ${i}`,
        event: `Evento ${i}`,
        feelings: ['neutro'],
        intensity: i,
        thoughts: `Pensamento ${i}`,
        reactions: `Reação ${i}`,
        alternative: `Alternativa ${i}`,
        current_mood: 'Normal',
      });
    }

    await Promise.all(entries.map(entry => TestDiaryService.createDiaryEntry(entry)));
    
    // Buscar apenas 3 entradas recentes
    const recentEntries = await TestDiaryService.getRecentEntries(testProfileId, 3);
    expect(recentEntries.length).toBeLessThanOrEqual(3);
    
    // Verificar que estão ordenadas por mais recente (ID maior)
    if (recentEntries.length > 1) {
      expect(recentEntries[0].id).toBeGreaterThan(recentEntries[1].id);
    }
  });

  it('deve lidar corretamente com feelings em formato JSON', async () => {
    const newEntry = {
      profile_id: testProfileId,
      title: 'Teste JSON Feelings',
      event: 'Evento JSON',
      feelings: ['alegre', 'esperançoso', 'motivado'],
      intensity: 9,
      thoughts: 'Pensamento JSON',
      reactions: 'Reação JSON',
      alternative: 'Alternativa JSON',
      current_mood: 'Excelente',
    };

    const entryId = await TestDiaryService.createDiaryEntry(newEntry);
    const foundEntry = await TestDiaryService.getEntryById(entryId);

    expect(foundEntry).not.toBeNull();
    expect(foundEntry?.feelings).toEqual(['alegre', 'esperançoso', 'motivado']);
    expect(Array.isArray(foundEntry?.feelings)).toBe(true);
  });
});