"use client";
import { useEffect, useRef, useState } from "react";
import { diffData } from "./changes";

const MAX_LOG = 30;
const FULL_REPLACE = 25; // more changes than this at once (import, reset) = one full upload

// Live view of what the page would send to the backend: every action the user
// takes shows up as the request it maps to, with its JSON and the changed fields.
export function useDataLog(data) {
  const prev = useRef(null);
  const [log, setLog] = useState([]);

  useEffect(() => {
    const before = prev.current;
    prev.current = data;
    if (!before || !data) return;
    const changes = diffData(before, data);
    if (!changes.length) return;
    const now = Date.now();
    const time = new Date().toTimeString().slice(0, 8);
    const entry =
      changes.length > FULL_REPLACE
        ? { id: now, time, at: now, changes: [{ entity: "restaurant", kind: "replace", method: "PUT", path: "/api/restaurant", body: null, count: changes.length }] }
        : { id: now, time, at: now, changes };
    setLog((l) => {
      // Typing into a field changes it on every key: fold those into one entry.
      const last = l[0];
      const one = entry.changes.length === 1 && last?.changes.length === 1 ? [last.changes[0], entry.changes[0]] : null;
      if (one && now - last.at < 1500 && one[0].kind === "update" && one[1].kind === "update" && one[0].path === one[1].path) {
        const fields = { ...one[1].fields };
        for (const k of Object.keys(fields)) if (one[0].fields?.[k]) fields[k] = [one[0].fields[k][0], fields[k][1]];
        return [{ ...entry, id: last.id, changes: [{ ...one[1], fields }] }, ...l.slice(1)];
      }
      return [entry, ...l].slice(0, MAX_LOG);
    });
  }, [data]);

  return [log, () => setLog([])];
}

const ENTITY = {
  ar: {
    reservation: "حجز",
    table: "ترابيزة",
    floor: "طابق",
    section: "قسم",
    waitlist: "انتظار",
    block: "قفل",
    guest: "ملف عميل",
    settings: "الإعدادات",
    layout: "شكل المطعم",
    restaurant: "كل البيانات",
  },
  en: {
    reservation: "Booking",
    table: "Table",
    floor: "Floor",
    section: "Section",
    waitlist: "Waitlist",
    block: "Block",
    guest: "Guest file",
    settings: "Settings",
    layout: "Room",
    restaurant: "All data",
  },
};

export default function DataInspector({ t, lang, log, clear, data }) {
  const [openId, setOpenId] = useState(null);
  const [copied, setCopied] = useState(false);
  const names = ENTITY[lang] || ENTITY.en;
  const entry = log.find((e) => e.id === openId) || log[0];

  // A new action always comes into view.
  const latestId = log[0]?.id;
  useEffect(() => setOpenId(null), [latestId]);

  const kindLabel = { add: t.dataAdd, update: t.dataUpdate, remove: t.dataRemove, replace: t.dataReplace };
  const bodyOf = (c) => (c.kind === "replace" ? data : c.body ?? (c.kind === "remove" ? null : c.record));
  const text = entry ? entry.changes.map((c) => `${c.method} ${c.path}\n${JSON.stringify(bodyOf(c), null, 2) ?? ""}`).join("\n\n") : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <aside className="rs-data" aria-label={t.dataTitle}>
      <header className="rs-data-head">
        <div>
          <strong>{t.dataTitle}</strong>
          <small>{t.dataSub}</small>
        </div>
        {entry && (
          <button onClick={copy} className="rs-data-btn">
            {copied ? t.jsonCopied : t.jsonCopy}
          </button>
        )}
      </header>

      {!entry ? (
        <p className="rs-data-empty">{t.dataEmpty}</p>
      ) : (
        <div className="rs-data-current">
          {entry.changes.map((c, i) => (
            <div key={i} className="rs-data-change">
              <div className="rs-data-line">
                <span className={`rs-verb is-${c.method.toLowerCase()}`}>{c.method}</span>
                <code dir="ltr">{c.path}</code>
              </div>
              <p className="rs-data-what">
                <b>{kindLabel[c.kind]}</b> · {names[c.entity] || c.entity}
                {c.kind === "replace" && ` · ${t.dataCount(c.count)}`}
              </p>
              {c.kind === "update" && c.fields && Object.keys(c.fields).length > 0 && (
                <ul className="rs-data-fields" dir="ltr">
                  {Object.entries(c.fields).map(([k, [a, b]]) => (
                    <li key={k}>
                      <code>{k}</code> <s>{JSON.stringify(a)}</s> → <ins>{JSON.stringify(b)}</ins>
                    </li>
                  ))}
                </ul>
              )}
              {bodyOf(c) !== null && <pre dir="ltr">{JSON.stringify(bodyOf(c), null, 2)}</pre>}
            </div>
          ))}
        </div>
      )}

      {log.length > 0 && (
        <div className="rs-data-log">
          <div className="rs-data-log-head">
            <span>{t.dataLog(log.length)}</span>
            <button className="rs-data-btn" onClick={clear}>
              {t.dataClear}
            </button>
          </div>
          <ul>
            {log.map((e) => (
              <li key={e.id}>
                <button className={e === entry ? "is-on" : ""} onClick={() => setOpenId(e.id)}>
                  <span className="rs-data-time" dir="ltr">
                    {e.time}
                  </span>
                  <span className={`rs-verb is-${e.changes[0].method.toLowerCase()}`}>{e.changes[0].method}</span>
                  <span className="rs-data-path" dir="ltr">
                    {e.changes[0].path}
                  </span>
                  {e.changes.length > 1 && <small>+{e.changes.length - 1}</small>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
