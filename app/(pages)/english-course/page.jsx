import Image from "next/image";
import { TbQuestionMark } from "react-icons/tb";
import { IoArrowDown, IoCheckmarkDone } from "react-icons/io5";
import diaa from "../../imges/diaa.png";
import "./english-course.css";

// Hidden page: not linked anywhere and excluded from search engines.
export const metadata = {
  title: "English Course",
  robots: { index: false, follow: false },
};

// "q" = question, "a" = me. Text is kept exactly as written.
const messages = [
  {
    from: "q",
    text: "When you were a kid, did you still want to be a developer/programmer? If Not, what did you want to be?",
  },
  { from: "a", text: "Not exactly, I was interested in planes while fling." },
  { from: "a", text: "I was break up my games and check motors how their work." },
  { from: "a", text: "I decided that I will be a planes engineer, but I don't now how, where and when will be start to do this." },
  { from: "a", text: "When I was in secondary school, I read about programming and websites so I decided I will be a programmer." },
  { from: "a", text: "My dreem until now is make dorons, drone Programming, 3d printer and make 3d models" },
];

// Poster banner: one ad-style composite of the story of the answer
// (planes -> motors -> code -> drones & 3D printing). Photos from Unsplash.
const unsplash = (id, w = 1600) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const poster = {
  sky: unsplash("1436491865332-7a61a109cc05", 2400),
  engine: unsplash("1540575861501-7cf05a4b125a"),
  cards: [
    { key: "code", src: unsplash("1555066931-4365d14bab8c", 1200), label: "Code" },
    { key: "printer", src: unsplash("1611117775350-ac3950990985", 1000), label: "3D printing" },
    { key: "drone", src: unsplash("1473968512647-3e447244af8f", 1200), label: "Drones" },
  ],
};

const steps = ["Planes", "Motors", "Code", "Drones", "3D printing"];

