import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useSelector } from "react-redux";
import AppShell from "./components/layout/AppShell.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Auth/Login.jsx";
import Signup from "./pages/Auth/Signup.jsx";
import Onboarding from "./pages/Onboarding/Onboarding.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import Workouts from "./pages/Workouts/Workouts.jsx";

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
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

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
          <Route path="/workouts/:workoutId" element={<WorkoutDetail />} />
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
