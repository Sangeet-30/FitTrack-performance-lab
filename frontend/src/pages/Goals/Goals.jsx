import { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { apiRequest } from "../../services/api.js";
import sharedStyles from "../../Shared.module.css";
import styles from "./Goals.module.css";
import { cx } from "../../utils/classNames.js";
import NoticeModal from "../../components/NoticeModal/NoticeModal.jsx";

const initialForm = {
  title: "",
  category: "Strength",
  targetValue: "",
  currentValue: "0",
  unit: "kg",
  dueDate: "",
};

const DEMO_GOALS_LIST = [
  {
    _id: "demo-goal-1",
    title: "Reach 100 kg Bench Press",
    category: "Strength",
    targetValue: 100,
    currentValue: 80,
    unit: "kg",
    status: "active",
  },
  {
    _id: "demo-goal-2",
    title: "Squat 140 kg with Clean Depth",
    category: "Strength",
    targetValue: 140,
    currentValue: 125,
    unit: "kg",
    status: "active",
  },
  {
    _id: "demo-goal-3",
    title: "Conventional Deadlift 180 kg",
    category: "Strength",
    targetValue: 180,
    currentValue: 160,
    unit: "kg",
    status: "active",
  },
  {
    _id: "demo-goal-4",
    title: "Maintain 6 Training Sessions / Wk",
    category: "Habit",
    targetValue: 6,
    currentValue: 5,
    unit: "sessions",
    status: "active",
  },
  {
    _id: "demo-goal-5",
    title: "Target Bodyweight 74 kg Lean",
    category: "Body",
    targetValue: 74,
    currentValue: 74.5,
    unit: "kg",
    status: "active",
  },
  {
    _id: "demo-goal-6",
    title: "Overhead Barbell Press 65 kg",
    category: "Strength",
    targetValue: 65,
    currentValue: 65,
    unit: "kg",
    status: "completed",
  },
];

function Goals() {
  const demoMode = useSelector((state) => state.auth.demoMode);
  const authUser = useSelector((state) => state.auth?.user);
  const isDemoUser = Boolean(demoMode || authUser?.isDemo || authUser?.email === "demo@fittrack.app");
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all"); // 'all', 'active', 'completed'
  const [deletingGoal, setDeletingGoal] = useState(null);

  // Edit Milestone Modal
  const [editingGoal, setEditingGoal] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    category: "Strength",
    targetValue: "",
    currentValue: "0",
    unit: "kg",
    dueDate: "",
    status: "active",
  });

  const loadGoals = useCallback(async () => {
    try {
      const data = await apiRequest("/goals");
      if (isDemoUser && (!data?.items || data.items.length === 0)) {
        setItems(DEMO_GOALS_LIST);
      } else {
        setItems(data.items || []);
      }
    } catch (error) {
      if (isDemoUser) {
        setItems(DEMO_GOALS_LIST);
      } else {
        setMessage(
          `${error.message} Check that the API is running and sign in again if needed.`
        );
      }
    } finally {
      setLoading(false);
    }
  }, [isDemoUser]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const submitGoal = async (event) => {
    event.preventDefault();
    if (isDemoUser) {
      setMessage(
        "Demo Overview Mode: Creating new goals is disabled in preview mode."
      );
      return;
    }
    if (!form.title.trim()) return;
    setSaving(true);
    setMessage("");

    try {
      let targetVal = form.targetValue === "" ? undefined : Number(form.targetValue);
      let currentVal = Number(form.currentValue) || 0;
      let statusVal = "active";
      if (targetVal !== undefined && targetVal > 0 && currentVal > targetVal) {
        currentVal = targetVal;
      }
      if (targetVal !== undefined && targetVal > 0 && currentVal >= targetVal) {
        statusVal = "completed";
      }

      const data = await apiRequest("/goals", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          targetValue: targetVal,
          currentValue: currentVal,
          status: statusVal,
          dueDate: form.dueDate || undefined,
        }),
      });
      setItems((current) => [data.item, ...current]);
      setForm(initialForm);
      setMessage("New training milestone goal established.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const updateGoal = async (goal, patch) => {
    if (isDemoUser) {
      setMessage("Demo Overview Mode: Editing goals is disabled in preview mode.");
      return;
    }
    try {
      const data = await apiRequest(`/goals/${goal._id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      setItems((current) =>
        current.map((item) => (item._id === goal._id ? data.item : item))
      );
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleStartEdit = (goal) => {
    if (goal.status === "completed") {
      setMessage("Completed milestones cannot be edited. Reopen the milestone first to modify it.");
      return;
    }
    setEditingGoal(goal);
    setEditForm({
      title: goal.title || "",
      category: goal.category || "Strength",
      targetValue: goal.targetValue != null ? String(goal.targetValue) : "",
      currentValue: goal.currentValue != null ? String(goal.currentValue) : "0",
      unit: goal.unit || "kg",
      dueDate: goal.dueDate ? new Date(goal.dueDate).toISOString().slice(0, 10) : "",
      status: goal.status || "active",
    });
  };

  const handleCloseEdit = () => {
    setEditingGoal(null);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingGoal || !editForm.title.trim()) return;

    let targetVal = editForm.targetValue === "" ? 0 : Number(editForm.targetValue);
    let currentVal = Number(editForm.currentValue) || 0;
    // Disallow progress exceeding target (e.g. no 82/80 kg)
    if (targetVal > 0 && currentVal > targetVal) {
      currentVal = targetVal;
    }
    let nextStatus = editForm.status;
    if (targetVal > 0 && currentVal >= targetVal && nextStatus !== "completed") {
      nextStatus = "completed";
    }

    const patch = {
      title: editForm.title.trim(),
      category: editForm.category,
      targetValue: targetVal,
      currentValue: currentVal,
      unit: (editForm.unit || "kg").trim(),
      dueDate: editForm.dueDate ? new Date(editForm.dueDate).toISOString() : undefined,
      status: nextStatus,
    };

    if (isDemoUser) {
      setItems((current) =>
        current.map((item) =>
          item._id === editingGoal._id ? { ...item, ...patch } : item
        )
      );
      setEditingGoal(null);
      setMessage("Milestone updated in preview mode.");
      return;
    }

    try {
      setSaving(true);
      const data = await apiRequest(`/goals/${editingGoal._id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      setItems((current) =>
        current.map((item) => (item._id === editingGoal._id ? data.item : item))
      );
      setEditingGoal(null);
      setMessage("Milestone goal updated successfully.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!editingGoal) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleCloseEdit();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingGoal]);

  const deleteGoal = async (goal) => {
    if (isDemoUser) {
      setMessage("Demo Overview Mode: Deleting goals is disabled in preview mode.");
      return;
    }

    try {
      await apiRequest(`/goals/${goal._id}`, { method: "DELETE" });
      setItems((current) => current.filter((item) => item._id !== goal._id));
      setMessage("Goal removed.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  // Metrics
  const activeCount = useMemo(
    () => items.filter((g) => g.status !== "completed").length,
    [items]
  );
  const completedCount = useMemo(
    () => items.filter((g) => g.status === "completed").length,
    [items]
  );
  const avgProgress = useMemo(() => {
    const scored = items.filter((g) => Number(g.targetValue) > 0);
    if (!scored.length) return 0;
    const totalP = scored.reduce((sum, g) => {
      const p = Math.min(
        100,
        Math.round(((Number(g.currentValue) || 0) / Number(g.targetValue)) * 100)
      );
      return sum + p;
    }, 0);
    return Math.round(totalP / scored.length);
  }, [items]);

  const filteredItems = useMemo(() => {
    if (filter === "active") return items.filter((g) => g.status !== "completed");
    if (filter === "completed") return items.filter((g) => g.status === "completed");
    return items;
  }, [items, filter]);

  return (
    <div className={cx([styles, sharedStyles], "goalsPage")}>
      {/* Executive Header */}
      <section className={styles.headerBlock}>
        <div className={styles.headerText}>
          <p className={cx([sharedStyles], "eyebrow accent")}>TARGETS &amp; ROADMAP</p>
          <h2>Performance &amp; Milestone Goals</h2>
          <p>Define measurable targets for barbell PRs, body composition, volume, or consistency.</p>
        </div>
      </section>

      {message && (
        <div role="status" className={styles.statusAlert}>
          {message}
        </div>
      )}

      {/* KPI Metrics Strip */}
      <section className={styles.metricsGrid}>
        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>Active Targets</span>
          <h3 className={styles.metricValue}>{activeCount}</h3>
          <p className={styles.metricSubtext}>Currently in progress</p>
        </article>

        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>Completed Milestones</span>
          <h3 className={styles.metricValue}>{completedCount}</h3>
          <p className={styles.metricSubtext}>Targets successfully achieved</p>
        </article>

        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>Overall Progress</span>
          <h3 className={styles.metricValue}>{avgProgress}%</h3>
          <p className={styles.metricSubtext}>Average completion rate</p>
        </article>
      </section>

      {/* Create New Milestone Form Panel */}
      <section className={styles.formPanel}>
        <div className={styles.panelHeader}>
          <h3>Set New Training Milestone</h3>
        </div>

        <form onSubmit={submitGoal}>
          <div className={styles.goalFormGrid}>
            <div className={styles.fieldGroup} style={{ gridColumn: "span 2" }}>
              <label htmlFor="goalTitle">Milestone Objective</label>
              <input
                id="goalTitle"
                className={styles.formInput}
                required
                maxLength={120}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. 100 kg Bench Press or 15 Pull-Ups"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="goalCategory">Focus Category</label>
              <select
                id="goalCategory"
                className={styles.formSelect}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option>Strength</option>
                <option>Body</option>
                <option>Nutrition</option>
                <option>Consistency</option>
                <option>Cardio</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="targetValue">Target Value</label>
              <input
                id="targetValue"
                className={styles.formInput}
                type="number"
                min="0"
                step="any"
                value={form.targetValue}
                onChange={(e) => setForm({ ...form, targetValue: e.target.value })}
                placeholder="e.g. 100"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="goalUnit">Unit of Measure</label>
              <input
                id="goalUnit"
                className={styles.formInput}
                maxLength={24}
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="kg, reps, sessions"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="dueDate">Target Deadline</label>
              <input
                id="dueDate"
                className={styles.formInput}
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>

            <div>
              <button
                type="submit"
                className={cx([sharedStyles], "primary-button")}
                style={{ width: "100%", height: "42px" }}
                disabled={saving}
              >
                {saving ? "Saving…" : "+ Set Goal"}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Goals List Panel */}
      <section className={styles.goalsPanel}>
        <div className={styles.panelHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h3>Your Milestones</h3>
            <div className={styles.filterPills}>
              <button
                type="button"
                className={`${styles.pillBtn} ${filter === "all" ? styles.active : ""}`}
                onClick={() => setFilter("all")}
              >
                All ({items.length})
              </button>
              <button
                type="button"
                className={`${styles.pillBtn} ${filter === "active" ? styles.active : ""}`}
                onClick={() => setFilter("active")}
              >
                Active ({activeCount})
              </button>
              <button
                type="button"
                className={`${styles.pillBtn} ${filter === "completed" ? styles.active : ""}`}
                onClick={() => setFilter("completed")}
              >
                Completed ({completedCount})
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className={styles.emptyState}>Loading milestones…</div>
        ) : filteredItems.length === 0 ? (
          <div className={styles.emptyState}>
            {filter === "all"
              ? "No goals established yet. Create your first milestone target above."
              : `No ${filter} goals found.`}
          </div>
        ) : (
          <div className={styles.goalsGrid}>
            {filteredItems.map((goal) => {
              const target = Number(goal.targetValue) || 0;
              const rawCurrent = Number(goal.currentValue) || 0;
              const isDone = goal.status === "completed";
              // When a goal is marked completed, display the completed target weight
              const current = isDone && target > 0 && rawCurrent < target ? target : rawCurrent;
              const percent =
                target > 0
                  ? Math.min(100, Math.round((current / target) * 100))
                  : isDone ? 100 : 0;

              return (
                <article
                  key={goal._id}
                  className={`${styles.goalCard} ${
                    isDone ? styles.goalCardCompleted : ""
                  }`}
                >
                  <div className={styles.cardTopRow}>
                    <span className={styles.categoryTag}>{goal.category}</span>
                    <span
                      className={`${styles.statusPill} ${
                        isDone ? styles.statusCompleted : styles.statusActive
                      }`}
                    >
                      {isDone ? "✓ Completed" : "In Progress"}
                    </span>
                  </div>

                  <div>
                    <h4 className={styles.goalTitle}>{goal.title}</h4>
                    <p className={styles.goalTargetText}>
                      {target > 0
                        ? `${current} / ${target} ${goal.unit || ""}`
                        : "Open qualitative milestone"}
                      {goal.dueDate && (
                        <span>
                          {" "}
                          · Due {new Date(goal.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  </div>

                  {target > 0 && (
                    <div>
                      <div className={styles.progressBarTrack}>
                        <div
                          className={`${styles.progressBarFill} ${
                            isDone ? styles.progressCompletedFill : ""
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <div
                        className={styles.progressControlsRow}
                        style={{ marginTop: 8 }}
                      >
                        <span className={styles.percentLabel}>{percent}%</span>
                        <div className={styles.inlineInputWrap}>
                          <span>Current:</span>
                          <input
                            aria-label={`Current progress for ${goal.title}`}
                            className={styles.inlineProgressInput}
                            type="number"
                            min="0"
                            max={target > 0 ? target : undefined}
                            step="any"
                            disabled={isDone || goal.status === "completed"}
                            style={isDone || goal.status === "completed" ? { opacity: 0.7, cursor: "not-allowed" } : undefined}
                            value={isDone && rawCurrent < target ? target : (goal.currentValue ?? 0)}
                            onChange={(e) => {
                              let val = e.target.value;
                              if (val !== "" && target > 0 && Number(val) > target) {
                                val = String(target);
                              }
                              setItems((currentItems) =>
                                currentItems.map((item) =>
                                  item._id === goal._id
                                    ? { ...item, currentValue: val }
                                    : item
                                )
                              );
                            }}
                            onBlur={(e) => {
                              let num = Number(e.target.value) || 0;
                              if (num < 0) num = 0;
                              if (target > 0 && num >= target) {
                                num = target;
                                updateGoal(goal, {
                                  currentValue: num,
                                  status: "completed",
                                });
                              } else {
                                updateGoal(goal, {
                                  currentValue: num,
                                });
                              }
                            }}
                          />
                          <span>{goal.unit}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      className={styles.toggleBtn}
                      onClick={() => {
                        const isCompleted = goal.status === "completed";
                        const nextStatus = isCompleted ? "active" : "completed";
                        const nextValue = nextStatus === "completed" && target > 0 ? target : goal.currentValue;
                        updateGoal(goal, {
                          status: nextStatus,
                          currentValue: nextValue,
                        });
                      }}
                    >
                      {goal.status === "completed" ? "Reopen" : "Mark Complete"}
                    </button>
                    {!isDone && goal.status !== "completed" && (
                      <button
                        type="button"
                        className={styles.editBtn}
                        onClick={() => handleStartEdit(goal)}
                        title="Edit this milestone"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                      </button>
                    )}
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => setDeletingGoal(goal)}
                      title="Delete this milestone"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Delete Confirmation Modal */}
      <NoticeModal
        isOpen={Boolean(deletingGoal)}
        type="danger"
        title="Delete Milestone"
        message={
          deletingGoal
            ? `Delete milestone "${deletingGoal.title}"? This milestone and its progress history will be removed.`
            : "Delete milestone? This milestone and its progress history will be removed."
        }
        confirmText="Delete Milestone"
        cancelText="Cancel"
        onConfirm={async () => {
          if (!deletingGoal) return;
          const g = deletingGoal;
          setDeletingGoal(null);
          await deleteGoal(g);
        }}
        onClose={() => setDeletingGoal(null)}
      />

      {/* Edit Milestone Modal */}
      {editingGoal && (
        <div
          className={styles.editModalBackdrop}
          onClick={handleCloseEdit}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={styles.editModalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.editModalHeader}>
              <div>
                <p className={cx([sharedStyles], "eyebrow accent")}>Milestone Target</p>
                <h3>Edit Milestone</h3>
              </div>
              <button
                type="button"
                className={styles.editModalCloseBtn}
                onClick={handleCloseEdit}
                aria-label="Close edit modal"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className={styles.editModalBody}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="edit-goal-title">Milestone Objective *</label>
                  <input
                    id="edit-goal-title"
                    className={styles.formInput}
                    type="text"
                    required
                    maxLength={120}
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="e.g. 100 kg Bench Press or 15 Pull-Ups"
                  />
                </div>

                <div className={styles.editModalRow2}>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="edit-goal-category">Focus Category</label>
                    <select
                      id="edit-goal-category"
                      className={styles.formSelect}
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    >
                      <option>Strength</option>
                      <option>Body</option>
                      <option>Nutrition</option>
                      <option>Consistency</option>
                      <option>Cardio</option>
                    </select>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="edit-goal-status">Status</label>
                    <select
                      id="edit-goal-status"
                      className={styles.formSelect}
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    >
                      <option value="active">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="paused">Paused</option>
                    </select>
                  </div>
                </div>

                <div className={styles.editModalRow2}>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="edit-target-value">Target Value</label>
                    <input
                      id="edit-target-value"
                      className={styles.formInput}
                      type="number"
                      min="0"
                      step="any"
                      value={editForm.targetValue}
                      onChange={(e) => setEditForm({ ...editForm, targetValue: e.target.value })}
                      placeholder="e.g. 150"
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="edit-current-value">Current Progress</label>
                    <input
                      id="edit-current-value"
                      className={styles.formInput}
                      type="number"
                      min="0"
                      max={Number(editForm.targetValue) > 0 ? Number(editForm.targetValue) : undefined}
                      step="any"
                      value={editForm.currentValue}
                      onChange={(e) => {
                        let val = e.target.value;
                        const tgt = Number(editForm.targetValue);
                        if (val !== "" && tgt > 0 && Number(val) > tgt) {
                          val = String(tgt);
                        }
                        setEditForm({ ...editForm, currentValue: val });
                      }}
                      placeholder="e.g. 120"
                    />
                  </div>
                </div>

                <div className={styles.editModalRow2}>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="edit-goal-unit">Unit of Measure</label>
                    <input
                      id="edit-goal-unit"
                      className={styles.formInput}
                      maxLength={24}
                      value={editForm.unit}
                      onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                      placeholder="kg, reps, sessions"
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="edit-due-date">Target Deadline</label>
                    <input
                      id="edit-due-date"
                      className={styles.formInput}
                      type="date"
                      value={editForm.dueDate}
                      onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.editModalFooter}>
                <button
                  type="button"
                  className={cx([sharedStyles], "secondary-button")}
                  onClick={handleCloseEdit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={cx([sharedStyles], "primary-button")}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Goals;
