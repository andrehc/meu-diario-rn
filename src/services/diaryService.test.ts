import { clearTestData, closeDB, getDB, initTestDB } from '../core/database';
import { createDiaryEntry, getEntryById } from './diaryService';

describe('DiaryService', () => {
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

    // Insere um perfil de teste
    const db = getDB();
    db.runSync('INSERT INTO Profile (id, name, email) VALUES (?, ?, ?)', [
      1,
      'Usuário Teste',
      'teste@email.com',
    ]);
  });

  it('pode criar uma entrada no diario', async () => {
    const newEntry = {
      profile_id: 1,
      title: `Diário - ${new Date().toISOString()}`,
      event: 'Evento de teste',
      feelings: ['feliz', 'ansioso'],
      intensity: 5,
      thoughts: 'Estou me sentindo bem hoje.',
      reactions: 'Sorriso',
      alternative: 'Fazer uma caminhada',
      current_mood: 'Feliz',
    };

    const entryId = await createDiaryEntry(newEntry);
    expect(entryId).toBeGreaterThan(0);
  });

  it('pode buscar uma entrada criada', async () => {
    const newEntry = {
      profile_id: 1,
      title: 'Teste de busca',
      event: 'Evento para buscar',
      feelings: ['calmo', 'confiante'],
      intensity: 7,
      thoughts: 'Pensamento de teste',
      reactions: 'Reação de teste',
      alternative: 'Alternativa de teste',
      current_mood: 'Bem',
    };

    const entryId = await createDiaryEntry(newEntry);
    const foundEntry = await getEntryById(entryId);

    expect(foundEntry).not.toBeNull();
    expect(foundEntry?.title).toBe('Teste de busca');
    expect(foundEntry?.profile_id).toBe(1);
    expect(foundEntry?.intensity).toBe(7);
    expect(foundEntry?.feelings).toEqual(['calmo', 'confiante']); // Como é convertido de volta para array
  });

  it('retorna null para entrada inexistente', async () => {
    const foundEntry = await getEntryById(999);
    expect(foundEntry).toBeNull();
  });
});
