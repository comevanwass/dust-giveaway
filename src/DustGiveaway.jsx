import { useState, useEffect, useRef, useCallback } from "react";
import React from "react";

const SUPABASE_URL = "https://jqeqlswglnmwpzmlcfbs.supabase.co";
const SUPABASE_KEY = "sb_publishable_IXr-5dLstlrNfVrSJDUcaA_V5gX-HeL";
const ADMIN_PASSWORD = "DUST2026";
const WINNER_COUNT = 4;

const headers = {
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=representation",
};

async function fetchParticipants() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/participants?select=*&order=created_at.asc`, { headers });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

async function insertParticipant(data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/participants`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to insert");
  return res.json();
}

async function deleteAllParticipants() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/participants?id=neq.00000000-0000-0000-0000-000000000000`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("Failed to delete");
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .dg-root {
    min-height: 100vh; background: #0D0B09; color: #ffffff;
    font-family: 'DM Sans', sans-serif; font-weight: 300; position: relative;
  }

  .dg-grain {
    position: fixed; inset: 0; pointer-events: none; z-index: 999; opacity: 0.04;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 200px 200px;
  }

  .dg-form-page {
    min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 48px 24px 80px; animation: fadeUp 0.6s ease both;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .dg-wordmark {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(72px, 18vw, 140px); color: #ffa800;
    letter-spacing: 0.06em; line-height: 0.88; text-align: center;
  }

  .dg-wordmark-sub {
    font-size: 10px; letter-spacing: 0.35em; text-transform: uppercase;
    color: #ffffff; margin-top: 10px; margin-bottom: 36px; text-align: center;
  }

  .dg-prize {
    border: 1px solid rgba(255,168,0,0.25); padding: 12px 28px;
    text-align: center; margin-bottom: 44px;
  }

  .dg-prize-label {
    font-size: 8px; letter-spacing: 0.4em; text-transform: uppercase;
    color: #ffffff; margin-bottom: 5px;
  }

  .dg-prize-value {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 16px; letter-spacing: 0.12em; color: #ffa800;
  }

  .dg-card { width: 100%; max-width: 460px; }
  .dg-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0 24px; }
  .dg-field { margin-bottom: 26px; }

  .dg-field label {
    display: block; font-size: 8px; letter-spacing: 0.32em; text-transform: uppercase;
    color: #ffffff; margin-bottom: 9px;
  }

  .dg-field input, .dg-field textarea {
    width: 100%; background: transparent; border: none;
    border-bottom: 1px solid #2C2722; color: #ffffff;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 300;
    padding: 8px 0; outline: none; transition: border-color 0.2s; resize: none;
  }

  .dg-field input:focus, .dg-field textarea:focus { border-bottom-color: #ffa800; }
  .dg-field input::placeholder, .dg-field textarea::placeholder { color: #2C2722; }
  .dg-field.err input, .dg-field.err textarea { border-bottom-color: #A84040; }
  .dg-field-err { font-size: 10px; color: #A84040; margin-top: 5px; letter-spacing: 0.06em; }

  .dg-submit {
    width: 100%; background: #ffa800; color: #0D0B09; border: none;
    padding: 15px; font-family: 'Bebas Neue', sans-serif;
    font-size: 18px; letter-spacing: 0.16em; cursor: pointer;
    transition: opacity 0.18s, transform 0.1s; margin-top: 6px;
  }
  .dg-submit:hover { opacity: 0.88; }
  .dg-submit:active { transform: scale(0.99); }
  .dg-submit:disabled { opacity: 0.35; cursor: not-allowed; }

  .dg-admin-trigger {
    position: fixed; bottom: 18px; right: 20px;
    font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase;
    color: #2C2722; cursor: pointer; background: none; border: none; transition: color 0.2s;
  }
  .dg-admin-trigger:hover { color: #ffffff; }

  .dg-success-page {
    min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 40px 24px; text-align: center; animation: fadeUp 0.6s ease both;
  }

  .dg-success-mark { font-size: 14px; letter-spacing: 0.5em; color: #ffa800; margin-bottom: 28px; text-transform: uppercase; }

  .dg-success-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(52px, 14vw, 100px);
    color: #ffa800; letter-spacing: 0.04em; line-height: 0.9; margin-bottom: 20px;
  }

  .dg-success-text { font-size: 13px; color: #ffffff; line-height: 1.8; max-width: 320px; font-weight: 300; }

  .dg-login-page {
    min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center; padding: 40px 24px; animation: fadeUp 0.4s ease both;
  }

  .dg-login-title { font-family: 'Bebas Neue', sans-serif; font-size: 28px; letter-spacing: 0.14em; color: #ffffff; margin-bottom: 28px; }

  .dg-pw-input {
    width: 100%; max-width: 280px; background: transparent;
    border: 1px solid #2C2722; color: #ffffff;
    font-family: 'DM Sans', sans-serif; font-size: 13px;
    letter-spacing: 0.25em; text-align: center;
    padding: 12px 16px; outline: none; margin-bottom: 14px; transition: border-color 0.2s;
  }
  .dg-pw-input:focus { border-color: #ffa800; }

  .dg-login-btn {
    width: 100%; max-width: 280px; background: transparent;
    border: 1px solid #ffa800; color: #ffa800;
    font-family: 'Bebas Neue', sans-serif; font-size: 15px;
    letter-spacing: 0.2em; padding: 12px; cursor: pointer; transition: background 0.18s, color 0.18s;
  }
  .dg-login-btn:hover { background: #ffa800; color: #0D0B09; }
  .dg-login-err { font-size: 10px; color: #A84040; margin-top: 14px; letter-spacing: 0.12em; }

  .dg-back-btn {
    background: none; border: none; color: #ffffff;
    font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase;
    cursor: pointer; margin-top: 32px; transition: color 0.2s;
  }
  .dg-back-btn:hover { color: #ffa800; }

  .dg-admin-page { min-height: 100vh; padding: 44px 36px 80px; max-width: 760px; margin: 0 auto; animation: fadeUp 0.4s ease both; }

  .dg-admin-top {
    display: flex; justify-content: space-between; align-items: flex-end;
    border-bottom: 1px solid #1A1714; padding-bottom: 18px; margin-bottom: 36px;
  }

  .dg-admin-title { font-family: 'Bebas Neue', sans-serif; font-size: 34px; letter-spacing: 0.08em; color: #ffa800; }
  .dg-pcount { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: #ffffff; }
  .dg-ptable { width: 100%; margin-bottom: 52px; }

  .dg-pt-head {
    display: grid; grid-template-columns: 1fr 1fr 1fr 2fr;
    padding: 0 0 10px; border-bottom: 1px solid #1A1714;
    font-size: 8px; letter-spacing: 0.3em; text-transform: uppercase; color: #ffffff; gap: 16px;
  }

  .dg-pt-row {
    display: grid; grid-template-columns: 1fr 1fr 1fr 2fr;
    padding: 13px 0; border-bottom: 1px solid #1A1714; gap: 16px; align-items: start;
  }
  .dg-pt-row.is-winner { background: rgba(255,168,0,0.06); }

  .dg-pt-name { font-size: 13px; font-weight: 500; color: #ffffff; }
  .dg-pt-phone { font-size: 12px; color: #ffffff; }
  .dg-pt-answer { font-size: 11px; color: #ffffff; font-style: italic; line-height: 1.5; }
  .dg-pt-badge { font-size: 8px; letter-spacing: 0.2em; text-transform: uppercase; color: #ffa800; background: rgba(255,168,0,0.12); padding: 3px 8px; display: inline-block; margin-top: 2px; }
  .dg-empty { text-align: center; padding: 56px 0; color: #2C2722; font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; }

  .dg-draw-section { text-align: center; padding: 0 0 40px; }

  .dg-slot {
    font-family: 'Bebas Neue', sans-serif; font-size: clamp(36px, 8vw, 72px);
    letter-spacing: 0.04em; color: #ffa800;
    min-height: 88px; display: flex; align-items: center; justify-content: center; margin: 0 0 20px;
  }

  .dg-winners-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 0 0 32px; text-align: center; }

  .dg-winner-card { border: 1px solid #ffa800; padding: 20px 16px; opacity: 0; animation: winIn 0.45s ease forwards; }

  @keyframes winIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .dg-w-num { font-size: 8px; letter-spacing: 0.35em; text-transform: uppercase; color: #ffa800; margin-bottom: 8px; }
  .dg-w-name { font-family: 'Bebas Neue', sans-serif; font-size: 26px; letter-spacing: 0.06em; color: #ffffff; }
  .dg-w-phone { font-size: 11px; color: #ffffff; margin-top: 4px; }

  .dg-draw-btn {
    background: #ffa800; color: #0D0B09; border: none;
    padding: 17px 52px; font-family: 'Bebas Neue', sans-serif;
    font-size: 20px; letter-spacing: 0.16em; cursor: pointer; transition: opacity 0.18s;
  }
  .dg-draw-btn:hover { opacity: 0.85; }
  .dg-draw-btn:disabled { opacity: 0.25; cursor: not-allowed; }
  .dg-draw-hint { font-size: 10px; color: #ffffff; margin-top: 12px; letter-spacing: 0.1em; }

  .dg-actions { display: flex; gap: 14px; justify-content: center; margin-top: 44px; flex-wrap: wrap; }

  .dg-ghost-btn, .dg-export-btn {
    background: transparent; border: 1px solid #2C2722; color: #ffffff;
    padding: 9px 22px; font-family: 'DM Sans', sans-serif;
    font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase;
    cursor: pointer; transition: border-color 0.2s, color 0.2s;
  }
  .dg-ghost-btn:hover, .dg-export-btn:hover { border-color: #ffa800; color: #ffa800; }
`;