function PosterBanner() {
  return (
    <section className="ec-poster">
      <div className="ec-poster-sky" style={{ backgroundImage: `url(${poster.sky})` }} />
      <div className="ec-poster-engine" style={{ backgroundImage: `url(${poster.engine})` }} />
      <svg className="ec-poster-path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M 2 92 C 30 88, 40 60, 58 52 S 85 30, 99 6" />
      </svg>

      <div className="ec-poster-copy">
        <span className="ec-poster-kicker">English Course</span>
        <h1 className="ec-poster-title">
          Childhood <span>Dream</span>
        </h1>
        <p className="ec-poster-question">
          When you were a kid, did you still want to be a developer/programmer? If Not, what did you want to be?
        </p>
        <ol className="ec-poster-steps">
          {steps.map((step, i) => (
            <li key={step}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              {step}
            </li>
          ))}
        </ol>
        <a href="#answer" className="ec-poster-cta">
          Read the answer <IoArrowDown aria-hidden="true" />
        </a>
      </div>

      <div className="ec-poster-cards" aria-hidden="true">
        {poster.cards.map((card) => (
          <figure key={card.key} className={`ec-card ec-card--${card.key}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={card.src} alt="" />
            <figcaption>{card.label}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

// Military drones and aircraft, shown uncropped and ordered by size (wingspan).
// Photos from Wikimedia Commons; each one links to its file page for credit.
const commons = (path, name, thumb = true) =>
  thumb
    ? `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}/${name}/1920px-${name}`
    : `https://upload.wikimedia.org/wikipedia/commons/${path}/${name}`;

const fleet = [
  {
    title: "Military drones",
    items: [
      { name: "Bayraktar TB2", type: "Combat drone", span: 12, src: commons("4/4d", "Bayraktar_TB2_Runway.jpg"), file: "Bayraktar_TB2_Runway.jpg" },
      { name: "MQ-1 Predator", type: "Combat drone", span: 14.8, src: commons("0/08", "MQ-1_Predator_unmanned_aircraft.jpg"), file: "MQ-1_Predator_unmanned_aircraft.jpg" },
      { name: "MQ-9 Reaper", type: "Hunter-killer drone", span: 20, src: commons("b/b0", "MQ-9_Reaper_in_flight_%282007%29.jpg"), file: "MQ-9_Reaper_in_flight_(2007).jpg" },
      { name: "RQ-4 Global Hawk", type: "High-altitude surveillance drone", span: 39.9, src: commons("9/9d", "Global_Hawk_1.jpg"), file: "Global_Hawk_1.jpg" },
    ],
  },
  {
    title: "Aircraft",
    items: [
      { name: "F-35A Lightning II", type: "Stealth fighter", span: 10.7, src: commons("6/61", "F-35A_flight_%28cropped%29.jpg", false), file: "F-35A_flight_(cropped).jpg" },
      { name: "F-22 Raptor", type: "Air superiority fighter", span: 13.6, src: commons("1/1e", "F-22_Raptor_edit1_%28cropped%29.jpg"), file: "F-22_Raptor_edit1_(cropped).jpg" },
      { name: "SR-71 Blackbird", type: "Mach 3 reconnaissance jet", span: 16.9, src: commons("9/97", "Lockheed_SR-71_Blackbird.jpg"), file: "Lockheed_SR-71_Blackbird.jpg" },
      { name: "C-130 Hercules", type: "Tactical transport", span: 40.4, src: commons("c/cc", "Lockheed_C-130_Hercules.jpg"), file: "Lockheed_C-130_Hercules.jpg" },
      { name: "C-17 Globemaster III", type: "Strategic transport", span: 51.8, src: commons("1/1b", "C-17_Globemaster_III.jpg"), file: "C-17_Globemaster_III.jpg" },
      { name: "B-2 Spirit", type: "Stealth bomber", span: 52.4, src: commons("4/47", "B-2_Spirit_original.jpg"), file: "B-2_Spirit_original.jpg" },
      { name: "Airbus A380", type: "Largest airliner", span: 79.8, src: commons("2/2a", "Lufthansa_Airbus_A380_D-AIMC_MD3.jpg"), file: "Lufthansa_Airbus_A380_D-AIMC_MD3.jpg" },
    ],
  },
];

const MAX_SPAN = 80;

function Fleet() {
  return (
    <section className="ec-fleet">
      <header className="ec-fleet-heading">
        <span className="section-kicker">Planes &amp; Drones</span>
        <h2 className="section-title">
          Every <span className="accent">size</span>, every type
        </h2>
      </header>

      {fleet.map((group) => (
        <div key={group.title} className="ec-fleet-group">
          <h3 className="ec-fleet-title">{group.title}</h3>
          <div className="ec-masonry">
            {group.items.map((item) => (
              <figure key={item.name} className="ec-shot">
                <a
                  href={`https://commons.wikimedia.org/wiki/File:${item.file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.src} alt={item.name} loading="lazy" />
                </a>
                <figcaption>
                  <div className="ec-shot-head">
                    <strong>{item.name}</strong>
                    <span className="ec-shot-span">{item.span} m</span>
                  </div>
                  <span className="ec-shot-type">{item.type}</span>
                  <span className="ec-shot-bar" aria-label={`Wingspan ${item.span} meters`}>
                    <span style={{ width: `${(item.span / MAX_SPAN) * 100}%` }} />
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      ))}

      <p className="ec-fleet-credit">Wingspan in meters · Photos: Wikimedia Commons</p>
    </section>
  );
}

function Avatar({ from }) {
  if (from === "a") {
    return (
      <span className="ec-avatar ec-avatar--me">
        <Image src={diaa} alt="Diaa" width={36} height={36} />
      </span>
    );
  }
  return (
    <span className="ec-avatar ec-avatar--them" aria-label="Question">
      <TbQuestionMark />
    </span>
  );
}

export default function EnglishCourse() {
  return (
    <main className="ec-page" dir="ltr">
      <PosterBanner />
      <div className="container">
        <section className="ec-chat" id="answer">
          <div className="ec-chat-header">
            <div className="ec-participants">
              <Avatar from="q" />
              <Avatar from="a" />
            </div>
            <div>
              <p className="ec-chat-title">Q&amp;A with Diaa</p>
              <p className="ec-chat-status">
                <span className="ec-dot" /> From planes to code
              </p>
            </div>
          </div>

          <ol className="ec-messages">
            {messages.map((m, i) => {
              const prev = messages[i - 1];
              const next = messages[i + 1];
              const first = prev?.from !== m.from;
              const last = next?.from !== m.from;
              return (
                <li
                  key={i}
                  className={`ec-row ec-row--${m.from}${first ? " is-first" : ""}${last ? " is-last" : ""}`}
                  style={{ animationDelay: `${i * 90}ms` }}
                >
                  <div className="ec-avatar-slot">{last && <Avatar from={m.from} />}</div>
                  <div className="ec-bubble-wrap">
                    {first && (
                      <span className="ec-name">{m.from === "a" ? "Diaa" : "Question"}</span>
                    )}
                    <p className="ec-bubble">
                      {m.text}
                      {m.from === "a" && last && <IoCheckmarkDone className="ec-seen" aria-hidden="true" />}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <Fleet />
      </div>
    </main>
  );
}
