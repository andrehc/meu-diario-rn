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
            created_at: Date.now(),
          };
          diaries.push(newEntry);
          mockDB.data.set('Diary', diaries);
          return { lastInsertRowId: mockDB.lastId };
        }

        if (sql.includes('INSERT INTO Profile')) {
          const profiles = mockDB.data.get('Profile') || [];
          mockDB.lastId++;
          
          let newProfile: any = { id: mockDB.lastId };
          
          if (sql.includes('google_id')) {
            // Inserção com campos do Google
            newProfile = {
              id: mockDB.lastId,
              name: params[0],
              phone: params[1],
              email: params[2],
              profile_image: params[3],
              psychologist_name: params[4],
              psychologist_phone: params[5],
              pin_enabled: params[6],
              pin_hash: params[7],
              login_provider: params[8],
              google_id: params[9],
              google_access_token: params[10],
              google_refresh_token: params[11],
              google_expires_at: params[12],
            };
          } else {
            // Inserção sem campos do Google (perfil local)
            newProfile = {
              id: mockDB.lastId,
              name: params[0],
              phone: params[1],
              email: params[2],
              profile_image: params[3],
              psychologist_name: params[4],
              psychologist_phone: params[5],
              pin_enabled: params[6],
              pin_hash: params[7],
              login_provider: params[8],
              google_id: null,
              google_access_token: null,
              google_refresh_token: null,
              google_expires_at: null,
            };
          }
          
          profiles.push(newProfile);
          mockDB.data.set('Profile', profiles);
          return { lastInsertRowId: mockDB.lastId };
        }

        if (sql.includes('DELETE FROM')) {
          const tableName = sql.match(/DELETE FROM (\w+)/)?.[1];

          if (tableName) {
            if (sql.includes('WHERE id = ?')) {
              // DELETE específico por ID
              const records = mockDB.data.get(tableName) || [];
              const recordId = params[0];
              const initialLength = records.length;
              const filteredRecords = records.filter(
                (record: any) => record.id !== recordId
              );
              mockDB.data.set(tableName, filteredRecords);
              return { changes: initialLength - filteredRecords.length };
            } else {
              // DELETE geral (limpar tabela)
              mockDB.data.set(tableName, []);
              if (tableName === 'sqlite_sequence') {
                mockDB.lastId = 0;
              }
              return { changes: 1 };
            }
          }
          return { changes: 0 };
        }

        if (sql.includes('UPDATE Profile SET')) {
          const profiles = mockDB.data.get('Profile') || [];
          const profileId = params[params.length - 1]; // último parâmetro é sempre o ID
          const profileIndex = profiles.findIndex(
            (p: any) => p.id === profileId
          );

          if (profileIndex >= 0) {
            const profile = profiles[profileIndex];

            // Parse simples do SQL para extrair os campos
            const setClause = sql.match(/SET (.+) WHERE/)?.[1] || '';
            const fields = setClause.split(', ').map(field => field.split(' = ?')[0].trim());

            fields.forEach((field, index) => {
              if (params[index] !== undefined) {
                profile[field] = params[index];
              }
            });

            profiles[profileIndex] = profile;
            mockDB.data.set('Profile', profiles);
            return { changes: 1 };
          }
          return { changes: 0 };
        }

        return { lastInsertRowId: 0, changes: 0 };
      }),

      getFirstSync: jest.fn((sql: string, params: any[] = []): any => {
        if (sql.includes('SELECT * FROM Diary WHERE id = ?')) {
          const diaries = mockDB.data.get('Diary') || [];
          const found = diaries.find((diary: any) => diary.id === params[0]);
          return found || null;
        }

        if (sql.includes('SELECT * FROM Profile WHERE id = ?')) {
          const profiles = mockDB.data.get('Profile') || [];
          const found = profiles.find(
            (profile: any) => profile.id === params[0]
          );
          return found || null;
        }

        if (sql.includes('SELECT * FROM Profile WHERE google_id = ?')) {
          const profiles = mockDB.data.get('Profile') || [];
          const found = profiles.find(
            (profile: any) => profile.google_id === params[0]
          );
          return found || null;
        }

        return null;
      }),

      closeSync: jest.fn((): void => {
        mockDB.data.clear();
        mockDB.lastId = 0;
      }),
    };

    return mockDB;
  }),
}));
