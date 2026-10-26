"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLang } from "../../i18n/LanguageProvider";
import { RestaurantScene } from "./scene";
import {
  DEFAULT_MAX_TABLES,
  SLOTS,
  STORAGE_KEY,
  activeOn,
  blockOn,
  defaultData,
  dirtyOn,
  isOverdue,
  migrate,
  nowHHMM,
  tablesOf,
  toMin,
  todayISO,
  uid,
} from "./model";
import { text } from "./text";
import ManagerPanel from "./ManagerPanel";
import StaffPanel from "./StaffPanel";
import ReportsPanel from "./ReportsPanel";
import CalendarView from "./CalendarView";
import DataInspector, { useDataLog } from "./DataInspector";
import ColorsPanel from "./ColorsPanel";
import { useMenu } from "./menuData";
import { Modal, RoleBadge } from "./ui";

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return migrate(JSON.parse(raw));
  } catch {}
  return defaultData();
}

// The 30-minute slots plus any exact time in use (e.g. "now" or a payment time).
const slotsWith = (...extra) => [...new Set([...SLOTS, ...extra.filter(Boolean)])].sort((a, b) => toMin(a) - toMin(b));

export default function ReservationsApp() {
  const { lang, dir } = useLang();
  const t = text[lang] || text.ar;

  const [data, setData] = useState(null);
  // One page for everyone; the role decides what can be added, changed or deleted.
  const [role, setRole] = useState("staff");
  // While asking to become manager: { value, error, then } — `then` is the manager action that asked.
  const [pin, setPin] = useState(null);
  const [floorId, setFloorId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [date, setDate] = useState(todayISO);
  const [time, setTime] = useState("19:00");
  const [party, setParty] = useState(2);
  const [footMsg, setFootMsg] = useState(null);
  // Which window is open over the room: { kind: "table" | "floor" | "find" | "waitlist" | "day" | "reports" | "settings" }.
  const [modal, setModal] = useState(null);
  const [pending, setPending] = useState(null);
  const [stageView, setStageView] = useState("3d"); // "3d" | "cal"
  const [toolsOpen, setToolsOpen] = useState(false);
  // The side panel next to the room: "data" (live requests), "colors", or none.
  const [side, setSide] = useState("data");
  // Every change to the data, as the backend request it maps to.
  const [dataLog, clearDataLog] = useDataLog(data);

  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const fileRef = useRef(null);

  // Load after mount so the server render never touches localStorage.
  useEffect(() => {
    const d = load();
    setData(d);
    setFloorId(d.layout.floors[0].id);
    setTime(nowHHMM());
  }, []);

  useEffect(() => {
    if (!data) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, [data]);

  // The menu belongs to the backend; this page only reads it.
  const menu = useMenu();
  const layout = data?.layout;
  const theme = data?.settings.theme;
  const setTheme = (next) => setData((d) => ({ ...d, settings: { ...d.settings, theme: next } }));
  // CSS variables so name tags, legend, counts and calendar bars use the same colours as the 3D room.
  const themeVars = theme && {
    "--rs-bg": theme.background,
    "--th-taken": theme.chairTaken,
    "--th-extra": theme.chairExtra,
    "--th-selected": theme.tableSelected,
    ...Object.fromEntries(Object.entries(theme.status).map(([k, v]) => [`--st-${k}`, v])),
  };
  const floorIndex = layout
    ? Math.max(
        0,
        layout.floors.findIndex((f) => f.id === floorId),
      )
    : 0;
  const floor = layout?.floors[floorIndex];
  const selected = floor?.tables.find((x) => x.id === selectedId) || null;
  const isManager = role === "manager";

  const updateLayout = (fn) => setData((d) => ({ ...d, layout: fn(d.layout) }));
  // Deleting tables also deletes their bookings and blocks.
  const dropTables = (ids) =>
    setData((d) => ({
      ...d,
      reservations: d.reservations
        .filter((r) => !ids.includes(r.tableId))
        .map((r) => (r.joined ? { ...r, joined: r.joined.filter((id) => !ids.includes(id)) } : r)),
      blocks: d.blocks.filter((b) => !ids.includes(b.targetId)),
    }));

  // State of every table at the chosen date & time:
  // a booking first, then a block, then waiting for cleaning, else free.
  const status = useMemo(() => {
    const s = {};
    if (!data) return s;
    const byId = {};
    data.layout.floors.forEach((f) => f.tables.forEach((x) => (byId[x.id] = x)));
    for (const f of data.layout.floors) {
      for (const x of f.tables) {
        const r = activeOn(data.reservations, x.id, date, time);
        if (r) {
          // Spread a combined party over its tables; overflow sits at the main one.
          const ids = tablesOf(r).filter((id) => byId[id]);
          let left = r.guests;
          const share = {};
          ids.forEach((id) => {
            share[id] = Math.min(left, byId[id].seats);
            left -= share[id];
          });
          share[ids[0]] += left;
          const others = ids.filter((id) => id !== x.id).map((id) => byId[id].label);
          s[x.id] = { state: r.status === "booked" ? "booked" : "seated", guests: share[x.id] || 0, res: r, joinedLabel: others.join("+") };
          continue;
        }
        const b = blockOn(data.blocks, x.id, f.id, date, time);
        const dirty = dirtyOn(data.reservations, x.id, date, time);
        if (b) s[x.id] = { state: "blocked", block: b };
        else if (dirty) s[x.id] = { state: "cleaning", dirty };
        else s[x.id] = { state: x.maxSeats < party ? "dim" : "free" };
      }
    }
    return s;
  }, [data, date, time, party]);

  const sectionColors = useMemo(() => Object.fromEntries((layout?.sections || []).map((s) => [s.id, s.color])), [layout]);

  // Create the 3D scene once; callbacks go through refs so they stay fresh.
  const handlers = useRef({});
  handlers.current = {
    // A table (or anywhere inside its ring) opens its window; empty floor just deselects.
    onSelect: (id) => {
      setSelectedId(id);
      setPending(null);
      setModal(id ? { kind: "table" } : null);
      if (id) sceneRef.current?.focusTable(id);
    },
    onMove: (id, x, z) =>
      updateLayout((l) => ({
        ...l,
        floors: l.floors.map((f) => (f.id === floorId ? { ...f, tables: f.tables.map((tb) => (tb.id === id ? { ...tb, x, z } : tb)) } : f)),
      })),
  };
  useEffect(() => {
    if (!data || sceneRef.current) return;
    const s = new RestaurantScene(mountRef.current, {
      onSelect: (id) => handlers.current.onSelect(id),
      onMove: (id, x, z) => handlers.current.onMove(id, x, z),
    });
    sceneRef.current = s;
    s.setRoom(data.layout.width, data.layout.depth);
    s.view("angle");
    return () => {
      s.dispose();
      sceneRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!data]);

  // Colours first, so the tables below are built with them.
  const ready = !!data;
  useEffect(() => {
    if (theme) sceneRef.current?.setTheme(theme);
  }, [theme, ready]);

  useEffect(() => {
    const s = sceneRef.current;
    if (!s || !layout) return;
    s.setRoom(layout.width, layout.depth);
    s.setTables(floor.tables, status, selectedId, sectionColors);
  }, [layout, floor, status, selectedId, sectionColors, theme]);

  // Only the manager can drag tables around.
  useEffect(() => {
    sceneRef.current?.setEditable(isManager);
  }, [isManager, data]);

  // Windows open in the middle of the page over a dimmed room, so the camera
  // keeps the plain framing (no side inset).
  useEffect(() => {
    sceneRef.current?.setInset(0, 0, 0);
  }, [data]);

  // The tools menu closes on any click outside it.
  useEffect(() => {
    if (!toolsOpen) return;
    const close = (e) => !e.target.closest(".rs-menu-wrap") && setToolsOpen(false);
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [toolsOpen]);

  const closeModal = useCallback(() => {
    setModal((m) => {
      if (m?.kind === "table") setSelectedId(null);
      return null;
    });
  }, []);

  // A booking whose guests are later than the grace period is cancelled and its
  // deposit is kept. Checked every 20 seconds while the page is open.
  const grace = data?.settings.graceMinutes;
  useEffect(() => {
    if (grace === undefined) return;
    const sweep = () => {
      const today = todayISO();
      const now = nowHHMM();
      setData((d) => {
        if (!d.reservations.some((r) => isOverdue(r, today, now, grace))) return d;
        return {
          ...d,
          reservations: d.reservations.map((r) =>
            isOverdue(r, today, now, grace) ? { ...r, status: "noshow", autoCancelled: true, forfeited: r.deposit || 0 } : r,
          ),
        };
      });
    };
    sweep();
    const id = setInterval(sweep, 20000);
    return () => clearInterval(id);
  }, [grace]);

  if (!data) return <main className="rs-page" dir={dir} />;

  const focusTable = (id) => sceneRef.current?.focusTable(id);
  const selectTable = (id, fId, pend = null) => {
    setFloorId(fId);
    setSelectedId(id);
    setPending(pend);
    setModal({ kind: "table" });
    setTimeout(() => focusTable(id), 50);
  };
  const showFloor = (f) => {
    setFloorId(f.id);
    setSelectedId(null);
    setTimeout(() => sceneRef.current?.view("angle"), 30);
  };

  // Switching to Manager asks for the PIN when one is set.
  const chooseRole = (r) => {
    if (r === "staff") {
      setRole("staff");
      setPin(null);
      if (["floor", "reports", "settings"].includes(modal?.kind)) setModal(null);
    } else if (!data.settings.managerPin) setRole("manager");
    else setPin({ value: "", error: false });
  };
  const tryUnlock = (e) => {
    e.preventDefault();
    if (!data.settings.managerPin || pin.value === data.settings.managerPin) {
      setRole("manager");
      setPin(null);
      pin.then?.();
    } else setPin({ ...pin, value: "", error: true });
  };
  // Manager-only buttons work for everyone: staff are asked to switch to
  // Manager first (with the PIN when one is set), then the action runs.
  const asManager = (action) => () => (isManager ? action() : setPin({ value: "", error: false, then: action }));

  const addFloor = () => {
    const f = { id: uid(), name: "", maxTables: DEFAULT_MAX_TABLES, tables: [] };
    updateLayout((l) => ({ ...l, floors: [...l.floors, f] }));
    setFloorId(f.id);
    setSelectedId(null);
    setModal({ kind: "floor" });
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `restaurant-bookings-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const importData = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const d = migrate(JSON.parse(await file.text()));
      if (!d.layout?.floors?.length) throw new Error("no floors");
      setData(d);
      setFloorId(d.layout.floors[0].id);
      setSelectedId(null);
      setFootMsg({ type: "ok", text: t.importDone });
    } catch {
      setFootMsg({ type: "err", text: t.importFail });
    }
  };

  const floorName = (f, i) => f.name || `${t.floor} ${i + 1}`;
  const countsOf = (f) =>
    f.tables.reduce(
      (c, x) => {
        const s = status[x.id]?.state;
        c[s === "booked" || s === "seated" ? s : s === "free" || s === "dim" ? "free" : "other"]++;
        return c;
      },
      { free: 0, booked: 0, seated: 0, other: 0 },
    );
  const waiting = data.waitlist.filter((w) => w.date === date).length;
  const dayCount = data.reservations.filter((r) => r.date === date).length;

  const staffProps = {
    t,
    can: { manage: isManager },
    data,
    setData,
    floor,
    date,
    setDate,
    time,
    setTime,
    party,
    setParty,
    status,
    selected,
    selectTable,
    menu,
  };
  const managerProps = {
    t,
    data,
    setData,
    layout,
    floor,
    floorIndex,
    setFloorId,
    selectedId,
    setSelectedId,
    updateLayout,
    dropTables,
    focusTable,
  };

  // Manager-only tools stay visible for staff, greyed out with the badge, so
  // everyone can see who is responsible for what.
  const tools = [
    { kind: "find", label: t.findTool, role: "staff" },
    { kind: "waitlist", label: t.waitTool, role: "staff", count: waiting },
    { kind: "day", label: t.dayTool, role: "staff", count: dayCount },
    { kind: "reports", label: t.reportsTool, role: "manager" },
    { kind: "settings", label: t.settingsTool, role: "manager" },
  ];

  const modalContent = () => {
    if (!modal) return null;
    const k = modal.kind;
    if (k === "table" && selected)
      return {
        large: true,
        title: `${t.table} ${selected.label}`,
        body: (
          <>
            <StaffPanel {...staffProps} view="table" pending={pending} clearPending={() => setPending(null)} />
            {isManager && (
              <details className="rs-details">
                <summary>
                  {t.editThisTable} <RoleBadge t={t} role="manager" />
                </summary>
                <ManagerPanel {...managerProps} view="table" />
              </details>
            )}
          </>
        ),
      };
    if (k === "floor" && isManager)
      return { title: `${floorName(floor, floorIndex)} · ${t.manageTables}`, body: <ManagerPanel {...managerProps} view="floor" /> };
    if (k === "settings" && isManager)
      return {
        title: t.settingsTool,
        body: (
          <>
            <ManagerPanel {...managerProps} view="settings" />
            <section className="rs-block">
              <h2>{t.savedLocal}</h2>
              <div className="rs-row">
                <button className="rs-ghost" onClick={exportData}>
                  {t.exportData}
                </button>
                <button className="rs-ghost" onClick={() => fileRef.current?.click()}>
                  {t.importData}
                </button>
              </div>
              {footMsg && <p className={`rs-msg is-${footMsg.type}`}>{footMsg.text}</p>}
              <button
                className="rs-link"
                onClick={() => {
                  const d = defaultData();
                  setData(d);
                  setFloorId(d.layout.floors[0].id);
                  setSelectedId(null);
                }}
              >
                {t.reset}
              </button>
            </section>
          </>
        ),
      };
    if (k === "reports" && isManager) return { title: t.reportsTool, body: <ReportsPanel t={t} data={data} date={date} setDate={setDate} /> };
    if (k === "find") return { title: t.findTool, body: <StaffPanel {...staffProps} view="find" /> };
    if (k === "waitlist") return { title: t.waitTool, body: <StaffPanel {...staffProps} view="waitlist" /> };
    if (k === "day") return { title: t.dayTool, body: <StaffPanel {...staffProps} view="day" /> };
    return null;
  };
  const open = modalContent();

  return (
    <main className="rs-page" dir={dir}>
      <div className={`rs-layout${side ? " has-data" : ""}`} style={themeVars}>
        {/* ---------- resources: just the floors, stacked beside the room ---------- */}
        <aside className="rs-resources-col" aria-label={t.resources}>
          <ul className="rs-resources">
            {layout.floors.map((f, i) => {
              const c = countsOf(f);
              return (
                <li key={f.id} className={f.id === floorId ? "is-on" : ""}>
                  <button className="rs-res-main" onClick={() => showFloor(f)}>
                    <strong>
                      {floorName(f, i)} <small>({f.tables.length})</small>
                    </strong>
                    <span className="rs-res-counts">
                      <i className="is-free" title={t.legendFree}>
                        {c.free}
                      </i>
                      <i className="is-booked" title={t.legendBooked}>
                        {c.booked}
                      </i>
                      <i className="is-seated" title={t.legendSeated}>
                        {c.seated}
                      </i>
                    </span>
                  </button>
                  <button
                    className={`rs-res-action${isManager ? "" : " is-locked"}`}
                    onClick={asManager(() => {
                      showFloor(f);
                      setModal({ kind: "floor" });
                    })}
                  >
                    ⚙ {t.manageTables} <RoleBadge t={t} role="manager" />
                  </button>
                </li>
              );
            })}
          </ul>
          <button className={`rs-res-add${isManager ? "" : " is-locked"}`} onClick={asManager(addFloor)}>
            + {t.addFloor} <RoleBadge t={t} role="manager" />
          </button>
        </aside>

        <div className="rs-main">
          {/* ---------- toolbar: view, date & time, tools, role ---------- */}
          <div className="rs-toolbar">
            <div className="rs-seg">
              {[
                ["3d", t.view3d],
                ["cal", t.viewCal],
              ].map(([k, l]) => (
                <button key={k} className={stageView === k ? "is-on" : ""} onClick={() => setStageView(k)}>
                  {l}
                </button>
              ))}
            </div>
            <input className="rs-tb-input" type="date" aria-label={t.date} value={date} onChange={(e) => setDate(e.target.value)} />
            <select className="rs-tb-input" aria-label={t.time} value={time} onChange={(e) => setTime(e.target.value)}>
              {slotsWith(time).map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <button
              className="rs-ghost"
              onClick={() => {
                setDate(todayISO());
                setTime(nowHHMM());
              }}
            >
              {t.now}
            </button>
            <span className="rs-spacer" />
            <div className="rs-menu-wrap">
              <button className={`rs-ghost${toolsOpen ? " is-on" : ""}`} aria-expanded={toolsOpen} onClick={() => setToolsOpen((o) => !o)}>
                {t.tools} ▾{waiting + dayCount > 0 && <span className="rs-count">{waiting + dayCount}</span>}
              </button>
              {toolsOpen && (
                <div className="rs-dropdown" role="menu">
                  {tools.map((x) => (
                    <button
                      key={x.kind}
                      role="menuitem"
                      className={x.role === "manager" && !isManager ? "is-locked" : ""}
                      onClick={(x.role === "manager" ? asManager : (f) => f)(() => {
                        setToolsOpen(false);
                        if (modal?.kind === "table") setSelectedId(null);
                        setModal({ kind: x.kind });
                      })}
                    >
                      <span>
                        {x.label}
                        {x.count > 0 && <span className="rs-count">{x.count}</span>}
                      </span>
                      <RoleBadge t={t} role={x.role} />
                    </button>
                  ))}
                </div>
              )}
            </div>
            {[
              ["data", `{ } ${t.dataToggle}`],
              ["colors", `◐ ${t.colToggle}`],
            ].map(([k, l]) => (
              <button
                key={k}
                className={`rs-ghost${side === k ? " is-on" : ""}`}
                aria-pressed={side === k}
                onClick={() => setSide((v) => (v === k ? null : k))}
              >
                {l}
              </button>
            ))}
            <div className="rs-seg" title={t.permHint}>
              {["staff", "manager"].map((r) => (
                <button key={r} className={role === r ? "is-on" : ""} onClick={() => chooseRole(r)}>
                  {r === "manager" ? t.roleManager : t.roleStaff}
                </button>
              ))}
            </div>
          </div>

          {/* ---------- 3D room ---------- */}
          <div className={`rs-stage${stageView === "cal" ? " is-cal" : ""}`}>
            <div className="rs-canvas" ref={mountRef} />
            {stageView === "cal" && (
              <div className="rs-cal-wrap">
                <CalendarView t={t} lang={lang} data={data} date={date} setDate={setDate} setTime={setTime} selectTable={selectTable} />
              </div>
            )}
            {stageView === "3d" && (
              <>
                <div className="rs-views">
                  {Object.entries(t.views).map(([k, l]) => (
                    <button key={k} onClick={() => sceneRef.current?.view(k)}>
                      {l}
                    </button>
                  ))}
                </div>
                <div className="rs-legend">
                  <span>
                    <i className="is-free" />
                    {t.legendFree}
                  </span>
                  <span>
                    <i className="is-booked" />
                    {t.legendBooked}
                  </span>
                  <span>
                    <i className="is-seated" />
                    {t.legendSeated}
                  </span>
                  {data.settings.cleaning && (
                    <span>
                      <i className="is-cleaning" />
                      {t.legendCleaning}
                    </span>
                  )}
                  <span>
                    <i className="is-blocked" />
                    {t.legendBlocked}
                  </span>
                  <span>
                    <i className="is-dim" />
                    {t.legendDim}
                  </span>
                  <span>
                    <i className="is-seat" />
                    {t.legendSeat}
                  </span>
                  <span>
                    <i className="is-extra" />
                    {t.legendExtra}
                  </span>
                </div>
                {!modal && <p className="rs-stage-hint">{t.pickHint}</p>}
              </>
            )}
          </div>
        </div>
        {side === "data" && <DataInspector t={t} lang={lang} log={dataLog} clear={clearDataLog} data={data} />}
        {side === "colors" && <ColorsPanel t={t} theme={theme} setTheme={setTheme} />}
      </div>
      <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={importData} />

      {pin && (
        <Modal title={t.managerOnly} onClose={() => setPin(null)} closeLabel={t.close}>
          <form className="rs-form" onSubmit={tryUnlock}>
            <p>{pin.then ? t.managerOnlyBody : t.switchBody}</p>
            {data.settings.managerPin && (
              <label className="rs-field">
                <span>{t.enterPin}</span>
                <input
                  type="password"
                  inputMode="numeric"
                  autoFocus
                  value={pin.value}
                  onChange={(e) => setPin({ ...pin, value: e.target.value, error: false })}
                />
              </label>
            )}
            {pin.error && <p className="rs-msg is-err">{t.wrongPin}</p>}
            <div className="rs-row">
              <button className="rs-primary" type="submit">
                {t.switchToManager}
              </button>
              <button type="button" className="rs-ghost" onClick={() => setPin(null)}>
                {t.cancelEdit}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {open && !pin && (
        <Modal title={open.title} large={open.large} onClose={closeModal} closeLabel={t.close}>
          {open.body}
        </Modal>
      )}
    </main>
  );
}
