import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';

describe('Health and CORS Endpoints', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('reports database disconnected when readyState is 0', async () => {
    vi.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(0);

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(503);
    expect(res.body.status).toBe('degraded');
    expect(res.body.database.status).toBe('disconnected');
    expect(res.body.database).not.toHaveProperty('readyState');
  });

  it('reports database connected when readyState is 1', async () => {
    vi.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(1);

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database.status).toBe('connected');
    expect(res.body.database).not.toHaveProperty('readyState');
  });

  it('permits non-browser requests without Origin header regardless of database state', async () => {
    vi.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(1);
    const resConnected = await request(app).get('/api/health');
    expect(resConnected.status).toBe(200);
    expect(resConnected.headers['access-control-allow-origin']).toBeUndefined();

    // Verify non-browser request reaches handler without CORS rejection even when DB is offline
    vi.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(0);
    const resOffline = await request(app).get('/api/health');
    expect(resOffline.status).toBe(503);
    expect(resOffline.body.database.status).toBe('disconnected');
  });

  it('blocks unapproved browser origins with 403', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'https://malicious-site.example.com');

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/CORS blocked/i);
  });
});

