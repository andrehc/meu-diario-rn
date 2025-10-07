import { initDB } from './database';

// Inicializa o banco de produção quando o app é carregado
export const initProductionDB = () => {
    initDB('diary.db'); // Banco de produção
};