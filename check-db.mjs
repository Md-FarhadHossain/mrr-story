import { createClient } from "@libsql/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function run() {
  const rs = await client.execute("SELECT id, title, number_of_founders FROM stories ORDER BY id DESC LIMIT 1");
  console.log(rs.rows);
}

run().catch(console.error);
