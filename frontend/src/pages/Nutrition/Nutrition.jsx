import { useEffect, useMemo, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import sharedStyles from "../../Shared.module.css";
import styles from "./Nutrition.module.css";
import { cx } from "../../utils/classNames.js";
import { apiRequest } from "../../services/api.js";
import NoticeModal from "../../components/NoticeModal/NoticeModal.jsx";

const todayKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
};

const emptyForm = {
  name: "",
  meal: "Breakfast",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
};

const DEMO_NUTRITION_ITEMS = [
  {
    name: "Steel-Cut Oats with Whey & Blueberries",
    meal: "Breakfast",
    calories: 520,
    protein: 42,
    carbs: 68,
    fat: 10,
  },
  {
    name: "Grilled Chicken Breast, Brown Rice & Broccoli",
    meal: "Lunch",
    calories: 680,
    protein: 58,
    carbs: 74,
    fat: 12,
  },
  {
    name: "Greek Yogurt Bowl with Almonds & Honey",
    meal: "Snack",
    calories: 290,
    protein: 26,
    carbs: 22,
    fat: 11,
  },
  {
    name: "Pan-Roasted Wild Salmon & Sweet Potato",
    meal: "Dinner",
    calories: 640,
    protein: 46,
    carbs: 52,
    fat: 24,
  },
];

