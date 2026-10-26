// Data model shared by the 3D scene and the panels. 1 unit = 1 metre.

export const STORAGE_KEY = "rs-data-v2";
export const DEFAULT_MAX_TABLES = 20;

// Each size has a physical footprint, a "normal" seat count we recommend,
// and the default upper limit the manager can raise up to the hard cap.
export const SIZES = {
  round: {
    S: { d: 0.8, normal: 2, max: 3 },
    M: { d: 1.0, normal: 4, max: 5 },
    L: { d: 1.4, normal: 6, max: 8 },
    XL: { d: 1.8, normal: 8, max: 10 },
  },
  rect: {
    S: { w: 0.8, d: 0.8, normal: 2, max: 4 },
    M: { w: 1.4, d: 0.9, normal: 4, max: 6 },
    L: { w: 2.0, d: 0.9, normal: 6, max: 8 },
    XL: { w: 2.8, d: 1.0, normal: 8, max: 10 },
  },
};
export const SIZE_KEYS = ["S", "M", "L", "XL"];

const CHAIR_ROUND = 0.54; // arc length one chair needs around a round table
const CHAIR_EDGE = 0.6; // edge length one chair needs along a rectangular table

export const preset = (shape, size) => SIZES[shape][size];

// How many chairs physically fit around a table of this shape and size.
export function hardMax(shape, size) {
  const p = preset(shape, size);
  if (shape === "round") return Math.floor((Math.PI * p.d) / CHAIR_ROUND);
  return 2 * Math.max(1, Math.floor(p.w / CHAIR_EDGE)) + 2 * Math.max(1, Math.floor(p.d / CHAIR_EDGE));
}

// Chair positions (local to the table) for `count` chairs.
export function chairSlots(table, count = table.seats) {
  const p = preset(table.shape, table.size);
  const slots = [];
  if (table.shape === "round") {
    const r = p.d / 2 + 0.42;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 - Math.PI / 2;
      slots.push({ x: Math.cos(a) * r, z: Math.sin(a) * r, rot: -a - Math.PI / 2 });
    }
    return slots;
  }
  // Fill the two long sides first, then the ends.
  const capLong = Math.max(1, Math.floor(p.w / CHAIR_EDGE));
  const capEnd = Math.max(1, Math.floor(p.d / CHAIR_EDGE));
  const sides = [0, 0, 0, 0]; // back, front, left, right
  for (let i = 0; i < count; i++) {
    if (sides[0] + sides[1] < capLong * 2) sides[sides[0] <= sides[1] ? 0 : 1]++;
    else if (sides[2] + sides[3] < capEnd * 2) sides[sides[2] <= sides[3] ? 2 : 3]++;
  }
  const along = (n, len) => Array.from({ length: n }, (_, i) => -len / 2 + (len / n) * (i + 0.5));
  along(sides[0], p.w).forEach((x) => slots.push({ x, z: -p.d / 2 - 0.4, rot: 0 }));
  along(sides[1], p.w).forEach((x) => slots.push({ x, z: p.d / 2 + 0.4, rot: Math.PI }));
  along(sides[2], p.d).forEach((z) => slots.push({ x: -p.w / 2 - 0.4, z, rot: Math.PI / 2 }));
  along(sides[3], p.d).forEach((z) => slots.push({ x: p.w / 2 + 0.4, z, rot: -Math.PI / 2 }));
  return slots;
}

// Radius that keeps a table and its chairs clear of walls and other tables.
export function footprint(table) {
  const p = preset(table.shape, table.size);
  if (table.shape === "round") return p.d / 2 + 0.75;
  return Math.hypot(p.w / 2 + 0.7, p.d / 2 + 0.7);
}

export function clampToRoom(table, width, depth) {
  const m = footprint(table) * 0.8;
  return {
    ...table,
    x: Math.max(-width / 2 + m, Math.min(width / 2 - m, table.x)),
    z: Math.max(-depth / 2 + m, Math.min(depth / 2 - m, table.z)),
  };
}

// First free spot on a 50cm grid, searched outward from the room centre.
export function findSpot(table, others, width, depth) {
  const r = footprint(table);
  let best = null;
  for (let x = -width / 2 + r * 0.8; x <= width / 2 - r * 0.8; x += 0.5) {
    for (let z = -depth / 2 + r * 0.8; z <= depth / 2 - r * 0.8; z += 0.5) {
      const clear = others.every((o) => Math.hypot(o.x - x, o.z - z) >= (r + footprint(o)) * 0.75);
      const d = Math.hypot(x, z);
      if (clear && (!best || d < best.d)) best = { x, z, d };
    }
  }
  return best ? { x: best.x, z: best.z } : null;
}

