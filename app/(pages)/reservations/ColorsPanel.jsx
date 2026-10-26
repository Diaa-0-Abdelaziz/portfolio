"use client";
import { DEFAULT_THEME } from "./model";

// One colour field: a colour picker plus its hex code.
function Swatch({ label, value, onChange }) {
  return (
    <label className="rs-color-row">
      <span>{label}</span>
      <span className="rs-color-pick" dir="ltr">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
        <code>{value}</code>
      </span>
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="rs-color-row">
      <span>{label}</span>
      <input type="checkbox" className="rs-switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

// Lets anyone restyle the room: floor, walls, lights, tables, chairs, and the
// colour of every state. Changes show up live in the 3D room, the name tags,
// the legend, the floor counts and the calendar bars.
export default function ColorsPanel({ t, theme, setTheme }) {
  const set = (k) => (v) => setTheme({ ...theme, [k]: v });
  const setStatus = (k) => (v) => setTheme({ ...theme, status: { ...theme.status, [k]: v } });
  const dirty = JSON.stringify(theme) !== JSON.stringify(DEFAULT_THEME);

  const groups = [
    {
      title: t.colRoom,
      rows: [
        <Swatch key="floor" label={t.colFloor} value={theme.floor} onChange={set("floor")} />,
        <Toggle key="pat" label={t.colPattern} checked={theme.floorPattern} onChange={set("floorPattern")} />,
        <Swatch key="wall" label={t.colWall} value={theme.wall} onChange={set("wall")} />,
        <Swatch key="trim" label={t.colTrim} value={theme.trim} onChange={set("trim")} />,
        <Swatch key="bg" label={t.colBackground} value={theme.background} onChange={set("background")} />,
      ],
    },
    {
      title: t.colLight,
      rows: [
        <Swatch key="lc" label={t.colLightColor} value={theme.lightColor} onChange={set("lightColor")} />,
        <label key="ll" className="rs-color-row is-range">
          <span>
            {t.colLightLevel} <b dir="ltr">{theme.lightLevel.toFixed(2)}</b>
          </span>
          <input type="range" min="0.3" max="2.4" step="0.05" value={theme.lightLevel} onChange={(e) => set("lightLevel")(Number(e.target.value))} />
        </label>,
        <Toggle key="lamps" label={t.colLamps} checked={theme.lamps} onChange={set("lamps")} />,
        theme.lamps && <Swatch key="lamp" label={t.colLampColor} value={theme.lampColor} onChange={set("lampColor")} />,
      ],
    },
    {
      title: t.colTables,
      rows: [
        <Swatch key="tt" label={t.colTableTop} value={theme.tableTop} onChange={set("tableTop")} />,
        <Swatch key="tl" label={t.colTableLeg} value={theme.tableLeg} onChange={set("tableLeg")} />,
        <Swatch key="ts" label={t.colTableSelected} value={theme.tableSelected} onChange={set("tableSelected")} />,
      ],
    },
    {
      title: t.colChairs,
      rows: [
        <Swatch key="c" label={t.colChair} value={theme.chair} onChange={set("chair")} />,
        <Swatch key="cb" label={t.colChairBack} value={theme.chairBack} onChange={set("chairBack")} />,
        <Swatch key="cl" label={t.colChairLeg} value={theme.chairLeg} onChange={set("chairLeg")} />,
        <Swatch key="ct" label={t.colTaken} value={theme.chairTaken} onChange={set("chairTaken")} />,
        <Swatch key="ce" label={t.colExtra} value={theme.chairExtra} onChange={set("chairExtra")} />,
      ],
    },
    {
      title: t.colStatus,
      note: t.colStatusNote,
      rows: [
        ["free", t.legendFree],
        ["booked", t.legendBooked],
        ["seated", t.legendSeated],
        ["cleaning", t.legendCleaning],
        ["blocked", t.legendBlocked],
        ["dim", t.legendDim],
        ["closed", t.closedTag],
        ["noshow", t.noshow],
      ].map(([k, l]) => <Swatch key={k} label={l} value={theme.status[k]} onChange={setStatus(k)} />),
    },
  ];

  return (
    <aside className="rs-data rs-colors" aria-label={t.colTitle}>
      <header className="rs-data-head">
        <div>
          <strong>{t.colTitle}</strong>
          <small>{t.colSub}</small>
        </div>
        <button className="rs-data-btn" disabled={!dirty} onClick={() => setTheme(DEFAULT_THEME)}>
          {t.colReset}
        </button>
      </header>
      <div className="rs-colors-body">
        {groups.map((g) => (
          <section key={g.title} className="rs-color-group">
            <h3>{g.title}</h3>
            {g.note && <p className="rs-hint">{g.note}</p>}
            {g.rows}
          </section>
        ))}
      </div>
    </aside>
  );
}
