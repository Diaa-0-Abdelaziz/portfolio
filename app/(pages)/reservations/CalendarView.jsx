"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { estimateFree, fromMin, nowHHMM, tablesOf, toMin, todayISO } from "./model";
import { Seg } from "./ui";

// ---------- local-calendar date helpers (no UTC drift) ----------
const parse = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const iso = (dt) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
const addDays = (d, n) => {
  const dt = parse(d);
  dt.setDate(dt.getDate() + n);
  return iso(dt);
};
const addMonths = (d, n) => {
  const dt = parse(d);
  return iso(new Date(dt.getFullYear(), dt.getMonth() + n, 1));
};

// Columns of the grid for the chosen range.
function daysOf(range, date) {
  if (range === "week") {
    const dt = parse(date);
    const start = addDays(date, -((dt.getDay() + 1) % 7)); // weeks start on Saturday
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }
  const dt = parse(date);
  const n = new Date(dt.getFullYear(), dt.getMonth() + 1, 0).getDate();
  return Array.from({ length: n }, (_, i) => iso(new Date(dt.getFullYear(), dt.getMonth(), i + 1)));
}

const OPEN_FROM = 12; // first hour shown in the day view (earlier bookings widen it)

// Resource calendar: floors with their tables as rows on the start side, time
// across. Day view shows each booking as a bar from its start to payment (or
// the estimated end while it is still open); week and month show counts per day.
export default function CalendarView({ t, lang, data, date, setDate, setTime, selectTable }) {
  const [range, setRange] = useState("day");
  const locale = lang === "ar" ? "ar-EG" : "en-GB";
  const today = todayISO();
  const res = data.reservations;

  const rows = useMemo(
    () =>
      data.layout.floors.map((f, i) => ({
        floor: f,
        name: f.name || `${t.floor} ${i + 1}`,
        tables: f.tables,
      })),
    [data.layout, t],
  );

  // ---------- day view: hours ----------
  const dayRes = res.filter((r) => r.date === date);
  const firstHour = Math.min(OPEN_FROM, ...dayRes.map((r) => Math.floor(toMin(r.time) / 60)));
  const hours = Array.from({ length: 24 - firstHour }, (_, i) => firstHour + i);
  const span = hours.length * 60;
  const pos = (min) => ((min - firstHour * 60) / span) * 100;

  const endOf = (r) => {
    if (r.status === "closed" && r.closedAt) return Math.max(toMin(r.closedAt), toMin(r.time) + 15);
    if (r.status === "noshow") return toMin(r.time) + 30;
    return Math.max(toMin(estimateFree(r, res)), toMin(r.time) + 30);
  };
  const blocksFor = (table, floor) =>
    (data.blocks || []).filter((b) => b.date === date && (b.kind === "floor" ? b.targetId === floor.id : b.targetId === table.id));

  // Click on an empty spot of a table's timeline: book that table at that time.
  const pickTime = (e, table, floor) => {
    const box = e.currentTarget.getBoundingClientRect();
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const x = rtl ? box.right - e.clientX : e.clientX - box.left;
    const min = Math.round((firstHour * 60 + (x / box.width) * span) / 30) * 30;
    setTime(fromMin(Math.min(min, 23 * 60 + 30)));
    selectTable(table.id, floor.id);
  };

  const openRes = (e, r, floor) => {
    e.stopPropagation();
    setTime(r.time);
    selectTable(r.tableId, floor.id);
  };

  // ---------- week / month: days ----------
  const days = range === "day" ? [] : daysOf(range, date);
  const countOn = (tableId, d) => res.filter((r) => r.date === d && r.status !== "noshow" && tablesOf(r).includes(tableId)).length;
  const fmt = (opts) => new Intl.DateTimeFormat(locale, opts);
  const weekend = (d) => [5, 6].includes(parse(d).getDay()); // Friday & Saturday

  const step = (n) => setDate(range === "day" ? addDays(date, n) : range === "week" ? addDays(date, 7 * n) : addMonths(date, n));
  const title =
    range === "day"
      ? fmt({ weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(parse(date))
      : range === "week"
        ? `${fmt({ day: "numeric", month: "short" }).format(parse(days[0]))} – ${fmt({ day: "numeric", month: "short", year: "numeric" }).format(parse(days[6]))}`
        : fmt({ month: "long", year: "numeric" }).format(parse(date));

  const cols = range === "day" ? hours.length : days.length;

  // Open scrolled to what matters: "now" (or the first booking) in the day
  // view, the picked day in the month view.
  const scrollRef = useRef(null);
  const focusMin = date === today ? toMin(nowHHMM()) - 60 : dayRes.length ? Math.min(...dayRes.map((r) => toMin(r.time))) - 30 : firstHour * 60;
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || range === "week") return;
    const grid = el.firstElementChild;
    const frac = range === "day" ? (focusMin - firstHour * 60) / span : (days.indexOf(date) - 2) / days.length;
    const line = (grid.scrollWidth - 150) * Math.max(0, frac);
    el.scrollLeft = getComputedStyle(el).direction === "rtl" ? -line : line;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, date]);
  const nowMin = toMin(nowHHMM());
  const showNow = range === "day" && date === today && nowMin >= firstHour * 60;

  return (
    <div className="rs-cal">
      <header className="rs-cal-head">
        <div className="rs-cal-nav">
          <button onClick={() => step(-1)} aria-label="previous">
            {lang === "ar" ? "›" : "‹"}
          </button>
          <button onClick={() => step(1)} aria-label="next">
            {lang === "ar" ? "‹" : "›"}
          </button>
          <button className="rs-cal-today" onClick={() => setDate(today)}>
            {t.calToday}
          </button>
        </div>
        <h2>{title}</h2>
        <Seg
          value={range}
          onChange={setRange}
          options={[
            ["day", t.calDay],
            ["week", t.calWeek],
            ["month", t.calMonth],
          ]}
        />
      </header>

      <div className="rs-cal-scroll" ref={scrollRef}>
        <div className={`rs-cal-grid is-${range}`} style={{ "--cols": cols }}>
          {/* column headers */}
          <div className="rs-cal-corner">{t.resources}</div>
          {range === "day" ? (
            <div className="rs-cal-hours">
              {hours.map((h) => (
                <span key={h} dir="ltr">
                  {String(h).padStart(2, "0")}:00
                </span>
              ))}
            </div>
          ) : (
            days.map((d) => (
              <button
                key={d}
                className={`rs-cal-day${d === today ? " is-today" : ""}${weekend(d) ? " is-weekend" : ""}${d === date ? " is-picked" : ""}`}
                onClick={() => (setDate(d), setRange("day"))}
              >
                <b>{parse(d).getDate()}</b>
                <small>{fmt({ weekday: "short" }).format(parse(d))}</small>
              </button>
            ))
          )}

          {rows.map(({ floor, name, tables }) => (
            <FloorRows
              key={floor.id}
              {...{
                t,
                range,
                floor,
                name,
                tables,
                days,
                today,
                date,
                weekend,
                countOn,
                dayRes,
                pos,
                endOf,
                blocksFor,
                pickTime,
                openRes,
                hours,
                firstHour,
              }}
              setDate={setDate}
              setRange={setRange}
              nowPos={showNow ? pos(nowMin) : null}
            />
          ))}
        </div>
      </div>


      <footer className="rs-cal-legend">
        <span>
          <i className="is-booked" />
          {t.legendBooked}
        </span>
        <span>
          <i className="is-seated" />
          {t.legendSeated}
        </span>
        <span>
          <i className="is-closed" />
          {t.closedTag}
        </span>
        <span>
          <i className="is-noshow" />
          {t.noshow}
        </span>
        <span>
          <i className="is-blocked" />
          {t.legendBlocked}
        </span>
        <span className="rs-dim">{range === "day" ? t.calDayHint : t.calRangeHint}</span>
      </footer>
    </div>
  );
}

