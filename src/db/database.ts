import { Platform } from 'react-native';

// SQLite Database direct connection
let sqliteDatabase: any = null;

// Mock para web (usando localStorage)
class WebDatabaseMock {
  private data: { [key: string]: any[] } = {};
  private nextId: { [key: string]: number } = {};

  constructor() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('drizzle_mock_db');
        if (saved) {
          const parsed = JSON.parse(saved);
          this.data = parsed.data || {};
          this.nextId = parsed.nextId || {};
        }
      }
    } catch (error) {
      console.warn('[Drizzle Mock] Erro ao carregar dados:', error);
    }
  }

  private save() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('drizzle_mock_db', JSON.stringify({
          data: this.data,
          nextId: this.nextId
        }));
      }
    } catch (error) {
      console.warn('[Drizzle Mock] Erro ao salvar:', error);
    }
  }

  execSync(sql: string) {
    console.log(`[Drizzle Mock] Executing: ${sql.substring(0, 100)}...`);
    if (sql.includes('CREATE TABLE')) {
      const tableName = sql.match(/CREATE TABLE (?:IF NOT EXISTS )?`?(\w+)`?/i)?.[1]?.toLowerCase();
      if (tableName && !this.data[tableName]) {
        this.data[tableName] = [];
        this.nextId[tableName] = 1;
      }
    }
  }

  runSync(sql: string, params: any[] = []) {
    console.log(`[Drizzle Mock] Running: ${sql}`, params);
    
    if (sql.includes('INSERT')) {
      const tableName = sql.match(/INSERT INTO `?(\w+)`?/i)?.[1]?.toLowerCase();
      if (tableName) {
        if (!this.data[tableName]) {
          this.data[tableName] = [];
          this.nextId[tableName] = 1;
        }
        const id = this.nextId[tableName]++;
        
        // Parse dos valores baseado na tabela
        let record: any = { id };
        if (tableName === 'profile') {
          const values = sql.match(/VALUES\s*\((.*?)\)/i)?.[1]?.split(',').length || 0;
          record = {
            id,
            name: params[0] || '',
            phone: params[1] || null,
            email: params[2] || null,
            profile_image: params[3] || null,
            psychologist_name: params[4] || null,
            psychologist_phone: params[5] || null,
            pin_enabled: params[6] || 0,
            pin_hash: params[7] || null,
            login_provider: params[8] || 'local',
            google_id: params[9] || null,
            google_access_token: params[10] || null,
            google_refresh_token: params[11] || null,
            google_expires_at: params[12] || null,
          };
        } else if (tableName === 'diary') {
          record = {
            id,
            profile_id: params[0] || 1,
            title: params[1] || '',
            event: params[2] || null,
            feelings: params[3] || null,
            intensity: params[4] || 5,
            thoughts: params[5] || null,
            reactions: params[6] || null,
            alternative: params[7] || null,
            current_mood: params[8] || null,
            created_at: Date.now() / 1000,
          };
        }
        
        this.data[tableName].push(record);
        this.save();
        return { lastInsertRowId: id, changes: 1 };
      }
    }
    
    if (sql.includes('UPDATE')) {
      const tableName = sql.match(/UPDATE `?(\w+)`?/i)?.[1]?.toLowerCase();
      if (tableName && this.data[tableName]) {
        const whereMatch = sql.match(/WHERE\s+`?(\w+)`?\s*=\s*\?/i);
        if (whereMatch) {
          const whereField = whereMatch[1];
          const whereValue = params[params.length - 1];
          const updateParams = params.slice(0, -1);
          
          const recordIndex = this.data[tableName].findIndex((record: any) => record[whereField] == whereValue);
          if (recordIndex >= 0) {
            const setMatch = sql.match(/SET\s+(.+?)\s+WHERE/i);
            if (setMatch) {
              const setPart = setMatch[1];
              const setFields = setPart.split(',').map(field => field.trim().split('=')[0].trim().replace(/`/g, ''));
              
              setFields.forEach((field, index) => {
                if (updateParams[index] !== undefined) {
                  this.data[tableName][recordIndex][field] = updateParams[index];
                }
              });
            }
            this.save();
            return { lastInsertRowId: 0, changes: 1 };
          }
        }
      }
      return { lastInsertRowId: 0, changes: 0 };
    }
    
    if (sql.includes('DELETE')) {
      const tableName = sql.match(/DELETE FROM `?(\w+)`?/i)?.[1]?.toLowerCase();
      if (tableName && this.data[tableName]) {
        const whereMatch = sql.match(/WHERE\s+`?(\w+)`?\s*=\s*\?/i);
        if (whereMatch) {
          const whereField = whereMatch[1];
          const whereValue = params[0];
          
          const initialLength = this.data[tableName].length;
          this.data[tableName] = this.data[tableName].filter((record: any) => record[whereField] != whereValue);
          const changes = initialLength - this.data[tableName].length;
          
          if (changes > 0) {
            this.save();
            return { lastInsertRowId: 0, changes };
          }
        } else if (sql.includes('DELETE FROM') && !sql.includes('WHERE')) {
          const changes = this.data[tableName].length;
          this.data[tableName] = [];
          this.save();
          return { lastInsertRowId: 0, changes };
        }
      }
      return { lastInsertRowId: 0, changes: 0 };
    }
    
    return { lastInsertRowId: 0, changes: 0 };
  }

  getAllSync(sql: string, params: any[] = []) {
    const tableName = sql.match(/FROM `?(\w+)`?/i)?.[1]?.toLowerCase();
    if (!tableName || !this.data[tableName]) {
      return [];
    }
    
    const whereMatch = sql.match(/WHERE\s+`?(\w+)`?\s*=\s*\?/i);
    if (whereMatch) {
      const whereField = whereMatch[1];
      const whereValue = params[0];
      return this.data[tableName].filter((record: any) => record[whereField] == whereValue);
    }
    
    return this.data[tableName] || [];
  }

  getFirstSync(sql: string, params: any[] = []) {
    const results = this.getAllSync(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  closeSync() {
    this.save();
  }
}

export const initSQLiteDB = async () => {
  try {
    console.log('🔧 [DATABASE] Iniciando inicialização do banco...');
    console.log('🔧 [DATABASE] Banco atual:', sqliteDatabase ? 'JÁ EXISTE' : 'NULL');
    
    // Se já existe, não reinicializa
    if (sqliteDatabase) {
      console.log('ℹ️ [DATABASE] Banco já inicializado, pulando inicialização');
      return sqliteDatabase;
    }
    
    if (Platform.OS === 'web' || typeof window !== 'undefined') {
      console.log('[SQLite] Inicializando mock para web');
      sqliteDatabase = new WebDatabaseMock();
    } else {
      console.log('[SQLite] Inicializando SQLite para mobile');
      // Para mobile, usar require dinâmico para evitar problemas de bundling
      const { openDatabaseSync } = eval('require("expo-sqlite")');
      sqliteDatabase = openDatabaseSync('diary.db');
    }

    // Criar as tabelas se não existirem
    sqliteDatabase.execSync(`
      CREATE TABLE IF NOT EXISTS Profile (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        profile_image TEXT,
        psychologist_name TEXT,
        psychologist_phone TEXT,
        pin_enabled INTEGER NOT NULL DEFAULT 0,
        pin_hash TEXT,
        login_provider TEXT NOT NULL DEFAULT 'local',
        google_id TEXT,
        google_access_token TEXT,
        google_refresh_token TEXT,
        google_expires_at INTEGER
      );
    `);

    sqliteDatabase.execSync(
      `CREATE TABLE IF NOT EXISTS Diary (
        id INTEGER PRIMARY KEY AUTOINCREMENT,  // ✅ Removido AUTO_INCREMENT
        profile_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        event TEXT,
        feelings TEXT,
        intensity INTEGER,
        thoughts TEXT,
        reactions TEXT,
        alternative TEXT,
        current_mood TEXT,
        created_at REAL NOT NULL DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (profile_id) REFERENCES Profile (id) ON DELETE CASCADE
      );`
    );
    
    console.log('✅ SQLite DB inicializado com sucesso');
    return sqliteDatabase;
  } catch (error) {
    console.error('❌ Erro ao inicializar SQLite DB:', error);
    throw error;
  }
};

export const getSQLiteDB = () => {
  return sqliteDatabase;
};

export const closeDB = () => {
  if (sqliteDatabase && typeof sqliteDatabase.closeSync === 'function') {
    sqliteDatabase.closeSync();
  }
  sqliteDatabase = null;
};