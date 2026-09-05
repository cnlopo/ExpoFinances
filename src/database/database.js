import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('financas.db');

db.execSync(`DROP TABLE IF EXISTS registros`);

db.execSync(`
CREATE TABLE IF NOT EXISTS registros (
    id TEXT PRIMARY KEY NOT NULL,
    descricao TEXT,
    valor REAL,
    tipo TEXT,
    categoria TEXT
);
`);

export default db;