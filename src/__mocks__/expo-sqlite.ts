// Mock do expo-sqlite para testes
class MockSQLiteDatabase {
  private data: Map<string, any[]> = new Map();
  private lastId = 0;

  constructor() {
    // Inicializa as tabelas vazias
    this.data.set('Profile', []);
    this.data.set('Diary', []);
  }

  execSync(sql: string) {
    // Mock simples para CREATE TABLE
    console.log('Mock execSync:', sql);
  }

  runSync(sql: string, params: any[] = []) {
    console.log('Mock runSync:', sql, params);

    if (sql.includes('INSERT INTO Profile')) {
      const profiles = this.data.get('Profile') || [];
      const newProfile = {
        id: params[0],
        name: params[1],
        email: params[2],
      };
      profiles.push(newProfile);
      this.data.set('Profile', profiles);
      return { lastInsertRowId: params[0] };
    }

    if (sql.includes('INSERT INTO Diary')) {
      const diaries = this.data.get('Diary') || [];
      this.lastId++;
      const newDiary = {
        id: this.lastId,
        profile_id: params[0],
        title: params[1],
        event: params[2],
        feelings: params[3],
        intensity: params[4],
        thoughts: params[5],
        reactions: params[6],
        alternative: params[7],
        current_mood: params[8],
        created_at: Date.now(),
      };
      diaries.push(newDiary);
      this.data.set('Diary', diaries);
      return { lastInsertRowId: this.lastId };
    }

    if (sql.includes('DELETE FROM')) {
      const tableName = sql.match(/DELETE FROM (\w+)/)?.[1];
      if (tableName) {
        this.data.set(tableName, []);
      }
      return { changes: 1 };
    }

    return { lastInsertRowId: 0, changes: 0 };
  }

  getFirstSync(sql: string, params: any[] = []) {
    console.log('Mock getFirstSync:', sql, params);

    if (sql.includes('SELECT * FROM Diary WHERE id = ?')) {
      const diaries = this.data.get('Diary') || [];
      const found = diaries.find((diary: any) => diary.id === params[0]);
      return found || null;
    }

    return null;
  }

  closeSync() {
    // Mock do close
    console.log('Mock closeSync');
  }
}

export const mockSQLite = {
  openDatabaseSync: jest.fn(() => new MockSQLiteDatabase()),
};

// Mock do módulo expo-sqlite
jest.mock('expo-sqlite', () => mockSQLite);
