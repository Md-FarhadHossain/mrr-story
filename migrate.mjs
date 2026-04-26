import { createClient } from '@libsql/client';

const client = createClient({
  url: 'libsql://staterstory-saasix.aws-ap-south-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzYxMDgwNDAsImlkIjoiMDE5ZDg4NDktZGUwMS03NzA4LWE5YzUtMDZjNzY5NjAyNTRlIiwicmlkIjoiM2RlMTMwODUtMDQyMi00NzA0LWEzNDctNTk3ZDE3MGY3MWM5In0.AQTe-6cODM5ZI0-DDiIZ-nmWnqlF6hfMAAwOy1xVvbw1HIMD_qyNNZpVsWDc5yFte1oHxoKrmzU2RigI0_Y4AA',
});

async function migrate() {
  const cols = [
    { name: 'customers', type: 'TEXT' },
    { name: 'niche', type: 'TEXT' },
    { name: 'product_url', type: 'TEXT' },
  ];

  for (const col of cols) {
    try {
      await client.execute(`ALTER TABLE stories ADD COLUMN ${col.name} ${col.type}`);
      console.log(`✅ Added column: ${col.name}`);
    } catch (e) {
      if (e.message?.includes('duplicate column')) {
        console.log(`⚠️  Column already exists: ${col.name}`);
      } else {
        console.error(`❌ Error adding ${col.name}:`, e.message);
      }
    }
  }

  console.log('Migration complete.');
  process.exit(0);
}

migrate();
