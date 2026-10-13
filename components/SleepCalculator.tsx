"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Stars } from "./Art";

const CYCLE = 90; // minutos por ciclo de sueño, en promedio
const FALL_ASLEEP = 15; // minutos que tardamos en dormirnos

const fmt = (mins: number) => {
  const m = ((mins % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};
const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};
const hoursLabel = (cycles: number) => {
  const total = cycles * CYCLE;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
};

const QUICK = ["05:30", "06:00", "06:30", "07:00", "07:30"];

export function SleepCalculator() {
  const [mode, setMode] = useState<"despertar" | "ahora">("despertar");
  const [wake, setWake] = useState("06:30");
  const [now, setNow] = useState<number | null>(null);

  const results = useMemo(() => {
    if (mode === "despertar") {
      const w = toMinutes(wake);
      return [6, 5, 4].map((c) => ({ cycles: c, time: fmt(w - c * CYCLE - FALL_ASLEEP) }));
    }
    const base = now ?? 22 * 60;
    return [4, 5, 6].map((c) => ({ cycles: c, time: fmt(base + FALL_ASLEEP + c * CYCLE) }));
  }, [mode, wake, now]);

  const switchToNow = () => {
    const d = new Date();
    setNow(d.getHours() * 60 + d.getMinutes());
    setMode("ahora");
  };

  return (
    <section className="chapter chapter--night sleep" id="suenometro" aria-labelledby="sleep-title">
      <Stars className="sleep__stars" count={90} seed={11} />
      <div className="sleep__inner">
        <div className="sleep__intro">
          <h2 id="sleep-title" className="h2" data-reveal>
            ¿A qué hora suena
            <br />
            tu alarma?
          </h2>
          <p data-reveal>
            Dormimos en ciclos de unos 90 minutos. Despertar al final de un ciclo, y no en medio, es la diferencia entre
            levantarte liviano o arrastrando la mañana.
          </p>
          <div className="seg" role="radiogroup" aria-label="Qué quieres calcular" data-reveal>
            <button role="radio" aria-checked={mode === "despertar"} onClick={() => setMode("despertar")}>
              Me despierto a una hora
            </button>
            <button role="radio" aria-checked={mode === "ahora"} onClick={switchToNow}>
              Me acuesto ahora
            </button>
          </div>
          {mode === "despertar" ? (
            <div className="sleep__picker" data-reveal>
              <label htmlFor="wake">Mi alarma suena a las</label>
              <input id="wake" type="time" value={wake} step={300} onChange={(e) => setWake(e.target.value || "06:30")} />
              <div className="chips">
                {QUICK.map((q) => (
                  <button key={q} className="chip" aria-pressed={q === wake} onClick={() => setWake(q)}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="sleep__now">Si te acuestas a las {fmt(now ?? 0)}, estas son buenas horas para despertar.</p>
          )}
        </div>

        <div className="sleep__results" aria-live="polite">
          <p className="sleep__label">{mode === "despertar" ? "Acuéstate a las" : "Pon la alarma a las"}</p>
          <ol className="sleep__times">
            {results.map((r, i) => (
              <li key={r.cycles} data-best={i === 0 ? (mode === "despertar" ? "true" : undefined) : undefined}>
                <span className="sleep__time">{r.time}</span>
                <span className="sleep__meta">
                  {r.cycles} ciclos · {hoursLabel(r.cycles)} de sueño
                </span>
              </li>
            ))}
          </ol>
          <p className="sleep__fine">
            Contamos {FALL_ASLEEP} minutos para quedarte dormido. Es una guía para organizar tu noche, no un consejo
            médico. ¿Te cuesta apagar la luz? Un <Link href="/#catalogo">antifaz</Link> ayuda más de lo que crees.
          </p>
        </div>
      </div>
    </section>
  );
}
