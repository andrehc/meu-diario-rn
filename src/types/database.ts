// Tipos para o banco de dados (SQLite direto - sem Drizzle)

export interface Profile {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  profile_image: string | null;
  psychologist_name: string | null;
  psychologist_phone: string | null;
  pin_enabled: number;
  pin_hash: string | null;
  login_provider: string;
  google_id: string | null;
  google_access_token: string | null;
  google_refresh_token: string | null;
  google_expires_at: number | null;
}

export interface CreateLocalProfileData {
  name: string;
  phone: string;
  email: string;
  profile_image?: string;
  psychologist_name?: string;
  psychologist_phone?: string;
  pin_enabled: number;
  pin_hash: string;
  login_provider: 'local';
}

export interface CreateGoogleProfileData {
  name: string;
  phone?: string;
  email: string;
  profile_image?: string;
  psychologist_name?: string;
  psychologist_phone?: string;
  pin_enabled: number;
  pin_hash: string;
  login_provider: 'google';
  google_id: string;
  google_access_token: string;
  google_refresh_token?: string;
  google_expires_at: number;
}

export interface DiaryEntry {
  id: number;
  profile_id: number;
  title: string;
  event: string | null;
  feelings: string | null;
  intensity: number | null;
  thoughts: string | null;
  reactions: string | null;
  alternative: string | null;
  current_mood: string | null;
  created_at: number;
}

export interface NewDiaryEntry {
  profile_id: number;
  title: string;
  event?: string;
  feelings?: string;
  intensity?: number;
  thoughts?: string;
  reactions?: string;
  alternative?: string;
  current_mood?: string;
}

export interface DiaryEntryWithFeelings extends DiaryEntry {
  feelings_data?: {
    [key: string]: number;
  };
}

export interface NewDiaryEntryWithFeelings extends NewDiaryEntry {
  feelings_data?: {
    [key: string]: number;
  };
}

export interface GoogleAuthData {
  googleId: string;
  name: string;
  email: string;
  photo?: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}