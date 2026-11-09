import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('financas.db');

db.execSync(`
CREATE TABLE IF NOT EXISTS registros (
    id TEXT PRIMARY KEY NOT NULL,
    descricao TEXT,
    valor REAL,
    tipo TEXT,
    categoria TEXT,
    data_registro TEXT
);
`);

export default db;