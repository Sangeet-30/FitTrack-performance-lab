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
import NoticeModal from "../../components/NoticeModal/NoticeModal.jsx";

const initialForm = {
  recordedAt: new Date().toISOString().slice(0, 10),
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

const now = Date.now();
const DEMO_PROGRESS_ENTRIES = [
  {
    _id: "demo-prog-1",
    recordedAt: new Date(now - 3 * 86400000).toISOString(),
    weightKg: 74.5,
    bodyFatPercent: 14.5,
    measurements: { waist: 81, chest: 104, leftArm: 38.5 },
    notes: "Morning fasted, recovery on point post-hypertrophy block.",
  },
  {
    _id: "demo-prog-2",
    recordedAt: new Date(now - 10 * 86400000).toISOString(),
    weightKg: 74.2,
    bodyFatPercent: 14.8,
    measurements: { waist: 81.5, chest: 103.5, leftArm: 38 },
    notes: "Consistent high-protein nutrition, vascularity improving.",
  },
  {
    _id: "demo-prog-3",
    recordedAt: new Date(now - 17 * 86400000).toISOString(),
    weightKg: 73.8,
    bodyFatPercent: 15.0,
    measurements: { waist: 82, chest: 103, leftArm: 37.8 },
    notes: "Mid-mesocycle strength check. Shoulder pressing felt light.",
  },
  {
    _id: "demo-prog-4",
    recordedAt: new Date(now - 24 * 86400000).toISOString(),
    weightKg: 73.4,
    bodyFatPercent: 15.2,
    measurements: { waist: 82.5, chest: 102.5, leftArm: 37.5 },
    notes: "Baseline weigh-in before launching 5-day Bro Split.",
  },
];

function Progress() {
  const demoMode = useSelector((state) => state.auth.demoMode);
  const authUser = useSelector((state) => state.auth.user);
  const isDemoUser = Boolean(demoMode || authUser?.isDemo || authUser?.email === "demo@fittrack.app");
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [editingCheckpointId, setEditingCheckpointId] = useState(null);
  const [editingCheckpointForm, setEditingCheckpointForm] = useState(null);
  const [deletingEntry, setDeletingEntry] = useState(null);

  const loadEntries = useCallback(async () => {
    try {
      const data = await apiRequest("/progress");
      if (isDemoUser && (!data?.items || data.items.length === 0)) {
        setEntries(DEMO_PROGRESS_ENTRIES);
      } else {
        setEntries(data.items || []);
      }
    } catch (error) {
      if (isDemoUser) {
        setEntries(DEMO_PROGRESS_ENTRIES);
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
    loadEntries();
  }, [loadEntries]);

  // Strictly arrange entries by date with newest on top
  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      const timeA = new Date(a.recordedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.recordedAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }, [entries]);

  const chartData = useMemo(() => {
    return [...sortedEntries]
      .filter((item) => item.weightKg != null && Number.isFinite(Number(item.weightKg)))
      .reverse()
      .map((item) => ({
        date: new Date(item.recordedAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        weight: Number(item.weightKg),
      }));
  }, [sortedEntries]);

  const submitEntry = async (event) => {
    event.preventDefault();
    if (isDemoUser) {
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

    const todayStr = new Date().toISOString().slice(0, 10);
    const chosenDate = form.recordedAt || todayStr;
    if (chosenDate > todayStr) {
      setMessage("Cannot record checkpoint for a future date. Only previous and current dates are allowed.");
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
          recordedAt: new Date(chosenDate + "T12:00:00").toISOString(),
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
    if (isDemoUser) {
      setMessage("Demo Overview Mode: Deleting entries is disabled in preview mode.");
      return;
    }

    try {
      await apiRequest(`/progress/${entry._id}`, { method: "DELETE" });
      setEntries((current) => current.filter((item) => item._id !== entry._id));
      setMessage("Entry removed.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleStartEdit = (entry) => {
    setEditingCheckpointId(entry._id);
    setEditingCheckpointForm({
      recordedAt: entry.recordedAt
        ? new Date(entry.recordedAt).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      weightKg: entry.weightKg ?? "",
      bodyFatPercent: entry.bodyFatPercent ?? "",
      waist: entry.measurements?.waist ?? "",
      chest: entry.measurements?.chest ?? "",
      leftArm: entry.measurements?.leftArm ?? "",
      notes: entry.notes ?? "",
    });
  };

  const handleCloseEdit = () => {
    setEditingCheckpointId(null);
    setEditingCheckpointForm(null);
  };

  useEffect(() => {
    if (!editingCheckpointId) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleCloseEdit();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingCheckpointId]);

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingCheckpointForm) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const chosenDate = editingCheckpointForm.recordedAt || todayStr;
    if (chosenDate > todayStr) {
      setMessage("Cannot set checkpoint date in the future. Please select today or a previous date.");
      return;
    }

    if (isDemoUser) {
      setEntries((current) =>
        current.map((item) =>
          item._id === editingCheckpointId
            ? {
                ...item,
                recordedAt: new Date(chosenDate + "T12:00:00").toISOString(),
                weightKg: editingCheckpointForm.weightKg ? Number(editingCheckpointForm.weightKg) : null,
                bodyFatPercent: editingCheckpointForm.bodyFatPercent ? Number(editingCheckpointForm.bodyFatPercent) : null,
                measurements: {
                  waist: editingCheckpointForm.waist ? Number(editingCheckpointForm.waist) : null,
                  chest: editingCheckpointForm.chest ? Number(editingCheckpointForm.chest) : null,
                  leftArm: editingCheckpointForm.leftArm ? Number(editingCheckpointForm.leftArm) : null,
                },
                notes: editingCheckpointForm.notes || "",
              }
            : item
        )
      );
      setEditingCheckpointId(null);
      setEditingCheckpointForm(null);
      setMessage("Checkpoint updated in preview mode.");
      return;
    }

    try {
      const payload = {
        recordedAt: new Date(chosenDate + "T12:00:00").toISOString(),
        weightKg: editingCheckpointForm.weightKg ? Number(editingCheckpointForm.weightKg) : null,
        bodyFatPercent: editingCheckpointForm.bodyFatPercent ? Number(editingCheckpointForm.bodyFatPercent) : null,
        measurements: {
          waist: editingCheckpointForm.waist ? Number(editingCheckpointForm.waist) : null,
          chest: editingCheckpointForm.chest ? Number(editingCheckpointForm.chest) : null,
          leftArm: editingCheckpointForm.leftArm ? Number(editingCheckpointForm.leftArm) : null,
        },
        notes: editingCheckpointForm.notes ? editingCheckpointForm.notes.trim() : "",
      };

      const res = await apiRequest(`/progress/${editingCheckpointId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      setEntries((current) =>
        current.map((item) => (item._id === editingCheckpointId ? (res.item || { ...item, ...payload }) : item))
      );
      setEditingCheckpointId(null);
      setEditingCheckpointForm(null);
      setMessage("Checkpoint updated.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  // Metric computations
  const validWeights = useMemo(() => {
    return sortedEntries
      .filter((e) => e.weightKg != null && Number.isFinite(Number(e.weightKg)))
      .map((e) => Number(e.weightKg));
  }, [sortedEntries]);

  const latestWeight = validWeights.length > 0 ? validWeights[0] : null;
  const oldestWeight = validWeights.length > 1 ? validWeights[validWeights.length - 1] : null;
  const weightDelta =
    latestWeight != null && oldestWeight != null
      ? (latestWeight - oldestWeight).toFixed(1)
      : null;

  const habitScore =
    sortedEntries.length >= 6
      ? "Consistent Habit"
      : sortedEntries.length >= 2
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
            {sortedEntries.length > 0
              ? `Logged on ${new Date(sortedEntries[0].recordedAt).toLocaleDateString()}`
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
              <label htmlFor="progress-recorded-at">Date</label>
              <input
                id="progress-recorded-at"
                className={styles.formInput}
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                value={form.recordedAt || new Date().toISOString().slice(0, 10)}
                onChange={(e) => {
                  const todayStr = new Date().toISOString().slice(0, 10);
                  if (e.target.value > todayStr) {
                    setMessage("Checkpoint date cannot be in the future. Please select today or a previous date.");
                    setForm({ ...form, recordedAt: todayStr });
                  } else {
                    setMessage("");
                    setForm({ ...form, recordedAt: e.target.value });
                  }
                }}
              />
            </div>

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
        ) : sortedEntries.length === 0 ? (
          <div className={styles.emptyState}>
            No entries logged yet. Record your initial baseline above.
          </div>
        ) : (
          <div className={styles.historyList}>
            {sortedEntries.map((entry) => (
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

                <div className={styles.historyActions}>
                  <button
                    type="button"
                    className={styles.editBtn}
                    onClick={() => handleStartEdit(entry)}
                    title="Edit this biometric checkpoint"
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
                    onClick={() => setDeletingEntry(entry)}
                    title="Delete this checkpoint"
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
        isOpen={Boolean(deletingEntry)}
        type="danger"
        title="Delete Measurement Checkpoint"
        message={
          deletingEntry
            ? `Delete the measurement checkpoint from ${new Date(
                deletingEntry.recordedAt
              ).toLocaleDateString(undefined, {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })} (${deletingEntry.weightKg} kg)? This action cannot be undone.`
            : "Delete this measurement checkpoint? This action cannot be undone."
        }
        confirmText="Delete Entry"
        cancelText="Cancel"
        onConfirm={async () => {
          if (!deletingEntry) return;
          const entryToDelete = deletingEntry;
          setDeletingEntry(null);
          await removeEntry(entryToDelete);
        }}
        onClose={() => setDeletingEntry(null)}
      />

      {/* Edit Checkpoint Modal */}
      {editingCheckpointId && editingCheckpointForm && (
        <div className={styles.editModalBackdrop} onClick={handleCloseEdit}>
          <div
            className={styles.editModalCard}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-checkpoint-modal-title"
          >
            <div className={styles.editModalHeader}>
              <div>
                <p className={cx([sharedStyles], "eyebrow accent")}>BIOMETRICS</p>
                <h3 id="edit-checkpoint-modal-title">Edit Measurement Checkpoint</h3>
              </div>
              <button
                type="button"
                className={styles.editModalCloseBtn}
                onClick={handleCloseEdit}
                aria-label="Close edit checkpoint dialog"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className={styles.editModalBody}>
                <div className={styles.editModalRow2}>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="edit-cp-date">Date *</label>
                    <input
                      id="edit-cp-date"
                      type="date"
                      className={styles.modalFormInput}
                      required
                      max={new Date().toISOString().slice(0, 10)}
                      value={editingCheckpointForm.recordedAt || new Date().toISOString().slice(0, 10)}
                      onChange={(e) => {
                        const todayStr = new Date().toISOString().slice(0, 10);
                        if (e.target.value > todayStr) {
                          setMessage("Checkpoint date cannot be in the future. Please select today or a previous date.");
                          setEditingCheckpointForm({
                            ...editingCheckpointForm,
                            recordedAt: todayStr,
                          });
                        } else {
                          setEditingCheckpointForm({
                            ...editingCheckpointForm,
                            recordedAt: e.target.value,
                          });
                        }
                      }}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="edit-cp-weight">Weight (kg) *</label>
                    <input
                      id="edit-cp-weight"
                      type="number"
                      className={styles.modalFormInput}
                      step="0.1"
                      min="20"
                      max="400"
                      required
                      value={editingCheckpointForm.weightKg}
                      onChange={(e) =>
                        setEditingCheckpointForm({
                          ...editingCheckpointForm,
                          weightKg: e.target.value,
                        })
                      }
                      placeholder="e.g. 75.5"
                    />
                  </div>
                </div>

                <div className={styles.editModalRow2}>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="edit-cp-bodyfat">Body Fat (%)</label>
                    <input
                      id="edit-cp-bodyfat"
                      type="number"
                      className={styles.modalFormInput}
                      step="0.1"
                      min="3"
                      max="70"
                      value={editingCheckpointForm.bodyFatPercent}
                      onChange={(e) =>
                        setEditingCheckpointForm({
                          ...editingCheckpointForm,
                          bodyFatPercent: e.target.value,
                        })
                      }
                      placeholder="Optional"
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="edit-cp-waist">Waist (cm)</label>
                    <input
                      id="edit-cp-waist"
                      type="number"
                      className={styles.modalFormInput}
                      step="0.5"
                      min="40"
                      max="250"
                      value={editingCheckpointForm.waist}
                      onChange={(e) =>
                        setEditingCheckpointForm({
                          ...editingCheckpointForm,
                          waist: e.target.value,
                        })
                      }
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className={styles.editModalRow2}>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="edit-cp-chest">Chest (cm)</label>
                    <input
                      id="edit-cp-chest"
                      type="number"
                      className={styles.modalFormInput}
                      step="0.5"
                      min="40"
                      max="250"
                      value={editingCheckpointForm.chest}
                      onChange={(e) =>
                        setEditingCheckpointForm({
                          ...editingCheckpointForm,
                          chest: e.target.value,
                        })
                      }
                      placeholder="Optional"
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="edit-cp-arm">Arm (cm)</label>
                    <input
                      id="edit-cp-arm"
                      type="number"
                      className={styles.modalFormInput}
                      step="0.5"
                      min="15"
                      max="100"
                      value={editingCheckpointForm.leftArm}
                      onChange={(e) =>
                        setEditingCheckpointForm({
                          ...editingCheckpointForm,
                          leftArm: e.target.value,
                        })
                      }
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="edit-cp-notes">Context &amp; Notes</label>
                  <input
                    id="edit-cp-notes"
                    type="text"
                    className={styles.modalFormInput}
                    maxLength={300}
                    value={editingCheckpointForm.notes}
                    onChange={(e) =>
                      setEditingCheckpointForm({
                        ...editingCheckpointForm,
                        notes: e.target.value,
                      })
                    }
                    placeholder="e.g. Morning fasted, post-refeed day"
                  />
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
                  {saving ? "Saving…" : "Save Checkpoint"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Progress;
