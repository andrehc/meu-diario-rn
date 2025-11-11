import { getDB } from '../core/database';

// constante interface com os atributos do perfil
/**
 * id number,
 * name string,
 * email string,
 * profile_image string,
 * psychologist_name string,
 * psychologist_phone string,
 * pin_enabled number NOT NULL DEFAULT 0,
 * pin_hash string
 */
// Interface base do perfil
interface BaseProfile {
  id: number;
  name: string;
  phone: string;
  email: string;
  profile_image: string;
  psychologist_name: string;
  psychologist_phone: string;
  pin_enabled: number;
  pin_hash: string;
  login_provider: 'local' | 'google';
}

// Interface para perfil com Google
interface GoogleProfile extends BaseProfile {
  login_provider: 'google';
  google_id: string;
  google_access_token: string;
  google_refresh_token: string | null;
  google_expires_at: number;
}

// Interface para perfil local
interface LocalProfile extends BaseProfile {
  login_provider: 'local';
  google_id: null;
  google_access_token: null;
  google_refresh_token: null;
  google_expires_at: null;
}

// União dos tipos possíveis de perfil
export type Profile = LocalProfile | GoogleProfile;

// Tipo para criação de perfil local
export type CreateLocalProfileData = Omit<LocalProfile, 'id'>;

// Tipo para criação de perfil Google
export type CreateGoogleProfileData = Omit<GoogleProfile, 'id'>;

// Função auxiliar para verificar se é perfil Google
const isGoogleProfile = (profile: CreateLocalProfileData | CreateGoogleProfileData): profile is CreateGoogleProfileData => {
  return profile.login_provider === 'google';
};

// export constantes com as funcoes do crud de perfil
export const createProfile = async (
  profile: CreateLocalProfileData | CreateGoogleProfileData
): Promise<number> => {
  const db = getDB();
  
  if (isGoogleProfile(profile)) {
    // Perfil Google
    const result = db.runSync(
      `INSERT INTO Profile (
        name, phone, email, profile_image, psychologist_name, psychologist_phone, 
        pin_enabled, pin_hash, login_provider, google_id, google_access_token, 
        google_refresh_token, google_expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        profile.name,
        profile.phone,
        profile.email,
        profile.profile_image,
        profile.psychologist_name,
        profile.psychologist_phone,
        profile.pin_enabled,
        profile.pin_hash,
        profile.login_provider,
        profile.google_id,
        profile.google_access_token,
        profile.google_refresh_token,
        profile.google_expires_at,
      ]
    );
    return result.lastInsertRowId;
  } else {
    // Perfil Local
    const result = db.runSync(
      `INSERT INTO Profile (
        name, phone, email, profile_image, psychologist_name, psychologist_phone, 
        pin_enabled, pin_hash, login_provider
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        profile.name,
        profile.phone,
        profile.email,
        profile.profile_image,
        profile.psychologist_name,
        profile.psychologist_phone,
        profile.pin_enabled,
        profile.pin_hash,
        profile.login_provider,
      ]
    );
    return result.lastInsertRowId;
  }
};

export const getProfile = async (id: number): Promise<Profile | null> => {
  const db = getDB();
  const result = db.getFirstSync(`SELECT * FROM Profile WHERE id = ?;`, [id]);
  return result as Profile | null;
};

export const getProfileByGoogleId = async (googleId: string): Promise<Profile | null> => {
  const db = getDB();
  const result = db.getFirstSync(
    `SELECT * FROM Profile WHERE google_id = ?;`,
    [googleId]
  );
  return result as Profile | null;
};

export const updateProfile = async (
  id: number,
  profile: Partial<Profile>
): Promise<number> => {
  const db = getDB();

  // Constrói a query UPDATE dinamicamente baseada nos campos fornecidos
  const fields = Object.keys(profile).filter(key => key !== 'id');
  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const values = fields.map(field => (profile as any)[field]);

  const result = db.runSync(`UPDATE Profile SET ${setClause} WHERE id = ?;`, [
    ...values,
    id,
  ]);

  return result.changes;
};

export const deleteProfile = async (id: number): Promise<number> => {
  const db = getDB();
  const result = db.runSync(`DELETE FROM Profile WHERE id = ?;`, [id]);
  return result.changes;
};

// Função específica para login com Google
export const loginWithGoogle = async (googleUserData: {
  googleId: string;
  email: string;
  name: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}): Promise<{ profile: Profile; isNewUser: boolean }> => {
  // Primeiro, verifica se já existe um perfil com este Google ID
  let existingProfile = await getProfileByGoogleId(googleUserData.googleId);
  
  if (existingProfile) {
    // Usuário já existe, atualiza os tokens
    await updateProfile(existingProfile.id, {
      google_access_token: googleUserData.accessToken,
      google_refresh_token: googleUserData.refreshToken || null,
      google_expires_at: googleUserData.expiresAt,
    });
    
    // Busca o perfil atualizado
    const updatedProfile = await getProfile(existingProfile.id);
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
      google_refresh_token: googleUserData.refreshToken || null,
      google_expires_at: googleUserData.expiresAt,
    };
    
    const profileId = await createProfile(newProfileData);
    const newProfile = await getProfile(profileId);
    
    return {
      profile: newProfile!,
      isNewUser: true
    };
  }
};

// Função para verificar se o token do Google expirou
export const isGoogleTokenExpired = (profile: Profile): boolean => {
  if (!profile.google_expires_at) return true;
  return Date.now() >= profile.google_expires_at;
};

// Função para atualizar tokens do Google
export const updateGoogleTokens = async (
  profileId: number, 
  tokens: {
    accessToken: string;
    refreshToken?: string;
    expiresAt: number;
  }
): Promise<boolean> => {
  const changes = await updateProfile(profileId, {
    google_access_token: tokens.accessToken,
    google_refresh_token: tokens.refreshToken,
    google_expires_at: tokens.expiresAt,
  });
  
  return changes > 0;
};
