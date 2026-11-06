import { useMemo, useState } from "react";
import styles from "./Exercises.module.css";
import sharedStyles from "../../Shared.module.css";
import { cx } from "../../utils/classNames.js";

const exerciseLibrary = [
  // CHEST
  {
    id: "bench-press",
    name: "Flat Barbell Bench Press",
    category: "Chest",
    target: "Pectoralis Major",
    secondaryTargets: ["Triceps", "Front Delts"],
    difficulty: "Intermediate",
    equipment: "Barbell",
    setsReps: "3-4 sets × 6-10 reps",
    description: "Primary horizontal push for maximum mechanical tension and upper-body pectoral mass.",
    setup: "Lie flat on the bench, retract your scapulae, plant both feet firmly, and grip the bar slightly wider than shoulder width.",
    execution: "Unrack under control, lower bar with elbows tucked at roughly 45-75 degrees to mid-chest, touch lightly, and drive back up powerfully.",
    proTip: "Keep your wrists neutral and maintain leg drive throughout the entire pressing motion."
  },
  {
    id: "incline-dumbbell-press",
    name: "Incline Dumbbell Press",
    category: "Chest",
    target: "Upper Pectorals (Clavicular Head)",
    secondaryTargets: ["Front Delts", "Triceps"],
    difficulty: "Intermediate",
    equipment: "Dumbbells",
    setsReps: "3-4 sets × 8-12 reps",
    description: "Focuses load on the upper chest fibers with unrestricted natural range of motion.",
    setup: "Set the bench angle to 30-45 degrees. Kick the dumbbells up to shoulder height as you lean back.",
    execution: "Press upward in a slight converging arc without banging the weights together at the peak. Lower with a deep controlled stretch.",
    proTip: "Avoid setting the incline too steep (above 45°) to prevent front delts from taking over."
  },
  {
    id: "weighted-chest-dips",
    name: "Weighted Chest Dips",
    category: "Chest",
    target: "Lower Pectorals & Sternum",
    secondaryTargets: ["Triceps", "Anterior Delts"],
    difficulty: "Advanced",
    equipment: "Dip Station",
    setsReps: "3 sets × 8-12 reps",
    description: "High-yield bodyweight/weighted movement delivering maximal stretch and overload to the lower chest.",
    setup: "Support your weight on parallel bars, lean the torso forward 20-30 degrees, and cross your ankles.",
    execution: "Lower until your shoulders are just below your elbows, feeling a deep chest stretch. Press straight back up to full extension.",
    proTip: "Keep elbows flared slightly outward to bias pectorals over triceps."
  },
  {
    id: "pec-deck-fly",
    name: "Pec Deck Machine Fly",
    category: "Chest",
    target: "Sternal Pectorals",
    secondaryTargets: ["Anterior Delts"],
    difficulty: "Beginner",
    equipment: "Machine",
    setsReps: "3 sets × 12-15 reps",
    description: "Isolated adduction delivering continuous tension directly across the inner chest fibers.",
    setup: "Adjust seat height so handles align directly with mid-chest. Keep chest proud against the pad.",
    execution: "Bring handles together in a sweeping hugging arc. Hold peak contraction for 1 second before opening slowly.",
    proTip: "Maintain a soft micro-bend in the elbows to protect the biceps tendon."
  },
  {
    id: "cable-low-to-high-fly",
    name: "Cable Low-to-High Fly",
    category: "Chest",
    target: "Upper Chest & Serratus",
    secondaryTargets: ["Front Delts"],
    difficulty: "Intermediate",
    equipment: "Cables",
    setsReps: "3 sets × 12-15 reps",
    description: "Upward cable vector targeting upper chest fibers with consistent resistance.",
    setup: "Set pulleys to lowest pins. Take a split stance in the center and hold handles with palms facing up.",
    execution: "Scoop the handles upward and inward toward eye level, squeezing the clavicular chest at the peak.",
    proTip: "Do not use excessive weight; prioritize peak squeeze and controlled eccentric descent."
  },
  // BACK
  {
    id: "deadlift",
    name: "Conventional Barbell Deadlift",
    category: "Back",
    target: "Entire Posterior Chain & Erector Spinae",
    secondaryTargets: ["Hamstrings", "Glutes", "Traps", "Lats"],
    difficulty: "Advanced",
    equipment: "Barbell",
    setsReps: "3-5 sets × 5 reps",
    description: "The king of posterior chain compound strength movements, developing full-body thickness and grip.",
    setup: "Stance hip-width with bar over mid-foot. Hinge hips back, brace lats and core tight, grip just outside shins.",
    execution: "Push the floor away through midfoot, keeping bar glued close to shins and thighs. Lock out hips and knees simultaneously.",
    proTip: "Take slack out of the bar and build wedge tension before breaking the bar from the floor."
  },
  {
    id: "barbell-bent-over-row",
    name: "Barbell Bent-Over Row",
    category: "Back",
    target: "Rhomboids, Mid-Traps & Latissimus Dorsi",
    secondaryTargets: ["Biceps", "Rear Delts", "Spinal Erectors"],
    difficulty: "Intermediate",
    equipment: "Barbell",
    setsReps: "3-4 sets × 8-10 reps",
    description: "Essential builder for back density and pulling power in a hinged position.",
    setup: "Hinge torso forward to roughly a 45-degree angle. Grip bar slightly wider than shoulder width.",
    execution: "Pull elbows back toward hip pockets, squeezing scapulae together hard at peak. Lower under control without bobbing torso.",
    proTip: "Pull with your elbows, not your hands, to maximize back recruitment."
  },
  {
    id: "wide-grip-pull-up",
    name: "Wide-Grip Pull-Up",
    category: "Back",
    target: "Latissimus Dorsi (Outer Lats)",
    secondaryTargets: ["Biceps", "Brachialis", "Lower Traps"],
    difficulty: "Intermediate",
    equipment: "Pull-Up Bar",
    setsReps: "3-4 sets × 6-12 reps",
    description: "Foundational vertical pulling exercise to build sweeping lat width and V-taper aesthetic.",
    setup: "Hang with an overhand grip wider than shoulders. Depress scapulae downward to engage lats.",
    execution: "Drive elbows down toward hips while pulling upper chest toward the bar. Lower until arms are fully extended.",
    proTip: "Avoid kipping or swinging; initiate the pull by driving the elbows down."
  },
  {
    id: "seated-cable-row",
    name: "Seated Cable Row (Close-Grip)",
    category: "Back",
    target: "Mid-Back & Lower Lats",
    secondaryTargets: ["Biceps", "Forearms"],
    difficulty: "Beginner",
    equipment: "Cables",
    setsReps: "3-4 sets × 10-12 reps",
    description: "Safe, stabilized horizontal row for targeting mid-back thickness without lower back fatigue.",
    setup: "Sit upright with knees slightly bent. Grasp V-bar handle and sit tall with shoulders back.",
    execution: "Row handle directly into lower abdomen, driving elbows straight back. Squeeze shoulder blades together for 1s.",
    proTip: "Do not swing backward and forward; keep your torso stable at roughly 90 degrees."
  },
  {
    id: "face-pull",
    name: "Cable Face Pull",
    category: "Back",
    target: "Rear Deltoids & Rotator Cuff",
    secondaryTargets: ["Upper Traps", "Rhomboids"],
    difficulty: "Beginner",
    equipment: "Cables",
    setsReps: "3 sets × 15-20 reps",
    description: "Vital posture and shoulder-health builder focusing on external rotation and posterior delts.",
    setup: "Set rope attachment to eye level. Grip rope with thumbs pointing back towards you.",
    execution: "Pull the center of the rope toward your bridge of nose while externally rotating hands back past ears.",
    proTip: "Pause at peak external rotation to build bulletproof shoulder health."
  },
  // LEGS
  {
    id: "barbell-back-squat",
    name: "Barbell Back Squat",
    category: "Legs",
    target: "Quadriceps & Gluteus Maximus",
    secondaryTargets: ["Adductors", "Hamstrings", "Core"],
    difficulty: "Advanced",
    equipment: "Barbell",
    setsReps: "3-4 sets × 6-8 reps",
    description: "The cornerstone lower-body movement for mass, athletic performance, and structural strength.",
    setup: "Position bar across upper traps (high bar) or rear delts (low bar). Feet shoulder-width apart with toes flared slightly.",
    execution: "Inhale, brace 360° core, break at hips and knees together. Descend until hips break parallel. Drive aggressively back up.",
    proTip: "Keep knees tracking directly in line with toes and avoid letting hips shoot back early on the ascent."
  },
  {
    id: "romanian-deadlift",
    name: "Romanian Deadlift (RDL)",
    category: "Legs",
    target: "Hamstrings & Glutes",
    secondaryTargets: ["Erector Spinae", "Forearms"],
    difficulty: "Intermediate",
    equipment: "Barbell",
    setsReps: "3-4 sets × 8-10 reps",
    description: "Pure hip hinge producing intense eccentric hamstring stretch and glute hypertrophy.",
    setup: "Stand tall holding barbell at hip level. Unlock knees slightly and fix them in place.",
    execution: "Push your hips straight back as if closing a car door with your glutes. Lower bar along thighs until you feel full hamstring stretch.",
    proTip: "Do not squat down; this is a pure horizontal hip hinge movement."
  },
  {
    id: "leg-press",
    name: "45° Incline Leg Press",
    category: "Legs",
    target: "Quadriceps",
    secondaryTargets: ["Glutes", "Hamstrings"],
    difficulty: "Beginner",
    equipment: "Machine",
    setsReps: "3-4 sets × 10-15 reps",
    description: "High-volume leg builder allowing maximal quad overloading without axial spine fatigue.",
    setup: "Sit deep into the seat with lower back pinned firmly. Place feet shoulder-width on platform.",
    execution: "Release safety catches, lower platform smoothly until knees reach 90 degrees. Press platform back without hyperextending knees.",
    proTip: "Never allow your pelvis or lower back to round off the backrest."
  },
  {
    id: "bulgarian-split-squat",
    name: "Bulgarian Split Squat",
    category: "Legs",
    target: "Unilateral Quads & Glute Medius",
    secondaryTargets: ["Hamstrings", "Calves", "Core"],
    difficulty: "Intermediate",
    equipment: "Dumbbells",
    setsReps: "3 sets × 8-10 reps per leg",
    description: "Unilateral powerhouse that eliminates strength imbalances and builds bulletproof knees.",
    setup: "Place rear foot laces-down on a bench behind you. Take a comfortable stride forward with leading foot.",
    execution: "Descend straight down until rear knee is hovering just above the floor. Drive through front heel to return to top.",
    proTip: "Lean slightly forward at the torso to shift more tension into the glutes."
  },
  {
    id: "standing-calf-raise",
    name: "Standing Machine Calf Raise",
    category: "Legs",
    target: "Gastrocnemius & Soleus",
    secondaryTargets: ["Achilles Tendon"],
    difficulty: "Beginner",
    equipment: "Machine",
    setsReps: "4 sets × 12-15 reps",
    description: "Full-stretch calf extension under vertical load to develop dense lower leg muscles.",
    setup: "Place balls of feet on platform ledge. Rest shoulder pads comfortably on upper traps.",
    execution: "Drop heels deep for a full 2-second stretch. Explode onto toes, contracting calves hard at the peak for 1 second.",
    proTip: "Eliminate bouncing; the stretch pause at the bottom maximizes muscle fiber recruitment."
  },
  // SHOULDERS
  {
    id: "overhead-barbell-press",
    name: "Standing Overhead Barbell Press (OHP)",
    category: "Shoulders",
    target: "Anterior & Lateral Deltoids",
    secondaryTargets: ["Triceps", "Upper Chest", "Core"],
    difficulty: "Intermediate",
    equipment: "Barbell",
    setsReps: "3-4 sets × 6-8 reps",
    description: "Strict vertical pressing for total shoulder breadth, core stabilization, and tricep power.",
    setup: "Bar rests on anterior deltoids and clavicle. Grip shoulder-width, squeeze glutes and brace core.",
    execution: "Press bar vertically in a straight path, moving head slightly back to clear chin, then locking out directly overhead.",
    proTip: "Squeeze your glutes tightly to prevent excessive hyperextension of the lumbar spine."
  },
  {
    id: "dumbbell-lateral-raise",
    name: "Dumbbell Lateral Raise",
    category: "Shoulders",
    target: "Lateral (Side) Deltoids",
    secondaryTargets: ["Upper Traps"],
    difficulty: "Beginner",
    equipment: "Dumbbells",
    setsReps: "4 sets × 12-15 reps",
    description: "The ultimate exercise for side delt caps that give the aesthetic wide-shoulder appearance.",
    setup: "Stand with dumbbells at sides, slight hinge at hips, soft bend in elbows.",
    execution: "Raise dumbbells outward and upward in the scapular plane until parallel with floor. Lead with elbows.",
    proTip: "Think about pushing the weights out towards the walls rather than lifting them up."
  },
  {
    id: "cable-rear-delt-fly",
    name: "Cable Rear Delt Cross Fly",
    category: "Shoulders",
    target: "Posterior Deltoids",
    secondaryTargets: ["Rhomboids", "Mid Traps"],
    difficulty: "Beginner",
    equipment: "Cables",
    setsReps: "3 sets × 15 reps",
    description: "Isolates the posterior delts to round out complete 3D shoulder development.",
    setup: "Set dual pulleys to head height without handles. Grab left cable with right hand, right cable with left hand.",
    execution: "Pull arms outward and back horizontally in a sweeping cross pattern, contracting rear delts at full extension.",
    proTip: "Keep arms relatively straight with a micro-bend; do not squeeze shoulder blades excessively."
  },
  // ARMS
  {
    id: "barbell-bicep-curl",
    name: "Standing Barbell Bicep Curl",
    category: "Arms",
    target: "Biceps Brachii (Short & Long Heads)",
    secondaryTargets: ["Brachialis", "Forearms"],
    difficulty: "Beginner",
    equipment: "Barbell",
    setsReps: "3-4 sets × 8-12 reps",
    description: "High-overload direct arm builder delivering peak flexion tension to the biceps.",
    setup: "Stand with feet shoulder-width. Grip barbell underhand at shoulder width, pinning elbows by ribcage.",
    execution: "Curl bar upward in a controlled arc without rocking hips. Squeeze biceps hard at shoulder level, then lower slowly.",
    proTip: "Keep elbows stationary; moving elbows forward shifts tension away from biceps onto front delts."
  },
  {
    id: "hammer-curl",
    name: "Neutral Grip Hammer Curl",
    category: "Arms",
    target: "Brachialis & Brachioradialis",
    secondaryTargets: ["Biceps Brachii", "Forearm Flexors"],
    difficulty: "Beginner",
    equipment: "Dumbbells",
    setsReps: "3 sets × 10-12 reps",
    description: "Builds forearm mass and pushes the bicep peak higher from underneath.",
    setup: "Hold dumbbells with palms facing each other in a neutral handshake grip.",
    execution: "Curl dumbbells upward keeping palms facing inward throughout the entire arc. Squeeze at top and control descent.",
    proTip: "Can be performed alternating or both arms together for continuous tension."
  },
  {
    id: "tricep-rope-pushdown",
    name: "Cable Tricep Rope Pushdown",
    category: "Arms",
    target: "Triceps Lateral & Medial Heads",
    secondaryTargets: ["Anconeus"],
    difficulty: "Beginner",
    equipment: "Cables",
    setsReps: "3-4 sets × 10-15 reps",
    description: "Standard tricep isolation with rope flare maximizing contraction at full elbow extension.",
    setup: "Attach rope to high pulley. Stand with slight forward lean, pinning elbows tight to sides.",
    execution: "Push hands down, flaring the rope outward at bottom lockout to maximize lateral head squeeze.",
    proTip: "Keep upper arms completely motionless; only the forearms should move."
  },
  {
    id: "overhead-tricep-extension",
    name: "Overhead Cable Tricep Extension",
    category: "Arms",
    target: "Triceps Long Head",
    secondaryTargets: ["Lateral Head"],
    difficulty: "Intermediate",
    equipment: "Cables",
    setsReps: "3 sets × 12 reps",
    description: "Overhead position places the long head of the tricep under maximum stretch.",
    setup: "Attach rope to mid-chest pulley height. Turn facing away from stack, stepping forward into lunge.",
    execution: "Extend elbows overhead to full lockout, then return slowly to allow full stretch behind head.",
    proTip: "Flaring elbows slightly is natural, but keep them generally pointed forward to protect elbow joints."
  },
  // CORE
  {
    id: "hanging-leg-raise",
    name: "Hanging Leg Raise",
    category: "Core",
    target: "Rectus Abdominis (Lower Core)",
    secondaryTargets: ["Hip Flexors", "Obliques", "Grip"],
    difficulty: "Advanced",
    equipment: "Pull-Up Bar",
    setsReps: "3 sets × 10-15 reps",
    description: "High-recruitment core lift involving posterior pelvic tilt for deep abdominal definition.",
    setup: "Hang from pull-up bar with overhand grip. Engage lats to stabilize body from swinging.",
    execution: "Curl pelvis upward, bringing feet/knees toward chest height. Pause briefly, then lower slowly with zero swing.",
    proTip: "Initiate movement by curling the hips up toward the ribs, not just lifting the legs."
  },
  {
    id: "ab-wheel-rollout",
    name: "Ab Wheel Rollout",
    category: "Core",
    target: "Transverse Abdominis & Anterior Core",
    secondaryTargets: ["Lats", "Serratus", "Shoulders"],
    difficulty: "Advanced",
    equipment: "Wheel / Barbell",
    setsReps: "3 sets × 8-12 reps",
    description: "Intense anti-extension exercise requiring maximum core stiffness and spinal control.",
    setup: "Kneel on a soft mat, gripping the wheel handles directly beneath shoulders with tucked pelvis.",
    execution: "Roll wheel forward slowly, keeping core braced like a plank. Reach full extension before pulling back via lats and core.",
    proTip: "Never let your lower back sag into hyperextension; keep ribs glued down."
  }
];

