import { db } from "./db/index";
import { storiesTable } from "./db/schema";

async function run() {
  const stories = await db.select().from(storiesTable).limit(1);
  console.log(stories[0]);
}

run().catch(console.error);
