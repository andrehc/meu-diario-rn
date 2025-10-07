import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase;

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
    
    // Abre o novo banco
    db = SQLite.openDatabaseSync(dbName);
    
    // Cria as tabelas
    try {
        db.execSync(
            `CREATE TABLE IF NOT EXISTS Profile (
                id INTEGER PRIMARY KEY NOT NULL,
                name TEXT NOT NULL,
                email TEXT,
                profile_image TEXT,
                psychologist_name TEXT,
                psychologist_phone TEXT,
                pin_enabled INTEGER NOT NULL DEFAULT 0,
                pin_hash TEXT
            );`
        );

        db.execSync(
            `CREATE TABLE IF NOT EXISTS Diary (
                id INTEGER PRIMARY KEY NOT NULL,
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

        console.log("Database and tables created successfully.");
    } catch (error) {
        console.error("Database initialization error:", error);
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
    initDB(testDbName);
    return db;
};

// Função para limpar dados de teste
export const clearTestData = () => {
    if (!db) return;
    
    try {
        db.runSync('DELETE FROM Diary');
        db.runSync('DELETE FROM Profile');
        // Reset dos auto-increment
        db.runSync('DELETE FROM sqlite_sequence WHERE name IN ("Diary", "Profile")');
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