function FloorRows({
  t,
  range,
  floor,
  name,
  tables,
  days,
  today,
  date,
  weekend,
  countOn,
  dayRes,
  pos,
  endOf,
  blocksFor,
  pickTime,
  openRes,
  setDate,
  setRange,
  nowPos,
}) {
  return (
    <>
      <div className="rs-cal-floor">
        {name} <small>({tables.length})</small>
      </div>
      <div className="rs-cal-floor-fill" />
      {tables.map((table) => (
        <div key={table.id} className="rs-cal-row">
          <div className="rs-cal-res">
            <strong>{table.label}</strong>
            <small>
              {table.seats}/{table.maxSeats}
            </small>
          </div>
          {range === "day" ? (
            <div className="rs-cal-line" onClick={(e) => pickTime(e, table, floor)} title={t.calDayHint}>
              {blocksFor(table, floor).map((b) => (
                <span
                  key={b.id}
                  className="rs-cal-bar is-blocked"
                  style={{
                    insetInlineStart: `${Math.max(0, pos(toMin(b.from)))}%`,
                    width: `${Math.min(100, pos(toMin(b.to))) - Math.max(0, pos(toMin(b.from)))}%`,
                  }}
                >
                  {b.reason || t.blocked}
                </span>
              ))}
              {dayRes
                .filter((r) => tablesOf(r).includes(table.id))
                .map((r) => {
                  const kind = r.status === "closed" ? "closed" : r.status === "noshow" ? "noshow" : r.status === "seated" ? "seated" : "booked";
                  const start = pos(toMin(r.time));
                  const end = Math.min(100, pos(endOf(r)));
                  const open = r.status === "booked" || r.status === "seated";
                  return (
                    <button
                      key={r.id}
                      className={`rs-cal-bar is-${kind}${open ? " is-open" : ""}`}
                      style={{ insetInlineStart: `${start}%`, width: `${Math.max(2, end - start)}%` }}
                      onClick={(e) => openRes(e, r, floor)}
                      title={`${r.name} · ${r.guests} · ${r.time}${r.closedAt ? `–${r.closedAt}` : ""}`}
                    >
                      {r.name} · {r.guests}
                    </button>
                  );
                })}
              {nowPos !== null && <i className="rs-cal-now" style={{ insetInlineStart: `${nowPos}%` }} />}
            </div>
          ) : (
            days.map((d) => {
              const n = countOn(table.id, d);
              return (
                <button
                  key={d}
                  className={`rs-cal-cell${d === today ? " is-today" : ""}${weekend(d) ? " is-weekend" : ""}${d === date ? " is-picked" : ""}`}
                  onClick={() => (setDate(d), setRange("day"))}
                >
                  {n > 0 && <span className="rs-cal-count">{n}</span>}
                </button>
              );
            })
          )}
        </div>
      ))}
    </>
  );
}
