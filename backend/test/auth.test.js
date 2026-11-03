import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import app from '../src/app.js';
import User from '../src/models/User.js';

describe('Authentication and Protected Routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(1);
  });

  describe('Registration & Login', () => {
    it('creates a new user and sets httpOnly fittrack_token cookie on successful registration', async () => {
      vi.spyOn(User, 'findOne').mockResolvedValue(null);

      const fakeUser = {
        _id: new mongoose.Types.ObjectId().toString(),
        id: 'new-user-id',
        name: 'Jordan Hayes',
        email: 'jordan@example.com',
        goal: 'Improve Fitness',
        fitnessLevel: 'Beginner',
        units: 'kg',
        toSafeJSON() {
          return {
            id: this.id,
            name: this.name,
            email: this.email,
            goal: this.goal,
            fitnessLevel: this.fitnessLevel,
            units: this.units,
          };
        },
      };

      vi.spyOn(User, 'create').mockResolvedValue(fakeUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jordan Hayes',
          email: 'jordan@example.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe('jordan@example.com');
      expect(res.body.token).toBeUndefined();
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.headers['set-cookie'].some((c) => c.includes('fittrack_token'))).toBe(true);
      expect(res.headers['set-cookie'].some((c) => c.includes('HttpOnly'))).toBe(true);
    });

    it('returns 409 when attempting to register with an existing email', async () => {
      vi.spyOn(User, 'findOne').mockResolvedValue({ _id: 'existing-id' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jordan Hayes',
          email: 'duplicate@example.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('signs in a user with valid credentials', async () => {
      const passwordHash = await bcrypt.hash('CorrectPass1!', 10);
      const userDoc = {
        _id: new mongoose.Types.ObjectId().toString(),
        email: 'user@example.com',
        name: 'Athlete',
        status: 'active',
        passwordHash,
        async comparePassword(pwd) {
          return bcrypt.compare(pwd, this.passwordHash);
        },
        toSafeJSON() {
          return { id: this._id, name: this.name, email: this.email };
        },
      };

      vi.spyOn(User, 'findOne').mockReturnValue({
        select: () => Promise.resolve(userDoc),
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@example.com',
          password: 'CorrectPass1!',
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/Signed in successfully/i);
      expect(res.body.token).toBeUndefined();
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('rejects sign-in with invalid credentials with 401', async () => {
      vi.spyOn(User, 'findOne').mockReturnValue({
        select: () => Promise.resolve(null),
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/Invalid email or password/i);
    });

    it('clears fittrack_token cookie on logout', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).toBe(200);
      expect(res.headers['set-cookie']).toBeDefined();
    });
  });

  describe('Protected Route Enforcement', () => {
    it('rejects unauthenticated requests to /api/workouts with 401', async () => {
      const res = await request(app).get('/api/workouts');
      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/Authentication required/i);
    });

    it('rejects unauthenticated requests to /api/goals with 401', async () => {
      const res = await request(app).get('/api/goals');
      expect(res.status).toBe(401);
    });

    it('rejects unauthenticated requests to /api/dashboard with 401', async () => {
      const res = await request(app).get('/api/dashboard');
      expect(res.status).toBe(401);
    });

    it('returns 503 on protected routes when database is disconnected for non-demo users', async () => {
      vi.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(0);

      // Sign a valid token for a regular user
      const jwt = (await import('jsonwebtoken')).default;
      const regularUserToken = jwt.sign(
        { sub: 'some-user-id', email: 'regular@example.com' },
        process.env.JWT_SECRET || 'fittrack-development-fallback-secret-minimum-32-chars-long'
      );

      const res = await request(app)
        .get('/api/workouts')
        .set('Authorization', `Bearer ${regularUserToken}`);

      expect(res.status).toBe(503);
      expect(res.body.message).toMatch(/Database service is currently unavailable/i);
    });
  });
});
