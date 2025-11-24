import { relations } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Tabela Profile
export const profiles = sqliteTable('Profile', {
  id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email'),
  profile_image: text('profile_image'),
  psychologist_name: text('psychologist_name'),
  psychologist_phone: text('psychologist_phone'),
  pin_enabled: integer('pin_enabled').notNull().default(0),
  pin_hash: text('pin_hash'),
  theme: text('theme').notNull().default('light'), // 'light' ou 'dark'
  login_provider: text('login_provider').notNull().default('local'),
  google_id: text('google_id'),
  google_access_token: text('google_access_token'),
  google_refresh_token: text('google_refresh_token'),
  google_expires_at: integer('google_expires_at'),
});

// Tabela Diary
export const diaryEntries = sqliteTable('Diary', {
  id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
  profile_id: integer('profile_id').notNull(),
  title: text('title').notNull(),
  event: text('event'),
  feelings: text('feelings'), // Armazenado como JSON string
  intensity: integer('intensity'),
  thoughts: text('thoughts'),
  reactions: text('reactions'),
  alternative: text('alternative'),
  current_mood: text('current_mood'),
  created_at: real('created_at').notNull().default(Date.now() / 1000),
});

// Relacionamentos
export const profilesRelations = relations(profiles, ({ many }) => ({
  diaryEntries: many(diaryEntries),
}));

export const diaryEntriesRelations = relations(diaryEntries, ({ one }) => ({
  profile: one(profiles, {
    fields: [diaryEntries.profile_id],
    references: [profiles.id],
  }),
}));

// Tipos TypeScript inferidos
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type DiaryEntry = typeof diaryEntries.$inferSelect;
export type NewDiaryEntry = typeof diaryEntries.$inferInsert;

// Tipos customizados para compatibility
export type DiaryEntryWithFeelings = Omit<DiaryEntry, 'feelings'> & {
  feelings: string[];
};

export type NewDiaryEntryWithFeelings = Omit<NewDiaryEntry, 'feelings'> & {
  feelings: string[];
};