import { db } from './db';
import { storiesTable } from './db/schema';
import { desc } from 'drizzle-orm';

async function check() {
  const stories = await db.select().from(storiesTable).orderBy(desc(storiesTable.createdAt));
  for (const s of stories) {
    console.log(`ID: ${s.id}, Founder: "${s.founderName}", Image: ${s.profileImageUrl ? 'YES' : 'NO'}`);
  }
}
check();
