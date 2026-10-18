import Image from "next/image";
import { FaUserTie } from "react-icons/fa";
import { IoCheckmarkDone } from "react-icons/io5";
import diaa from "../../imges/diaa.png";
import "./english-course.css";

// Hidden page: not linked anywhere and excluded from search engines.
export const metadata = {
  title: "English Course",
  robots: { index: false, follow: false },
};

// "q" = interviewer, "a" = me. Text is kept exactly as written.
const messages = [
  { from: "q", text: "How do you do ?" },
  { from: "a", text: "I'm fine thanks." },
  { from: "q", text: "Introduce your self." },
  {
    from: "a",
    text: "My name is Diaa Mohamed, my education degree is bachelor of computer science at the insittutes of Al Obour, I worked as a frontend react developer 'freelancer' from 3/2024 to 12/2024,I work as a frontend vue developer at Barq solutions from 2/2025 until now.",
  },
  { from: "q", text: "Greet, tell me about your responsibility in barq solution." },
  { from: "a", text: "I develope and maintain dashboard systems for chalet, restaurant, and salon management platforms." },
  { from: "a", text: "I build reusable dynaic form components used across multiple modules." },
  { from: "a", text: "I entegrate REST APIS and optimize frontend performance." },
  { from: "a", text: "I collabrate with backend and design teams to deliver new features." },
  { from: "q", text: "Ok, do you have any certificates ?" },
  { from: "a", text: 'Yes, I have three certificates "Createivo, Huawei and Route".' },
  { from: "q", text: "Thats very good, we will send an email message to you" },
  { from: "q", text: "See you soon." },
  { from: "a", text: "See you soon." },
];

function Avatar({ from }) {
  if (from === "a") {
    return (
      <span className="ec-avatar ec-avatar--me">
        <Image src={diaa} alt="Diaa" width={36} height={36} />
      </span>
    );
  }
  return (
    <span className="ec-avatar ec-avatar--them" aria-label="Interviewer">
      <FaUserTie />
    </span>
  );
}

export default function EnglishCourse() {
  return (
    <main className="ec-page" dir="ltr">
      <div className="container">
        <header className="ec-heading">
          <span className="section-kicker">English Course</span>
          <h1 className="section-title">
            Job <span className="accent">Interview</span>
          </h1>
        </header>

        <section className="ec-chat">
          <div className="ec-chat-header">
            <div className="ec-participants">
              <Avatar from="q" />
              <Avatar from="a" />
            </div>
            <div>
              <p className="ec-chat-title">Interviewer &amp; Diaa</p>
              <p className="ec-chat-status">
                <span className="ec-dot" /> Interview chat
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
                      <span className="ec-name">{m.from === "a" ? "Diaa" : "Interviewer"}</span>
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
      </div>
    </main>
  );
}
