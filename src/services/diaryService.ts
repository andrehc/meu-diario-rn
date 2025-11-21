import { getSQLiteDB } from '../db/database';
import { DiaryEntry, NewDiaryEntry, NewDiaryEntryWithFeelings } from '../types/database';
import { DiaryEventBus } from './diaryEventBus';

export class DiaryService {
  // Criar entrada de diário - usando SQLite diretamente
  static async createDiaryEntry(entryData: Omit<NewDiaryEntryWithFeelings, 'id' | 'created_at'>): Promise<number> {
    console.log('📝 [DiaryService] Criando entrada de diário:', entryData);

    try {
      const sqliteDB = getSQLiteDB();

      if (!sqliteDB) {
        throw new Error('Database não disponível');
      }

      const sql = `
        INSERT INTO Diary (
          profile_id, title, event, feelings, intensity, thoughts, reactions, alternative, current_mood
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        entryData.profile_id,
        entryData.title,
        entryData.event || null,
        entryData.feelings ? JSON.stringify(entryData.feelings) : null,
        entryData.intensity || null,
        entryData.thoughts || null,
        entryData.reactions || null,
        entryData.alternative || null,
        entryData.current_mood || null,
      ];

      console.log('🔧 [DiaryService] Executando SQL:', sql);
      console.log('🔧 [DiaryService] Com parâmetros:', params);

      const result = sqliteDB.runSync(sql, params);
      console.log('✅ [DiaryService] Entrada criada com ID:', result.lastInsertRowId);

      // Buscar a entrada completa para enviar via EventBus
      const createdEntry = await this.getDiaryEntry(result.lastInsertRowId);
      
      if (createdEntry) {
        // Notificar via EventBus local
        const eventBus = DiaryEventBus.getInstance();
        eventBus.emitDiaryEvent({
          type: 'diary_entry_created',
          payload: {
            userId: entryData.profile_id,
            entryId: result.lastInsertRowId,
            entry: createdEntry
          }
        });
        console.log('📡 [DiaryService] Notificação EventBus enviada para nova entrada');
      }

      return result.lastInsertRowId;
    } catch (error) {
      console.error('❌ [DiaryService] Erro ao criar entrada:', error);
      throw new Error(`Erro ao criar entrada de diário: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Buscar entradas de um perfil com paginação - usando SQLite diretamente
  static async getDiaryEntriesForProfile(profileId: number, page: number = 0, limit: number = 10): Promise<DiaryEntry[]> {
    console.log('🔍 [DiaryService] Buscando entradas para perfil:', profileId, 'página:', page, 'limit:', limit);

    try {
      const sqliteDB = getSQLiteDB();

      if (!sqliteDB) {
        throw new Error('Database não disponível');
      }

      const offset = page * limit;
      const sql = 'SELECT * FROM Diary WHERE profile_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?';
      const results = sqliteDB.getAllSync(sql, [profileId, limit, offset]);

      console.log('✅ [DiaryService] Encontradas', results.length, 'entradas');

      return results.map((entry: any) => ({
        ...entry,
        feelings: entry.feelings ? JSON.parse(entry.feelings) : null
      })) as DiaryEntry[];
    } catch (error) {
      console.error('❌ [DiaryService] Erro ao buscar entradas:', error);
      return [];
    }
  }

  // Buscar todas as entradas de um perfil - usando SQLite diretamente
  static async getAllDiaryEntriesForProfile(profileId: number): Promise<DiaryEntry[]> {
    console.log('🔍 [DiaryService] Buscando entradas para perfil:', profileId);

    try {
      const sqliteDB = getSQLiteDB();

      if (!sqliteDB) {
        throw new Error('Database não disponível');
      }

      const sql = 'SELECT * FROM Diary WHERE profile_id = ? ORDER BY created_at DESC';
      const results = sqliteDB.getAllSync(sql, [profileId]);

      console.log('✅ [DiaryService] Encontradas', results.length, 'entradas');

      return results.map((entry: any) => ({
        ...entry,
        feelings: entry.feelings ? JSON.parse(entry.feelings) : null
      })) as DiaryEntry[];
    } catch (error) {
      console.error('❌ [DiaryService] Erro ao buscar entradas:', error);
      return [];
    }
  }

  // Buscar ultima entrada de um perfil - usando SQLite diretamente
  static async getLastDiaryEntryForProfile(profileId: number): Promise<DiaryEntry | null> {
    console.log('🔍 [DiaryService] Buscando última entrada para perfil:', profileId);

    try {
      const sqliteDB = getSQLiteDB();

      if (!sqliteDB) {
        throw new Error('Database não disponível');
      }

      const sql = 'SELECT * FROM Diary WHERE profile_id = ? ORDER BY created_at DESC, id DESC LIMIT 1';
      const result = sqliteDB.getAllSync(sql, [profileId]);

      console.log('✅ [DiaryService] Encontrada', result.length, 'entrada(s)');
      if (result.length > 0) {
        console.log('🔍 [DiaryService] Última entrada:', {
          id: result[0].id,
          title: result[0].title,
          created_at: result[0].created_at,
          current_mood: result[0].current_mood
        });
      }

      return result.length > 0 ? {
        ...result[0],
        feelings: result[0].feelings ? JSON.parse(result[0].feelings) : null
      } as DiaryEntry : null;
    } catch (error) {
      console.error('❌ [DiaryService] Erro ao buscar entradas:', error);
      return null;
    }
  }

  // Buscar entrada específica por ID - usando SQLite diretamente
  static async getDiaryEntry(id: number): Promise<DiaryEntry | null> {
    console.log('🔍 [DiaryService] Buscando entrada ID:', id);

    try {
      const sqliteDB = getSQLiteDB();

      if (!sqliteDB) {
        throw new Error('Database não disponível');
      }

      const sql = 'SELECT * FROM Diary WHERE id = ?';
      const result = sqliteDB.getFirstSync(sql, [id]);

      if (result) {
        console.log('✅ [DiaryService] Entrada encontrada:', result);
        return {
          ...result,
          feelings: result.feelings ? JSON.parse(result.feelings) : null
        } as DiaryEntry;
      }

      console.log('❌ [DiaryService] Entrada não encontrada');
      return null;
    } catch (error) {
      console.error('❌ [DiaryService] Erro ao buscar entrada:', error);
      return null;
    }
  }

  // Atualizar entrada de diário - usando SQLite diretamente
  static async updateDiaryEntry(id: number, updates: Partial<NewDiaryEntry>): Promise<boolean> {
    console.log('🔄 [DiaryService] Atualizando entrada ID:', id, 'com:', updates);

    try {
      const sqliteDB = getSQLiteDB();

      if (!sqliteDB) {
        throw new Error('Database não disponível');
      }

      const updateFields: string[] = [];
      const params: any[] = [];

      Object.entries(updates).forEach(([key, value]) => {
        updateFields.push(`${key} = ?`);
        params.push(value);
      });

      if (updateFields.length === 0) {
        console.log('⚠️ [DiaryService] Nenhum campo para atualizar');
        return false;
      }

      params.push(id); // WHERE id = ?

      const sql = `UPDATE Diary SET ${updateFields.join(', ')} WHERE id = ?`;

      console.log('🔧 [DiaryService] Executando SQL:', sql);
      console.log('🔧 [DiaryService] Com parâmetros:', params);

      const result = sqliteDB.runSync(sql, params);
      console.log('✅ [DiaryService] Update result:', result);

      return result.changes > 0;
    } catch (error) {
      console.error('❌ [DiaryService] Erro ao atualizar entrada:', error);
      return false;
    }
  }

  // Deletar entrada de diário - usando SQLite diretamente
  static async deleteDiaryEntry(id: number): Promise<boolean> {
    console.log('🗑️ [DiaryService] Deletando entrada ID:', id);

    try {
      const sqliteDB = getSQLiteDB();

      if (!sqliteDB) {
        throw new Error('Database não disponível');
      }

      const sql = 'DELETE FROM Diary WHERE id = ?';
      const result = sqliteDB.runSync(sql, [id]);

      console.log('✅ [DiaryService] Delete result:', result);
      return result.changes > 0;
    } catch (error) {
      console.error('❌ [DiaryService] Erro ao deletar entrada:', error);
      return false;
    }
  }

  // Debug: Verificar todas as entradas de um perfil com detalhes
  static async debugEntriesForProfile(profileId: number): Promise<void> {
    console.log('🐛 [DiaryService] DEBUG - Verificando todas as entradas para perfil:', profileId);

    try {
      const sqliteDB = getSQLiteDB();

      if (!sqliteDB) {
        throw new Error('Database não disponível');
      }

      const sql = 'SELECT id, title, created_at, current_mood FROM Diary WHERE profile_id = ? ORDER BY created_at DESC';
      const results = sqliteDB.getAllSync(sql, [profileId]);

      console.log(`🐛 [DiaryService] DEBUG - Total de entradas: ${results.length}`);
      
      results.forEach((entry: any, index: number) => {
        const date = new Date(entry.created_at < 10000000000 ? entry.created_at * 1000 : entry.created_at);
        console.log(`🐛 [DiaryService] DEBUG - Entrada ${index + 1}:`, {
          id: entry.id,
          title: entry.title,
          created_at: entry.created_at,
          formatted_date: date.toLocaleString('pt-BR'),
          current_mood: entry.current_mood
        });
      });
    } catch (error) {
      console.error('❌ [DiaryService] Erro no debug:', error);
    }
  }

  // Deletar todas as entradas de um perfil - usando SQLite diretamente
  static async deleteAllEntriesForProfile(profileId: number): Promise<boolean> {
    console.log('🗑️ [DiaryService] Deletando todas as entradas do perfil:', profileId);

    try {
      const sqliteDB = getSQLiteDB();

      if (!sqliteDB) {
        throw new Error('Database não disponível');
      }

      const sql = 'DELETE FROM Diary WHERE profile_id = ?';
      const result = sqliteDB.runSync(sql, [profileId]);

      console.log('✅ [DiaryService] Deletadas', result.changes, 'entradas');
      return result.changes > 0;
    } catch (error) {
      console.error('❌ [DiaryService] Erro ao deletar entradas:', error);
      return false;
    }
  }
}