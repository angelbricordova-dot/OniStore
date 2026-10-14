"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const CYCLE = 90; // minutos por ciclo de sueño, en promedio
const FALL_ASLEEP = 15; // minutos que tardamos en dormirnos
const CYCLES = 6;
const QUICK = ["05:30", "06:00", "06:30", "07:00", "07:30"];

/** Colores de cada ciclo: de la noche cerrada al amanecer. */
const CYCLE_COLORS: string[][] = [
  ["#15144A", "#38125C", "#15144A"],
  ["#38125C", "#4A1F73", "#38125C"],
  ["#4A1F73", "#A11370", "#4A1F73"],
  ["#A11370", "#C2335F", "#A11370"],
  ["#F95C42", "#FF8A50", "#F95C42"],
  ["#FFBF42", "#FFA385", "#FFBF42"],
];

const fmt = (mins: number) => {
  const m = ((Math.round(mins) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};
const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};
const duration = (cycles: number) => {
  const total = cycles * CYCLE;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
};

export function NightPlanner({ title = "Tu noche, en ciclos.", lede = "" }: { title?: string; lede?: string }) {
  const [mode, setMode] = useState<"alarma" | "ahora">("alarma");
  const [wake, setWake] = useState("06:30");
  const [now, setNow] = useState(22 * 60 + 30);

  const plan = useMemo(() => {
    if (mode === "alarma") {
      const end = toMinutes(wake);
      const start = end - CYCLES * CYCLE - FALL_ASLEEP;
      const options = [6, 5, 4].map((c) => ({ cycles: c, time: fmt(end - c * CYCLE - FALL_ASLEEP) }));
      // Marcas: cada hora posible para acostarse, sobre la línea de la noche.
      const marks = [6, 5, 4].map((c) => ({
        at: (CYCLES - c) * CYCLE,
        label: fmt(end - c * CYCLE - FALL_ASLEEP),
        cycles: c,
      }));
      return { start, end, options, marks, lead: `Acuéstate a las`, endLabel: `Suena la alarma` };
    }
    const start = now;
    const options = [4, 5, 6].map((c) => ({ cycles: c, time: fmt(now + FALL_ASLEEP + c * CYCLE) }));
    const marks = [4, 5, 6].map((c) => ({
      at: FALL_ASLEEP + c * CYCLE,
      label: fmt(now + FALL_ASLEEP + c * CYCLE),
      cycles: c,
    }));
    return {
      start,
      end: now + FALL_ASLEEP + CYCLES * CYCLE,
      options,
      marks,
      lead: `Pon la alarma a las`,
      endLabel: "",
    };
  }, [mode, wake, now]);

  const span = CYCLES * CYCLE + FALL_ASLEEP;
  const best = plan.options[mode === "alarma" ? 0 : 1];

  return (
    <section className="planner" id="tu-noche" aria-labelledby="planner-title">
      <div className="planner__intro">
        <h2 id="planner-title" className="title" data-reveal>
          {title}
        </h2>
        {lede ? <p data-reveal>{lede}</p> : null}
        <div className="seg" role="radiogroup" aria-label="Qué quieres calcular" data-reveal>
          <button type="button" role="radio" aria-checked={mode === "alarma"} onClick={() => setMode("alarma")}>
            Sé a qué hora me levanto
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={mode === "ahora"}
            onClick={() => {
              const d = new Date();
              setNow(d.getHours() * 60 + d.getMinutes());
              setMode("ahora");
            }}
          >
            Me voy a dormir ya
          </button>
        </div>
        {mode === "alarma" ? (
          <div className="planner__picker" data-reveal>
            <label htmlFor="wake">Mi alarma suena a las</label>
            <div className="planner__row">
              <input
                id="wake"
                type="time"
                value={wake}
                step={300}
                onChange={(e) => setWake(e.target.value || "06:30")}
              />
              <div className="chips">
                {QUICK.map((q) => (
                  <button key={q} type="button" className="chip-btn" aria-pressed={q === wake} onClick={() => setWake(q)}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="planner__now">Si te acuestas a las {fmt(now)}, estas son las mejores horas para despertar.</p>
        )}
      </div>

      <div className="planner__out" aria-live="polite">
        <p className="planner__lead">
          {plan.lead} <strong>{best.time}</strong>
          <span>
            {best.cycles} ciclos · {duration(best.cycles)} de sueño
          </span>
        </p>

        <div className="night" aria-hidden="true">
          <div className="night__bar">
            <span className="night__seg night__seg--fall" style={{ flexGrow: FALL_ASLEEP }} />
            {CYCLE_COLORS.map((c, i) => (
              <span key={i} className="night__seg" style={{ flexGrow: CYCLE, background: c[1], "--i": i } as React.CSSProperties} />
            ))}
          </div>
          {plan.marks.map((m) => (
            <span
              key={m.cycles}
              className="night__mark"
              data-best={m.cycles === best.cycles}
              style={{
                left: `${(m.at / span) * 100}%`,
                transform: m.at / span < 0.08 ? "none" : m.at / span > 0.92 ? "translateX(-100%)" : undefined,
              }}
            >
              {m.label}
            </span>
          ))}
          <span className="night__end">{mode === "alarma" ? fmt(plan.end) : ""}</span>
        </div>

        <ol className="planner__times">
          {plan.options.map((o) => (
            <li key={o.cycles} data-best={o.cycles === best.cycles}>
              <span className="planner__time">{o.time}</span>
              <span className="planner__meta">
                {o.cycles} ciclos · {duration(o.cycles)}
              </span>
            </li>
          ))}
        </ol>
        <p className="planner__fine">
          Contamos {FALL_ASLEEP} minutos para quedarte dormido. Es una guía para organizar tu noche, no un consejo
          médico. ¿La luz no te deja apagarte? Un <Link href="/#coleccion">antifaz</Link> ayuda más de lo que crees.
        </p>
      </div>
    </section>
  );
}
