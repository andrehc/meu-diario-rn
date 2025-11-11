import { Platform } from 'react-native';

// Mock para plataforma web
const createWebMock = () => {
  console.warn('SQLite não suportado na web - usando LocalStorage como fallback');
  
  // Simula dados no localStorage
  const getStorageKey = (table: string) => `meu_diario_${table}`;
  
  const getData = (table: string) => {
    try {
      const data = localStorage.getItem(getStorageKey(table));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };
  
  const setData = (table: string, data: any[]) => {
    try {
      localStorage.setItem(getStorageKey(table), JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  };

  return {
    execSync: (sql: string) => {
      console.log('Web Mock execSync:', sql);
    },
    
    runSync: (sql: string, params: any[] = []) => {
      console.log('Web Mock runSync:', sql, params);
      
      if (sql.includes('INSERT INTO Profile')) {
        const profiles = getData('Profile');
        const newId = profiles.length + 1;
        
        let newProfile: any = { id: newId };
        
        if (sql.includes('google_id')) {
          // Inserção com campos do Google
          newProfile = {
            id: newId,
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
            id: newId,
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
        setData('Profile', profiles);
        return { lastInsertRowId: newId };
      }
      
      if (sql.includes('INSERT INTO Diary')) {
        const diaries = getData('Diary');
        const newId = diaries.length + 1;
        const newDiary = {
          id: newId,
          profile_id: params[0],
          title: params[1],
          event: params[2],
          feelings: params[3],
          intensity: params[4],
          thoughts: params[5],
          reactions: params[6],
          alternative: params[7],
          current_mood: params[8],
          created_at: new Date().toISOString(),
        };
        diaries.push(newDiary);
        setData('Diary', diaries);
        return { lastInsertRowId: newId };
      }
      
      if (sql.includes('DELETE FROM Profile WHERE id = ?')) {
        const profiles = getData('Profile');
        const filteredProfiles = profiles.filter((p: any) => p.id !== params[0]);
        setData('Profile', filteredProfiles);
        return { changes: profiles.length - filteredProfiles.length };
      }
      
      if (sql.includes('DELETE FROM')) {
        const tableName = sql.match(/DELETE FROM (\w+)/)?.[1];
        if (tableName) {
          setData(tableName, []);
          return { changes: 1 };
        }
      }
      
      if (sql.includes('UPDATE Profile SET')) {
        const profiles = getData('Profile');
        const profileId = params[params.length - 1];
        const profileIndex = profiles.findIndex((p: any) => p.id === profileId);
        
        if (profileIndex >= 0) {
          const profile = profiles[profileIndex];
          const setClause = sql.match(/SET (.+) WHERE/)?.[1] || '';
          const fields = setClause.split(', ').map(field => field.split(' = ?')[0].trim());
          
          fields.forEach((field, index) => {
            if (params[index] !== undefined) {
              profile[field] = params[index];
            }
          });
          
          profiles[profileIndex] = profile;
          setData('Profile', profiles);
          return { changes: 1 };
        }
        return { changes: 0 };
      }
      
      return { lastInsertRowId: 0, changes: 0 };
    },
    
    getFirstSync: (sql: string, params: any[] = []) => {
      console.log('Web Mock getFirstSync:', sql, params);
      
      if (sql.includes('SELECT * FROM Profile WHERE id = ?')) {
        const profiles = getData('Profile');
        return profiles.find((p: any) => p.id === params[0]) || null;
      }
      
      if (sql.includes('SELECT * FROM Profile WHERE google_id = ?')) {
        const profiles = getData('Profile');
        return profiles.find((p: any) => p.google_id === params[0]) || null;
      }
      
      if (sql.includes('SELECT * FROM Diary WHERE id = ?')) {
        const diaries = getData('Diary');
        return diaries.find((d: any) => d.id === params[0]) || null;
      }
      
      return null;
    },
    
    closeSync: () => {
      console.log('Web Mock closeSync');
    },
  };
};

// Função para obter a implementação correta baseada na plataforma
export const openDatabaseSync = (name: string) => {
  if (Platform.OS === 'web') {
    return createWebMock();
  } else {
    // Importa o SQLite real apenas no mobile
    const { openDatabaseSync: realOpenDatabase } = require('expo-sqlite');
    return realOpenDatabase(name);
  }
};