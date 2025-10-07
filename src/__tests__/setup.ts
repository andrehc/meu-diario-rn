// Configuração global para testes

// Mock do expo-sqlite
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => {
    const mockDB: any = {
      data: new Map(),
      lastId: 0,
      
      execSync: jest.fn((sql: string): void => {
        // Mock do CREATE TABLE
      }),
      
      runSync: jest.fn((sql: string, params: any[] = []): any => {
        
        if (sql.includes('INSERT INTO Diary')) {
          mockDB.lastId++;
          const diaries = mockDB.data.get('Diary') || [];
          const newEntry = {
            id: mockDB.lastId,
            profile_id: params[0],
            title: params[1],
            event: params[2],
            feelings: params[3],
            intensity: params[4],
            thoughts: params[5],
            reactions: params[6],
            alternative: params[7],
            current_mood: params[8],
            created_at: Date.now()
          };
          diaries.push(newEntry);
          mockDB.data.set('Diary', diaries);
          return { lastInsertRowId: mockDB.lastId };
        }
        
        if (sql.includes('INSERT INTO Profile')) {
          const profiles = mockDB.data.get('Profile') || [];
          profiles.push({
            id: params[0],
            name: params[1],
            email: params[2]
          });
          mockDB.data.set('Profile', profiles);
          return { lastInsertRowId: params[0] };
        }
        
        if (sql.includes('DELETE FROM')) {
          const tableName = sql.match(/DELETE FROM (\w+)/)?.[1];
          if (tableName) {
            mockDB.data.set(tableName, []);
          }
          if (tableName === 'sqlite_sequence') {
            mockDB.lastId = 0;
          }
          return { changes: 1 };
        }
        
        return { lastInsertRowId: 0, changes: 0 };
      }),
      
      getFirstSync: jest.fn((sql: string, params: any[] = []): any => {
        
        if (sql.includes('SELECT * FROM Diary WHERE id = ?')) {
          const diaries = mockDB.data.get('Diary') || [];
          const found = diaries.find((diary: any) => diary.id === params[0]);
          return found || null;
        }
        
        return null;
      }),
      
      closeSync: jest.fn((): void => {
        mockDB.data.clear();
        mockDB.lastId = 0;
      })
    };
    
    return mockDB;
  })
}));