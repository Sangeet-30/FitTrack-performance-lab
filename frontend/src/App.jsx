import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import AppShell from "./components/layout/AppShell.jsx";
import { getCurrentUser } from "./services/authService.js";
import { loginSuccess, logout } from "./features/auth/authSlice.js";
import { setProfile, clearProfile } from "./features/user/userSlice.js";
const Landing = lazy(() => import("./pages/Landing.jsx"));
const Login = lazy(() => import("./pages/Auth/Login.jsx"));
const Signup = lazy(() => import("./pages/Auth/Signup.jsx"));
const Onboarding = lazy(() => import("./pages/Onboarding/Onboarding.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard.jsx"));
const Workouts = lazy(() => import("./pages/Workouts/Workouts.jsx"));

const WorkoutDetail = lazy(() => import("./pages/Workouts/WorkoutDetail.jsx"));
const ActiveWorkout = lazy(() => import("./pages/Workouts/ActiveWorkout.jsx"));
const Exercises = lazy(() => import("./pages/Exercises/Exercises.jsx"));
const Logs = lazy(() => import("./pages/Logs/Logs.jsx"));
const Progress = lazy(() => import("./pages/Progress/Progress.jsx"));
const Nutrition = lazy(() => import("./pages/Nutrition/Nutrition.jsx"));
const Goals = lazy(() => import("./pages/Goals/Goals.jsx"));
const Profile = lazy(() => import("./pages/Profile/Profile.jsx"));
const Settings = lazy(() => import("./pages/Settings/Settings.jsx"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound.jsx"));

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const isDemo = useSelector((state) => state.auth.demoMode);

  // Check persisted session on startup to prevent stale localStorage auth from bypassing expiry
  const [isVerifying, setIsVerifying] = useState(() => {
    return Boolean(isAuthenticated && !isDemo);
  });

  useEffect(() => {
    let isMounted = true;

    // Listen for unauthorized 401 events dispatched from API calls to immediately synchronize Redux
    const handleUnauthorized = () => {
      dispatch(logout());
      dispatch(clearProfile());
    };
    window.addEventListener("fittrack:unauthorized", handleUnauthorized);

    const verifySession = async () => {
      if (!isAuthenticated || isDemo) {
        if (isMounted) setIsVerifying(false);
        return;
      }

      try {
        const user = await getCurrentUser();
        if (isMounted) {
          if (user) {
            dispatch(loginSuccess(user));
            dispatch(setProfile(user));
          } else {
            dispatch(logout());
            dispatch(clearProfile());
          }
        }
      } catch {
        if (isMounted) {
          dispatch(logout());
          dispatch(clearProfile());
        }
      } finally {
        if (isMounted) {
          setIsVerifying(false);
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false;
      window.removeEventListener("fittrack:unauthorized", handleUnauthorized);
    };
  }, [dispatch, isAuthenticated, isDemo]);

  if (isVerifying) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "var(--bg-page, #0d0d10)",
          color: "var(--text-muted, #a1a1aa)",
          fontSize: "0.95rem",
          fontWeight: 500,
        }}
      >
        Verifying session...
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div style={{ padding: 48, textAlign: "center", color: "#a1a1aa" }}>
          Loading FitTrack...
        </div>
      }
    >
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />
        <Route
          path="/signup"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup />
          }
        />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Protected Authenticated Routes */}
        <Route
          element={
            isAuthenticated ? <AppShell /> : <Navigate to="/login" replace />
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/workout" element={<Navigate to="/workouts" replace />} />
          <Route path="/workouts/:workoutId" element={<WorkoutDetail />} />
          <Route path="/workout/:workoutId" element={<WorkoutDetail />} />
          <Route
            path="/workouts/:workoutId/active"
            element={<ActiveWorkout />}
          />
          <Route path="/exercises" element={<Exercises />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/nutrition" element={<Nutrition />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
