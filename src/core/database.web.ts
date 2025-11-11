// Database implementation for web platform using localStorage mock
export const openDatabaseSync = (dbName: string) => {
  // Retorna o mock do localStorage que já existe no database.platform.ts
  const { openDatabaseSync: webImpl } = require('./database.platform');
  return webImpl(dbName);
};