export const uid = () => Math.random().toString(36).slice(2, 9);
// Local date, not UTC: toISOString() would show yesterday after midnight in Egypt.
export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export const toMin = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
export const fromMin = (n) => `${String(Math.floor(n / 60) % 24).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
export const SLOTS = Array.from({ length: 24 }, (_, i) => fromMin(12 * 60 + i * 30));
export const nowHHMM = () => {
  const d = new Date();
  return fromMin(d.getHours() * 60 + d.getMinutes());
};

// A booking has no fixed length: it holds the table from its start time until
// staff mark it paid (the guests have left).
// status: "booked" -> "seated" (+ seatedAt) -> "closed" (+ closedAt)
//         "booked" -> "noshow" (never held the table)
// A booking can span several tables: `tableId` is the main one, `joined` the rest.
export const tablesOf = (r) => [r.tableId, ...(r.joined || [])];
export const isActiveAt = (r, at) =>
  r.status !== "noshow" && toMin(r.time) <= toMin(at) && (!r.closedAt || toMin(r.closedAt) > toMin(at));

const onTable = (reservations, tableId, date, ignoreId) =>
  reservations.filter((r) => r.id !== ignoreId && r.date === date && tablesOf(r).includes(tableId));

// The booking holding the table at `at` (the latest one to start, if several).
export const activeOn = (reservations, tableId, date, at, ignoreId) =>
  onTable(reservations, tableId, date, ignoreId)
    .filter((r) => isActiveAt(r, at))
    .sort((a, b) => toMin(b.time) - toMin(a.time))[0] || null;

// The next open booking on the table after `at`, so staff get a heads-up.
export const nextOn = (reservations, tableId, date, at, ignoreId) =>
  onTable(reservations, tableId, date, ignoreId)
    .filter((r) => !r.closedAt && r.status !== "noshow" && toMin(r.time) > toMin(at))
    .sort((a, b) => toMin(a.time) - toMin(b.time))[0] || null;

// A paid table waiting to be cleaned (only when the manager turned that step on).
export const dirtyOn = (reservations, tableId, date, at) =>
  onTable(reservations, tableId, date).find((r) => r.needsCleaning && r.closedAt && toMin(r.closedAt) <= toMin(at)) || null;

// Blocks close a table or a whole floor for part of a day (to = "24:00" for the whole day).
export const blockOn = (blocks, tableId, floorId, date, at) =>
  (blocks || []).find(
    (b) =>
      b.date === date &&
      (b.kind === "floor" ? b.targetId === floorId : b.targetId === tableId) &&
      toMin(b.from) <= toMin(at) &&
      toMin(at) < toMin(b.to)
  ) || null;

// ---------- turn time ----------
// No booking has an end time, so we learn how long tables usually stay taken
// from the bookings that were already paid.
export const DEFAULT_TURN = 90;
export const durationOf = (r) => (r.closedAt ? toMin(r.closedAt) - toMin(r.seatedAt || r.time) : null);

export function avgTurn(reservations, guests) {
  const done = reservations.filter((r) => r.status === "closed" && durationOf(r) > 0);
  const similar = done.filter((r) => Math.abs(r.guests - guests) <= 1);
  const pool = similar.length >= 3 ? similar : done;
  if (!pool.length) return DEFAULT_TURN;
  const avg = pool.reduce((s, r) => s + durationOf(r), 0) / pool.length;
  return Math.max(15, Math.round(avg / 5) * 5);
}

export const estimateFree = (r, reservations) => fromMin(Math.min(24 * 60 - 1, toMin(r.seatedAt || r.time) + avgTurn(reservations, r.guests)));

// ---------- guests ----------
// Guests are recognised by phone number (last 10 digits, so 010… and +2010… match).
export function guestKey(phone) {
  const d = String(phone || "").replace(/\D/g, "");
  return d.length >= 6 ? d.slice(-10) : null;
}

export function guestStats(reservations, key) {
  if (!key) return null;
  const mine = reservations.filter((r) => guestKey(r.phone) === key);
  if (!mine.length) return null;
  const visits = mine.filter((r) => r.status === "closed");
  const last = [...visits].sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1))[0];
  return {
    name: mine[mine.length - 1].name,
    visits: visits.length,
    noShows: mine.filter((r) => r.status === "noshow").length,
    lastVisit: last ? last.date : null,
  };
}

// WhatsApp click-to-chat link; Egyptian local numbers (01…) get the 20 country code.
export function waLink(phone, message) {
  let d = String(phone || "").replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  else if (d.startsWith("0")) d = "20" + d.slice(1);
  return `https://wa.me/${d}?text=${encodeURIComponent(message)}`;
}

