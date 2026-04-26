require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@libsql/client');

async function main() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const result = await client.execute('SELECT content FROM stories ORDER BY created_at DESC LIMIT 1;');
  const content = result.rows[0].content;
  console.log("Raw content characters:");
  console.log(JSON.stringify(content.substring(0, 500)));
  
  const regex = /^##\s+(.+)$/gm;
  let match;
  console.log("Regex matches:");
  while ((match = regex.exec(content)) !== null) {
    console.log("Matched:", match[1]);
  }
}

main();
