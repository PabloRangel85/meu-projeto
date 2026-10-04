import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./infrastructure/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: "./local.db" },
});
