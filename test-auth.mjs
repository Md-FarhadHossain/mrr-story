import { betterAuth } from "better-auth";
import { createClient } from "@libsql/client";

const client = createClient({
  url: "file:test.db",
});

try {
  const auth = betterAuth({
    database: client,
    emailAndPassword: { enabled: true }
  });
  console.log("betterAuth initialized successfully with direct libsql client");
} catch (e) {
  console.error("Error initializing betterAuth:", e);
}
