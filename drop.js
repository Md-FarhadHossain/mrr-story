require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@libsql/client');

async function main() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  await client.execute('DROP TABLE IF EXISTS stories;');
  console.log('Drop successful');
}

main();
