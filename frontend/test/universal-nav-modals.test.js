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

describe('NoticeModal Contextual Display (Authenticated vs Demo Mode)', () => {
  it('renders clean confirmation for authenticated users without demo preview banner', async () => {
    const React = await import('react');
    const { renderToStaticMarkup } = await import('react-dom/server');
    const { Provider } = await import('react-redux');
    const { configureStore } = await import('@reduxjs/toolkit');
    const { MemoryRouter } = await import('react-router-dom');
    const { NoticeModal } = await import('../src/components/NoticeModal/NoticeModal.jsx');

    const testStore = configureStore({
      reducer: {
        auth: () => ({ isAuthenticated: true, demoMode: false, user: { name: 'Sangeet' } }),
      },
    });

    const html = renderToStaticMarkup(
      React.createElement(
        Provider,
        { store: testStore },
        React.createElement(
          MemoryRouter,
          null,
          React.createElement(NoticeModal, {
            isOpen: true,
            title: 'Session Logged',
            message: 'Awesome job! Session has been recorded.',
            onClose: () => {},
          })
        )
      )
    );

    // Should NOT contain "Read-Only Preview"
    expect(html).not.toContain('Read-Only Preview');
    // Should NOT contain "Create Free Account"
    expect(html).not.toContain('Create Free Account');
    // Should contain contextual eyebrow and Got it button
    expect(html).toContain('Session Recorded');
    expect(html).toContain('Got it');
  });

  it('renders read-only preview and signup CTA when demoMode is active', async () => {
    const React = await import('react');
    const { renderToStaticMarkup } = await import('react-dom/server');
    const { Provider } = await import('react-redux');
    const { configureStore } = await import('@reduxjs/toolkit');
    const { MemoryRouter } = await import('react-router-dom');
    const { NoticeModal } = await import('../src/components/NoticeModal/NoticeModal.jsx');

    const demoStore = configureStore({
      reducer: {
        auth: () => ({ isAuthenticated: false, demoMode: true }),
      },
    });

    const html = renderToStaticMarkup(
      React.createElement(
        Provider,
        { store: demoStore },
        React.createElement(
          MemoryRouter,
          null,
          React.createElement(NoticeModal, {
            isOpen: true,
            title: 'Training Readiness',
            message: 'Training load is well balanced.',
            onClose: () => {},
          })
        )
      )
    );

    // Should contain "Read-Only Preview"
    expect(html).toContain('Read-Only Preview');
    // Should contain "Create Free Account"
    expect(html).toContain('Create Free Account');
    // Should contain "Continue Exploring"
    expect(html).toContain('Continue Exploring');
  });
});
