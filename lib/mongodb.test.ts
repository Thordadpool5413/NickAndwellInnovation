import { describe, it, expect, vi } from 'vitest';

class MockMongoClient {
  connect = vi.fn().mockResolvedValue({ db: vi.fn().mockReturnValue({}) });
}

vi.mock('mongodb', () => ({ MongoClient: MockMongoClient, Db: class {} }));

async function load(env: Record<string, string>) {
  vi.resetModules();
  for (const [key, val] of Object.entries(env)) vi.stubEnv(key, val);
  delete (globalThis as Record<string, unknown>)._cihMongoClientPromise;
  return import('./mongodb');
}

describe('isMongoConfigured', () => {
  it('returns false when URI is not set', async () => {
    const { isMongoConfigured } = await load({ MONGODB_URI: '', MONGODB_DB: '' });
    expect(isMongoConfigured()).toBe(false);
  });

  it('returns true when URI is set', async () => {
    const { isMongoConfigured } = await load({ MONGODB_URI: 'mongodb://localhost:27017/test', MONGODB_DB: '' });
    expect(isMongoConfigured()).toBe(true);
  });

  it('trims whitespace from env value', async () => {
    const { isMongoConfigured } = await load({ MONGODB_URI: '  mongodb://localhost:27017/test  ', MONGODB_DB: '' });
    expect(isMongoConfigured()).toBe(true);
  });
});

describe('getMongoClient', () => {
  it('throws when URI is not configured', async () => {
    const { getMongoClient } = await load({ MONGODB_URI: '', MONGODB_DB: '' });
    await expect(getMongoClient()).rejects.toThrow('MONGODB_URI is not configured');
  });

  it('returns a connected client when configured', async () => {
    const { getMongoClient } = await load({ MONGODB_URI: 'mongodb://localhost:27017/test', MONGODB_DB: '' });
    const client = await getMongoClient();
    expect(client).toBeDefined();
  });

  it('caches the client promise', async () => {
    const { getMongoClient } = await load({ MONGODB_URI: 'mongodb://localhost:27017/test', MONGODB_DB: '' });
    const first = await getMongoClient();
    const second = await getMongoClient();
    expect(first).toBe(second);
  });
});

describe('getMongoDb', () => {
  it('returns a db instance', async () => {
    const { getMongoDb } = await load({ MONGODB_URI: 'mongodb://localhost:27017/test', MONGODB_DB: 'test_db' });
    const db = await getMongoDb();
    expect(db).toBeDefined();
  });
});
