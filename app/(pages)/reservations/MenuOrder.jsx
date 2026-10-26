"use client";
import { useMemo, useState } from "react";
import { lineTotal, money, orderCount, orderDue, orderTotal } from "./model";
import { Modal, Stepper } from "./ui";

export const lineKey = (itemId, sizeId) => `${itemId}:${sizeId}`;

// A dish photo that falls back to a coloured tile with the dish's first letter
// when there is no photo or it fails to load.
export function DishImage({ src, name, className = "" }) {
  const [failed, setFailed] = useState(false);
  const hue = [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
  if (!src || failed)
    return (
      <span className={`rs-dish-img is-fallback ${className}`} style={{ "--hue": hue }} aria-hidden="true">
        {name.trim().charAt(0)}
      </span>
    );
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={`rs-dish-img ${className}`} src={src} alt={name} loading="lazy" onError={() => setFailed(true)} />;
}

// The bill as a receipt: one line per dish and size with its unit price, the
// quantity, the line total, and the final total. Editable lines have a stepper
// and a remove button; the same ticket is read-only once the bill is paid.
export function Ticket({ t, items, currency, place, meta, onChange, readOnly, deposit = 0 }) {
  const total = orderTotal(items);
  const count = orderCount(items);
  const setQty = (key, qty) => onChange(qty > 0 ? items.map((l) => (l.key === key ? { ...l, qty } : l)) : items.filter((l) => l.key !== key));

  return (
    <div className="rs-ticket" dir="auto">
      <div className="rs-ticket-head">
        <strong>{place}</strong>
        {meta && <small>{meta}</small>}
      </div>
      {items.length === 0 ? (
        <p className="rs-ticket-empty">{t.ticketEmpty}</p>
      ) : (
        <ul className="rs-ticket-lines">
          {items.map((l) => (
            <li key={l.key}>
              <DishImage className="rs-ticket-img" src={l.image} name={l.name} />
              <div className="rs-ticket-dish">
                <span className="rs-ticket-name">{l.name}</span>
                {l.size && <span className="rs-ticket-size">{l.size}</span>}
                <span className="rs-ticket-unit" dir="ltr">
                  {l.qty} × {money(l.price, currency)}
                </span>
              </div>
              <span className="rs-ticket-sum" dir="ltr">
                {money(lineTotal(l), currency)}
              </span>
              {!readOnly && (
                <div className="rs-ticket-edit">
                  <Stepper value={l.qty} min={0} max={99} onChange={(v) => setQty(l.key, v)} />
                  <button type="button" className="rs-ticket-x" aria-label={t.del} onClick={() => setQty(l.key, 0)}>
                    ×
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {deposit > 0 ? (
        <div className="rs-ticket-sums">
          <p>
            <span>
              {t.orderTotal} <small>({t.itemsCount(count)})</small>
            </span>
            <b dir="ltr">{money(total, currency)}</b>
          </p>
          <p className="is-deposit">
            <span>{t.depositDeducted}</span>
            <b dir="ltr">− {money(Math.min(deposit, total), currency)}</b>
          </p>
          <div className="rs-ticket-total">
            <span>{t.amountDue}</span>
            <b dir="ltr">{money(orderDue(items, deposit), currency)}</b>
          </div>
        </div>
      ) : (
        <div className="rs-ticket-total">
          <span>
            {t.orderTotal} <small>({t.itemsCount(count)})</small>
          </span>
          <b dir="ltr">{money(total, currency)}</b>
        </div>
      )}
    </div>
  );
}

// The full menu in a big window: categories, dishes with their sizes and prices,
// and the ticket beside it. Quantities change the order right away.
export function MenuModal({ t, menu, items, onChange, onClose, currency, place, meta, deposit = 0 }) {
  const categories = useMemo(() => [...new Set(menu.map((m) => m.category))], [menu]);
  const [cat, setCat] = useState(null);
  const [filter, setFilter] = useState("");

  const qtyOf = (key) => items.find((l) => l.key === key)?.qty || 0;
  const setQty = (dish, size, qty) => {
    const key = lineKey(dish.id, size.id);
    const rest = items.filter((l) => l.key !== key);
    if (qty <= 0) return onChange(rest);
    // A line keeps the price it was first added at.
    const old = items.find((l) => l.key === key);
    const line = old ? { ...old, qty } : { key, itemId: dish.id, sizeId: size.id, name: dish.name, size: size.label, price: size.price, image: dish.image, qty };
    const at = items.findIndex((l) => l.key === key);
    onChange(at >= 0 ? items.map((l) => (l.key === key ? line : l)) : [...items, line]);
  };

  const q = filter.trim().toLowerCase();
  const visible = menu.filter((m) => (!cat || m.category === cat) && (!q || `${m.name} ${m.description} ${m.category}`.toLowerCase().includes(q)));
  const shownCats = categories.filter((c) => visible.some((m) => m.category === c));

  return (
    <Modal wide title={t.menuTitle} onClose={onClose} closeLabel={t.close}>
      <div className="rs-menu-layout">
        <div className="rs-menu-main">
          <div className="rs-menu-bar">
            <div className="rs-menu-cats" role="tablist">
              <button className={!cat ? "is-on" : ""} onClick={() => setCat(null)}>
                {t.menuAll}
              </button>
              {categories.map((c) => (
                <button key={c} className={cat === c ? "is-on" : ""} onClick={() => setCat(c)}>
                  {c}
                </button>
              ))}
            </div>
            <input className="rs-order-search" placeholder={t.orderSearch} value={filter} onChange={(e) => setFilter(e.target.value)} />
          </div>

          <div className="rs-menu-scroll">
            {shownCats.map((c) => (
              <section key={c} className="rs-menu-section">
                <h3>{c}</h3>
                <div className="rs-dishes">
                  {visible
                    .filter((m) => m.category === c)
                    .map((dish) => (
                      <article key={dish.id} className={`rs-dish${dish.available ? "" : " is-off"}`}>
                        <DishImage className="rs-dish-photo" src={dish.image} name={dish.name} />
                        <div className="rs-dish-info">
                          <h4>{dish.name}</h4>
                          {dish.description && <p>{dish.description}</p>}
                          {!dish.available && <span className="rs-dish-na">{t.menuUnavailable}</span>}
                        </div>
                        <ul className="rs-sizes">
                          {dish.sizes.map((size) => {
                            const qty = qtyOf(lineKey(dish.id, size.id));
                            return (
                              <li key={size.id} className={qty ? "is-on" : ""}>
                                <span className="rs-size-label">{size.label || t.menuStandard}</span>
                                <span className="rs-size-price" dir="ltr">
                                  {money(size.price, currency)}
                                </span>
                                {dish.available || qty ? (
                                  <Stepper value={qty} min={0} max={99} onChange={(v) => setQty(dish, size, v)} />
                                ) : (
                                  <span />
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </article>
                    ))}
                </div>
              </section>
            ))}
            {shownCats.length === 0 && <p className="rs-hint">{t.orderNoMatch}</p>}
          </div>
        </div>

        <aside className="rs-menu-ticket">
          <h3>{t.ticketTitle}</h3>
          <Ticket t={t} items={items} currency={currency} place={place} meta={meta} deposit={deposit} onChange={onChange} />
          <button className="rs-primary" onClick={onClose}>
            {t.menuDone}
          </button>
        </aside>
      </div>
    </Modal>
  );
}
