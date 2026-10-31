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

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('degraded');
    expect(res.body.database.status).toBe('disconnected');
    expect(res.body.database.readyState).toBe(0);
  });

  it('reports database connected when readyState is 1', async () => {
    vi.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(1);

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database.status).toBe('connected');
    expect(res.body.database.readyState).toBe(1);
  });

  it('permits non-browser requests without Origin header', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
  });

  it('blocks unapproved browser origins with 403', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'https://malicious-site.example.com');

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/CORS blocked/i);
  });
});

