import { useEffect, useMemo, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import sharedStyles from "../../Shared.module.css";
import styles from "./Nutrition.module.css";
import { cx } from "../../utils/classNames.js";
import { apiRequest } from "../../services/api.js";

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

function Nutrition() {
  const demoMode = useSelector((state) => state.auth.demoMode);
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
      setLog(
        data.items?.[0] || {
          items: [],
          waterMl: 0,
          calorieTarget: 2200,
          proteinTarget: 140,
        }
      );
      setMessage("");
    } catch (error) {
      setMessage(
        `${error.message} Check that the API is running and sign in again if needed.`
      );
    } finally {
      setLoading(false);
    }
  }, [dateKey]);

  useEffect(() => {
    loadLog(dateKey);
  }, [dateKey, loadLog]);

  const saveLog = async (next) => {
    if (demoMode) {
      setMessage(
        "Demo Overview Mode: Saving nutrition logs is disabled in preview mode."
      );
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
            onChange={(e) => setDateKey(e.target.value)}
            aria-label="Select log date"
          />
          <button
            type="button"
            className={styles.navArrowBtn}
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

                <button
                  type="button"
                  className={styles.deleteBtn}
                  disabled={saving}
                  onClick={() => removeMeal(index)}
                >
                  Delete
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Nutrition;
