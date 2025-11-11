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
      this.lastId++;
      
      // Mapear parâmetros baseado na consulta SQL
      let newProfile: any = { id: this.lastId };
      
      if (sql.includes('google_id')) {
        // Inserção com campos do Google
        newProfile = {
          id: this.lastId,
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
          id: this.lastId,
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
      this.data.set('Profile', profiles);
      return { lastInsertRowId: this.lastId };
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

    if (sql.includes('UPDATE Profile SET')) {
      const profiles = this.data.get('Profile') || [];
      const id = params[params.length - 1]; // O ID é sempre o último parâmetro no UPDATE
      const profileIndex = profiles.findIndex((profile: any) => profile.id === id);
      
      if (profileIndex >= 0) {
        // Atualizar o perfil existente com os novos valores
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
        this.data.set('Profile', profiles);
        return { changes: 1 };
      }
      return { changes: 0 };
    }

    if (sql.includes('DELETE FROM Profile WHERE id = ?')) {
      const profiles = this.data.get('Profile') || [];
      const filteredProfiles = profiles.filter((profile: any) => profile.id !== params[0]);
      this.data.set('Profile', filteredProfiles);
      return { changes: profiles.length - filteredProfiles.length };
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

    if (sql.includes('SELECT * FROM Profile WHERE id = ?')) {
      const profiles = this.data.get('Profile') || [];
      console.log('Profiles in database:', profiles);
      const found = profiles.find((profile: any) => profile.id === params[0]);
      console.log('Found profile:', found);
      return found || null;
    }

    if (sql.includes('SELECT * FROM Profile WHERE google_id = ?')) {
      const profiles = this.data.get('Profile') || [];
      const found = profiles.find((profile: any) => profile.google_id === params[0]);
      return found || null;
    }

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
