import { Platform } from 'react-native';

let db: any;

// Função para inicializar o banco com nome customizado
export const initDB = (dbName: string = 'diary.db') => {
  // Fecha o banco anterior se existir
  if (db) {
    try {
      db.closeSync();
    } catch (error) {
      // Ignora erro se o banco já estiver fechado
    }
  }

  // Importação condicional baseada na plataforma
  if (Platform.OS === 'web') {
    // Usa mock para web
    const { openDatabaseSync } = require('./database.web');
    db = openDatabaseSync(dbName);
  } else {
    // Usa implementação nativa para mobile
    const { openDatabaseSync } = require('./database.native');
    db = openDatabaseSync(dbName);
  }

  // Cria as tabelas
  try {
    db.execSync(
      `CREATE TABLE IF NOT EXISTS Profile (
                id INTEGER PRIMARY KEY NOT NULL,
                name TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                profile_image TEXT,
                psychologist_name TEXT,
                psychologist_phone TEXT,
                pin_enabled INTEGER NOT NULL DEFAULT 0,
                pin_hash TEXT,
                login_provider TEXT DEFAULT 'local',
                google_id TEXT UNIQUE,
                google_access_token TEXT,
                google_refresh_token TEXT,
                google_expires_at INTEGER
            );`
    );

    db.execSync(
      `CREATE TABLE IF NOT EXISTS Diary (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                profile_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                event TEXT,             --1 o_que_aconteceu
                feelings TEXT,          --2 o_que_senti
                intensity INTEGER,      --3 intensidade da emoção 0 a 10
                thoughts TEXT,          --4 o_que_pensei
                reactions TEXT,         --5 o_que_eu_fiz
                alternative TEXT,       --6 o_que_poderia_ter_feito_diferente
                current_mood TEXT,      --7 como_estou_me_sentindo_agora
                created_at REAL NOT NULL DEFAULT (strftime('%s', 'now'))
            );`
    );

    console.log('Database and tables created successfully.');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

export const getDB = () => {
  if (!db) {
    throw new Error('Database não foi inicializado. Chame initDB() primeiro.');
  }
  return db;
};

// Função específica para testes
export const initTestDB = () => {
  const testDbName = `:memory:`; // Banco em memória para testes
  
  // Fecha o banco anterior se existir
  if (db) {
    try {
      db.closeSync();
    } catch (error) {
      // Ignora erro se o banco já estiver fechado
    }
  }

  // Importação condicional para testes
  if (Platform.OS === 'web') {
    const { openDatabaseSync } = require('./database.web');
    db = openDatabaseSync('test_memory');
  } else {
    const { openDatabaseSync } = require('./database.native');
    db = openDatabaseSync(testDbName);
  }

  // Remove tabelas existentes e cria novamente com estrutura atualizada
  try {
    db.execSync('DROP TABLE IF EXISTS Diary');
    db.execSync('DROP TABLE IF EXISTS Profile');
    
    db.execSync(
      `CREATE TABLE Profile (
                id INTEGER PRIMARY KEY NOT NULL,
                name TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                profile_image TEXT,
                psychologist_name TEXT,
                psychologist_phone TEXT,
                pin_enabled INTEGER NOT NULL DEFAULT 0,
                pin_hash TEXT,
                login_provider TEXT DEFAULT 'local',
                google_id TEXT UNIQUE,
                google_access_token TEXT,
                google_refresh_token TEXT,
                google_expires_at INTEGER
            );`
    );

    db.execSync(
      `CREATE TABLE Diary (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                profile_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                event TEXT,             --1 o_que_aconteceu
                feelings TEXT,          --2 o_que_senti
                intensity INTEGER,      --3 intensidade da emoção 0 a 10
                thoughts TEXT,          --4 o_que_pensei
                reactions TEXT,         --5 o_que_eu_fiz
                alternative TEXT,       --6 o_que_poderia_ter_feito_diferente
                created_at TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
                FOREIGN KEY (profile_id) REFERENCES Profile (id) ON DELETE CASCADE
	        );`
    );

    console.log('Test database and tables created successfully.');
  } catch (error) {
    console.error('Erro ao criar tabelas de teste:', error);
    throw error;
  }
  
  return db;
};

// Função para limpar dados de teste
export const clearTestData = () => {
  if (!db) return;

  try {
    db.runSync('DELETE FROM Diary');
    db.runSync('DELETE FROM Profile');
    // Reset dos auto-increment
    db.runSync(
      'DELETE FROM sqlite_sequence WHERE name IN ("Diary", "Profile")'
    );
  } catch (error) {
    console.error('Erro ao limpar dados de teste:', error);
  }
};

// Função para fechar banco (útil para testes)
export const closeDB = () => {
  if (db) {
    try {
      db.closeSync();
    } catch (error) {
      console.error('Erro ao fechar banco:', error);
    }
  }
};
