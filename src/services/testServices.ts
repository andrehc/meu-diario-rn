// Implementação simplificada dos services Drizzle para testes

// Mock simples que simula Drizzle sem depender da interface complexa
export class SimpleDrizzleMock {
  private data: { [key: string]: any[] } = {};
  private nextId: { [key: string]: number } = {};

  constructor() {
    this.data.profile = [];
    this.data.diary = [];
    this.nextId.profile = 1;
    this.nextId.diary = 1;
  }

  // Simula insert
  async insert(table: string, values: any) {
    const tableName = table.toLowerCase();
    if (!this.data[tableName]) {
      this.data[tableName] = [];
      this.nextId[tableName] = 1;
    }
    
    const id = this.nextId[tableName]++;
    const record = { id, ...values };
    this.data[tableName].push(record);
    
    return { lastInsertRowId: id };
  }

  // Simula select
  async select(table: string, where?: any) {
    const tableName = table.toLowerCase();
    if (!this.data[tableName]) return [];
    
    let results = [...this.data[tableName]];
    
    if (where) {
      results = results.filter(record => {
        for (const [key, value] of Object.entries(where)) {
          if (record[key] !== value) return false;
        }
        return true;
      });
    }
    
    return results;
  }

  // Simula update
  async update(table: string, id: number, values: any) {
    const tableName = table.toLowerCase();
    if (!this.data[tableName]) return { changes: 0 };
    
    const index = this.data[tableName].findIndex(record => record.id === id);
    if (index >= 0) {
      this.data[tableName][index] = { ...this.data[tableName][index], ...values };
      return { changes: 1 };
    }
    
    return { changes: 0 };
  }

  // Simula delete
  async delete(table: string, id: number) {
    const tableName = table.toLowerCase();
    if (!this.data[tableName]) return { changes: 0 };
    
    const initialLength = this.data[tableName].length;
    this.data[tableName] = this.data[tableName].filter(record => record.id !== id);
    const changes = initialLength - this.data[tableName].length;
    
    return { changes };
  }

  // Limpa dados para testes
  clear() {
    this.data = { profile: [], diary: [] };
    this.nextId = { profile: 1, diary: 1 };
  }
}

// Instância global do mock
const mockDB = new SimpleDrizzleMock();

// Services simplificados para testes
export class TestProfileService {
  static async createProfile(profileData: any): Promise<number> {
    const result = await mockDB.insert('profile', profileData);
    return result.lastInsertRowId;
  }

  static async getProfile(id: number): Promise<any> {
    const results = await mockDB.select('profile', { id });
    return results[0] || null;
  }

  static async getProfileByGoogleId(googleId: string): Promise<any> {
    const results = await mockDB.select('profile', { google_id: googleId });
    return results[0] || null;
  }

  static async updateProfile(id: number, updates: any): Promise<boolean> {
    const result = await mockDB.update('profile', id, updates);
    return result.changes > 0;
  }

  static async deleteProfile(id: number): Promise<boolean> {
    const result = await mockDB.delete('profile', id);
    return result.changes > 0;
  }

  static async loginWithGoogle(googleUserData: any): Promise<{ profile: any; isNewUser: boolean }> {
    let existingProfile = await this.getProfileByGoogleId(googleUserData.googleId);
    
    if (existingProfile) {
      await this.updateProfile(existingProfile.id, {
        google_access_token: googleUserData.accessToken,
        google_refresh_token: googleUserData.refreshToken || null,
        google_expires_at: googleUserData.expiresAt,
      });
      
      const updatedProfile = await this.getProfile(existingProfile.id);
      return {
        profile: updatedProfile,
        isNewUser: false
      };
    } else {
      const newProfileData = {
        name: googleUserData.name,
        email: googleUserData.email,
        phone: '',
        profile_image: '',
        psychologist_name: '',
        psychologist_phone: '',
        pin_enabled: 0,
        pin_hash: '',
        login_provider: 'google',
        google_id: googleUserData.googleId,
        google_access_token: googleUserData.accessToken,
        google_refresh_token: googleUserData.refreshToken || null,
        google_expires_at: googleUserData.expiresAt,
      };
      
      const profileId = await this.createProfile(newProfileData);
      const newProfile = await this.getProfile(profileId);
      
      return {
        profile: newProfile,
        isNewUser: true
      };
    }
  }

  static isGoogleTokenExpired(profile: any): boolean {
    if (!profile.google_expires_at) return true;
    return Date.now() >= profile.google_expires_at;
  }

  static async updateGoogleTokens(profileId: number, tokens: any): Promise<boolean> {
    return await this.updateProfile(profileId, {
      google_access_token: tokens.accessToken,
      google_refresh_token: tokens.refreshToken || null,
      google_expires_at: tokens.expiresAt,
    });
  }

  static async updateTheme(profileId: number, theme: 'light' | 'dark'): Promise<boolean> {
    return await this.updateProfile(profileId, { theme });
  }

  static async getTheme(profileId: number): Promise<'light' | 'dark'> {
    const profile = await this.getProfile(profileId);
    return (profile?.theme as 'light' | 'dark') || 'light';
  }
}

export class TestDiaryService {
  static async createDiaryEntry(entryData: any): Promise<number> {
    const newEntry = {
      ...entryData,
      feelings: JSON.stringify(entryData.feelings),
      created_at: Date.now() / 1000,
    };
    
    const result = await mockDB.insert('diary', newEntry);
    return result.lastInsertRowId;
  }

  static async getEntryById(id: number): Promise<any> {
    const results = await mockDB.select('diary', { id });
    const entry = results[0];
    
    if (!entry) return null;
    
    // Converte feelings de volta para array
    if (entry.feelings && typeof entry.feelings === 'string') {
      try {
        entry.feelings = JSON.parse(entry.feelings);
      } catch (error) {
        entry.feelings = entry.feelings.split(', ');
      }
    }
    
    return entry;
  }

  static async getEntriesByProfile(profileId: number): Promise<any[]> {
    const results = await mockDB.select('diary', { profile_id: profileId });
    
    return results.map(entry => {
      if (entry.feelings && typeof entry.feelings === 'string') {
        try {
          entry.feelings = JSON.parse(entry.feelings);
        } catch (error) {
          entry.feelings = entry.feelings.split(', ');
        }
      }
      return entry;
    });
  }

  static async updateEntry(id: number, updates: any): Promise<boolean> {
    const updateData = { ...updates };
    if (updates.feelings) {
      updateData.feelings = JSON.stringify(updates.feelings);
    }
    
    const result = await mockDB.update('diary', id, updateData);
    return result.changes > 0;
  }

  static async deleteEntry(id: number): Promise<boolean> {
    const result = await mockDB.delete('diary', id);
    return result.changes > 0;
  }

  static async getRecentEntries(profileId: number, limit: number = 10): Promise<any[]> {
    const results = await mockDB.select('diary', { profile_id: profileId });
    
    // Ordena por ID decrescente e limita
    const sortedResults = results
      .sort((a, b) => b.id - a.id)
      .slice(0, limit);
    
    return sortedResults.map(entry => {
      if (entry.feelings && typeof entry.feelings === 'string') {
        try {
          entry.feelings = JSON.parse(entry.feelings);
        } catch (error) {
          entry.feelings = entry.feelings.split(', ');
        }
      }
      return entry;
    });
  }
}

// Função para limpar dados entre testes
export const clearTestData = () => {
  mockDB.clear();
};