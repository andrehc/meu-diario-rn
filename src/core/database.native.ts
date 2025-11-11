// Database implementation for native platforms (iOS/Android)
const SQLite = require('expo-sqlite');

export const openDatabaseSync = (dbName: string) => {
  return SQLite.openDatabaseSync(dbName);
};