function Nutrition() {
  const demoMode = useSelector((state) => state.auth.demoMode);
  const authUser = useSelector((state) => state.auth.user);
  const isDemoUser = Boolean(demoMode || authUser?.isDemo || authUser?.email === "demo@fittrack.app");
  const [dateKey, setDateKey] = useState(todayKey());
  const [log, setLog] = useState({
    items: [],
    waterMl: 0,
    calorieTarget: 2200,
    proteinTarget: 140,
  });
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [editingMealIndex, setEditingMealIndex] = useState(null);
  const [editingMealForm, setEditingMealForm] = useState(null);
  const [deletingMealIndex, setDeletingMealIndex] = useState(null);

  const totals = useMemo(() => {
    return (log.items || []).reduce(
      (sum, item) => ({
        calories: sum.calories + Number(item.calories || 0),
        protein: sum.protein + Number(item.protein || 0),
        carbs: sum.carbs + Number(item.carbs || 0),
        fat: sum.fat + Number(item.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [log.items]);

  const loadLog = useCallback(async (date = dateKey) => {
    setLoading(true);
    try {
      const data = await apiRequest(`/nutrition?from=${date}&to=${date}`);
      const fetched = data.items?.[0];
      if (isDemoUser && (!fetched || !fetched.items || fetched.items.length === 0)) {
        setLog({
          items: DEMO_NUTRITION_ITEMS,
          waterMl: 2750,
          calorieTarget: 2200,
          proteinTarget: 160,
        });
      } else {
        setLog(
          fetched || {
            items: [],
            waterMl: 0,
            calorieTarget: 2200,
            proteinTarget: 140,
          }
        );
      }
      setMessage("");
    } catch (error) {
      if (isDemoUser) {
        setLog({
          items: DEMO_NUTRITION_ITEMS,
          waterMl: 2750,
          calorieTarget: 2200,
          proteinTarget: 160,
        });
      } else {
        setMessage(
          `${error.message} Check that the API is running and sign in again if needed.`
        );
      }
    } finally {
      setLoading(false);
    }
  }, [dateKey, isDemoUser]);

  useEffect(() => {
    loadLog(dateKey);
  }, [dateKey, loadLog]);

  const saveLog = async (next) => {
    if (isDemoUser) {
      setMessage(
        "Demo Overview Mode: Saving nutrition logs is disabled in preview mode."
      );
      return;
    }
    if (dateKey > todayKey()) {
      setMessage("Cannot log or edit nutrition for a future date. Only previous and current dates are allowed.");
      return;
    }
    setSaving(true);
    try {
      const data = await apiRequest(`/nutrition/${dateKey}`, {
        method: "PUT",
        body: JSON.stringify(next),
      });
      setLog(data.item);
      setMessage("Nutrition journal updated.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDateOffset = (days) => {
    const current = new Date(dateKey + "T00:00:00");
    current.setDate(current.getDate() + days);
    const nextKey = `${current.getFullYear()}-${String(
      current.getMonth() + 1
    ).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;
    if (nextKey > todayKey()) {
      setDateKey(todayKey());
      return;
    }
    setDateKey(nextKey);
  };

  const addMeal = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;

    const item = {
      ...form,
      calories: Number(form.calories) || 0,
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
      consumedAt: new Date().toISOString(),
    };

    await saveLog({
      items: [...log.items, item],
      waterMl: log.waterMl || 0,
      calorieTarget: log.calorieTarget || 2200,
      proteinTarget: log.proteinTarget || 140,
    });
    setForm(emptyForm);
  };

  const removeMeal = (index) =>
    saveLog({
      items: log.items.filter((_, i) => i !== index),
      waterMl: log.waterMl || 0,
      calorieTarget: log.calorieTarget || 2200,
      proteinTarget: log.proteinTarget || 140,
    });

  const handleStartEditMeal = (index, item) => {
    setEditingMealIndex(index);
    setEditingMealForm({
      name: item.name || "",
      meal: item.meal || "Breakfast",
      calories: item.calories ?? "",
      protein: item.protein ?? "",
      carbs: item.carbs ?? "",
      fat: item.fat ?? "",
    });
  };

  const handleCloseEditMeal = () => {
    setEditingMealIndex(null);
    setEditingMealForm(null);
  };

  useEffect(() => {
    if (editingMealIndex === null) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleCloseEditMeal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingMealIndex]);

  const handleSaveEditMeal = async (e) => {
    e.preventDefault();
    if (!editingMealForm || !editingMealForm.name.trim()) return;

    const updatedItems = log.items.map((item, idx) => {
      if (idx !== editingMealIndex) return item;
      return {
        ...item,
        name: editingMealForm.name.trim(),
        meal: editingMealForm.meal,
        calories: Number(editingMealForm.calories) || 0,
        protein: Number(editingMealForm.protein) || 0,
        carbs: Number(editingMealForm.carbs) || 0,
        fat: Number(editingMealForm.fat) || 0,
      };
    });

    await saveLog({
      items: updatedItems,
      waterMl: log.waterMl || 0,
      calorieTarget: log.calorieTarget || 2200,
      proteinTarget: log.proteinTarget || 140,
    });

    setEditingMealIndex(null);
    setEditingMealForm(null);
  };

  const changeWater = (amount) =>
    saveLog({
      items: log.items,
      waterMl: Math.max(
        0,
        Math.min(20000, Number(log.waterMl || 0) + amount)
      ),
      calorieTarget: log.calorieTarget || 2200,
      proteinTarget: log.proteinTarget || 140,
    });

  const updateTarget = (key, value) =>
    setLog((current) => ({ ...current, [key]: value }));

  const calTarget = Number(log.calorieTarget) || 2200;
  const calPercent = Math.min(100, Math.round((totals.calories / calTarget) * 100));
  const calRemaining = Math.max(0, calTarget - Math.round(totals.calories));

  const proTarget = Number(log.proteinTarget) || 140;
  const proPercent = Math.min(100, Math.round((totals.protein / proTarget) * 100));

  return (
    <div className={cx([styles, sharedStyles], "nutritionPage")}>
      {/* Executive Header Banner with Date Navigation */}
      <section className={styles.headerBlock}>
        <div className={styles.headerText}>
          <p className={cx([sharedStyles], "eyebrow accent")}>FUEL &amp; HYDRATION</p>
          <h2>Nutrition &amp; Macro Journal</h2>
          <p>Track caloric balance, macronutrient targets, and daily hydration volume.</p>
        </div>

        <div className={styles.dateNavigator}>
          <button
            type="button"
            className={styles.navArrowBtn}
            onClick={() => handleDateOffset(-1)}
            aria-label="Previous day"
          >
            ◀
          </button>
          <input
            type="date"
            className={styles.dateInput}
            value={dateKey}
            max={todayKey()}
            onChange={(e) => {
              const val = e.target.value;
              if (val > todayKey()) {
                setDateKey(todayKey());
                setMessage("Future dates are not allowed. Only today and previous dates can be tracked.");
              } else {
                setDateKey(val);
              }
            }}
            aria-label="Select log date"
          />
          <button
            type="button"
            className={styles.navArrowBtn}
            disabled={dateKey >= todayKey()}
            style={dateKey >= todayKey() ? { opacity: 0.35, cursor: "not-allowed" } : undefined}
            onClick={() => handleDateOffset(1)}
            aria-label="Next day"
          >
            ▶
          </button>
          {dateKey !== todayKey() && (
            <button
              type="button"
              className={styles.todayBtn}
              onClick={() => setDateKey(todayKey())}
            >
              Today
            </button>
          )}
        </div>
      </section>

      {message && (
        <div role="status" className={styles.statusAlert}>
          {message}
        </div>
      )}

      {/* 4 Macro & Hydration KPI Cards */}
      <section className={styles.macroGrid}>
        {/* Calories Card */}
        <article className={styles.macroCard}>
          <div className={styles.macroCardHeader}>
            <span className={styles.macroLabel}>Energy Balance</span>
            <span className={styles.macroTargetBadge}>
              {calRemaining > 0 ? `${calRemaining} kcal left` : "Target Met"}
            </span>
          </div>
          <div>
            <h3 className={styles.macroValue}>
              {Math.round(totals.calories).toLocaleString()}{" "}
              <span style={{ fontSize: "1rem", color: "var(--text-muted)", fontWeight: 500 }}>
                / {calTarget.toLocaleString()} kcal
              </span>
            </h3>
            <div className={styles.progressBarTrack} style={{ marginTop: 10 }}>
              <div
                className={`${styles.progressBarFill} ${styles.fillCalories}`}
                style={{ width: `${calPercent}%` }}
              />
            </div>
          </div>
        </article>

        {/* Protein Card */}
        <article className={styles.macroCard}>
          <div className={styles.macroCardHeader}>
            <span className={styles.macroLabel}>Daily Protein</span>
            <span className={styles.macroTargetBadge}>
              {proPercent}% Reached
            </span>
          </div>
          <div>
            <h3 className={styles.macroValue}>
              {Math.round(totals.protein)} g{" "}
              <span style={{ fontSize: "1rem", color: "var(--text-muted)", fontWeight: 500 }}>
                / {proTarget} g target
              </span>
            </h3>
            <div className={styles.progressBarTrack} style={{ marginTop: 10 }}>
              <div
                className={`${styles.progressBarFill} ${styles.fillProtein}`}
                style={{ width: `${proPercent}%` }}
              />
            </div>
          </div>
        </article>

        {/* Carbs & Fat Card */}
        <article className={styles.macroCard}>
          <div className={styles.macroCardHeader}>
            <span className={styles.macroLabel}>Carbs &amp; Fats</span>
            <span className={styles.macroTargetBadge}>Macros</span>
          </div>
          <div>
            <h3 className={styles.macroValue}>
              {Math.round(totals.carbs)}g / {Math.round(totals.fat)}g
            </h3>
            <p style={{ margin: "6px 0 0", fontSize: "0.82rem", color: "var(--text-muted)" }}>
              {Math.round(totals.carbs * 4)} kcal carbs · {Math.round(totals.fat * 9)} kcal fats
            </p>
          </div>
        </article>

        {/* Hydration Card */}
        <article className={styles.macroCard}>
          <div className={styles.macroCardHeader}>
            <span className={styles.macroLabel}>Hydration</span>
            <span className={styles.macroTargetBadge}>Water</span>
          </div>
          <div>
            <h3 className={styles.macroValue}>
              {(Number(log.waterMl || 0) / 1000).toFixed(1)} L
            </h3>
            <div className={styles.waterControls}>
              <button
                type="button"
                className={styles.waterBtn}
                disabled={saving}
                onClick={() => changeWater(-250)}
              >
                -250 ml
              </button>
              <button
                type="button"
                className={styles.waterBtn}
                disabled={saving}
                onClick={() => changeWater(250)}
              >
                +250 ml
              </button>
              <button
                type="button"
                className={styles.waterBtn}
                disabled={saving}
                onClick={() => changeWater(500)}
              >
                +500 ml
              </button>
            </div>
          </div>
        </article>
      </section>

      {/* Target Configuration Bar */}
      <section className={styles.targetsPanel}>
        <div>
          <h4 style={{ margin: "0 0 2px", fontSize: "0.98rem", color: "var(--text-main)" }}>
            Daily Nutritional Targets
          </h4>
          <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            Adjust your caloric ceiling and daily protein requirement
          </span>
        </div>

        <div className={styles.targetsForm}>
          <div className={styles.targetField}>
            <label htmlFor="calorieTarget">Calories (kcal)</label>
            <input
              id="calorieTarget"
              className={styles.targetInput}
              type="number"
              min="500"
              max="20000"
              value={log.calorieTarget ?? 2200}
              onChange={(e) => updateTarget("calorieTarget", Number(e.target.value))}
            />
          </div>

          <div className={styles.targetField}>
            <label htmlFor="proteinTarget">Protein (g)</label>
            <input
              id="proteinTarget"
              className={styles.targetInput}
              type="number"
              min="20"
              max="1000"
              value={log.proteinTarget ?? 140}
              onChange={(e) => updateTarget("proteinTarget", Number(e.target.value))}
            />
          </div>

          <button
            type="button"
            className={cx([sharedStyles], "secondary-button")}
            disabled={saving}
            onClick={() =>
              saveLog({
                items: log.items,
                waterMl: log.waterMl || 0,
                calorieTarget: Number(log.calorieTarget) || 2200,
                proteinTarget: Number(log.proteinTarget) || 140,
              })
            }
          >
            Save Targets
          </button>
        </div>
      </section>

      {/* Log Meal Form Panel */}
      <section className={styles.formPanel}>
        <div className={styles.panelHeader}>
          <h3>Log Meal or Snack</h3>
        </div>

        <form onSubmit={addMeal}>
          <div className={styles.mealFormGrid}>
            <div className={styles.fieldGroup} style={{ gridColumn: "span 2" }}>
              <label htmlFor="foodName">Food / Meal Name</label>
              <input
                id="foodName"
                className={styles.formInput}
                required
                maxLength={120}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Grilled Chicken &amp; Jasmine Rice"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="mealSlot">Meal Time</label>
              <select
                id="mealSlot"
                className={styles.formSelect}
                value={form.meal}
                onChange={(e) => setForm({ ...form, meal: e.target.value })}
              >
                <option>Breakfast</option>
                <option>Lunch</option>
                <option>Dinner</option>
                <option>Snack</option>
                <option>Pre-Workout</option>
                <option>Post-Workout</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="mealCalories">Calories (kcal)</label>
              <input
                id="mealCalories"
                className={styles.formInput}
                type="number"
                min="0"
                max="10000"
                value={form.calories}
                onChange={(e) => setForm({ ...form, calories: e.target.value })}
                placeholder="e.g. 520"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="mealProtein">Protein (g)</label>
              <input
                id="mealProtein"
                className={styles.formInput}
                type="number"
                min="0"
                value={form.protein}
                onChange={(e) => setForm({ ...form, protein: e.target.value })}
                placeholder="e.g. 42"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="mealCarbs">Carbs (g)</label>
              <input
                id="mealCarbs"
                className={styles.formInput}
                type="number"
                min="0"
                value={form.carbs}
                onChange={(e) => setForm({ ...form, carbs: e.target.value })}
                placeholder="e.g. 60"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="mealFat">Fat (g)</label>
              <input
                id="mealFat"
                className={styles.formInput}
                type="number"
                min="0"
                value={form.fat}
                onChange={(e) => setForm({ ...form, fat: e.target.value })}
                placeholder="e.g. 12"
              />
            </div>

            <div>
              <button
                type="submit"
                className={cx([sharedStyles], "primary-button")}
                style={{ width: "100%", height: "42px" }}
                disabled={saving}
              >
                {saving ? "Saving…" : "+ Add Food"}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Meals Timeline Panel */}
      <section className={styles.mealsPanel}>
        <div className={styles.panelHeader}>
          <h3>Recorded Meals &amp; Snacks</h3>
          <span className={styles.mealCountBadge}>
            {log.items.length} Entries Logged
          </span>
        </div>

        {loading ? (
          <div className={styles.emptyState}>Loading nutrition data…</div>
        ) : log.items.length === 0 ? (
          <div className={styles.emptyState}>
            No meals recorded for this date yet. Log your first meal above.
          </div>
        ) : (
          <div className={styles.mealList}>
            {log.items.map((item, index) => (
              <article key={`${item.name}-${index}`} className={styles.mealItem}>
                <div className={styles.mealInfo}>
                  <div className={styles.mealHeaderRow}>
                    <span className={styles.mealTypeTag}>{item.meal}</span>
                    <h4 className={styles.mealName}>{item.name}</h4>
                  </div>

                  <div className={styles.mealMacrosRow}>
                    <span className={styles.macroChip}>
                      ⚡ {item.calories || 0} kcal
                    </span>
                    <span className={styles.macroChip}>
                      🥩 P: {item.protein || 0}g
                    </span>
                    <span className={styles.macroChip}>
                      🍚 C: {item.carbs || 0}g
                    </span>
                    <span className={styles.macroChip}>
                      🥑 F: {item.fat || 0}g
                    </span>
                  </div>
                </div>

                <div className={styles.mealActions}>
                  <button
                    type="button"
                    className={styles.editBtn}
                    onClick={() => handleStartEditMeal(index, item)}
                    title="Edit this meal entry"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    disabled={saving}
                    onClick={() => setDeletingMealIndex(index)}
                    title="Delete this meal entry"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Delete Confirmation Modal */}
      <NoticeModal
        isOpen={deletingMealIndex !== null}
        type="danger"
        title="Delete Meal Entry"
        message={
          deletingMealIndex !== null && log.items[deletingMealIndex]
            ? `Remove "${log.items[deletingMealIndex].name}" (${log.items[deletingMealIndex].meal}) from your nutrition records?`
            : "Remove this meal from your nutrition records?"
        }
        confirmText="Delete Meal"
        cancelText="Cancel"
        onConfirm={async () => {
          if (deletingMealIndex !== null) {
            const idx = deletingMealIndex;
            setDeletingMealIndex(null);
            await removeMeal(idx);
          }
        }}
        onClose={() => setDeletingMealIndex(null)}
      />

      {/* Edit Meal Modal */}
      {editingMealIndex !== null && editingMealForm && (
        <div className={styles.editModalBackdrop} onClick={handleCloseEditMeal}>
          <div
            className={styles.editModalCard}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-meal-modal-title"
          >
            <div className={styles.editModalHeader}>
              <div>
                <p className={cx([sharedStyles], "eyebrow accent")}>NUTRITION JOURNAL</p>
                <h3 id="edit-meal-modal-title">Edit Meal Entry</h3>
              </div>
              <button
                type="button"
                className={styles.editModalCloseBtn}
                onClick={handleCloseEditMeal}
                aria-label="Close edit meal dialog"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEditMeal}>
              <div className={styles.editModalBody}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="edit-meal-name">Food / Meal Name *</label>
                  <input
                    id="edit-meal-name"
                    type="text"
                    className={styles.modalFormInput}
                    required
                    maxLength={120}
                    value={editingMealForm.name}
                    onChange={(e) =>
                      setEditingMealForm({ ...editingMealForm, name: e.target.value })
                    }
                    placeholder="e.g. Grilled Chicken & Jasmine Rice"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="edit-meal-time">Meal Time</label>
                  <select
                    id="edit-meal-time"
                    className={styles.modalFormSelect}
                    value={editingMealForm.meal}
                    onChange={(e) =>
                      setEditingMealForm({ ...editingMealForm, meal: e.target.value })
                    }
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Snack">Snack</option>
                    <option value="Pre-Workout">Pre-Workout</option>
                    <option value="Post-Workout">Post-Workout</option>
                  </select>
                </div>

                <div className={styles.editModalRow4}>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="edit-meal-calories">Calories (kcal)</label>
                    <input
                      id="edit-meal-calories"
                      type="number"
                      className={styles.modalFormInput}
                      min="0"
                      max="10000"
                      value={editingMealForm.calories}
                      onChange={(e) =>
                        setEditingMealForm({ ...editingMealForm, calories: e.target.value })
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="edit-meal-protein">Protein (g)</label>
                    <input
                      id="edit-meal-protein"
                      type="number"
                      className={styles.modalFormInput}
                      min="0"
                      max="500"
                      value={editingMealForm.protein}
                      onChange={(e) =>
                        setEditingMealForm({ ...editingMealForm, protein: e.target.value })
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="edit-meal-carbs">Carbs (g)</label>
                    <input
                      id="edit-meal-carbs"
                      type="number"
                      className={styles.modalFormInput}
                      min="0"
                      max="1000"
                      value={editingMealForm.carbs}
                      onChange={(e) =>
                        setEditingMealForm({ ...editingMealForm, carbs: e.target.value })
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="edit-meal-fat">Fat (g)</label>
                    <input
                      id="edit-meal-fat"
                      type="number"
                      className={styles.modalFormInput}
                      min="0"
                      max="500"
                      value={editingMealForm.fat}
                      onChange={(e) =>
                        setEditingMealForm({ ...editingMealForm, fat: e.target.value })
                      }
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className={styles.editModalFooter}>
                <button
                  type="button"
                  className={cx([sharedStyles], "secondary-button")}
                  onClick={handleCloseEditMeal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={cx([sharedStyles], "primary-button")}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save Meal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Nutrition;
