import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('diary.db');

// Exportamos a função de inicialização e a instância do DB
export const initDB = () => {
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

export const getDB = () => db;