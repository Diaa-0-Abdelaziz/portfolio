"use client";
import { useEffect, useMemo, useState } from "react";
import {
  SLOTS,
  activeOn,
  avgTurn,
  blockOn,
  dirtyOn,
  estimateFree,
  fromMin,
  guestKey,
  guestStats,
  graceLeft,
  money,
  nearby,
  nextOn,
  nowHHMM,
  orderDue,
  tablesOf,
  toMin,
  todayISO,
  uid,
} from "./model";
import { Confirm, RoleBadge, Stepper } from "./ui";
import { BlockForm, GuestChip, WaitlistSection, WhatsAppButton } from "./StaffExtras";
import { MenuModal, Ticket } from "./MenuOrder";

const emptyForm = (guests, time, deposit = 0) => ({ name: "", phone: "", guests, time, notes: "", items: [], deposit });

// The 30-minute slots plus any exact time in use (e.g. "now" or a payment time).
const slotsWith = (...extra) => [...new Set([...SLOTS, ...extra.filter(Boolean)])].sort((a, b) => toMin(a) - toMin(b));

// view: "table" (the selected table: details + booking), "find" (free tables),
// "waitlist" or "day" (the day's bookings and blocks).
// can.manage: the signed-in role may do manager-only actions (blocking tables/floors).
// pending: what to put in the table form once it opens ({ editId } or { join, guests }).
export default function StaffPanel({
  t,
  view = "table",
  can = {},
  pending,
  clearPending,
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
  menu = [],
}) {
  const [form, setForm] = useState(() => emptyForm(party, time, data.settings.deposit));
  const [join, setJoin] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState(null);
  const [notice, setNotice] = useState(null);
  const [blocking, setBlocking] = useState(null); // "table" | "floor" | null
  const [menuFor, setMenuFor] = useState(null); // "form" | "current" | null: which order the menu window edits

  const res = data.reservations;
  const place = data.settings.restaurantName || t.defaultPlace;
  const currency = data.settings.currency;

  const where = useMemo(() => {
    const w = {};
    data.layout.floors.forEach((f, i) => f.tables.forEach((x) => (w[x.id] = { floor: f, floorNo: i + 1, table: x })));
    return w;
  }, [data.layout]);
  const floorLabel = (id) => where[id] && (where[id].floor.name || `${t.floor} ${where[id].floorNo}`);
  const labelOf = (id) => where[id]?.table.label || "?";
  const labelsOf = (r) =>
    tablesOf(r)
      .filter((id) => where[id])
      .map(labelOf)
      .join(" + ");

  // Reset the form whenever a different table is picked.
  useEffect(() => {
    setEditingId(null);
    setMsg(null);
    setJoin([]);
    setBlocking(null);
    setMenuFor(null);
    setForm(emptyForm(selected ? Math.min(party, selected.maxSeats) : party, time, data.settings.deposit));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  // The booking form follows the time picked at the top (unless editing).
  useEffect(() => {
    if (!editingId) setForm((f) => ({ ...f, time }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time]);

  // A booking to edit, or combined tables picked from a list, opened this table.
  // Runs after the reset above, so its values win.
  useEffect(() => {
    if (!pending || !selected) return;
    if (pending.editId) {
      const r = data.reservations.find((x) => x.id === pending.editId);
      if (r) {
        setEditingId(r.id);
        setJoin(r.joined || []);
        setForm({
          name: r.name,
          phone: r.phone || "",
          guests: r.guests,
          time: r.time,
          notes: r.notes || "",
          items: r.items || [],
          deposit: r.deposit || 0,
        });
      }
    } else {
      setJoin(pending.join || []);
      if (pending.guests) setForm((f) => ({ ...f, guests: pending.guests }));
    }
    clearPending?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending, selected?.id]);

  // "Now" for actions: the real clock today, the picked time on other days.
  const nowAt = () => (date === todayISO() ? nowHHMM() : time);

  const freeAt = (table, at, ignoreId) =>
    !activeOn(res, table.id, date, at, ignoreId) &&
    !blockOn(data.blocks, table.id, where[table.id].floor.id, date, at) &&
    !dirtyOn(res, table.id, date, at);

  // An open booking only blocks a new one while it is happening (now or in the
  // past) or at the very same start time. A later slot is allowed with a
  // warning, since nobody knows when the earlier guests will pay.
  const blocker = (tableId, at, ignoreId) => {
    if (blockOn(data.blocks, tableId, where[tableId].floor.id, date, at)) return true;
    const r = activeOn(res, tableId, date, at, ignoreId);
    if (!r) return null;
    const today = todayISO();
    const happening = date < today || (date === today && toMin(at) <= toMin(nowHHMM()));
    return happening || r.time === at ? r : null;
  };

  // Every free table (all floors) that can seat the party at the chosen time,
  // closest fit first so big tables stay free for big groups.
  const fitSort = (n) => (a, b) => Math.max(0, n - a.seats) - Math.max(0, n - b.seats) || a.seats - b.seats;
  const available = useMemo(
    () =>
      Object.values(where)
        .filter(({ table }) => table.maxSeats >= party && freeAt(table, time))
        .sort((a, b) => fitSort(party)(a.table, b.table)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [where, res, data.blocks, date, time, party],
  );

  // Pairs of neighbouring free tables for parties no single table can take.
  const combos = useMemo(() => {
    const out = [];
    for (const f of data.layout.floors) {
      const free = f.tables.filter((x) => x.maxSeats < party && freeAt(x, time));
      for (let i = 0; i < free.length; i++)
        for (let j = i + 1; j < free.length; j++)
          if (free[i].maxSeats + free[j].maxSeats >= party && nearby(free[i], free[j])) out.push([free[i], free[j], f]);
    }
    return out.sort((a, b) => a[0].maxSeats + a[1].maxSeats - (b[0].maxSeats + b[1].maxSeats)).slice(0, 6);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.layout, res, data.blocks, date, time, party]);

  const dayList = useMemo(
    () => res.filter((r) => r.date === date && where[r.tableId]).sort((a, b) => toMin(a.time) - toMin(b.time)),
    [res, date, where],
  );
  const dayBlocks = (data.blocks || []).filter((b) => b.date === date);

  const st = selected && status[selected.id];
  const current = st?.res;
  const upcoming = selected && nextOn(res, selected.id, date, editingId ? form.time : time, editingId);
  const openBefore = selected && !editingId && activeOn(res, selected.id, date, form.time);

  // Tables that can be pushed against the selected one for this booking.
  const joinable = selected ? floor.tables.filter((x) => x.id !== selected.id && nearby(selected, x) && freeAt(x, form.time, editingId)) : [];
  const joinedTables = join.map((id) => where[id]?.table).filter(Boolean);
  const seatSum = selected ? selected.seats + joinedTables.reduce((s, x) => s + x.seats, 0) : 0;
  const maxSum = selected ? selected.maxSeats + joinedTables.reduce((s, x) => s + x.maxSeats, 0) : 0;

  const patchRes = (id, patch) => setData((d) => ({ ...d, reservations: d.reservations.map((r) => (r.id === id ? { ...r, ...patch } : r)) }));

  // Offer the freed table to the first waiting party it can seat.
  const offerFor = (tableIds) => {
    const cap = tableIds.reduce((s, id) => s + (where[id]?.table.maxSeats || 0), 0);
    const w = data.waitlist.filter((x) => x.date === date && x.guests <= cap).sort((a, b) => toMin(a.addedAt) - toMin(b.addedAt))[0];
    setNotice(w ? { w, table: where[tableIds[0]].table } : null);
  };

  const submit = (e, seatNow = false) => {
    e.preventDefault();
    const name = form.name.trim() || (seatNow ? t.walkIn : "");
    if (!name) return setMsg({ type: "err", text: t.needName });
    if ([selected.id, ...join].some((id) => blocker(id, form.time, editingId))) return setMsg({ type: "err", text: t.conflict });
    // A booking whose grace period has already passed would be cancelled at once.
    const grace = data.settings.graceMinutes;
    const keepsTime = editingId && res.find((r) => r.id === editingId)?.time === form.time;
    if (!seatNow && !keepsTime && date === todayISO() && toMin(nowHHMM()) > toMin(form.time) + grace)
      return setMsg({ type: "err", text: t.bookingPassed(grace) });
    const entry = { ...form, name, tableId: selected.id, joined: join, date, deposit: seatNow ? 0 : Math.max(0, Number(form.deposit) || 0) };
    setData((d) => ({
      ...d,
      reservations: editingId
        ? d.reservations.map((r) => (r.id === editingId ? { ...r, ...entry } : r))
        : [...d.reservations, { id: uid(), ...entry, status: seatNow ? "seated" : "booked", ...(seatNow && { seatedAt: form.time, walkIn: true }) }],
    }));
    setTime(form.time);
    setEditingId(null);
    // A fresh form for the next booking: the order and name never carry over.
    setForm(emptyForm(Math.min(party, selected.maxSeats), form.time, data.settings.deposit));
    setJoin([]);
    setMsg({ type: "ok", text: editingId ? t.updated : t.done });
  };

  const arrive = (r) => {
    const at = nowAt();
    patchRes(r.id, { status: "seated", seatedAt: toMin(at) < toMin(r.time) ? r.time : at });
  };

  // Paid = the guests have left: the booking ends now. The table is free again,
  // or waits for cleaning first when the manager turned that step on.
  const markPaid = (r) => {
    // A bill needs an order: nothing can be paid for an empty table.
    if (!r.items?.length) return setMsg({ type: "err", text: t.payNeedOrder });
    // Never before the start; equal to it is fine (isActiveAt treats closedAt as exclusive).
    const closedAt = toMin(nowAt()) < toMin(r.time) ? r.time : nowAt();
    patchRes(r.id, { status: "closed", closedAt, needsCleaning: data.settings.cleaning, paid: orderDue(r.items, r.deposit || 0) });
    setTime(closedAt);
    if (!data.settings.cleaning) offerFor(tablesOf(r));
  };

  const markCleaned = (r) => {
    patchRes(r.id, { needsCleaning: false });
    offerFor([selected.id]);
  };

  // Best free table right now for a waiting party, or when one will likely free up.
  const findSeat = (guests) => {
    const at = nowAt();
    const fits = Object.values(where)
      .map((w) => w.table)
      .filter((x) => x.maxSeats >= guests);
    const table = fits.filter((x) => freeAt(x, at)).sort(fitSort(guests))[0];
    if (table) return { table };
    const soon = fits
      .map((x) => ({ x, r: activeOn(res, x.id, date, at) }))
      .filter(({ r }) => r?.status === "seated")
      .map(({ x, r }) => ({ time: estimateFree(r, res), label: x.label }))
      .sort((a, b) => toMin(a.time) - toMin(b.time))[0];
    return { estimate: soon };
  };

  const seatWaiting = (w, table) => {
    const at = nowAt();
    setData((d) => ({
      ...d,
      waitlist: d.waitlist.filter((x) => x.id !== w.id),
      reservations: [
        ...d.reservations,
        {
          id: uid(),
          tableId: table.id,
          joined: [],
          items: [],
          date,
          time: at,
          seatedAt: at,
          guests: w.guests,
          name: w.name,
          phone: w.phone,
          notes: "",
          status: "seated",
          walkIn: true,
        },
      ],
    }));
    setNotice(null);
    setTime(at);
    selectTable(table.id, where[table.id].floor.id);
  };

  const startEdit = (r) => {
    setTime(r.time);
    if (selected?.id === r.tableId) {
      setEditingId(r.id);
      setJoin(r.joined || []);
      setForm({
        name: r.name,
        phone: r.phone || "",
        guests: r.guests,
        time: r.time,
        notes: r.notes || "",
        items: r.items || [],
        deposit: r.deposit || 0,
      });
      setMsg(null);
    } else selectTable(r.tableId, where[r.tableId].floor.id, { editId: r.id });
  };

  // Picking from the available lists carries the party size (and any partner
  // table) into the table's booking form.
  const pick = (table, fId, joinIds = []) => {
    const cap = table.maxSeats + joinIds.reduce((s, id) => s + where[id].table.maxSeats, 0);
    selectTable(table.id, fId, { join: joinIds, guests: Math.min(party, cap) });
  };

  const remove = (id) => {
    setData((d) => ({ ...d, reservations: d.reservations.filter((r) => r.id !== id) }));
    if (editingId === id) setEditingId(null);
  };

  const addBlock = (kind, targetId, b) => {
    setData((d) => ({ ...d, blocks: [...(d.blocks || []), { id: uid(), kind, targetId, date, ...b }] }));
    setBlocking(null);
  };
  const removeBlock = (id) => setData((d) => ({ ...d, blocks: d.blocks.filter((b) => b.id !== id) }));

  const onPhone = (phone) => {
    const known = guestStats(res, guestKey(phone));
    setForm((f) => ({ ...f, phone, name: f.name || known?.name || "" }));
  };

  const statusLine = (r) =>
    r.status === "closed"
      ? t.statusClosed(r.time, r.closedAt)
      : r.status === "seated"
        ? t.statusSeated(r.seatedAt || r.time)
        : r.status === "noshow"
          ? t.noshow
          : t.statusBooked(r.time);

  const pillOf = (r) => (r.status === "closed" ? "closed" : r.status === "noshow" ? "noshow" : r.status === "seated" ? "seated" : "booked");
  const pillText = { closed: t.closedTag, noshow: t.noshow, seated: t.seated, booked: t.booked };

  const freeState = st && (st.state === "free" || st.state === "dim");
  // Minutes left before a late booking is cancelled (today only).
  const lateLeft = current?.status === "booked" && date === todayISO() ? graceLeft(current, nowHHMM(), data.settings.graceMinutes) : null;
  // The order can change until the bill is paid.
  const orderable = !!current && ["booked", "seated"].includes(current.status);
  const showForm = selected && (editingId || (!blocking && (freeState || (current && !blocker(selected.id, time)))));
  const turn = selected && avgTurn(res, current?.guests || form.guests);
  const hasHistory = res.some((r) => r.status === "closed" && r.closedAt);

  const findView = (
    <section className="rs-block">
      <div className="rs-block-head">
        <h2>{t.findTitle}</h2>
        <Stepper value={party} max={30} onChange={setParty} suffix={t.party} />
      </div>
      <p className="rs-hint">{t.availableFor(party)}</p>
      {available.length === 0 && combos.length === 0 ? (
        <p className="rs-msg is-err">{t.noneAvailable}</p>
      ) : (
        <ul className="rs-avail">
          {available.map(({ table, floor: f }) => (
            <li key={table.id}>
              <button onClick={() => pick(table, f.id)}>
                <strong>{table.label}</strong>
                <span>{floorLabel(table.id)}</span>
                <span className="rs-dim">
                  {table.seats}/{table.maxSeats}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {combos.length > 0 && (
        <>
          <p className="rs-hint">{t.combos}</p>
          <ul className="rs-avail">
            {combos.map(([a, b, f]) => (
              <li key={a.id + b.id}>
                <button className="is-combo" onClick={() => pick(a, f.id, [b.id])}>
                  <strong>
                    {a.label} + {b.label}
                  </strong>
                  <span>{floorLabel(a.id)}</span>
                  <span className="rs-dim">
                    {a.seats + b.seats}/{a.maxSeats + b.maxSeats}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );

  const dayView = (
    <>
      <section className="rs-block">
        <h2>
          {t.todays} <RoleBadge t={t} role="staff" />
        </h2>
        {dayList.length === 0 ? (
          <p className="rs-hint">{t.none}</p>
        ) : (
          <ul className="rs-crud">
            {dayList.map((r) => (
              <li key={r.id} className={["closed", "noshow"].includes(r.status) ? "is-closed" : ""}>
                <button className="rs-crud-main" onClick={() => (setTime(r.time), selectTable(r.tableId, where[r.tableId].floor.id))}>
                  <strong>
                    <span className="rs-time" dir="ltr">
                      {r.time}
                    </span>{" "}
                    {r.name}
                    {data.guests[guestKey(r.phone)]?.vip && <span className="rs-vip is-on is-small">★</span>}
                    <span className={`rs-pill is-${pillOf(r)}`}>{pillText[pillOf(r)]}</span>
                  </strong>
                  <span className="rs-dim">
                    {labelsOf(r)} · {floorLabel(r.tableId)} · {r.guests} {t.seats}
                    {r.status === "closed" && ` · ${r.seatedAt || r.time}–${r.closedAt}`}
                    {r.status === "seated" && ` · ${t.estFree(estimateFree(r, res))}`}
                  </span>
                </button>
                <div className="rs-crud-actions">
                  {!["closed", "noshow"].includes(r.status) && <button onClick={() => startEdit(r)}>{t.edit}</button>}
                  <Confirm label={t.del} confirm={t.confirmDel} onConfirm={() => remove(r.id)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rs-block">
        <div className="rs-block-head">
          <h2>
            {t.blocksToday} <RoleBadge t={t} role="manager" />
          </h2>
          {can.manage && blocking !== "floor" && (
            <button className="rs-ghost" onClick={() => setBlocking("floor")}>
              {t.blockFloor}
            </button>
          )}
        </div>
        {blocking === "floor" && <BlockForm t={t} time="00:00" onSave={(b) => addBlock("floor", floor.id, b)} onCancel={() => setBlocking(null)} />}
        {dayBlocks.length === 0 && <p className="rs-hint">—</p>}
        {dayBlocks.length > 0 && (
          <ul className="rs-crud">
            {dayBlocks.map((b) => {
              const fl = data.layout.floors.findIndex((f) => f.id === b.targetId);
              const label = b.kind === "floor" ? data.layout.floors[fl]?.name || `${t.floor} ${fl + 1}` : labelOf(b.targetId);
              return (
                <li key={b.id}>
                  <div className="rs-crud-main">
                    <strong>{label}</strong>
                    <span className="rs-dim">
                      {b.from} – {b.to === "24:00" ? t.wholeDay : b.to}
                      {b.reason && ` · ${b.reason}`}
                    </span>
                  </div>
                  {can.manage && (
                    <div className="rs-crud-actions">
                      <button onClick={() => removeBlock(b.id)}>{t.unblock}</button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );

  if (view === "find") return findView;
  if (view === "day") return dayView;
  if (view === "waitlist")
    return <WaitlistSection t={t} data={data} setData={setData} date={date} findSeat={findSeat} seatWaiting={seatWaiting} place={place} />;
  if (!selected) return <p className="rs-hint">{t.pickTable}</p>;

  // ---------- table view: everything about this table and its booking ----------
  return (
    <>
      {notice && (
        <div className="rs-notice">
          <p>{t.freedFor(notice.table.label, notice.w.name, notice.w.guests)}</p>
          <div className="rs-row">
            <button className="rs-primary" onClick={() => seatWaiting(notice.w, notice.table)}>
              {t.seatHim}
            </button>
            <WhatsAppButton phone={notice.w.phone} label={t.waReady} message={t.waReadyMsg({ name: notice.w.name, place })} />
            <button className="rs-ghost" onClick={() => setNotice(null)}>
              {t.dismiss}
            </button>
          </div>
        </div>
      )}

      <div className="rs-table-facts">
        <span className={`rs-badge is-${st.state === "dim" ? "free" : st.state}`}>
          {{ free: t.free, dim: t.free, booked: t.booked, seated: t.seated, cleaning: t.cleaning, blocked: t.blocked }[st.state]}
        </span>
        <span>{floorLabel(selected.id)}</span>
        <span>
          {selected.seats} {t.seats} · {t.overMax(selected.maxSeats)}
        </span>
        {selected.section && data.layout.sections?.find((x) => x.id === selected.section) && (
          <span>
            {t.section}: {data.layout.sections.find((x) => x.id === selected.section).name}
          </span>
        )}
        <span dir="ltr">
          {date} · {time}
        </span>
      </div>

      {st.state === "blocked" && (
        <div className="rs-booking rs-card">
          <p>{t.blockedFor(st.block.reason)}</p>
          <p className="rs-dim" dir="ltr">
            {st.block.from} – {st.block.to === "24:00" ? t.wholeDay : st.block.to}
          </p>
          {can.manage && (
            <button className="rs-ghost rs-self-start" onClick={() => removeBlock(st.block.id)}>
              {t.unblock}
            </button>
          )}
        </div>
      )}

      {st.state === "cleaning" && (
        <div className="rs-booking rs-card">
          <p>{t.cleaning}</p>
          <button className="rs-primary rs-self-start" onClick={() => markCleaned(st.dirty)}>
            ✓ {t.cleaned}
          </button>
        </div>
      )}

      {current && !editingId && (
        <section className="rs-booking rs-card">
          <h2 className="rs-sub">
            {t.currentBooking} <RoleBadge t={t} role="staff" />
          </h2>
          <p>
            {t.bookedBy} <strong>{current.name}</strong>
          </p>
          <p className="rs-dim">
            {statusLine(current)} · {current.guests} {t.seats}
            {current.phone && ` · ${current.phone}`}
          </p>
          {tablesOf(current).length > 1 && <p className="rs-dim">{t.joined(labelsOf(current))}</p>}
          {current.deposit > 0 && <p className="rs-reco">{t.depositHeld(money(current.deposit, currency))}</p>}
          {current.status === "booked" && lateLeft !== null && (
            <p className={`rs-reco${lateLeft <= 5 ? " is-warn" : ""}`}>{lateLeft > 0 ? t.lateIn(lateLeft, data.settings.graceMinutes) : t.lateNow}</p>
          )}
          {current.status === "seated" && !current.items?.length && <p className="rs-reco is-warn">{t.payNeedOrder}</p>}
          {current.notes && <p className="rs-dim">{current.notes}</p>}
          {current.status === "seated" && (
            <p className="rs-reco">
              {t.estFree(estimateFree(current, res))} · {t.estBasis(hasHistory ? turn : 0)}
            </p>
          )}
          <div className="rs-cols">
            <div className="rs-col">
              <GuestChip t={t} data={data} setData={setData} phone={current.phone} />
            </div>
            <div className="rs-col">
              <div className="rs-order-box">
                <div className="rs-block-head">
                  <h3>{t.orderTitle}</h3>
                  {orderable && (
                    <button className="rs-ghost" onClick={() => setMenuFor("current")}>
                      {current.items?.length ? t.orderEdit : t.orderOpenMenu}
                    </button>
                  )}
                </div>
                <Ticket
                  t={t}
                  items={current.items || []}
                  currency={currency}
                  place={place}
                  meta={`${labelsOf(current)} · ${current.name}`}
                  readOnly={!orderable}
                  deposit={current.deposit || 0}
                  onChange={(items) => patchRes(current.id, { items })}
                />
              </div>
            </div>
          </div>
          <div className="rs-row">
            {current.status === "booked" && (
              <>
                <button className="rs-primary" onClick={() => arrive(current)}>
                  {t.arrive}
                </button>
                <Confirm
                  label={t.markNoShow}
                  confirm={current.deposit > 0 ? t.noShowForfeit : t.confirmDel}
                  onConfirm={() => patchRes(current.id, { status: "noshow", forfeited: current.deposit || 0 })}
                />
              </>
            )}
            {current.status === "seated" && (
              <button className="rs-primary rs-pay" disabled={!current.items?.length} onClick={() => markPaid(current)}>
                ✓ {t.pay}
                {current.items?.length > 0 && ` · ${money(orderDue(current.items, current.deposit || 0), currency)}`}
              </button>
            )}
            <button className="rs-ghost" onClick={() => startEdit(current)}>
              {t.edit}
            </button>
            {current.status === "booked" && (
              <WhatsAppButton
                phone={current.phone}
                label={t.waConfirm}
                message={t.waConfirmMsg({ name: current.name, place, date, time: current.time, guests: current.guests, table: labelsOf(current) })}
              />
            )}
            {current.status === "booked" && <Confirm label={t.cancelBooking} confirm={t.confirmDel} onConfirm={() => remove(current.id)} />}
          </div>
        </section>
      )}

      {showForm && (
        <form className="rs-form rs-card" onSubmit={submit}>
          <h2 className="rs-sub">
            {editingId ? t.editBooking : t.newBooking} <RoleBadge t={t} role="staff" />
          </h2>
          <div className="rs-cols">
            <div className="rs-col">
              <label className="rs-field">
                <span>{t.phone}</span>
                <input type="tel" dir="ltr" value={form.phone} onChange={(e) => onPhone(e.target.value)} />
              </label>
              <GuestChip t={t} data={data} setData={setData} phone={form.phone} />
              <label className="rs-field">
                <span>{t.name}</span>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </label>

              {(joinable.length > 0 || join.length > 0) && (
                <div className="rs-field">
                  <span>{t.joinWith}</span>
                  <div className="rs-chips">
                    {[...new Set([...joinable.map((x) => x.id), ...join])].map((id) => (
                      <button
                        type="button"
                        key={id}
                        className={join.includes(id) ? "is-on" : ""}
                        onClick={() => setJoin((j) => (j.includes(id) ? j.filter((x) => x !== id) : [...j, id]))}
                      >
                        {labelOf(id)} · {where[id].table.seats}
                      </button>
                    ))}
                  </div>
                  {join.length > 0 && <p className="rs-reco">{t.combinedSeats(seatSum, maxSum)}</p>}
                </div>
              )}

              <div className="rs-row rs-spread">
                <span className="rs-dim">{t.guests}</span>
                <Stepper value={Math.min(form.guests, maxSum)} max={maxSum} onChange={(guests) => setForm({ ...form, guests })} />
              </div>
              {form.guests > seatSum && form.guests <= maxSum && <p className="rs-reco">{t.extraChairs(form.guests - seatSum)}</p>}
              <label className="rs-field">
                <span>
                  {t.depositLabel} ({currency})
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="decimal"
                  dir="ltr"
                  value={form.deposit}
                  onChange={(e) => setForm({ ...form, deposit: e.target.value })}
                />
              </label>
              <p className="rs-hint">{t.depositHint(data.settings.graceMinutes)}</p>
              <div className="rs-row">
                <label className="rs-field">
                  <span>{t.time}</span>
                  <select value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}>
                    {slotsWith(form.time, time).map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </label>
                <label className="rs-field">
                  <span>{t.notes}</span>
                  <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </label>
              </div>
            </div>
            <div className="rs-col">
              <div className="rs-order-box">
                <div className="rs-block-head">
                  <h3>{t.orderTitle}</h3>
                  <button type="button" className="rs-ghost" onClick={() => setMenuFor("form")}>
                    {form.items.length ? t.orderEdit : t.orderOpenMenu}
                  </button>
                </div>
                {form.items.length > 0 && (
                  <Ticket
                    t={t}
                    items={form.items}
                    currency={currency}
                    place={place}
                    meta={`${labelOf(selected.id)} · ${form.name}`}
                    deposit={Number(form.deposit) || 0}
                    onChange={(items) => setForm({ ...form, items })}
                  />
                )}
              </div>
            </div>
          </div>
          {openBefore && <p className="rs-reco is-warn">{t.openBefore(openBefore.time)}</p>}
          {upcoming && <p className="rs-reco is-warn">{t.nextBooking(upcoming.time)}</p>}
          <div className="rs-row">
            <button className="rs-primary" type="submit">
              {editingId ? t.saveBooking : t.book}
            </button>
            {!editingId && (
              <button type="button" className="rs-ghost" onClick={(e) => submit(e, true)}>
                {t.seatNow}
              </button>
            )}
            {editingId && (
              <button type="button" className="rs-ghost" onClick={() => setEditingId(null)}>
                {t.cancelEdit}
              </button>
            )}
          </div>
        </form>
      )}

      {can.manage && freeState && !editingId && blocking !== "table" && (
        <button className="rs-link" onClick={() => setBlocking("table")}>
          {t.blockTable} <RoleBadge t={t} role="manager" />
        </button>
      )}
      {blocking === "table" && <BlockForm t={t} time={time} onSave={(b) => addBlock("table", selected.id, b)} onCancel={() => setBlocking(null)} />}
      {msg && <p className={`rs-msg is-${msg.type}`}>{msg.text}</p>}

      {menuFor && (
        <MenuModal
          t={t}
          menu={menu}
          currency={currency}
          place={place}
          meta={`${labelsOf(menuFor === "current" && current ? current : { tableId: selected.id, joined: join })} · ${menuFor === "current" && current ? current.name : form.name}`}
          items={menuFor === "current" && current ? current.items || [] : form.items}
          deposit={menuFor === "current" && current ? current.deposit || 0 : Number(form.deposit) || 0}
          onChange={(items) => (menuFor === "current" && current ? patchRes(current.id, { items }) : setForm({ ...form, items }))}
          onClose={() => setMenuFor(null)}
        />
      )}
    </>
  );
}
