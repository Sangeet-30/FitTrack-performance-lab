import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { apiRequest } from "../../services/api.js";
import sharedStyles from "../../Shared.module.css";
import { cx } from "../../utils/classNames.js";

const initialForm = { weightKg: "", bodyFatPercent: "", waist: "", chest: "", leftArm: "", notes: "" };
function Progress() {
  const demoMode = useSelector((state) => state.auth.demoMode);
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const loadEntries = async () => { try { const data = await apiRequest("/progress"); setEntries(data.items || []); } catch (error) { setMessage(`${error.message} Check that the API is running and sign in again if needed.`); } finally { setLoading(false); } };
  useEffect(() => { loadEntries(); }, []);
  const chartData = useMemo(() => [...entries].filter((item) => item.weightKg != null && Number.isFinite(Number(item.weightKg))).reverse().map((item) => ({ date: new Date(item.recordedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }), weight: Number(item.weightKg) })), [entries]);
  const submitEntry = async (event) => {
    event.preventDefault();
    if (demoMode) {
      setMessage("Demo Overview Mode: Saving progress entries is disabled in preview mode. Create a free account to track your progress!");
      return;
    }
    if (form.weightKg === "" && form.bodyFatPercent === "" && !form.waist && !form.chest && !form.leftArm) { setMessage("Add at least one measurement."); return; }
    setSaving(true); setMessage("");
    const measurements = Object.fromEntries([["waist", form.waist], ["chest", form.chest], ["leftArm", form.leftArm]].filter(([, value]) => value !== "").map(([key, value]) => [key, Number(value)]));
    try { const data = await apiRequest("/progress", { method: "POST", body: JSON.stringify({ weightKg: form.weightKg === "" ? undefined : Number(form.weightKg), bodyFatPercent: form.bodyFatPercent === "" ? undefined : Number(form.bodyFatPercent), measurements: Object.keys(measurements).length ? measurements : undefined, notes: form.notes }) }); setEntries((current) => [data.item, ...current]); setForm(initialForm); setMessage("Progress entry saved."); }
    catch (error) { setMessage(error.message); }
    finally { setSaving(false); }
  };
  const removeEntry = async (entry) => {
    if (demoMode) {
      setMessage("Demo Overview Mode: Deleting entries is disabled in preview mode.");
      return;
    }
    try { await apiRequest(`/progress/${entry._id}`, { method: "DELETE" }); setEntries((current) => current.filter((item) => item._id !== entry._id)); } catch (error) { setMessage(error.message); }
  };
  const latestWeight = entries.find((item) => Number.isFinite(Number(item.weightKg)) && item.weightKg != null)?.weightKg;
  return <div className={cx([sharedStyles], "progress-page")}>
    <section className={cx([sharedStyles], "page-header-block card-panel")}><div><p className={cx([sharedStyles], "eyebrow accent")}>Your data, over time</p><h2>Progress journal</h2><p>Record measurements consistently. Trends are more useful than one-off readings.</p></div></section>
    {message && <p role="status" className={cx([sharedStyles], "card-panel")}>{message}</p>}
    <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 14, marginBottom: 18 }}>
      <article className={cx([sharedStyles], "card-panel")}><p>Latest weight</p><h2>{latestWeight == null ? "—" : `${latestWeight} kg`}</h2><small>Most recent recorded value</small></article>
      <article className={cx([sharedStyles], "card-panel")}><p>Measurements logged</p><h2>{entries.length}</h2><small>Saved to your account</small></article>
      <article className={cx([sharedStyles], "card-panel")}><p>Tracking habit</p><h2>{entries.length >= 4 ? "Building" : "Getting started"}</h2><small>Log regularly to reveal trends</small></article>
    </section>
    <section className={cx([sharedStyles], "card-panel")}><div className={cx([sharedStyles], "panel-header")}><h3>Weight trend</h3></div>{chartData.length < 2 ? <p>Add at least two weight entries to see your trend chart.</p> : <div style={{ width: "100%", height: 280 }}><ResponsiveContainer><LineChart data={chartData} margin={{ top: 12, right: 12, bottom: 4, left: 0 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis domain={["dataMin - 1", "dataMax + 1"]} /><Tooltip /><Line type="monotone" dataKey="weight" name="Weight (kg)" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: "#ef4444" }} activeDot={{ r: 6, fill: "#dc2626" }} /></LineChart></ResponsiveContainer></div>}</section>
    <section className={cx([sharedStyles], "card-panel")} style={{ marginTop: 18 }}><div className={cx([sharedStyles], "panel-header")}><h3>Add measurement</h3></div><form onSubmit={submitEntry} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
      <label className={cx([sharedStyles], "field-group")}>Weight (kg)<input type="number" min="20" max="500" step="0.1" value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: e.target.value })} placeholder="e.g. 74.5" /></label>
      <label className={cx([sharedStyles], "field-group")}>Body fat (%)<input type="number" min="1" max="75" step="0.1" value={form.bodyFatPercent} onChange={(e) => setForm({ ...form, bodyFatPercent: e.target.value })} placeholder="Optional" /></label>
      <label className={cx([sharedStyles], "field-group")}>Waist (cm)<input type="number" min="1" step="0.1" value={form.waist} onChange={(e) => setForm({ ...form, waist: e.target.value })} /></label>
      <label className={cx([sharedStyles], "field-group")}>Chest (cm)<input type="number" min="1" step="0.1" value={form.chest} onChange={(e) => setForm({ ...form, chest: e.target.value })} /></label>
      <label className={cx([sharedStyles], "field-group")}>Left arm (cm)<input type="number" min="1" step="0.1" value={form.leftArm} onChange={(e) => setForm({ ...form, leftArm: e.target.value })} /></label>
      <label className={cx([sharedStyles], "field-group")}>Notes<input maxLength={1000} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional context" /></label>
      <div style={{ display: "flex", alignItems: "end" }}><button className={cx([sharedStyles], "primary-button")} disabled={saving}>{saving ? "Saving…" : "Save entry"}</button></div>
    </form></section>
    <section className={cx([sharedStyles], "card-panel")} style={{ marginTop: 18 }}><div className={cx([sharedStyles], "panel-header")}><h3>History</h3><span>{entries.length} entries</span></div>{loading ? <p>Loading progress…</p> : entries.length === 0 ? <p>Your saved measurements will appear here.</p> : <div style={{ display: "grid", gap: 10 }}>{entries.map((entry) => <article key={entry._id} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", borderBottom: "1px solid #e2e8f0", padding: "10px 0" }}><div><strong>{new Date(entry.recordedAt).toLocaleDateString()}</strong><p style={{ margin: "4px 0 0" }}>{entry.weightKg != null ? `${entry.weightKg} kg` : "Weight not logged"}{entry.bodyFatPercent != null ? ` · ${entry.bodyFatPercent}% body fat` : ""}{entry.measurements?.waist ? ` · Waist ${entry.measurements.waist} cm` : ""}</p>{entry.notes && <small>{entry.notes}</small>}</div><button type="button" className={cx([sharedStyles], "secondary-button")} onClick={() => removeEntry(entry)}>Delete</button></article>)}</div>}</section>
  </div>;
}
export default Progress;
