
import {
    CreateGoogleProfileData,
    CreateLocalProfileData,
    GoogleAuthData,
    Profile
} from '../types/database';

// Serviços usando Drizzle ORM
export class ProfileService {
  // Criar perfil - usando SQLite diretamente para evitar problemas com Drizzle
  static async createProfile(profileData: CreateLocalProfileData | CreateGoogleProfileData): Promise<number> {
    console.log('� [ProfileService] Criando perfil com dados:', profileData);
    
    try {
      const { getSQLiteDB } = await import('../db/database');
      const sqliteDB = getSQLiteDB();
      
      if (!sqliteDB) {
        throw new Error('Database não disponível');
      }

      // SQL e parâmetros diferentes para perfil local vs Google
      let sql: string;
      let params: any[];

      if (profileData.login_provider === 'google') {
        const googleData = profileData as CreateGoogleProfileData;
        sql = `
          INSERT INTO Profile (
            name, phone, email, profile_image, psychologist_name, psychologist_phone,
            pin_enabled, pin_hash, login_provider, google_id, google_access_token,
            google_refresh_token, google_expires_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        params = [
          googleData.name,
          googleData.phone,
          googleData.email,
          googleData.profile_image,
          googleData.psychologist_name,
          googleData.psychologist_phone,
          googleData.pin_enabled,
          googleData.pin_hash,
          googleData.login_provider,
          googleData.google_id,
          googleData.google_access_token,
          googleData.google_refresh_token,
          googleData.google_expires_at,
        ];
      } else {
        sql = `
          INSERT INTO Profile (
            name, phone, email, profile_image, psychologist_name, psychologist_phone,
            pin_enabled, pin_hash, login_provider
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        params = [
          profileData.name,
          profileData.phone,
          profileData.email,
          profileData.profile_image,
          profileData.psychologist_name,
          profileData.psychologist_phone,
          profileData.pin_enabled,
          profileData.pin_hash,
          profileData.login_provider,
        ];
      }

      console.log('🔧 [ProfileService] Executando SQL:', sql);
      console.log('🔧 [ProfileService] Com parâmetros:', params);
      
      const result = sqliteDB.runSync(sql, params);
      console.log('✅ [ProfileService] Insert result:', result);
      return result.lastInsertRowId;
    } catch (error) {
      console.error('❌ [ProfileService] Erro ao criar perfil:', error);
      throw new Error(`Erro ao criar perfil: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Buscar perfil por ID - usando SQLite diretamente
  static async getProfile(id: number): Promise<Profile | null> {
    console.log('🔍 [ProfileService] Buscando perfil ID:', id);
    
    try {
      const { getSQLiteDB } = await import('../db/database');
      const sqliteDB = getSQLiteDB();
      
      if (!sqliteDB) {
        throw new Error('Database não disponível');
      }

      const sql = 'SELECT * FROM Profile WHERE id = ?';
      const result = sqliteDB.getFirstSync(sql, [id]);
      
      console.log('✅ [ProfileService] Perfil encontrado:', result);
      return result as Profile | null;
    } catch (error) {
      console.error('❌ [ProfileService] Erro ao buscar perfil:', error);
      return null;
    }
  }

  // Buscar perfil por Google ID - usando SQLite diretamente
  static async getProfileByGoogleId(googleId: string): Promise<Profile | null> {
    console.log('🔍 [ProfileService] Buscando perfil por Google ID:', googleId);
    
    try {
      const { getSQLiteDB } = await import('../db/database');
      const sqliteDB = getSQLiteDB();
      
      if (!sqliteDB) {
        throw new Error('Database não disponível');
      }

      const sql = 'SELECT * FROM Profile WHERE google_id = ?';
      const result = sqliteDB.getFirstSync(sql, [googleId]);
      
      console.log('✅ [ProfileService] Perfil Google encontrado:', result);
      return result as Profile | null;
    } catch (error) {
      console.error('❌ [ProfileService] Erro ao buscar perfil Google:', error);
      return null;
    }
  }

  // Buscar perfil por email - usando SQLite diretamente
  static async getProfileByEmail(email: string): Promise<Profile | null> {
    console.log('🔍 [ProfileService] Buscando perfil por email:', email);
    
    try {
      const { getSQLiteDB } = await import('../db/database');
      const sqliteDB = getSQLiteDB();
      
      if (!sqliteDB) {
        throw new Error('Database não disponível');
      }

      const sql = 'SELECT * FROM Profile WHERE email = ?';
      const result = sqliteDB.getFirstSync(sql, [email.toLowerCase()]);
      
      console.log('✅ [ProfileService] Perfil por email encontrado:', result);
      return result as Profile | null;
    } catch (error) {
      console.error('❌ [ProfileService] Erro ao buscar perfil por email:', error);
      return null;
    }
  }

  // Atualizar perfil - usando SQLite diretamente
  static async updateProfile(id: number, updates: Partial<Profile>): Promise<boolean> {
    console.log('🔄 [ProfileService] Atualizando perfil ID:', id, 'com:', updates);
    
    try {
      const { getSQLiteDB } = await import('../db/database');
      const sqliteDB = getSQLiteDB();
      
      if (!sqliteDB) {
        throw new Error('Database não disponível');
      }

      // Construir SQL dinamicamente baseado nos campos para atualizar
      const fields = Object.keys(updates).filter(key => key !== 'id');
      if (fields.length === 0) {
        console.log('⚠️ [ProfileService] Nenhum campo para atualizar');
        return false;
      }

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const sql = `UPDATE Profile SET ${setClause} WHERE id = ?`;
      const params = [...fields.map(field => updates[field as keyof Profile]), id];

      console.log('🔧 [ProfileService] SQL Update:', sql);
      console.log('🔧 [ProfileService] Params:', params);
      
      const result = sqliteDB.runSync(sql, params);
      console.log('✅ [ProfileService] Update result:', result);
      
      return result.changes > 0;
    } catch (error) {
      console.error('❌ [ProfileService] Erro ao atualizar perfil:', error);
      return false;
    }
  }

  // Deletar perfil - usando SQLite diretamente
  static async deleteProfile(id: number): Promise<boolean> {
    console.log('🗑️ [ProfileService] Deletando perfil ID:', id);
    
    try {
      const { getSQLiteDB } = await import('../db/database');
      const sqliteDB = getSQLiteDB();
      
      if (!sqliteDB) {
        throw new Error('Database não disponível');
      }

      const sql = 'DELETE FROM Profile WHERE id = ?';
      const result = sqliteDB.runSync(sql, [id]);
      
      console.log('✅ [ProfileService] Delete result:', result);
      return result.changes > 0;
    } catch (error) {
      console.error('❌ [ProfileService] Erro ao deletar perfil:', error);
      return false;
    }
  }

  // Login com Google
  static async loginWithGoogle(googleUserData: GoogleAuthData): Promise<{ profile: Profile; isNewUser: boolean }> {
    // Verifica se já existe um perfil com este Google ID
    let existingProfile = await this.getProfileByGoogleId(googleUserData.googleId);
    
    if (existingProfile) {
      // Usuário já existe, atualiza os tokens
      await this.updateProfile(existingProfile.id, {
        google_access_token: googleUserData.accessToken,
        google_refresh_token: googleUserData.refreshToken || null,
        google_expires_at: googleUserData.expiresAt,
      });
      
      // Busca o perfil atualizado
      const updatedProfile = await this.getProfile(existingProfile.id);
      return {
        profile: updatedProfile!,
        isNewUser: false
      };
    } else {
      // Novo usuário, cria o perfil
      const newProfileData: CreateGoogleProfileData = {
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
        google_refresh_token: googleUserData.refreshToken,
        google_expires_at: googleUserData.expiresAt,
      };
      
      const profileId = await this.createProfile(newProfileData);
      const newProfile = await this.getProfile(profileId);
      
      return {
        profile: newProfile!,
        isNewUser: true
      };
    }
  }

  // Verificar se token do Google expirou
  static isGoogleTokenExpired(profile: Profile): boolean {
    if (!profile.google_expires_at) return true;
    return Date.now() >= profile.google_expires_at;
  }

  // Atualizar tokens do Google
  static async updateGoogleTokens(
    profileId: number,
    tokens: { accessToken: string; refreshToken?: string; expiresAt: number }
  ): Promise<boolean> {
    return await this.updateProfile(profileId, {
      google_access_token: tokens.accessToken,
      google_refresh_token: tokens.refreshToken || null,
      google_expires_at: tokens.expiresAt,
    });
  }

  // Atualizar tema do perfil
  static async updateTheme(profileId: number, theme: 'light' | 'dark'): Promise<boolean> {
    console.log('🎨 [ProfileService] Atualizando tema do perfil:', profileId, 'para:', theme);
    return await this.updateProfile(profileId, { theme });
  }

  // Obter tema do perfil
  static async getTheme(profileId: number): Promise<'light' | 'dark'> {
    console.log('🎨 [ProfileService] Buscando tema do perfil:', profileId);
    const profile = await this.getProfile(profileId);
    return (profile?.theme as 'light' | 'dark') || 'light';
  }
}