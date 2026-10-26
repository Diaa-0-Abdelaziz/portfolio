"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function Stepper({ value, onChange, min = 1, max = 12, suffix }) {
  return (
    <div className="rs-stepper">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>
        −
      </button>
      <span>
        {value}
        {suffix && <small> {suffix}</small>}
      </span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>
        +
      </button>
    </div>
  );
}

export function Seg({ value, onChange, options, className = "" }) {
  return (
    <div className={`rs-seg ${className}`}>
      {options.map(([k, label]) => (
        <button type="button" key={k} className={value === k ? "is-on" : ""} onClick={() => onChange(k)}>
          {label}
        </button>
      ))}
    </div>
  );
}

// Two-step delete: the first click arms it, the second one deletes.
export function Confirm({ label, confirm, onConfirm }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const id = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(id);
  }, [armed]);
  return (
    <button type="button" className={`rs-del${armed ? " is-armed" : ""}`} onClick={() => (armed ? onConfirm() : setArmed(true))}>
      {armed ? confirm : label}
    </button>
  );
}

// Shows whose job an action is: the staff (and the manager) or the manager only.
export function RoleBadge({ t, role }) {
  return <span className={`rs-role is-${role}`}>{role === "manager" ? t.roleManager : t.roleStaff}</span>;
}

const modalStack = [];

// Dialog in the middle of the page over the dimmed room. Esc or the backdrop
// closes it; with one open over another, Esc closes only the top one. It renders
// in the page body so a window can open over another without being clipped.
export function Modal({ title, onClose, closeLabel, wide, large, children }) {
  const id = useRef(Symbol("modal"));
  // Register once, in opening order, so the stack tells which window is on top.
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const me = id.current;
    modalStack.push(me);
    const onKey = (e) => e.key === "Escape" && modalStack[modalStack.length - 1] === me && close.current();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      modalStack.splice(modalStack.indexOf(me), 1);
    };
  }, []);
  const [host, setHost] = useState(null);
  useEffect(() => setHost(document.body), []);
  if (!host) return null;
  return createPortal(
    <div className="rs-modal-backdrop" dir={document.documentElement.dir} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`rs-modal${wide ? " is-wide" : ""}${large ? " is-large" : ""}`} role="dialog" aria-modal="true" aria-label={typeof title === "string" ? title : undefined}>
        <header className="rs-modal-head">
          <h2>{title}</h2>
          <button className="rs-close" aria-label={closeLabel} onClick={onClose}>
            ×
          </button>
        </header>
        <div className="rs-modal-body">{children}</div>
      </div>
    </div>,
    host,
  );
}
