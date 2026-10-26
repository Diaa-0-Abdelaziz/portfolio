"use client";
import { useMemo, useState } from "react";
import { durationOf, money, orderTotal, tablesOf, toMin } from "./model";
import { Seg } from "./ui";

const RANGES = { day: 1, week: 7, month: 30 };

// ISO date `n` days before `iso` (local calendar, no timezone drift).
function daysBefore(iso, n) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d - n);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

export default function ReportsPanel({ t, data, date, setDate }) {
  const [range, setRange] = useState("day");

  const labels = useMemo(() => {
    const l = {};
    data.layout.floors.forEach((f) => f.tables.forEach((x) => (l[x.id] = x.label)));
    return l;
  }, [data.layout]);

  const r = useMemo(() => {
    const from = daysBefore(date, RANGES[range] - 1);
    const list = data.reservations.filter((x) => x.date >= from && x.date <= date);
    const showed = list.filter((x) => x.status !== "noshow");
    const booked = list.filter((x) => !x.walkIn);
    const stays = list.map(durationOf).filter((m) => m > 0);

    const byHour = {};
    showed.forEach((x) => {
      const h = Math.floor(toMin(x.time) / 60);
      byHour[h] = (byHour[h] || 0) + 1;
    });
    const hours = Object.keys(byHour).map(Number);
    const peak = hours.length
      ? Array.from({ length: Math.max(...hours) - Math.min(...hours) + 1 }, (_, i) => Math.min(...hours) + i).map((h) => [h, byHour[h] || 0])
      : [];

    const byTable = {};
    showed.forEach((x) => tablesOf(x).forEach((id) => labels[id] && (byTable[id] = (byTable[id] || 0) + 1)));
    const top = Object.entries(byTable)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      from,
      count: list.length,
      guests: showed.reduce((s, x) => s + x.guests, 0),
      noShow: booked.length ? Math.round((list.filter((x) => x.status === "noshow").length / booked.length) * 100) : 0,
      turn: stays.length ? Math.round(stays.reduce((a, b) => a + b, 0) / stays.length) : null,
      walkIns: list.filter((x) => x.walkIn).length,
      forfeits: list.reduce((sum, x) => sum + (x.forfeited || 0), 0),
      sales: list.filter((x) => x.status === "closed").reduce((sum, x) => sum + orderTotal(x.items), 0),
      peak,
      top,
    };
  }, [data.reservations, date, range, labels]);

  const maxPeak = Math.max(1, ...r.peak.map(([, n]) => n));
  const maxTop = Math.max(1, ...r.top.map(([, n]) => n));

  return (
    <>
      <section className="rs-block rs-row">
        <label className="rs-field">
          <span>{t.date}</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </section>
      <div className="rs-field">
        <span>{t.range}</span>
        <Seg
          value={range}
          onChange={setRange}
          options={[
            ["day", t.rangeDay],
            ["week", t.range7],
            ["month", t.range30],
          ]}
        />
      </div>
      {range !== "day" && (
        <p className="rs-hint" dir="ltr">
          {r.from} → {date}
        </p>
      )}

      {r.count === 0 ? (
        <p className="rs-hint">{t.rNone}</p>
      ) : (
        <>
          <div className="rs-kpis">
            <Kpi label={t.rBookings} value={r.count} />
            <Kpi label={t.rGuests} value={r.guests} />
            <Kpi label={t.rNoShow} value={`${r.noShow}%`} />
            <Kpi label={t.rTurn} value={r.turn ? `${r.turn} ${t.minutes}` : "—"} />
            <Kpi label={t.rWalkins} value={r.walkIns} />
            <Kpi label={t.rSales} value={money(r.sales, data.settings.currency)} />
            <Kpi label={t.rForfeits} value={money(r.forfeits, data.settings.currency)} />
          </div>

          <section className="rs-block">
            <h2>{t.rPeak}</h2>
            <div className="rs-bars">
              {r.peak.map(([h, n]) => (
                <div key={h} className="rs-bar" title={`${h}:00 · ${n}`}>
                  <span className="rs-bar-n">{n || ""}</span>
                  <i style={{ height: `${(n / maxPeak) * 100}%` }} />
                  <span className="rs-bar-l" dir="ltr">
                    {h}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rs-block">
            <h2>{t.rTopTables}</h2>
            <ul className="rs-hbars">
              {r.top.map(([id, n]) => (
                <li key={id}>
                  <span>{labels[id]}</span>
                  <i style={{ width: `${(n / maxTop) * 100}%` }} />
                  <b>{n}</b>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </>
  );
}

function Kpi({ label, value }) {
  return (
    <div className="rs-kpi">
      <b>{value}</b>
      <span>{label}</span>
    </div>
  );
}
