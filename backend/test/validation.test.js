import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import User from '../src/models/User.js';
import { workoutCreateSchema, goalCreateSchema } from '../src/validation/schemas.js';

describe('Zod and ObjectId Request Validation', () => {
  const dummyUserId = new mongoose.Types.ObjectId().toString();
  let validAuthToken;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(1);

    // Mock User.findById for auth middleware
    vi.spyOn(User, 'findById').mockReturnValue({
      select: () => ({
        maxTimeMS: async () => ({
          _id: dummyUserId,
          id: dummyUserId,
          email: 'test@example.com',
          name: 'Test Athlete',
          status: 'active',
          toSafeJSON() {
            return { id: dummyUserId, email: this.email, name: this.name };
          },
        }),
      }),
    });

    validAuthToken = jwt.sign(
      { sub: dummyUserId, email: 'test@example.com' },
      process.env.JWT_SECRET || 'fittrack-development-fallback-secret-minimum-32-chars-long'
    );
  });

  describe('Auth Registration Validation', () => {
    it('rejects registration when name is shorter than 2 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'A',
          email: 'valid@example.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Name must contain at least 2 characters/i);
    });

    it('rejects registration with invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Alex Rivera',
          email: 'not-an-email',
          password: 'Password123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Enter a valid email address/i);
    });

    it('rejects registration when password fails complexity rules', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Alex Rivera',
          email: 'valid@example.com',
          password: 'alllowercase',
        });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('Workout Validation', () => {
    it('rejects workout creation when name is missing or empty', async () => {
      const res = await request(app)
        .post('/api/workouts')
        .set('Authorization', `Bearer ${validAuthToken}`)
        .send({
          category: 'Strength',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Workout name is required/i);
    });

    it('rejects workout creation when category is invalid', async () => {
      const res = await request(app)
        .post('/api/workouts')
        .set('Authorization', `Bearer ${validAuthToken}`)
        .send({
          name: 'Morning Run',
          category: 'InvalidCategory123',
        });

      expect(res.status).toBe(400);
    });

    it('accepts extended athletic workout categories including Hypertrophy, Conditioning, and HIIT', () => {
      const hypertrophyParsed = workoutCreateSchema.safeParse({ name: 'Chest Session', category: 'Hypertrophy' });
      expect(hypertrophyParsed.success).toBe(true);

      const conditioningParsed = workoutCreateSchema.safeParse({ name: 'Agility Ladder', category: 'Conditioning' });
      expect(conditioningParsed.success).toBe(true);

      const hiitParsed = workoutCreateSchema.safeParse({ name: 'Sprint Intervals', category: 'HIIT' });
      expect(hiitParsed.success).toBe(true);
    });
  });

  describe('Goal Validation', () => {
    it('accepts consistent goal status values including active, completed, paused, and archived', () => {
      ['active', 'completed', 'paused', 'archived'].forEach((status) => {
        const parsed = goalCreateSchema.safeParse({
          title: 'Target Benchmark',
          targetValue: 100,
          status,
        });
        expect(parsed.success).toBe(true);
      });
    });

    it('rejects goal creation when targetValue is missing or not positive', async () => {
      const res = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${validAuthToken}`)
        .send({
          title: 'Bench Press',
          targetValue: -10,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Target value must be positive/i);
    });
  });

  describe('MongoDB ObjectId Param Validation', () => {
    it('rejects invalid ObjectId parameters with 400 before querying database', async () => {
      const res = await request(app)
        .get('/api/workouts/invalid-id-123')
        .set('Authorization', `Bearer ${validAuthToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/24-character hexadecimal ObjectId string/i);
    });

    it('rejects invalid ObjectId on goal PATCH route', async () => {
      const res = await request(app)
        .patch('/api/goals/not-a-mongo-id')
        .set('Authorization', `Bearer ${validAuthToken}`)
        .send({ currentValue: 10 });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/24-character hexadecimal ObjectId string/i);
    });
  });
});
