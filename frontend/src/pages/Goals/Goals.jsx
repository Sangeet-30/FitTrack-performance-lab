import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { apiRequest } from "../../services/api.js";
import sharedStyles from "../../Shared.module.css";
import { cx } from "../../utils/classNames.js";

const initialForm = { title: "", category: "Strength", targetValue: "", currentValue: "0", unit: "kg", dueDate: "" };

function Goals() {
  const demoMode = useSelector((state) => state.auth.demoMode);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadGoals = async () => {
    try { const data = await apiRequest("/goals"); setItems(data.items || []); }
    catch (error) { setMessage(`${error.message} Check that the API is running and sign in again if needed.`); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadGoals(); }, []);

  const submitGoal = async (event) => {
    event.preventDefault();
    if (demoMode) {
      setMessage("Demo Overview Mode: Creating new goals is disabled in preview. Sign up for a free account to customize your goals!");
      return;
    }
    if (!form.title.trim()) return;
    setSaving(true); setMessage("");
    try {
      const data = await apiRequest("/goals", { method: "POST", body: JSON.stringify({ ...form, targetValue: form.targetValue === "" ? undefined : Number(form.targetValue), currentValue: Number(form.currentValue) || 0, dueDate: form.dueDate || undefined }) });
      setItems((current) => [data.item, ...current]); setForm(initialForm); setMessage("Goal created.");
    } catch (error) { setMessage(error.message); }
    finally { setSaving(false); }
  };
  const updateGoal = async (goal, patch) => {
    if (demoMode) {
      setMessage("Demo Overview Mode: Editing goals is disabled in preview mode.");
      return;
    }
    try { const data = await apiRequest(`/goals/${goal._id}`, { method: "PATCH", body: JSON.stringify(patch) }); setItems((current) => current.map((item) => item._id === goal._id ? data.item : item)); }
    catch (error) { setMessage(error.message); }
  };
  const deleteGoal = async (goal) => {
    if (demoMode) {
      setMessage("Demo Overview Mode: Deleting goals is disabled in preview mode.");
      return;
    }
    if (!window.confirm(`Delete goal “${goal.title}”?`)) return;
    try { await apiRequest(`/goals/${goal._id}`, { method: "DELETE" }); setItems((current) => current.filter((item) => item._id !== goal._id)); }
    catch (error) { setMessage(error.message); }
  };

  return <div className={cx([sharedStyles], "goals-page")}>
    <section className={cx([sharedStyles], "page-header-block card-panel")}><div><p className={cx([sharedStyles], "eyebrow accent")}>Your training roadmap</p><h2>Goals that move with you</h2><p>Create measurable targets and update progress as you train.</p></div></section>
    {message && <p role="status" className={cx([sharedStyles], "card-panel")}>{message}</p>}
    <section className={cx([sharedStyles], "card-panel")}>
      <div className={cx([sharedStyles], "panel-header")}><h3>Create a goal</h3></div>
      <form onSubmit={submitGoal} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
        <label className={cx([sharedStyles], "field-group")}>Goal title<input required maxLength={120} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Bench press target" /></label>
        <label className={cx([sharedStyles], "field-group")}>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>Strength</option><option>Body</option><option>Nutrition</option><option>Consistency</option><option>Other</option></select></label>
        <label className={cx([sharedStyles], "field-group")}>Target value<input type="number" min="0" value={form.targetValue} onChange={(e) => setForm({ ...form, targetValue: e.target.value })} placeholder="e.g. 100" /></label>
        <label className={cx([sharedStyles], "field-group")}>Unit<input maxLength={24} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="kg, workouts, days" /></label>
        <label className={cx([sharedStyles], "field-group")}>Due date<input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></label>
        <div style={{ display: "flex", alignItems: "end" }}><button className={cx([sharedStyles], "primary-button")} disabled={saving}>{saving ? "Saving…" : "Add goal"}</button></div>
      </form>
    </section>
    <section className={cx([sharedStyles], "card-panel")} style={{ marginTop: 18 }}>
      <div className={cx([sharedStyles], "panel-header")}><h3>Your goals</h3><span>{items.length} total</span></div>
      {loading ? <p>Loading goals…</p> : items.length === 0 ? <p>No goals yet. Add your first measurable target above.</p> : <div style={{ display: "grid", gap: 12 }}>
        {items.map((goal) => { const target = Number(goal.targetValue) || 0; const current = Number(goal.currentValue) || 0; const percent = target > 0 ? Math.min(100, Math.round(current / target * 100)) : 0; return <article key={goal._id} style={{ border: "1px solid var(--border, #e2e8f0)", borderRadius: 14, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}><div><small>{goal.category} · {goal.status}</small><h3 style={{ margin: "5px 0" }}>{goal.title}</h3><p>{target ? `${current} / ${target} ${goal.unit}` : "No numeric target set"}{goal.dueDate ? ` · Due ${new Date(goal.dueDate).toLocaleDateString()}` : ""}</p></div><div style={{ display: "flex", gap: 8, alignItems: "start", flexWrap: "wrap" }}><button className={cx([sharedStyles], "secondary-button")} onClick={() => updateGoal(goal, { status: goal.status === "completed" ? "active" : "completed" })}>{goal.status === "completed" ? "Reopen" : "Complete"}</button><button className={cx([sharedStyles], "secondary-button")} onClick={() => deleteGoal(goal)}>Delete</button></div></div>
          {target > 0 && <><div style={{ height: 8, borderRadius: 99, background: "var(--border-color, #27272a)", overflow: "hidden", margin: "12px 0" }}><div style={{ width: `${percent}%`, height: "100%", background: "linear-gradient(90deg, #ef4444, #991b1b)", transition: "width .2s" }} /></div><div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><span>{percent}% complete</span><input aria-label={`Current progress for ${goal.title}`} type="number" min="0" value={goal.currentValue ?? 0} style={{ maxWidth: 110 }} onChange={(e) => setItems((currentItems) => currentItems.map((item) => item._id === goal._id ? { ...item, currentValue: e.target.value } : item))} onBlur={(e) => updateGoal(goal, { currentValue: Number(e.target.value) || 0 })} /></div></>}
        </article>; })}
      </div>}
    </section>
  </div>;
}
export default Goals;
