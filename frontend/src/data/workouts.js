export const workouts = [
  {
    id: "upper-body-power",
    name: "Upper Body Power",
    category: "Strength",
    difficulty: "Intermediate",
    duration: 45,
    muscleGroups: ["Chest", "Shoulders", "Triceps", "Arms"],
    equipment: "Barbell, Bench",
    description:
      "A focused upper body session for pressing strength and muscular control.",
    exercisesList: [
      { name: "Bench Press", sets: 4, reps: 8 },
      { name: "Incline Dumbbell Press", sets: 3, reps: 10 },
      { name: "Cable Fly", sets: 3, reps: 12 },
    ],
  },
  {
    id: "lower-body-strength",
    name: "Lower Body Strength",
    category: "Legs",
    difficulty: "Advanced",
    duration: 55,
    exercises: 5,
    muscleGroups: ["Quads", "Hamstrings", "Glutes"],
    equipment: "Barbell, Rack",
    description:
      "Compound lower body work targeting power, stability, and balance.",
    exercisesList: [
      { name: "Back Squat", sets: 5, reps: 6 },
      { name: "Romanian Deadlift", sets: 4, reps: 8 },
      { name: "Walking Lunge", sets: 3, reps: 10 },
    ],
  },
  {
    id: "hiit-circuit",
    name: "HIIT Circuit",
    category: "Cardio",
    difficulty: "Beginner",
    duration: 30,
    muscleGroups: ["Full Body"],
    equipment: "Bodyweight, Mat",
    description:
      "A fast-paced cardiovascular workout for conditioning and calorie burn.",
    exercisesList: [
      { name: "Jump Squats", sets: 4, reps: 12 },
      { name: "Mountain Climbers", sets: 4, reps: 20 },
      { name: "Burpees", sets: 3, reps: 10 },
    ],
  },
  {
    id: "hypertrophy-core",
    name: "Hypertrophy Core",
    category: "Hypertrophy",
    difficulty: "Intermediate",
    duration: 40,
    muscleGroups: ["Core", "Abs", "Obliques"],
    equipment: "Dumbbells, Bench",
    description:
      "High-rep core-focused training to build strength and endurance.",
    exercisesList: [
      { name: "Weighted Sit-Up", sets: 4, reps: 12 },
      { name: "Cable Crunch", sets: 4, reps: 10 },
      { name: "Russian Twist", sets: 3, reps: 15 },
    ],
  },
  {
    id: "full-body-builder",
    name: "Full Body Builder",
    category: "Full Body",
    difficulty: "Intermediate",
    duration: 50,
    muscleGroups: ["Full Body", "Back"],
    equipment: "Dumbbells, Kettlebell",
    description:
      "A balanced full-body session for strength, stamina, and coordination.",
    exercisesList: [
      { name: "Goblet Squat", sets: 4, reps: 8 },
      { name: "Bent Over Row", sets: 4, reps: 8 },
      { name: "Overhead Press", sets: 3, reps: 10 },
    ],
  },
];

export const workoutCategories = [
  "All",
  ...new Set(
    workouts.flatMap((workout) => [workout.category, ...workout.muscleGroups]),
  ),
];
