import { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { apiRequest } from "../../services/api.js";
import sharedStyles from "../../Shared.module.css";
import styles from "./Goals.module.css";
import { cx } from "../../utils/classNames.js";

const initialForm = {
  title: "",
  category: "Strength",
  targetValue: "",
  currentValue: "0",
  unit: "kg",
  dueDate: "",
};

function Goals() {
  const demoMode = useSelector((state) => state.auth.demoMode);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all"); // 'all', 'active', 'completed'

  const loadGoals = useCallback(async () => {
    try {
      const data = await apiRequest("/goals");
      setItems(data.items || []);
    } catch (error) {
      setMessage(
        `${error.message} Check that the API is running and sign in again if needed.`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const submitGoal = async (event) => {
    event.preventDefault();
    if (demoMode) {
      setMessage(
        "Demo Overview Mode: Creating new goals is disabled in preview mode."
      );
      return;
    }
    if (!form.title.trim()) return;
    setSaving(true);
    setMessage("");

    try {
      const data = await apiRequest("/goals", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          targetValue:
            form.targetValue === "" ? undefined : Number(form.targetValue),
          currentValue: Number(form.currentValue) || 0,
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
    if (demoMode) {
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

  const deleteGoal = async (goal) => {
    if (demoMode) {
      setMessage("Demo Overview Mode: Deleting goals is disabled in preview mode.");
      return;
    }
    if (!window.confirm(`Delete milestone “${goal.title}”?`)) return;

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
              const current = Number(goal.currentValue) || 0;
              const percent =
                target > 0
                  ? Math.min(100, Math.round((current / target) * 100))
                  : 0;
              const isDone = goal.status === "completed" || percent >= 100;

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
                      {isDone ? "✓ Achieved" : "In Progress"}
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
                            step="any"
                            value={goal.currentValue ?? 0}
                            onChange={(e) =>
                              setItems((currentItems) =>
                                currentItems.map((item) =>
                                  item._id === goal._id
                                    ? { ...item, currentValue: e.target.value }
                                    : item
                                )
                              )
                            }
                            onBlur={(e) =>
                              updateGoal(goal, {
                                currentValue: Number(e.target.value) || 0,
                              })
                            }
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
                      onClick={() =>
                        updateGoal(goal, {
                          status:
                            goal.status === "completed" ? "active" : "completed",
                        })
                      }
                    >
                      {goal.status === "completed" ? "Reopen" : "Mark Complete"}
                    </button>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => deleteGoal(goal)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Goals;
