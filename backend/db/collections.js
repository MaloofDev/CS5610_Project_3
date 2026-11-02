// Creates the collections and their indexes. Safe to run repeatedly.
const COLLECTIONS = {
  users: [{ key: { username: 1 }, unique: true }],
  runs: [
    { key: { userId: 1, startedAt: -1 } },
    { key: { userId: 1, repo: 1, release: 1, startedAt: -1 } },
  ],
  knownIssues: [
    { key: { userId: 1, status: 1, category: 1 } },
    { key: { userId: 1, updatedAt: -1 } },
  ],
  issueUpdates: [{ key: { issueId: 1, createdAt: 1 } }],
};

export async function initCollections(db) {
  const existing = new Set(
    (await db.listCollections({}, { nameOnly: true }).toArray()).map(
      (c) => c.name,
    ),
  );
  for (const [name, indexes] of Object.entries(COLLECTIONS)) {
    if (!existing.has(name)) await db.createCollection(name);
    for (const { key, ...options } of indexes) {
      await db.collection(name).createIndex(key, options);
    }
  }
}
