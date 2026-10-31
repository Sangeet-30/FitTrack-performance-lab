import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Workout from '../src/models/Workout.js';
import Goal from '../src/models/Goal.js';

describe('Multi-Tenant Data Isolation', () => {
  const userAId = new mongoose.Types.ObjectId().toString();
  const userBId = new mongoose.Types.ObjectId().toString();
  const workoutId = new mongoose.Types.ObjectId().toString();
  const goalId = new mongoose.Types.ObjectId().toString();

  const secret = process.env.JWT_SECRET || 'fittrack-development-fallback-secret-minimum-32-chars-long';
  const tokenUserA = jwt.sign({ sub: userAId, email: 'userA@example.com' }, secret);
  const tokenUserB = jwt.sign({ sub: userBId, email: 'userB@example.com' }, secret);

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(1);

    // Mock User.findById to resolve the respective user based on token sub
    vi.spyOn(User, 'findById').mockImplementation((id) => ({
      select: () => ({
        maxTimeMS: async () => ({
          _id: id,
          id: id.toString(),
          email: id.toString() === userAId ? 'userA@example.com' : 'userB@example.com',
          name: id.toString() === userAId ? 'User A' : 'User B',
          status: 'active',
          toSafeJSON() {
            return { id: this.id, email: this.email, name: this.name };
          },
        }),
      }),
    }));
  });

  describe('Workout Tenant Isolation', () => {
    it('prevents User B from accessing User A workout by returning 404', async () => {
      // Find query scoped by user: req.user.id
      vi.spyOn(Workout, 'findOne').mockImplementation(({ _id, user }) => {
        if (_id.toString() === workoutId && user.toString() === userAId) {
          return Promise.resolve({ _id: workoutId, user: userAId, name: 'User A Secret Workout' });
        }
        return Promise.resolve(null);
      });

      // User B tries to read User A's workout
      const res = await request(app)
        .get(`/api/workouts/${workoutId}`)
        .set('Authorization', `Bearer ${tokenUserB}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/Workout not found/i);
    });

    it('prevents User B from updating User A workout by returning 404', async () => {
      vi.spyOn(Workout, 'findOneAndUpdate').mockImplementation(({ _id, user }) => {
        if (_id.toString() === workoutId && user.toString() === userAId) {
          return Promise.resolve({ _id: workoutId, user: userAId, name: 'Updated' });
        }
        return Promise.resolve(null);
      });

      const res = await request(app)
        .patch(`/api/workouts/${workoutId}`)
        .set('Authorization', `Bearer ${tokenUserB}`)
        .send({ name: 'Tampered Workout Name' });

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/Workout not found/i);
    });

    it('prevents User B from deleting User A workout by returning 404', async () => {
      vi.spyOn(Workout, 'findOneAndDelete').mockImplementation(({ _id, user }) => {
        if (_id.toString() === workoutId && user.toString() === userAId) {
          return Promise.resolve({ _id: workoutId, user: userAId });
        }
        return Promise.resolve(null);
      });

      const res = await request(app)
        .delete(`/api/workouts/${workoutId}`)
        .set('Authorization', `Bearer ${tokenUserB}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/Workout not found/i);
    });
  });

  describe('Goal Tenant Isolation', () => {
    it('prevents User B from updating User A goal by returning 404', async () => {
      vi.spyOn(Goal, 'findOneAndUpdate').mockImplementation(({ _id, user }) => {
        if (_id.toString() === goalId && user.toString() === userAId) {
          return Promise.resolve({ _id: goalId, user: userAId });
        }
        return Promise.resolve(null);
      });

      const res = await request(app)
        .patch(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${tokenUserB}`)
        .send({ currentValue: 999 });

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/Goal not found/i);
    });

    it('prevents User B from deleting User A goal by returning 404', async () => {
      vi.spyOn(Goal, 'findOneAndDelete').mockImplementation(({ _id, user }) => {
        if (_id.toString() === goalId && user.toString() === userAId) {
          return Promise.resolve({ _id: goalId, user: userAId });
        }
        return Promise.resolve(null);
      });

      const res = await request(app)
        .delete(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${tokenUserB}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/Goal not found/i);
    });
  });
});
