import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const cepHistory = sqliteTable("cep_history", {
  id: text("id").primaryKey(),
  cep: text("cep").notNull(),
  logradouro: text("logradouro").notNull(),
  complemento: text("complemento").notNull().default(""),
  bairro: text("bairro").notNull(),
  localidade: text("localidade").notNull(),
  uf: text("uf").notNull(),
  ibge: text("ibge").notNull().default(""),
  gia: text("gia").notNull().default(""),
  ddd: text("ddd").notNull().default(""),
  siafi: text("siafi").notNull().default(""),
  searchedAt: integer("searched_at", { mode: "timestamp" }).notNull(),
});

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  done: integer("done", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const addresses = sqliteTable("addresses", {
  id: text("id").primaryKey(),
  cep: text("cep").notNull(),
  logradouro: text("logradouro").notNull(),
  complemento: text("complemento").notNull().default(""),
  bairro: text("bairro").notNull(),
  localidade: text("localidade").notNull(),
  uf: text("uf").notNull(),
  ibge: text("ibge").notNull().default(""),
  gia: text("gia").notNull().default(""),
  ddd: text("ddd").notNull().default(""),
  siafi: text("siafi").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

