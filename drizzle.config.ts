import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.TURSO_DATABASE_URL) {
  throw new Error("Missing env var: TURSO_DATABASE_URL");
}

export default defineConfig({
  out: './drizzle',
  schema: './db/schema.ts',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
});
