"use client";
import { useState } from "react";
import { SLOTS, guestKey, guestStats, nowHHMM, toMin, todayISO, uid, waLink } from "./model";
import { Confirm, Stepper } from "./ui";

// What we know about a guest from their phone number: visits, no-shows, VIP, notes.
export function GuestChip({ t, data, setData, phone }) {
  const key = guestKey(phone);
  if (!key) return null;
  const stats = guestStats(data.reservations, key);
  const profile = data.guests[key] || {};
  const setProfile = (patch) => setData((d) => ({ ...d, guests: { ...d.guests, [key]: { ...d.guests[key], ...patch } } }));

  return (
    <div className={`rs-guest${profile.vip ? " is-vip" : ""}`}>
      <div className="rs-row">
        <button type="button" className={`rs-vip${profile.vip ? " is-on" : ""}`} onClick={() => setProfile({ vip: !profile.vip })}>
          ★ {t.vip}
        </button>
        <span className="rs-dim">
          {stats
            ? [t.guestVisits(stats.visits), stats.noShows ? t.guestNoShows(stats.noShows) : null, stats.lastVisit ? t.guestLast(stats.lastVisit) : null]
                .filter(Boolean)
                .join(" · ")
            : t.newGuest}
        </span>
      </div>
      <input
        className="rs-guest-notes"
        placeholder={t.guestNotes}
        value={profile.notes || ""}
        onChange={(e) => setProfile({ notes: e.target.value })}
      />
    </div>
  );
}

export function WhatsAppButton({ phone, message, label }) {
  if (!guestKey(phone)) return null;
  return (
    <a className="rs-wa" href={waLink(phone, message)} target="_blank" rel="noreferrer">
      {label}
    </a>
  );
}

// Close a table (or, from the day list, a whole floor) for part of a day.
export function BlockForm({ t, time, onSave, onCancel }) {
  const [from, setFrom] = useState(time);
  const [to, setTo] = useState("24:00");
  const [reason, setReason] = useState("");
  const ends = [...SLOTS.filter((s) => toMin(s) > toMin(from)), "24:00"];
  return (
    <div className="rs-card rs-form">
      <div className="rs-row">
        <label className="rs-field">
          <span>{t.blockFrom}</span>
          <select value={from} onChange={(e) => setFrom(e.target.value)}>
            {[...new Set(["00:00", time, ...SLOTS])].sort((a, b) => toMin(a) - toMin(b)).map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="rs-field">
          <span>{t.blockTo}</span>
          <select value={to} onChange={(e) => setTo(e.target.value)}>
            {ends.map((s) => (
              <option key={s} value={s}>
                {s === "24:00" ? t.wholeDay : s}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="rs-field">
        <span>{t.reason}</span>
        <input value={reason} onChange={(e) => setReason(e.target.value)} />
      </label>
      <div className="rs-row">
        <button type="button" className="rs-primary" onClick={() => onSave({ from, to, reason: reason.trim() })}>
          {t.save}
        </button>
        <button type="button" className="rs-ghost" onClick={onCancel}>
          {t.cancelEdit}
        </button>
      </div>
    </div>
  );
}

// Walk-ins waiting for a table. Seating picks the best free table that fits.
export function WaitlistSection({ t, data, setData, date, findSeat, seatWaiting, place }) {
  const [form, setForm] = useState({ name: "", phone: "", guests: 2 });
  const [msg, setMsg] = useState(null);
  const list = data.waitlist.filter((w) => w.date === date).sort((a, b) => toMin(a.addedAt) - toMin(b.addedAt));
  const now = toMin(nowHHMM());
  const isToday = date === todayISO();

  const add = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setMsg({ type: "err", text: t.needName });
    setData((d) => ({ ...d, waitlist: [...d.waitlist, { id: uid(), date, addedAt: nowHHMM(), ...form, name: form.name.trim() }] }));
    setForm({ name: "", phone: "", guests: 2 });
    setMsg(null);
  };
  const remove = (id) => setData((d) => ({ ...d, waitlist: d.waitlist.filter((w) => w.id !== id) }));

  return (
    <section className="rs-block">
      <h2>
        {t.waitlist} {list.length > 0 && <span className="rs-count">{list.length}</span>}
      </h2>
      <form className="rs-form" onSubmit={add}>
        <div className="rs-row">
          <label className="rs-field">
            <span>{t.name}</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="rs-field">
            <span>{t.phone}</span>
            <input type="tel" dir="ltr" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
        </div>
        <div className="rs-row rs-spread">
          <Stepper value={form.guests} max={20} onChange={(guests) => setForm({ ...form, guests })} suffix={t.party} />
          <button className="rs-ghost" type="submit">
            + {t.addWaiting}
          </button>
        </div>
        {msg && <p className={`rs-msg is-${msg.type}`}>{msg.text}</p>}
      </form>

      {list.length === 0 ? (
        <p className="rs-hint">{t.emptyWaitlist}</p>
      ) : (
        <ul className="rs-crud">
          {list.map((w) => {
            const seat = findSeat(w.guests);
            return (
              <li key={w.id} className="rs-wait">
                <div className="rs-crud-main">
                  <strong>
                    {w.name} <span className="rs-pill is-booked">{w.guests}</span>
                  </strong>
                  <span className="rs-dim">
                    {isToday ? t.waitedFor(Math.max(0, now - toMin(w.addedAt))) : w.addedAt}
                    {!seat.table && ` · ${t.noFreeNow(seat.estimate?.time, seat.estimate?.label)}`}
                  </span>
                </div>
                <div className="rs-crud-actions">
                  {seat.table && <button onClick={() => seatWaiting(w, seat.table)}>{t.seatAt(seat.table.label)}</button>}
                  <WhatsAppButton phone={w.phone} label="WA" message={t.waReadyMsg({ name: w.name, place })} />
                  <Confirm label={t.del} confirm={t.confirmDel} onConfirm={() => remove(w.id)} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

