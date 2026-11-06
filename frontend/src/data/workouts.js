export const workouts = [
  // Chest Workouts
  {
    id: "chest-hypertrophy-blast",
    name: "Chest Hypertrophy & Density",
    category: "Chest",
    difficulty: "Intermediate",
    duration: 50,
    muscleGroups: ["Chest", "Triceps", "Shoulders"],
    equipment: "Barbell, Dumbbells, Cables",
    description:
      "A high-volume chest builder focused on progressive mechanical tension and deep pectoral stretch.",
    exercisesList: [
      { name: "Flat Barbell Bench Press", sets: 4, reps: 8 },
      { name: "Incline Dumbbell Press", sets: 3, reps: 10 },
      { name: "Weighted Chest Dips", sets: 3, reps: 10 },
      { name: "Pec Deck Machine Fly", sets: 3, reps: 12 },
      { name: "Cable Low-to-High Fly", sets: 3, reps: 15 },
    ],
  },
  {
    id: "upper-chest-power",
    name: "Upper Chest & Triceps Power",
    category: "Chest",
    difficulty: "Advanced",
    duration: 55,
    muscleGroups: ["Chest", "Triceps", "Shoulders"],
    equipment: "Barbell, Incline Bench, Cables",
    description:
      "Targeted clavicular pectoral work paired with heavy triceps pressing for shelf-like chest development.",
    exercisesList: [
      { name: "Incline Barbell Bench Press", sets: 4, reps: 6 },
      { name: "Incline Dumbbell Fly", sets: 3, reps: 10 },
      { name: "Close-Grip Barbell Bench Press", sets: 4, reps: 8 },
      { name: "Low-to-High Cable Crossover", sets: 3, reps: 12 },
      { name: "Overhead Rope Tricep Extension", sets: 3, reps: 12 },
    ],
  },

  // Back Workouts
  {
    id: "lat-width-pull-day",
    name: "Lat Width & Heavy Pull Day",
    category: "Back",
    difficulty: "Advanced",
    duration: 60,
    muscleGroups: ["Back", "Lats", "Biceps"],
    equipment: "Barbell, Cable Machine, Pull-Up Bar",
    description:
      "Heavy compound pulling and vertical lat engagement to forge maximum V-taper width and pull strength.",
    exercisesList: [
      { name: "Conventional Deadlift", sets: 4, reps: 5 },
      { name: "Wide-Grip Lat Pulldown", sets: 4, reps: 10 },
      { name: "Chest-Supported T-Bar Row", sets: 4, reps: 8 },
      { name: "Seated Cable Row", sets: 3, reps: 12 },
      { name: "Neutral-Grip Pull-Ups", sets: 3, reps: 8 },
    ],
  },
  {
    id: "upper-back-rear-delts",
    name: "Upper Back & Rear Delts Density",
    category: "Back",
    difficulty: "Intermediate",
    duration: 50,
    muscleGroups: ["Back", "Shoulders", "Biceps"],
    equipment: "Barbell, Dumbbells, Cables",
    description:
      "Mid-back thickness workout targeting the rhomboids, traps, and posterior deltoids for postural power.",
    exercisesList: [
      { name: "Barbell Bent-Over Row", sets: 4, reps: 8 },
      { name: "Single-Arm Dumbbell Row", sets: 3, reps: 10 },
      { name: "Face Pulls with External Rotation", sets: 4, reps: 15 },
      { name: "Straight-Arm Cable Pulldown", sets: 3, reps: 12 },
      { name: "Incline Dumbbell Rear Delt Fly", sets: 3, reps: 15 },
    ],
  },

  // Leg Workouts
  {
    id: "quad-dominant-leg-day",
    name: "Quad-Dominant Leg Day",
    category: "Legs",
    difficulty: "Advanced",
    duration: 60,
    muscleGroups: ["Legs", "Quads", "Glutes", "Calves"],
    equipment: "Barbell, Squat Rack, Leg Press",
    description:
      "Heavy knee-flexion compound work designed to overload the quadriceps and build foundation lower body power.",
    exercisesList: [
      { name: "Barbell Back Squat", sets: 5, reps: 5 },
      { name: "Leg Press (Feet Low)", sets: 4, reps: 10 },
      { name: "Bulgarian Split Squat", sets: 3, reps: 10 },
      { name: "Leg Extension (Pause at Top)", sets: 4, reps: 12 },
      { name: "Standing Calf Raise", sets: 4, reps: 15 },
    ],
  },
  {
    id: "hamstring-glute-builder",
    name: "Hamstrings & Glute Builder",
    category: "Legs",
    difficulty: "Intermediate",
    duration: 50,
    muscleGroups: ["Legs", "Hamstrings", "Glutes", "Calves"],
    equipment: "Barbell, Dumbbells, Leg Curl Machine",
    description:
      "Hip-hinge dominant leg day focusing on the posterior chain, hamstring recruitment, and glute hypertrophy.",
    exercisesList: [
      { name: "Romanian Deadlift (RDL)", sets: 4, reps: 8 },
      { name: "Barbell Hip Thrust", sets: 4, reps: 10 },
      { name: "Lying or Seated Leg Curl", sets: 4, reps: 12 },
      { name: "Walking Dumbbell Lunges", sets: 3, reps: 12 },
      { name: "Seated Calf Raise", sets: 4, reps: 15 },
    ],
  },
  {
    id: "lower-body-strength",
    name: "Lower Body Strength",
    category: "Legs",
    difficulty: "Advanced",
    duration: 55,
    muscleGroups: ["Legs", "Quads", "Hamstrings", "Glutes"],
    equipment: "Barbell, Rack",
    description:
      "Compound lower body work targeting power, stability, and balance.",
    exercisesList: [
      { name: "Back Squat", sets: 5, reps: 6 },
      { name: "Romanian Deadlift", sets: 4, reps: 8 },
      { name: "Walking Lunge", sets: 3, reps: 10 },
    ],
  },

  // Biceps & Arms Workouts
  {
    id: "biceps-peak-forearms",
    name: "Biceps Peak & Forearm Builder",
    category: "Biceps",
    difficulty: "Intermediate",
    duration: 40,
    muscleGroups: ["Biceps", "Arms", "Forearms"],
    equipment: "Barbell, Dumbbells, Preacher Bench",
    description:
      "Dedicated biceps session targeting both the long and short heads plus the brachialis for peaked arm development.",
    exercisesList: [
      { name: "Standing Barbell Bicep Curl", sets: 4, reps: 8 },
      { name: "Incline Dumbbell Curl", sets: 3, reps: 10 },
      { name: "EZ-Bar Preacher Curl", sets: 3, reps: 10 },
      { name: "Cross-Body Hammer Curl", sets: 3, reps: 12 },
      { name: "Reverse Grip Barbell Curl", sets: 3, reps: 15 },
    ],
  },
  {
    id: "arm-annihilator-superset",
    name: "Arm Annihilator (Biceps & Triceps)",
    category: "Arms",
    difficulty: "Intermediate",
    duration: 45,
    muscleGroups: ["Biceps", "Triceps", "Arms"],
    equipment: "EZ-Bar, Dumbbells, Cable Machine",
    description:
      "Antagonist superset protocol pumping blood through both biceps and triceps for rapid hypertrophy.",
    exercisesList: [
      { name: "EZ-Bar Bicep Curl", sets: 4, reps: 10 },
      { name: "Barbell Skull Crusher", sets: 4, reps: 10 },
      { name: "Cable Rope Hammer Curl", sets: 3, reps: 12 },
      { name: "Tricep Rope Pushdown", sets: 3, reps: 12 },
      { name: "Concentration Curl", sets: 3, reps: 12 },
      { name: "Overhead Dumbbell Tricep Extension", sets: 3, reps: 12 },
    ],
  },

  // Shoulders Workouts
  {
    id: "boulder-shoulders",
    name: "Boulder Shoulders Specialization",
    category: "Shoulders",
    difficulty: "Intermediate",
    duration: 45,
    muscleGroups: ["Shoulders", "Chest", "Upper Body"],
    equipment: "Barbell, Dumbbells, Cables",
    description:
      "Comprehensive 3D shoulder routine hitting the anterior, lateral, and rear deltoid heads with controlled volume.",
    exercisesList: [
      { name: "Standing Barbell Overhead Press", sets: 4, reps: 6 },
      { name: "Seated Dumbbell Lateral Raise", sets: 4, reps: 12 },
      { name: "Arnold Press", sets: 3, reps: 10 },
      { name: "Cable Lean-Away Lateral Raise", sets: 3, reps: 15 },
      { name: "Face Pulls", sets: 3, reps: 15 },
    ],
  },

  // Upper Body & Full Body
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
    id: "full-body-builder",
    name: "Full Body Builder",
    category: "Full Body",
    difficulty: "Intermediate",
    duration: 50,
    muscleGroups: ["Full Body", "Back", "Legs"],
    equipment: "Dumbbells, Kettlebell",
    description:
      "A balanced full-body session for strength, stamina, and coordination.",
    exercisesList: [
      { name: "Goblet Squat", sets: 4, reps: 8 },
      { name: "Bent Over Row", sets: 4, reps: 8 },
      { name: "Overhead Press", sets: 3, reps: 10 },
    ],
  },
  {
    id: "hiit-circuit",
    name: "HIIT Circuit",
    category: "Cardio",
    difficulty: "Beginner",
    duration: 30,
    muscleGroups: ["Full Body", "Cardio"],
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
];

export const workoutCategories = [
  "All",
  "Chest",
  "Back",
  "Legs",
  "Biceps",
  "Arms",
  "Shoulders",
  "Strength",
  "Hypertrophy",
  "Cardio",
  "Full Body",
];