// Tables near enough to push together for one big party.
export const nearby = (a, b) => Math.hypot(a.x - b.x, a.z - b.z) <= footprint(a) + footprint(b) + 0.6;

export const SECTION_COLORS = ["#f472b6", "#60a5fa", "#a78bfa", "#facc15", "#34d399", "#fb923c"];

export function makeTable(label, shape, size, extra = {}) {
  const p = preset(shape, size);
  return { id: uid(), label, shape, size, seats: p.normal, maxSeats: p.max, x: 0, z: 0, rot: 0, ...extra };
}

// Colours the user can change from the Colours panel. Status colours are used
// everywhere a state shows: the ring under a table, name tags, legend, floor
// counts and calendar bars.
export const DEFAULT_THEME = {
  floor: "#b67e4d",
  floorPattern: true,
  wall: "#efe6d8",
  trim: "#6b4a32",
  background: "#1a1410",
  lightColor: "#fff3e0",
  lightLevel: 1.15,
  lamps: true,
  lampColor: "#ffe2a8",
  tableTop: "#9c6b45",
  tableLeg: "#2a2018",
  tableSelected: "#7c5cff",
  chair: "#3b2c22",
  chairBack: "#3b2c22",
  chairLeg: "#3b2c22",
  chairTaken: "#e0a33a",
  chairExtra: "#5b8def",
  status: {
    free: "#22c55e",
    booked: "#f59e0b",
    seated: "#ef4444",
    cleaning: "#38bdf8",
    blocked: "#1f2937",
    dim: "#6b7280",
    closed: "#16a34a",
    noshow: "#6b7280",
  },
};

// An order line copies the dish's name, size and price, so a menu change
// later never changes a bill that was already taken.
// line: { key: "<itemId>:<sizeId>", itemId, sizeId, name, size, price, qty }
export const lineTotal = (l) => l.price * l.qty;

// Booking deposit: paid when the table is booked and taken off the bill at the end.
// A booking whose guests are more than `grace` minutes late is cancelled and the deposit is kept.
export const orderDue = (items = [], deposit = 0) => Math.max(0, orderTotal(items) - deposit);
export const isOverdue = (r, today, now, grace) =>
  r.status === "booked" && (r.date < today || (r.date === today && toMin(now) > toMin(r.time) + grace));
export const graceLeft = (r, now, grace) => toMin(r.time) + grace - toMin(now);
export const orderTotal = (items = []) => items.reduce((sum, i) => sum + lineTotal(i), 0);
export const orderCount = (items = []) => items.reduce((sum, i) => sum + i.qty, 0);
export const money = (n, currency) => `${Number.isInteger(n) ? n : n.toFixed(2)} ${currency || ""}`.trim();

export function defaultData() {
  const t = (label, shape, size, x, z) => makeTable(label, shape, size, { x, z });
  return {
    layout: {
      shape: "rect",
      width: 14,
      depth: 10,
      nextLabel: 11,
      sections: [],
      floors: [
        {
          id: uid(),
          name: "",
          maxTables: 12,
          tables: [
            t("T1", "round", "M", -4.5, -2.5),
            t("T2", "round", "M", -1.5, -2.5),
            t("T3", "round", "S", 1.5, -2.5),
            t("T4", "round", "M", 4.5, -2.5),
            t("T5", "rect", "L", -4, 1.5),
            t("T6", "rect", "XL", 0.5, 1.5),
            t("T7", "round", "S", 4.75, 1.5),
          ],
        },
        {
          id: uid(),
          name: "",
          maxTables: 8,
          tables: [t("T8", "rect", "XL", -3, -1.5), t("T9", "round", "L", 2.5, -1.5), t("T10", "round", "M", 2.5, 2.25)],
        },
      ],
    },
    reservations: [],
    waitlist: [],
    guests: {},
    blocks: [],
    settings: { restaurantName: "", cleaning: false, managerPin: "", currency: "EGP", deposit: 100, graceMinutes: 15, theme: DEFAULT_THEME },
  };
}

// Fill in anything older saved data is missing.
export function migrate(d) {
  const base = defaultData();
  return {
    ...base,
    ...d,
    layout: { sections: [], ...d.layout },
    reservations: (d.reservations || []).map((r) => ({ status: "booked", items: [], ...r })),
    settings: {
      ...base.settings,
      ...d.settings,
      theme: { ...DEFAULT_THEME, ...d.settings?.theme, status: { ...DEFAULT_THEME.status, ...d.settings?.theme?.status } },
    },
  };
}
