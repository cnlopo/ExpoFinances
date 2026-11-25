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

db.execSync(`
CREATE TABLE IF NOT EXISTS cartoes (
    id TEXT PRIMARY KEY NOT NULL,
    nome TEXT NOT NULL,
    ultimos_digitos TEXT
);
`);

const colunas = db.getAllSync(
    'PRAGMA table_info(registros)'
);

const possuiCartaoId = colunas.some(
    coluna => coluna.name === 'cartao_id'
);

if (!possuiCartaoId) {
    db.execSync(`
        ALTER TABLE registros
        ADD COLUMN cartao_id TEXT;
    `);
}

db.execSync(`
CREATE INDEX IF NOT EXISTS idx_registros_cartao
ON registros(cartao_id);
`);

export default db;