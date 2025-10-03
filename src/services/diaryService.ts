import { getDB } from "../core/database";

export interface DiaryEntry {
    id: number;
    profile_id: number;
    title: string;
    event: string;
    feelings: string;
    intensity: number;
    thoughts: string;
    reactions: string;
    alternative: string;
    current_mood: string;
    created_at: number;
}

/**
 * @returns o ID da entrada criada
 */
export const createDiaryEntry = async (entry: Omit<DiaryEntry, "id" | "created_at">): Promise<number> => {
    const db = getDB();
    const result = db.runSync(
        `INSERT INTO Diary (profile_id, title, event, feelings, intensity, thoughts, reactions, alternative, current_mood)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
            entry.profile_id,
            entry.title,
            entry.event,
            entry.feelings,
            entry.intensity,
            entry.thoughts,
            entry.reactions,
            entry.alternative,
            entry.current_mood,
        ]
    );
    return result.lastInsertRowId;
};

/**
 * @returns A entrada do diario ou null se nao existir
 */
export const getEntryById = async (id: number): Promise<DiaryEntry | null> => {
    const db = getDB();
    const result = db.getFirstSync(
        `SELECT * FROM Diary WHERE id = ?;`,
        [id]
    );
    return result as DiaryEntry | null;
};

// TODO: implementar getAllEntries com paginação 