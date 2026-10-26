// Turns "data before" vs "data after" an action into the requests the backend
// would receive for it (paths and bodies follow the data contract).

const byId = (list = []) => new Map(list.map((x) => [x.id, x]));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// Fields whose value changed, as { field: [before, after] }.
function fieldDiff(a, b, skip = []) {
  const out = {};
  for (const k of new Set([...Object.keys(a || {}), ...Object.keys(b || {})])) {
    if (skip.includes(k)) continue;
    if (!same(a?.[k], b?.[k])) out[k] = [a?.[k] ?? null, b?.[k] ?? null];
  }
  return out;
}
const after = (fields) => Object.fromEntries(Object.entries(fields).map(([k, [, v]]) => [k, v]));
const withoutId = ({ id, ...rest }) => rest;

// Reservation updates that match one of the action endpoints.
function reservationAction(id, fields) {
  const keys = Object.keys(fields);
  const to = fields.status?.[1];
  if (to === "seated" && keys.every((k) => ["status", "seatedAt"].includes(k))) return `/api/reservations/${id}/arrive`;
  if (to === "closed" && keys.every((k) => ["status", "closedAt", "needsCleaning", "paid"].includes(k))) return `/api/reservations/${id}/pay`;
  if (to === "noshow" && keys.every((k) => ["status", "forfeited", "autoCancelled"].includes(k))) return `/api/reservations/${id}/no-show`;
  if (keys.length === 1 && fields.needsCleaning?.[1] === false) return `/api/reservations/${id}/cleaned`;
  return null;
}

// Added / changed / removed records of one list.
function diffList(entity, prev, next, paths) {
  const out = [];
  const a = byId(prev);
  const b = byId(next);
  for (const [id, rec] of b) {
    if (!a.has(id)) out.push({ entity, kind: "add", id, record: rec, method: "POST", path: paths.create(rec), body: withoutId(rec) });
    else if (!same(a.get(id), rec)) {
      const fields = fieldDiff(a.get(id), rec);
      const action = paths.action?.(id, fields);
      out.push({
        entity,
        kind: "update",
        id,
        record: rec,
        fields,
        method: action ? "POST" : "PATCH",
        path: action || paths.item(id),
        body: action ? null : after(fields),
      });
    }
  }
  for (const [id, rec] of a) if (!b.has(id)) out.push({ entity, kind: "remove", id, record: rec, method: "DELETE", path: paths.item(id), body: null });
  return out;
}

const tablesOfLayout = (layout) => (layout?.floors || []).flatMap((f) => f.tables.map((t) => ({ ...t, floorId: f.id })));
const floorsOfLayout = (layout) => (layout?.floors || []).map(({ tables, ...f }) => ({ ...f, tables: tables.length }));

export function diffData(prev, next) {
  if (!prev || !next) return [];
  const out = [];

  // Room shape and size.
  const room = (l) => ({ shape: l.shape, width: l.width, depth: l.depth });
  const roomFields = fieldDiff(room(prev.layout), room(next.layout));
  if (Object.keys(roomFields).length)
    out.push({ entity: "layout", kind: "update", id: "layout", record: room(next.layout), fields: roomFields, method: "PATCH", path: "/api/layout", body: after(roomFields) });

  out.push(
    ...diffList("floor", floorsOfLayout(prev.layout), floorsOfLayout(next.layout), {
      create: () => "/api/floors",
      item: (id) => `/api/floors/${id}`,
    }).map((c) => (c.kind === "update" && Object.keys(c.fields).every((k) => k === "tables") ? null : c)),
  );
  out.push(
    ...diffList("table", tablesOfLayout(prev.layout), tablesOfLayout(next.layout), {
      create: (t) => `/api/floors/${t.floorId}/tables`,
      item: (id) => `/api/tables/${id}`,
    }),
  );
  out.push(
    ...diffList("section", prev.layout.sections, next.layout.sections, {
      create: () => "/api/sections",
      item: (id) => `/api/sections/${id}`,
    }),
  );
  out.push(
    ...diffList("reservation", prev.reservations, next.reservations, {
      create: () => "/api/reservations",
      item: (id) => `/api/reservations/${id}`,
      action: reservationAction,
    }),
  );
  out.push(
    ...diffList("waitlist", prev.waitlist, next.waitlist, {
      create: () => "/api/waitlist",
      item: (id) => `/api/waitlist/${id}`,
    }),
  );
  out.push(
    ...diffList("block", prev.blocks, next.blocks, {
      create: () => "/api/blocks",
      item: (id) => `/api/blocks/${id}`,
    }),
  );

  // Guest files are keyed by phone, not a list.
  for (const key of new Set([...Object.keys(prev.guests || {}), ...Object.keys(next.guests || {})])) {
    const a = prev.guests?.[key];
    const b = next.guests?.[key];
    if (!same(a, b))
      out.push({ entity: "guest", kind: b ? "update" : "remove", id: key, record: b || a, fields: fieldDiff(a, b), method: b ? "PUT" : "DELETE", path: `/api/guests/${key}`, body: b || null });
  }

  // Settings, never the PIN (it stays on the device).
  const settingsFields = fieldDiff(prev.settings, next.settings, ["managerPin"]);
  if (Object.keys(settingsFields).length)
    out.push({ entity: "settings", kind: "update", id: "settings", record: next.settings, fields: settingsFields, method: "PATCH", path: "/api/settings", body: after(settingsFields) });

  return out.filter(Boolean).map((c) => {
    // The PIN never leaves the device; a table's floor is already in the path.
    if (c.entity === "settings") {
      const { managerPin, ...clean } = c.record || {};
      return { ...c, record: clean };
    }
    if (c.entity === "table" && c.body) {
      const { floorId, ...body } = c.body;
      return { ...c, body };
    }
    return c;
  });
}