const categoryOptions = ["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];
const difficultyOptions = ["All", "Beginner", "Intermediate", "Advanced"];
const equipmentOptions = ["All", "Barbell", "Dumbbells", "Cables", "Machine", "Pull-Up Bar"];

function Exercises() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [equipment, setEquipment] = useState("All");
  const [activeModalExercise, setActiveModalExercise] = useState(null);

  const filteredExercises = useMemo(() => {
    const q = query.trim().toLowerCase();

    return exerciseLibrary.filter((item) => {
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.target.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.equipment.toLowerCase().includes(q) ||
        (item.secondaryTargets && item.secondaryTargets.some((m) => m.toLowerCase().includes(q)));

      const matchesCategory = category === "All" || item.category === category;
      const matchesDifficulty = difficulty === "All" || item.difficulty === difficulty;
      const matchesEquipment = equipment === "All" || item.equipment.toLowerCase().includes(equipment.toLowerCase());

      return matchesQuery && matchesCategory && matchesDifficulty && matchesEquipment;
    });
  }, [query, category, difficulty, equipment]);

  return (
    <div className={cx([styles, sharedStyles], "exercisesPage")}>
      {/* Executive Header Banner */}
      <section className={cx([styles, sharedStyles], "headerBlock")}>
        <div className={styles.headerText}>
          <p className={cx([sharedStyles], "eyebrow accent")}>MOVEMENT VAULT</p>
          <h2>Exercise Catalog &amp; Form Guide</h2>
          <p>Master biomechanics, exercise selection, and key technical execution cues.</p>
        </div>
        <div className={styles.headerCountBadge}>
          <span>{filteredExercises.length}</span> Movements Available
        </div>
      </section>

      {/* Filter and Search Controls */}
      <section className={cx([styles, sharedStyles], "controlsBlock")}>
        {/* Quick Category Filter Pills */}
        <div className={styles.categoryPills}>
          {categoryOptions.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`${styles.pillButton} ${category === cat ? styles.active : ""}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Sub-filters */}
        <div className={styles.filterInputsRow}>
          <div className={styles.searchWrap}>
            <svg
              className={styles.searchIcon}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search exercise name, target muscle, or equipment…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search exercises"
            />
            {query && (
              <button
                type="button"
                className={styles.clearSearchBtn}
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <select
            className={styles.selectInput}
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            aria-label="Filter by equipment"
          >
            <option value="All">All Equipment</option>
            {equipmentOptions.filter((o) => o !== "All").map((eq) => (
              <option key={eq} value={eq}>{eq}</option>
            ))}
          </select>

          <select
            className={styles.selectInput}
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            aria-label="Filter by difficulty"
          >
            <option value="All">All Levels</option>
            {difficultyOptions.filter((o) => o !== "All").map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </section>

      {/* Exercises Grid */}
      <section className={styles.exercisesGrid}>
        {filteredExercises.length > 0 ? (
          filteredExercises.map((exercise) => {
            const diffClass =
              exercise.difficulty === "Beginner"
                ? styles.diffBeginner
                : exercise.difficulty === "Advanced"
                ? styles.diffAdvanced
                : styles.diffIntermediate;

            return (
              <article key={exercise.id} className={styles.exerciseCard}>
                <div className={styles.cardTopRow}>
                  <span className={styles.categoryTag}>{exercise.category}</span>
                  <span className={styles.difficultyPill}>
                    <span className={`${styles.diffDot} ${diffClass}`} />
                    {exercise.difficulty}
                  </span>
                </div>

                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{exercise.name}</h3>
                  <p className={styles.cardDesc}>{exercise.description}</p>

                  <div className={styles.specsStrip}>
                    <span className={styles.specChip}>
                      🎯 {exercise.target}
                    </span>
                    <span className={styles.specChip}>
                      ⚙️ {exercise.equipment}
                    </span>
                    <span className={styles.specChip}>
                      ⚡ {exercise.setsReps}
                    </span>
                  </div>

                  {exercise.secondaryTargets && exercise.secondaryTargets.length > 0 && (
                    <div className={styles.secondaryMuscleList}>
                      <span className={styles.secondaryLabel}>Synergists:</span>
                      {exercise.secondaryTargets.map((sec) => (
                        <span key={sec} className={styles.specChip}>
                          {sec}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.cardFooter}>
                  <button
                    type="button"
                    className={styles.detailButton}
                    onClick={() => setActiveModalExercise(exercise)}
                  >
                    📖 View Form &amp; Technique
                  </button>
                </div>
              </article>
            );
          })
        ) : (
          <div className={styles.emptyState}>
            <h3>No exercises match your current filters</h3>
            <p>Try clearing your search query or selecting "All" categories to view the full library.</p>
          </div>
        )}
      </section>

      {/* Technique Guide Modal */}
      {activeModalExercise && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setActiveModalExercise(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.categoryTag}>{activeModalExercise.category}</span>
                <h3 className={styles.modalTitle}>{activeModalExercise.name}</h3>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setActiveModalExercise(null)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className={styles.modalSection}>
              <div className={styles.modalSectionTitle}>Target Biomechanics</div>
              <p className={styles.modalSectionText}>
                <strong>Primary Target:</strong> {activeModalExercise.target}<br />
                {activeModalExercise.secondaryTargets && (
                  <><strong>Secondary Synergists:</strong> {activeModalExercise.secondaryTargets.join(", ")}<br /></>
                )}
                <strong>Recommended Volume:</strong> {activeModalExercise.setsReps}
              </p>
            </div>

            <div className={styles.modalSection}>
              <div className={styles.modalSectionTitle}>Setup &amp; Stance</div>
              <p className={styles.modalSectionText}>{activeModalExercise.setup}</p>
            </div>

            <div className={styles.modalSection}>
              <div className={styles.modalSectionTitle}>Execution Protocol</div>
              <p className={styles.modalSectionText}>{activeModalExercise.execution}</p>
            </div>

            <div className={styles.modalSection}>
              <div className={styles.modalSectionTitle}>Coaching Pro Tip</div>
              <p className={styles.modalSectionText}>💡 {activeModalExercise.proTip}</p>
            </div>

            <button
              type="button"
              className={cx([sharedStyles], "primary-button")}
              style={{ width: "100%", marginTop: 4 }}
              onClick={() => setActiveModalExercise(null)}
            >
              Close Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Exercises;
