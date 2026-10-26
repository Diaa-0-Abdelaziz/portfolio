"use client";
import { useEffect, useState } from "react";
import { DEFAULT_MAX_TABLES, SECTION_COLORS, SIZE_KEYS, clampToRoom, findSpot, hardMax, makeTable, preset, tablesOf, todayISO, uid } from "./model";
import { Confirm, Seg, Stepper } from "./ui";

// view: "floor" (one floor's details, tables and chairs), "settings" (room
// shape, server sections, restaurant settings) or "table" (edit the clicked table).
export default function ManagerPanel({
  t,
  view = "floor",
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
}) {
  const tables = (
    <TablesSection
      t={t}
      layout={layout}
      floor={floor}
      floorIndex={floorIndex}
      selectedId={selectedId}
      setSelectedId={setSelectedId}
      updateLayout={updateLayout}
      dropTables={dropTables}
      focusTable={focusTable}
      reservations={data.reservations}
      onlyForm={view === "table"}
    />
  );
  if (view === "table") return tables;
  if (view === "settings")
    return (
      <>
        <RoomSection t={t} layout={layout} updateLayout={updateLayout} />
        <SectionsSection t={t} layout={layout} updateLayout={updateLayout} />
        <SettingsSection t={t} settings={data.settings} setData={setData} />
      </>
    );
  return (
    <>
      <FloorDetails
        t={t}
        layout={layout}
        floor={floor}
        floorIndex={floorIndex}
        setFloorId={setFloorId}
        updateLayout={updateLayout}
        dropTables={dropTables}
      />
      {tables}
      <p className="rs-hint">{t.dragHint}</p>
    </>
  );
}

const clampAll = (l) => ({
  ...l,
  floors: l.floors.map((f) => ({ ...f, tables: f.tables.map((x) => clampToRoom(x, l.width, l.depth)) })),
});

function RoomSection({ t, layout, updateLayout }) {
  const setShape = (shape) =>
    updateLayout((l) => {
      const size = Math.max(l.width, l.depth);
      return clampAll({ ...l, shape, width: size, depth: shape === "square" ? size : Math.round(size * 0.7) });
    });
  const setSize = (key, v) => updateLayout((l) => clampAll(l.shape === "square" ? { ...l, width: v, depth: v } : { ...l, [key]: v }));

  return (
    <section className="rs-block">
      <h2>{t.shape}</h2>
      <Seg
        value={layout.shape}
        onChange={setShape}
        options={[
          [
            "square",
            <>
              <span className="rs-shape-ico is-square" /> {t.square}
            </>,
          ],
          [
            "rect",
            <>
              <span className="rs-shape-ico is-rect" /> {t.rect}
            </>,
          ],
        ]}
      />
      {layout.shape === "square" ? (
        <Range label={t.size} unit={t.m} value={layout.width} onChange={(v) => setSize("width", v)} />
      ) : (
        <>
          <Range label={t.width} unit={t.m} value={layout.width} onChange={(v) => setSize("width", v)} />
          <Range label={t.depth} unit={t.m} value={layout.depth} onChange={(v) => setSize("depth", v)} />
        </>
      )}
    </section>
  );
}

// Name, table limit and deletion of one floor.
function FloorDetails({ t, layout, floor, floorIndex, setFloorId, updateLayout, dropTables }) {
  const patch = (p) => updateLayout((l) => ({ ...l, floors: l.floors.map((f) => (f.id === floor.id ? { ...f, ...p } : f)) }));
  const remove = () => {
    dropTables(floor.tables.map((x) => x.id));
    const rest = layout.floors.filter((x) => x.id !== floor.id);
    updateLayout((l) => ({ ...l, floors: l.floors.filter((x) => x.id !== floor.id) }));
    setFloorId(rest[0].id);
  };
  return (
    <section className="rs-block rs-card">
      <h2 className="rs-sub">{t.floorSettings}</h2>
      <div className="rs-row">
        <label className="rs-field">
          <span>{t.floorName}</span>
          {/* An empty name keeps the translated default ("Floor 2" / "الطابق 2"). */}
          <input value={floor.name} placeholder={`${t.floor} ${floorIndex + 1}`} onChange={(e) => patch({ name: e.target.value })} />
        </label>
        <div className="rs-field">
          <span>{t.maxTables}</span>
          <Stepper value={floor.maxTables} min={Math.max(1, floor.tables.length)} max={60} onChange={(maxTables) => patch({ maxTables })} />
        </div>
      </div>
      {floor.tables.length > 0 && floor.maxTables === floor.tables.length && <p className="rs-hint">{t.maxBelowCount}</p>}
      {layout.floors.length > 1 && (
        <div className="rs-self-start">
          <Confirm label={`${t.del} ${floor.name || `${t.floor} ${floorIndex + 1}`}`} confirm={t.confirmDel} onConfirm={remove} />
        </div>
      )}
    </section>
  );
}

