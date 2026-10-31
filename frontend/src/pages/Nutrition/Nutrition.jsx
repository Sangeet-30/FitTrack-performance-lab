import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import sharedStyles from "../../Shared.module.css";
import { cx } from "../../utils/classNames.js";
import { apiRequest } from "../../services/api.js";

const todayKey = () => { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; };
const emptyForm = { name: "", meal: "Breakfast", calories: "", protein: "", carbs: "", fat: "" };
function Nutrition() {
  const demoMode = useSelector((state) => state.auth.demoMode);
  const [dateKey, setDateKey] = useState(todayKey());
  const [log, setLog] = useState({ items: [], waterMl: 0, calorieTarget: 2200, proteinTarget: 140 });
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const totals = useMemo(() => log.items.reduce((sum, item) => ({ calories: sum.calories + Number(item.calories || 0), protein: sum.protein + Number(item.protein || 0), carbs: sum.carbs + Number(item.carbs || 0), fat: sum.fat + Number(item.fat || 0) }), { calories: 0, protein: 0, carbs: 0, fat: 0 }), [log.items]);
  const loadLog = async (date = dateKey) => { setLoading(true); try { const data = await apiRequest(`/nutrition?from=${date}&to=${date}`); setLog(data.items?.[0] || { items: [], waterMl: 0, calorieTarget: 2200, proteinTarget: 140 }); setMessage(""); } catch (error) { setMessage(`${error.message} Check that the API is running and sign in again if needed.`); } finally { setLoading(false); } };
  useEffect(() => { loadLog(dateKey); }, [dateKey]);
  const saveLog = async (next) => {
    if (demoMode) {
      setMessage("Demo Overview Mode: Saving nutrition logs is disabled in preview mode. Create an account to log personal nutrition!");
      return;
    }
    setSaving(true);
    try { const data = await apiRequest(`/nutrition/${dateKey}`, { method: "PUT", body: JSON.stringify(next) }); setLog(data.item); setMessage("Nutrition log saved."); } catch (error) { setMessage(error.message); } finally { setSaving(false); }
  };
  const addMeal = async (event) => { event.preventDefault(); if (!form.name.trim()) return; const item = { ...form, calories: Number(form.calories) || 0, protein: Number(form.protein) || 0, carbs: Number(form.carbs) || 0, fat: Number(form.fat) || 0, consumedAt: new Date().toISOString() }; await saveLog({ items: [...log.items, item], waterMl: log.waterMl || 0, calorieTarget: log.calorieTarget || 2200, proteinTarget: log.proteinTarget || 140 }); setForm(emptyForm); };
  const removeMeal = (index) => saveLog({ items: log.items.filter((_, i) => i !== index), waterMl: log.waterMl || 0, calorieTarget: log.calorieTarget || 2200, proteinTarget: log.proteinTarget || 140 });
  const changeWater = (amount) => saveLog({ items: log.items, waterMl: Math.max(0, Math.min(20000, Number(log.waterMl || 0) + amount)), calorieTarget: log.calorieTarget || 2200, proteinTarget: log.proteinTarget || 140 });
  const updateTarget = (key, value) => setLog((current) => ({ ...current, [key]: value }));
  return <div className={cx([sharedStyles], "nutrition-page")}>
    <section className={cx([sharedStyles], "page-header-block card-panel")}><div><p className={cx([sharedStyles], "eyebrow accent")}>Fuel your training</p><h2>Nutrition journal</h2><p>Track meals, macros and hydration against goals you set.</p></div><label className={cx([sharedStyles], "field-group")}>Log date<input type="date" value={dateKey} onChange={(e) => setDateKey(e.target.value)} /></label></section>
    {message && <p role="status" className={cx([sharedStyles], "card-panel")}>{message}</p>}
    <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 18 }}>
      <article className={cx([sharedStyles], "card-panel")}><p>Calories</p><h2>{Math.round(totals.calories).toLocaleString()}</h2><small>of {Number(log.calorieTarget || 2200).toLocaleString()} kcal</small><div style={{ height: 7, background: "var(--border-color, #27272a)", borderRadius: 99, marginTop: 12, overflow: "hidden" }}><div style={{ width: `${Math.min(100, totals.calories / (Number(log.calorieTarget) || 2200) * 100)}%`, height: "100%", background: "linear-gradient(90deg, #ef4444, #b91c1c)" }} /></div></article>
      <article className={cx([sharedStyles], "card-panel")}><p>Protein</p><h2>{Math.round(totals.protein)} g</h2><small>of {Number(log.proteinTarget || 140)} g target</small><div style={{ height: 7, background: "var(--border-color, #27272a)", borderRadius: 99, marginTop: 12, overflow: "hidden" }}><div style={{ width: `${Math.min(100, totals.protein / (Number(log.proteinTarget) || 140) * 100)}%`, height: "100%", background: "linear-gradient(90deg, #f87171, #ef4444)" }} /></div></article>
      <article className={cx([sharedStyles], "card-panel")}><p>Carbs / Fat</p><h2>{Math.round(totals.carbs)} / {Math.round(totals.fat)} g</h2><small>Estimated from your meal entries</small></article>
      <article className={cx([sharedStyles], "card-panel")}><p>Water</p><h2>{(Number(log.waterMl || 0) / 1000).toFixed(1)} L</h2><div style={{ display: "flex", gap: 8, marginTop: 10 }}><button className={cx([sharedStyles], "secondary-button")} disabled={saving} onClick={() => changeWater(-250)}>-250 ml</button><button className={cx([sharedStyles], "secondary-button")} disabled={saving} onClick={() => changeWater(250)}>+250 ml</button></div></article>
    </section>
    <section className={cx([sharedStyles], "card-panel")}><div className={cx([sharedStyles], "panel-header")}><h3>Daily targets</h3></div><div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "end" }}><label className={cx([sharedStyles], "field-group")}>Calories (kcal)<input type="number" min="0" max="20000" value={log.calorieTarget ?? 2200} onChange={(e) => updateTarget("calorieTarget", Number(e.target.value))} /></label><label className={cx([sharedStyles], "field-group")}>Protein (g)<input type="number" min="0" max="1000" value={log.proteinTarget ?? 140} onChange={(e) => updateTarget("proteinTarget", Number(e.target.value))} /></label><button className={cx([sharedStyles], "secondary-button")} disabled={saving} onClick={() => saveLog({ items: log.items, waterMl: log.waterMl || 0, calorieTarget: Number(log.calorieTarget) || 0, proteinTarget: Number(log.proteinTarget) || 0 })}>Save targets</button></div></section>
    <section className={cx([sharedStyles], "card-panel")} style={{ marginTop: 18 }}><div className={cx([sharedStyles], "panel-header")}><h3>Add food</h3></div><form onSubmit={addMeal} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(135px,1fr))", gap: 12 }}><label className={cx([sharedStyles], "field-group")}>Food name<input required maxLength={120} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. oats and milk" /></label><label className={cx([sharedStyles], "field-group")}>Meal<select value={form.meal} onChange={(e) => setForm({ ...form, meal: e.target.value })}><option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Snack</option></select></label><label className={cx([sharedStyles], "field-group")}>Calories<input type="number" min="0" max="20000" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} /></label><label className={cx([sharedStyles], "field-group")}>Protein (g)<input type="number" min="0" value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} /></label><label className={cx([sharedStyles], "field-group")}>Carbs (g)<input type="number" min="0" value={form.carbs} onChange={(e) => setForm({ ...form, carbs: e.target.value })} /></label><label className={cx([sharedStyles], "field-group")}>Fat (g)<input type="number" min="0" value={form.fat} onChange={(e) => setForm({ ...form, fat: e.target.value })} /></label><div style={{ display: "flex", alignItems: "end" }}><button className={cx([sharedStyles], "primary-button")} disabled={saving}>{saving ? "Saving…" : "Add food"}</button></div></form></section>
    <section className={cx([sharedStyles], "card-panel")} style={{ marginTop: 18 }}><div className={cx([sharedStyles], "panel-header")}><h3>Food log</h3><span>{log.items.length} entries</span></div>{loading ? <p>Loading nutrition log…</p> : log.items.length === 0 ? <p>No meals recorded for this date yet.</p> : <div style={{ display: "grid", gap: 8 }}>{log.items.map((item, index) => <article key={`${item.name}-${index}`} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", borderBottom: "1px solid #e2e8f0", padding: "10px 0" }}><div><small>{item.meal}</small><h4 style={{ margin: "4px 0" }}>{item.name}</h4><p style={{ margin: 0 }}>{item.calories} kcal · P {item.protein}g · C {item.carbs}g · F {item.fat}g</p></div><button className={cx([sharedStyles], "secondary-button")} disabled={saving} onClick={() => removeMeal(index)}>Remove</button></article>)}</div>}</section>
  </div>;
}
export default Nutrition;
