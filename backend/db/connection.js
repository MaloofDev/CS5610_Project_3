import { MongoClient } from "mongodb";

let client;
let db;

// Connects once and reuses the same client everywhere.
export async function connectToDb() {
  if (db) return db;
  client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  db = client.db(process.env.DB_NAME || "warden");
  return db;
}

export function getDb() {
  if (!db) {
    throw new Error("Database not connected. Call connectToDb() first.");
  }
  return db;
}

export async function closeDb() {
  if (client) await client.close();
  client = undefined;
  db = undefined;
}