const blankDraft = () => ({ id: null, label: "", shape: "round", size: "M", seats: 4, maxSeats: 5, rot: 0 });

function TablesSection({ t, layout, floor, selectedId, setSelectedId, updateLayout, dropTables, focusTable, reservations, onlyForm }) {
  const [draft, setDraft] = useState(null);
  const [notice, setNotice] = useState(null);
  const full = floor.tables.length >= floor.maxTables;

  // Clicking a table in the 3D room opens it for editing.
  useEffect(() => {
    const table = floor.tables.find((x) => x.id === selectedId);
    setDraft(table ? { ...table } : (d) => (d && !d.id ? d : null));
    setNotice(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, floor.id]);

  const startAdd = () => {
    setSelectedId(null);
    setDraft({ ...blankDraft(), label: `T${layout.nextLabel}` });
    setNotice(null);
  };

  const save = () => {
    const fields = {
      label: draft.label.trim() || `T${layout.nextLabel}`,
      shape: draft.shape,
      size: draft.size,
      seats: draft.seats,
      maxSeats: draft.maxSeats,
      rot: draft.rot,
      section: draft.section || "",
    };
    if (draft.id) {
      updateLayout((l) => ({
        ...l,
        floors: l.floors.map((f) =>
          f.id === floor.id ? { ...f, tables: f.tables.map((x) => (x.id === draft.id ? clampToRoom({ ...x, ...fields }, l.width, l.depth) : x)) } : f,
        ),
      }));
      // Inside the table's own window the table stays open after saving.
      if (onlyForm) setNotice(null);
      else {
        setSelectedId(null);
        setDraft(null);
      }
      return;
    }
    if (full) return setNotice(t.floorFull);
    const table = makeTable(fields.label, fields.shape, fields.size, fields);
    const spot = findSpot(table, floor.tables, layout.width, layout.depth);
    Object.assign(table, spot || { x: 0, z: 0 });
    updateLayout((l) => ({
      ...l,
      nextLabel: l.nextLabel + 1,
      floors: l.floors.map((f) => (f.id === floor.id ? { ...f, tables: [...f.tables, table] } : f)),
    }));
    setDraft(null);
    setNotice(spot ? null : t.noSpace);
    setTimeout(() => focusTable(table.id), 50);
  };

  const remove = (id) => {
    dropTables([id]);
    updateLayout((l) => ({ ...l, floors: l.floors.map((f) => (f.id === floor.id ? { ...f, tables: f.tables.filter((x) => x.id !== id) } : f)) }));
    if (selectedId === id) setSelectedId(null);
    if (draft?.id === id) setDraft(null);
  };

  const form = draft && (
    <TableForm
      t={t}
      draft={draft}
      setDraft={setDraft}
      sections={layout.sections}
      reservations={reservations}
      onSave={save}
      onCancel={() => (onlyForm ? setDraft({ ...floor.tables.find((x) => x.id === draft.id) }) : (setDraft(null), setSelectedId(null)))}
      onDelete={draft.id ? () => remove(draft.id) : null}
    />
  );
  if (onlyForm) return form;

  return (
    <section className="rs-block">
      <div className="rs-block-head">
        <h2>
          {t.tables} <span className={`rs-count${full ? " is-full" : ""}`}>{t.tablesCount(floor.tables.length, floor.maxTables)}</span>
        </h2>
        <button className="rs-ghost" onClick={startAdd} disabled={full}>
          + {t.addTable}
        </button>
      </div>
      {full && !draft && <p className="rs-hint">{t.floorFull}</p>}

      {form}
      {notice && <p className="rs-msg is-err">{notice}</p>}

      {floor.tables.length === 0 ? (
        <p className="rs-hint">{t.noTables}</p>
      ) : (
        <ul className="rs-crud">
          {floor.tables.map((x) => (
            <li key={x.id} className={x.id === selectedId ? "is-on" : ""}>
              <button
                className="rs-crud-main"
                onClick={() => {
                  setSelectedId(x.id);
                  focusTable(x.id);
                }}
              >
                <strong>
                  <span className={`rs-dot is-${x.shape}`} /> {x.label}
                  {sectionOf(layout, x) && (
                    <span className="rs-sec" style={{ "--sec": sectionOf(layout, x).color }}>
                      {sectionOf(layout, x).name}
                    </span>
                  )}
                </strong>
                <span className="rs-dim">
                  {x.shape === "round" ? t.round : t.rectTable} · {t.sizes[x.size]} · {x.seats}/{x.maxSeats} {t.seats}
                </span>
              </button>
              <div className="rs-crud-actions">
                <button onClick={() => setSelectedId(x.id)}>{t.edit}</button>
                <Confirm label={t.del} confirm={t.confirmDel} onConfirm={() => remove(x.id)} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function TableForm({ t, draft, setDraft, sections, reservations, onSave, onCancel, onDelete }) {
  const p = preset(draft.shape, draft.size);
  const cap = hardMax(draft.shape, draft.size);
  // Open or upcoming bookings that would no longer fit if the limit drops.
  const overLimit = draft.id
    ? reservations.filter(
        (r) =>
          tablesOf(r).length === 1 &&
          r.tableId === draft.id &&
          r.date >= todayISO() &&
          !["closed", "noshow"].includes(r.status) &&
          r.guests > draft.maxSeats,
      ).length
    : 0;

  // Picking a shape or size applies that size's recommended seats and limit.
  const pick = (patch) => {
    const next = { ...draft, ...patch };
    const np = preset(next.shape, next.size);
    setDraft({ ...next, seats: np.normal, maxSeats: np.max });
  };

  return (
    <div className="rs-card rs-form">
      <h2>{draft.id ? `${t.editTable} ${draft.label}` : t.addTable}</h2>
      <label className="rs-field">
        <span>{t.tableName}</span>
        <input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
      </label>
      <div className="rs-field">
        <span>{t.tableShape}</span>
        <Seg
          value={draft.shape}
          onChange={(shape) => pick({ shape })}
          options={[
            ["round", t.round],
            ["rect", t.rectTable],
          ]}
        />
      </div>
      <div className="rs-field">
        <span>{t.tableSize}</span>
        <Seg className="is-grid" value={draft.size} onChange={(size) => pick({ size })} options={SIZE_KEYS.map((k) => [k, t.sizes[k]])} />
      </div>
      <p className="rs-reco">
        {t.recommended(p.normal, p.max)}
        {(draft.seats !== p.normal || draft.maxSeats !== p.max) && (
          <button type="button" className="rs-link" onClick={() => pick({})}>
            {t.useRecommended}
          </button>
        )}
      </p>
      <div className="rs-row rs-spread">
        <span className="rs-dim">{t.seatsLabel}</span>
        <Stepper value={draft.seats} max={draft.maxSeats} onChange={(seats) => setDraft({ ...draft, seats })} />
      </div>
      <div className="rs-row rs-spread">
        <span className="rs-dim">{t.maxSeats}</span>
        <Stepper value={draft.maxSeats} min={draft.seats} max={cap} onChange={(maxSeats) => setDraft({ ...draft, maxSeats })} />
      </div>
      <p className="rs-hint">{t.physicalMax(cap)}</p>
      {overLimit > 0 && <p className="rs-reco is-warn">{t.seatLimitWarn(overLimit)}</p>}
      {sections.length > 0 && (
        <label className="rs-field">
          <span>{t.section}</span>
          <select value={draft.section || ""} onChange={(e) => setDraft({ ...draft, section: e.target.value })}>
            <option value="">{t.noSection}</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      )}
      {draft.id && (
        <button type="button" className="rs-ghost rs-self-start" onClick={() => setDraft({ ...draft, rot: (draft.rot || 0) + Math.PI / 4 })}>
          ⟳ {t.rotate}
        </button>
      )}
      <div className="rs-row">
        <button className="rs-primary" onClick={onSave}>
          {draft.id ? t.save : `+ ${t.addTable}`}
        </button>
        <button className="rs-ghost" onClick={onCancel}>
          {t.cancelEdit}
        </button>
        {onDelete && <Confirm label={t.del} confirm={t.confirmDel} onConfirm={onDelete} />}
      </div>
    </div>
  );
}

const sectionOf = (layout, table) => (layout.sections || []).find((s) => s.id === table.section);

function SectionsSection({ t, layout, updateLayout }) {
  const sections = layout.sections || [];
  const [name, setName] = useState("");
  const setSections = (fn) => updateLayout((l) => ({ ...l, sections: fn(l.sections || []) }));
  const add = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSections((s) => [...s, { id: uid(), name: name.trim(), color: SECTION_COLORS[s.length % SECTION_COLORS.length] }]);
    setName("");
  };
  const remove = (id) =>
    updateLayout((l) => ({
      ...l,
      sections: l.sections.filter((s) => s.id !== id),
      floors: l.floors.map((f) => ({ ...f, tables: f.tables.map((x) => (x.section === id ? { ...x, section: "" } : x)) })),
    }));

  return (
    <section className="rs-block">
      <h2>{t.sections}</h2>
      <form className="rs-row" onSubmit={add}>
        <label className="rs-field">
          <span>{t.sectionName}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <button className="rs-ghost rs-now" type="submit">
          + {t.addSection}
        </button>
      </form>
      {sections.length > 0 && (
        <ul className="rs-crud">
          {sections.map((s) => (
            <li key={s.id}>
              <div className="rs-crud-main">
                <input
                  className="rs-sec-name"
                  value={s.name}
                  onChange={(e) => setSections((all) => all.map((x) => (x.id === s.id ? { ...x, name: e.target.value } : x)))}
                />
              </div>
              <div className="rs-swatches">
                {SECTION_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={c === s.color ? "is-on" : ""}
                    style={{ background: c }}
                    aria-label={c}
                    onClick={() => setSections((all) => all.map((x) => (x.id === s.id ? { ...x, color: c } : x)))}
                  />
                ))}
              </div>
              <div className="rs-crud-actions">
                <Confirm label={t.del} confirm={t.confirmDel} onConfirm={() => remove(s.id)} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SettingsSection({ t, settings, setData }) {
  const set = (patch) => setData((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
  return (
    <section className="rs-block">
      <h2>{t.settings}</h2>
      <label className="rs-field">
        <span>{t.restaurantName}</span>
        <input value={settings.restaurantName} onChange={(e) => set({ restaurantName: e.target.value })} />
      </label>
      <div className="rs-row">
        <label className="rs-field">
          <span>
            {t.depositLabel} ({settings.currency})
          </span>
          <input
            type="number"
            min="0"
            dir="ltr"
            value={settings.deposit}
            onChange={(e) => set({ deposit: Math.max(0, Number(e.target.value) || 0) })}
          />
        </label>
        <label className="rs-field">
          <span>{t.graceLabel}</span>
          <input
            type="number"
            min="1"
            max="120"
            dir="ltr"
            value={settings.graceMinutes}
            onChange={(e) => set({ graceMinutes: Math.max(1, Number(e.target.value) || 15) })}
          />
        </label>
      </div>
      <p className="rs-hint">{t.depositRule}</p>
      <label className="rs-field">
        <span>{t.currencyLabel}</span>
        <input value={settings.currency} onChange={(e) => set({ currency: e.target.value })} style={{ maxWidth: 140 }} />
      </label>
      <label className="rs-check">
        <input type="checkbox" checked={settings.cleaning} onChange={(e) => set({ cleaning: e.target.checked })} />
        <span>{t.cleaningStep}</span>
      </label>
      <label className="rs-field">
        <span>{t.managerPin}</span>
        <input type="password" inputMode="numeric" value={settings.managerPin} onChange={(e) => set({ managerPin: e.target.value })} />
      </label>
      <p className="rs-hint">
        {t.pinHint} {t.pinLocalNote}
      </p>
    </section>
  );
}

function Range({ label, unit, value, onChange }) {
  return (
    <label className="rs-range">
      <span>
        {label}{" "}
        <b>
          {value} {unit}
        </b>
      </span>
      <input type="range" min={6} max={30} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}