function injectStyles() {
  if (document.getElementById("dust-giveaway-css")) return;
  const el = document.createElement("style");
  el.id = "dust-giveaway-css";
  el.textContent = css;
  document.head.appendChild(el);
}

export default function DustGiveaway() {
  const [view, setView] = useState("form");
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", answer: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adminPw, setAdminPw] = useState("");
  const [adminErr, setAdminErr] = useState("");
  const [winners, setWinners] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [slotText, setSlotText] = useState("");
  const timerRef = useRef(null);

  useEffect(() => {
    injectStyles();
    return () => clearTimeout(timerRef.current);
  }, []);

  async function loadParticipants() {
    setLoading(true);
    try {
      const data = await fetchParticipants();
      setParticipants(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  function setField(key, val) {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: "" }));
  }

  function validate() {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    else if (!/^[\d\s\+\-\(\)]{7,20}$/.test(form.phone.trim())) e.phone = "Invalid number";
    if (!form.answer.trim()) e.answer = "Required";
    return e;
  }

  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      await insertParticipant({
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        phone: form.phone.trim(),
        answer: form.answer.trim(),
      });
      setView("success");
    } catch (e) { alert("Something went wrong, please try again."); }
    setSubmitting(false);
  }

  function handleAdminLogin() {
    if (adminPw.toUpperCase() === ADMIN_PASSWORD) {
      setAdminErr(""); setView("admin"); loadParticipants();
    } else { setAdminErr("Incorrect password"); }
  }

  const drawWinners = useCallback(() => {
    if (participants.length < WINNER_COUNT || drawing) return;
    setWinners([]); setDrawing(true); setSlotText("...");
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const chosen = shuffled.slice(0, WINNER_COUNT);
    const allNames = participants.map(p => `${p.first_name} ${p.last_name}`);

    function revealOne(idx) {
      if (idx >= WINNER_COUNT) { setDrawing(false); setSlotText(""); return; }
      const target = `${chosen[idx].first_name} ${chosen[idx].last_name}`;
      let count = 0;
      const totalCycles = 22 + idx * 7;

      function tick() {
        if (count >= totalCycles) {
          setSlotText(target);
          setWinners(prev => [...prev, chosen[idx]]);
          timerRef.current = setTimeout(() => {
            setSlotText("·  ·  ·");
            timerRef.current = setTimeout(() => revealOne(idx + 1), 900);
          }, 1100);
          return;
        }
        setSlotText(allNames[Math.floor(Math.random() * allNames.length)]);
        count++;
        const prog = count / totalCycles;
        timerRef.current = setTimeout(tick, 55 + prog * prog * 420);
      }
      tick();
    }
    revealOne(0);
  }, [participants, drawing]);

  async function clearAll() {
    if (!confirm("Delete all participants? This cannot be undone.")) return;
    try {
      await deleteAllParticipants();
      setParticipants([]); setWinners([]); setSlotText("");
    } catch (e) { alert("Failed to clear participants."); }
  }

  function exportCSV() {
    const rows = [
      ["First Name", "Last Name", "Phone", "Answer", "Timestamp"],
      ...participants.map(p => [p.first_name, p.last_name, p.phone, `"${p.answer.replace(/"/g, '""')}"`, p.created_at]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    a.download = "dust-giveaway-participants.csv";
    a.click();
  }

  const winnerIds = new Set(winners.map(w => w.id));

  if (view === "form") return (
    <div className="dg-root">
      <div className="dg-grain" />
      <div className="dg-form-page">
        <div className="dg-wordmark">DUST</div>
        <div className="dg-wordmark-sub">Festival · 28 &amp; 29 August · Namur, Belgium</div>
        <div className="dg-prize">
          <div className="dg-prize-label">Win</div>
          <div className="dg-prize-value">FREE 2-DAY FESTIVAL ACCESS</div>
        </div>
        <div className="dg-card">
          <div className="dg-row">
            <div className={`dg-field${errors.firstName ? " err" : ""}`}>
              <label>First Name</label>
              <input type="text" placeholder="Jane" value={form.firstName} onChange={e => setField("firstName", e.target.value)} />
              {errors.firstName && <div className="dg-field-err">{errors.firstName}</div>}
            </div>
            <div className={`dg-field${errors.lastName ? " err" : ""}`}>
              <label>Last Name</label>
              <input type="text" placeholder="Doe" value={form.lastName} onChange={e => setField("lastName", e.target.value)} />
              {errors.lastName && <div className="dg-field-err">{errors.lastName}</div>}
            </div>
          </div>
          <div className={`dg-field${errors.phone ? " err" : ""}`}>
            <label>Phone Number</label>
            <input type="tel" placeholder="+32 470 000 000" value={form.phone} onChange={e => setField("phone", e.target.value)} />
            {errors.phone && <div className="dg-field-err">{errors.phone}</div>}
          </div>
          <div className={`dg-field${errors.answer ? " err" : ""}`}>
            <label>What do you want to see at the Dust Festival?</label>
            <textarea rows={3} placeholder="Tell us..." value={form.answer} onChange={e => setField("answer", e.target.value)} />
            {errors.answer && <div className="dg-field-err">{errors.answer}</div>}
          </div>
          <button className="dg-submit" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "ENTERING..." : "ENTER THE DRAW"}
          </button>
        </div>
        <button className="dg-admin-trigger" onClick={() => setView("admin-login")}>admin</button>
      </div>
    </div>
  );

  if (view === "success") return (
    <div className="dg-root">
      <div className="dg-grain" />
      <div className="dg-success-page">
        <div className="dg-success-mark">◆ &nbsp; Entered &nbsp; ◆</div>
        <div className="dg-success-title">You're In</div>
        <p className="dg-success-text">
          Your entry has been received.<br />Winners will be announced at 11PM (SHARP),<br />check your messages.<br /><br />
          See you at the Dust Festival!
        </p>
      </div>
    </div>
  );

  if (view === "admin-login") return (
    <div className="dg-root">
      <div className="dg-grain" />
      <div className="dg-login-page">
        <div className="dg-login-title">ADMIN ACCESS</div>
        <input className="dg-pw-input" type="password" placeholder="PASSWORD"
          value={adminPw} onChange={e => setAdminPw(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdminLogin()} />
        <button className="dg-login-btn" onClick={handleAdminLogin}>ENTER</button>
        {adminErr && <div className="dg-login-err">{adminErr}</div>}
        <button className="dg-back-btn" onClick={() => setView("form")}>← Back to form</button>
      </div>
    </div>
  );

  return (
    <div className="dg-root">
      <div className="dg-grain" />
      <div className="dg-admin-page">
        <div className="dg-admin-top">
          <div>
            <div className="dg-admin-title">GIVEAWAY ADMIN</div>
            <div className="dg-pcount">{loading ? "Loading..." : `${participants.length} participant${participants.length !== 1 ? "s" : ""} enrolled`}</div>
          </div>
          <button className="dg-back-btn" onClick={() => setView("form")}>← Exit</button>
        </div>

        {loading ? <div className="dg-empty">Loading participants...</div>
          : participants.length === 0 ? <div className="dg-empty">No participants yet</div>
          : (
            <div className="dg-ptable">
              <div className="dg-pt-head"><span>First</span><span>Last</span><span>Phone</span><span>Answer</span></div>
              {participants.map(p => (
                <div key={p.id} className={`dg-pt-row${winnerIds.has(p.id) ? " is-winner" : ""}`}>
                  <div>
                    <div className="dg-pt-name">{p.first_name}</div>
                    {winnerIds.has(p.id) && <div className="dg-pt-badge">Winner</div>}
                  </div>
                  <div className="dg-pt-name">{p.last_name}</div>
                  <div className="dg-pt-phone">{p.phone}</div>
                  <div className="dg-pt-answer">{p.answer}</div>
                </div>
              ))}
            </div>
          )}

        <div className="dg-draw-section">
          {slotText && <div className="dg-slot">{slotText}</div>}
          {winners.length > 0 && (
            <div className="dg-winners-grid">
              {winners.map((w, i) => (
                <div key={w.id} className="dg-winner-card" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="dg-w-num">Winner {i + 1}</div>
                  <div className="dg-w-name">{w.first_name} {w.last_name}</div>
                  <div className="dg-w-phone">{w.phone}</div>
                </div>
              ))}
            </div>
          )}
          {!drawing && (
            <div>
              <button className="dg-draw-btn" onClick={drawWinners} disabled={participants.length < WINNER_COUNT}>
                {winners.length > 0 ? "REDRAW WINNERS" : "DRAW 4 WINNERS"}
              </button>
              {participants.length < WINNER_COUNT && <div className="dg-draw-hint">Need at least {WINNER_COUNT} participants to draw</div>}
            </div>
          )}
          {participants.length > 0 && !drawing && (
            <div className="dg-actions">
              <button className="dg-export-btn" onClick={exportCSV}>Export CSV</button>
              <button className="dg-ghost-btn" onClick={clearAll}>Clear All Participants</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
