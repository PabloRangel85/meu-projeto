import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const sqlite = new Database(process.env.DATABASE_URL ?? "local.db");

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS cep_history (
    id TEXT PRIMARY KEY,
    cep TEXT NOT NULL,
    logradouro TEXT NOT NULL,
    complemento TEXT NOT NULL DEFAULT '',
    bairro TEXT NOT NULL,
    localidade TEXT NOT NULL,
    uf TEXT NOT NULL,
    ibge TEXT NOT NULL DEFAULT '',
    gia TEXT NOT NULL DEFAULT '',
    ddd TEXT NOT NULL DEFAULT '',
    siafi TEXT NOT NULL DEFAULT '',
    searched_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS addresses (
    id TEXT PRIMARY KEY,
    cep TEXT NOT NULL,
    logradouro TEXT NOT NULL,
    complemento TEXT NOT NULL DEFAULT '',
    bairro TEXT NOT NULL,
    localidade TEXT NOT NULL,
    uf TEXT NOT NULL,
    ibge TEXT NOT NULL DEFAULT '',
    gia TEXT NOT NULL DEFAULT '',
    ddd TEXT NOT NULL DEFAULT '',
    siafi TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL
  );
`);

export const db = drizzle(sqlite, { schema });

