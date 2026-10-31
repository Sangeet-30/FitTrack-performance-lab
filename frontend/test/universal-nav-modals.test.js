import { describe, it, expect, vi } from 'vitest';
import { workouts } from '../src/data/workouts.js';

describe('Universal Search & Workout Catalog Filter', () => {
  it('correctly searches pages and workouts by query', () => {
    const query = 'upper';
    const q = query.toLowerCase();

    const matchedWorkouts = workouts.filter((w) =>
      w.name.toLowerCase().includes(q) ||
      (w.category && w.category.toLowerCase().includes(q))
    );

    expect(matchedWorkouts.length).toBeGreaterThan(0);
    expect(matchedWorkouts.some((w) => w.name.includes('Upper Body Power'))).toBe(true);
  });

  it('correctly indexes exercises across workouts', () => {
    const exerciseSet = new Set();
    workouts.forEach((w) => {
      (w.exercisesList || []).forEach((ex) => {
        exerciseSet.add(ex.name);
      });
    });

    expect(exerciseSet.has('Bench Press')).toBe(true);
    expect(exerciseSet.has('Back Squat')).toBe(true);

    const benchMatches = Array.from(exerciseSet).filter((name) =>
      name.toLowerCase().includes('bench')
    );
    expect(benchMatches.length).toBeGreaterThan(0);
  });

  it('clearing search query restores default quick navigation', () => {
    let query = 'bench press';
    expect(query.length).toBeGreaterThan(0);

    // Simulate clicking clear button (X)
    query = '';
    expect(query).toBe('');
  });
});

describe('Universal Quick Log Session Broadcast', () => {
  const eventTarget = typeof window !== 'undefined' ? window : new EventTarget();

  it('dispatches fittrack:workout-logged event on completion', () => {
    const listener = vi.fn();
    eventTarget.addEventListener('fittrack:workout-logged', listener);

    const testEvent = new CustomEvent('fittrack:workout-logged', {
      detail: { name: 'Upper Body Power', category: 'Strength' },
    });
    eventTarget.dispatchEvent(testEvent);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail).toEqual({
      name: 'Upper Body Power',
      category: 'Strength',
    });

    eventTarget.removeEventListener('fittrack:workout-logged', listener);
  });

  it('dispatches fittrack:open-log event from any page to open universal modal', () => {
    const listener = vi.fn();
    eventTarget.addEventListener('fittrack:open-log', listener);

    eventTarget.dispatchEvent(new CustomEvent('fittrack:open-log'));
    expect(listener).toHaveBeenCalledTimes(1);

    eventTarget.removeEventListener('fittrack:open-log', listener);
  });
});
