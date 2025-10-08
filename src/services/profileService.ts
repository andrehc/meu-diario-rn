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
export interface Profile {
  id: number;
  name: string;
  phone: string;
  email: string;
  profile_image: string;
  psychologist_name: string;
  psychologist_phone: string;
  pin_enabled: number;
  pin_hash: string;
}

// Tipo para criação (sem o id que é auto-increment)
export type CreateProfileData = Omit<Profile, 'id'>;

// export constantes com as funcoes do crud de perfil
export const createProfile = async (
  profile: CreateProfileData
): Promise<number> => {
  const db = getDB();
  const result = db.runSync(
    `INSERT INTO Profile (name, phone, email, profile_image, psychologist_name, psychologist_phone, pin_enabled, pin_hash)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      profile.name,
      profile.phone,
      profile.email,
      profile.profile_image,
      profile.psychologist_name,
      profile.psychologist_phone,
      profile.pin_enabled,
      profile.pin_hash,
    ]
  );

  return result.lastInsertRowId;
};

export const getProfile = async (id: number): Promise<Profile | null> => {
  const db = getDB();
  const result = db.getFirstSync(`SELECT * FROM Profile WHERE id = ?;`, [id]);
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
