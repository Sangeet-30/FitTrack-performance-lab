import { useEffect, useMemo, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiRequest } from "../../services/api.js";
import sharedStyles from "../../Shared.module.css";
import styles from "./Progress.module.css";
import { cx } from "../../utils/classNames.js";

const initialForm = {
  weightKg: "",
  bodyFatPercent: "",
  waist: "",
  chest: "",
  leftArm: "",
  notes: "",
};

function CustomChartTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className={styles.chartTooltip}>
        <div className={styles.tooltipDate}>{label}</div>
        <div className={styles.tooltipWeight}>{payload[0].value} kg</div>
      </div>
    );
  }
  return null;
}

function Progress() {
  const demoMode = useSelector((state) => state.auth.demoMode);
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadEntries = useCallback(async () => {
    try {
      const data = await apiRequest("/progress");
      setEntries(data.items || []);
    } catch (error) {
      setMessage(
        `${error.message} Check that the API is running and sign in again if needed.`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const chartData = useMemo(() => {
    return [...entries]
      .filter((item) => item.weightKg != null && Number.isFinite(Number(item.weightKg)))
      .reverse()
      .map((item) => ({
        date: new Date(item.recordedAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        weight: Number(item.weightKg),
      }));
  }, [entries]);

  const submitEntry = async (event) => {
    event.preventDefault();
    if (demoMode) {
      setMessage(
        "Demo Overview Mode: Saving progress entries is disabled in preview mode."
      );
      return;
    }

    if (
      form.weightKg === "" &&
      form.bodyFatPercent === "" &&
      !form.waist &&
      !form.chest &&
      !form.leftArm
    ) {
      setMessage("Please enter at least one measurement (weight, body fat, or circumference).");
      return;
    }

    setSaving(true);
    setMessage("");

    const measurements = Object.fromEntries(
      [
        ["waist", form.waist],
        ["chest", form.chest],
        ["leftArm", form.leftArm],
      ]
        .filter(([, value]) => value !== "")
        .map(([key, value]) => [key, Number(value)])
    );

    try {
      const data = await apiRequest("/progress", {
        method: "POST",
        body: JSON.stringify({
          weightKg: form.weightKg === "" ? undefined : Number(form.weightKg),
          bodyFatPercent:
            form.bodyFatPercent === "" ? undefined : Number(form.bodyFatPercent),
          measurements:
            Object.keys(measurements).length ? measurements : undefined,
          notes: form.notes,
        }),
      });

      setEntries((current) => [data.item, ...current]);
      setForm(initialForm);
      setMessage("Biometrics checkpoint saved successfully.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const removeEntry = async (entry) => {
    if (demoMode) {
      setMessage("Demo Overview Mode: Deleting entries is disabled in preview mode.");
      return;
    }

    if (!window.confirm("Delete this progress checkpoint entry?")) return;

    try {
      await apiRequest(`/progress/${entry._id}`, { method: "DELETE" });
      setEntries((current) => current.filter((item) => item._id !== entry._id));
      setMessage("Entry removed.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  // Metric computations
  const validWeights = useMemo(() => {
    return entries
      .filter((e) => e.weightKg != null && Number.isFinite(Number(e.weightKg)))
      .map((e) => Number(e.weightKg));
  }, [entries]);

  const latestWeight = validWeights.length > 0 ? validWeights[0] : null;
  const oldestWeight = validWeights.length > 1 ? validWeights[validWeights.length - 1] : null;
  const weightDelta =
    latestWeight != null && oldestWeight != null
      ? (latestWeight - oldestWeight).toFixed(1)
      : null;

  const habitScore =
    entries.length >= 6
      ? "Consistent Habit"
      : entries.length >= 2
      ? "Building Momentum"
      : "Getting Started";

  return (
    <div className={cx([styles, sharedStyles], "progressPage")}>
      {/* Executive Header */}
      <section className={styles.headerBlock}>
        <div className={styles.headerText}>
          <p className={cx([sharedStyles], "eyebrow accent")}>BIOMETRICS &amp; BODY COMPOSITION</p>
          <h2>Progress &amp; Measurement Journal</h2>
          <p>Record weight, body fat %, and tape circumferences. Consistency reveals true physiological trends.</p>
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
          <span className={styles.metricLabel}>Latest Recorded Weight</span>
          <div className={styles.metricValueRow}>
            <h3 className={styles.metricValue}>
              {latestWeight != null ? `${latestWeight} kg` : "—"}
            </h3>
            {weightDelta != null && (
              <span
                className={`${styles.metricDelta} ${
                  Number(weightDelta) <= 0 ? styles.deltaDown : styles.deltaUp
                }`}
              >
                {Number(weightDelta) > 0 ? `+${weightDelta} kg` : `${weightDelta} kg`}
              </span>
            )}
          </div>
          <p className={styles.metricSubtext}>
            {entries.length > 0
              ? `Logged on ${new Date(entries[0].recordedAt).toLocaleDateString()}`
              : "No weigh-ins recorded yet"}
          </p>
        </article>

        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>Total Checkpoints</span>
          <div className={styles.metricValueRow}>
            <h3 className={styles.metricValue}>{entries.length}</h3>
          </div>
          <p className={styles.metricSubtext}>Saved to your private training history</p>
        </article>

        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>Logging Habit</span>
          <div className={styles.metricValueRow}>
            <h3 className={styles.metricValue}>{habitScore}</h3>
          </div>
          <p className={styles.metricSubtext}>Log weekly under standard morning conditions</p>
        </article>
      </section>

      {/* Weight Trend Chart */}
      <section className={styles.chartPanel}>
        <div className={styles.panelHeader}>
          <h3>Weight Progression Curve</h3>
          <span className={styles.historyCount}>
            {chartData.length} Data Points
          </span>
        </div>

        {chartData.length < 2 ? (
          <div className={styles.emptyChartMessage}>
            Log at least 2 weigh-ins to generate your interactive weight trend line.
          </div>
        ) : (
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.6} />
                <XAxis
                  dataKey="date"
                  stroke="var(--text-muted)"
                  fontSize={12}
                  tickLine={false}
                  dy={6}
                />
                <YAxis
                  domain={["dataMin - 1", "dataMax + 1"]}
                  stroke="var(--text-muted)"
                  fontSize={12}
                  tickLine={false}
                  dx={-4}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#ef4444" }}
                  activeDot={{ r: 6, fill: "#dc2626" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Log Measurement Form */}
      <section className={styles.formPanel}>
        <div className={styles.panelHeader}>
          <h3>Record New Checkpoint</h3>
        </div>

        <form onSubmit={submitEntry}>
          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label htmlFor="weightKg">Weight (kg)</label>
              <input
                id="weightKg"
                className={styles.formInput}
                type="number"
                min="20"
                max="500"
                step="0.1"
                value={form.weightKg}
                onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
                placeholder="e.g. 75.2"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="bodyFatPercent">Body Fat (%)</label>
              <input
                id="bodyFatPercent"
                className={styles.formInput}
                type="number"
                min="1"
                max="75"
                step="0.1"
                value={form.bodyFatPercent}
                onChange={(e) => setForm({ ...form, bodyFatPercent: e.target.value })}
                placeholder="Optional"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="waist">Waist (cm)</label>
              <input
                id="waist"
                className={styles.formInput}
                type="number"
                min="1"
                step="0.1"
                value={form.waist}
                onChange={(e) => setForm({ ...form, waist: e.target.value })}
                placeholder="Optional"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="chest">Chest (cm)</label>
              <input
                id="chest"
                className={styles.formInput}
                type="number"
                min="1"
                step="0.1"
                value={form.chest}
                onChange={(e) => setForm({ ...form, chest: e.target.value })}
                placeholder="Optional"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="leftArm">Arm (cm)</label>
              <input
                id="leftArm"
                className={styles.formInput}
                type="number"
                min="1"
                step="0.1"
                value={form.leftArm}
                onChange={(e) => setForm({ ...form, leftArm: e.target.value })}
                placeholder="Optional"
              />
            </div>

            <div className={styles.fieldGroup} style={{ gridColumn: "span 2" }}>
              <label htmlFor="notes">Context &amp; Notes</label>
              <input
                id="notes"
                className={styles.formInput}
                maxLength={1000}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="e.g. Morning fasted, post-refeed day"
              />
            </div>

            <div>
              <button
                type="submit"
                className={cx([sharedStyles], "primary-button")}
                style={{ width: "100%", height: "42px" }}
                disabled={saving}
              >
                {saving ? "Saving…" : "+ Save Checkpoint"}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Checkpoint History Timeline */}
      <section className={styles.historyPanel}>
        <div className={styles.panelHeader}>
          <h3>Measurement History</h3>
          <span className={styles.historyCount}>{entries.length} Entries Recorded</span>
        </div>

        {loading ? (
          <div className={styles.emptyState}>Loading biometrics log…</div>
        ) : entries.length === 0 ? (
          <div className={styles.emptyState}>
            No entries logged yet. Record your initial baseline above.
          </div>
        ) : (
          <div className={styles.historyList}>
            {entries.map((entry) => (
              <article key={entry._id} className={styles.historyItem}>
                <div className={styles.historyMain}>
                  <div className={styles.historyDateRow}>
                    <span className={styles.historyDate}>
                      {new Date(entry.recordedAt).toLocaleDateString(undefined, {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {entry.weightKg != null && (
                      <span className={styles.historyWeightChip}>
                        {entry.weightKg} kg
                      </span>
                    )}
                  </div>

                  <div className={styles.historyMeasurementsRow}>
                    {entry.bodyFatPercent != null && (
                      <span className={styles.measurementTag}>
                        Body Fat: {entry.bodyFatPercent}%
                      </span>
                    )}
                    {entry.measurements?.waist && (
                      <span className={styles.measurementTag}>
                        Waist: {entry.measurements.waist} cm
                      </span>
                    )}
                    {entry.measurements?.chest && (
                      <span className={styles.measurementTag}>
                        Chest: {entry.measurements.chest} cm
                      </span>
                    )}
                    {entry.measurements?.leftArm && (
                      <span className={styles.measurementTag}>
                        Arm: {entry.measurements.leftArm} cm
                      </span>
                    )}
                  </div>

                  {entry.notes && (
                    <p className={styles.historyNotes}>"{entry.notes}"</p>
                  )}
                </div>

                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => removeEntry(entry)}
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

export default Progress;
