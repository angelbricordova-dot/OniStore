import { DayCycle } from "./DayCycle";

/**
 * Cielo del modo día: un sol que respira, nubes que cruzan despacio y motas de luz.
 * Al bajar por la página el sol se pone y el cielo se vuelve atardecer, camino a la noche.
 * El movimiento propio (nubes, halo, motas) es CSS; el atardecer lo lleva DayCycle según el scroll.
 */

const CLOUD = "M28 70c-12 0-22-8-22-19s9-19 21-19c2-14 15-25 30-25 12 0 22 6 27 16 4-3 9-4 14-4 15 0 27 11 28 26h4c13 0 23 9 23 20s-6 5-14 5H28Z";

const CLOUDS = [
  { top: 9, width: 220, dur: 210, delay: -40, opacity: 0.95 },
  { top: 24, width: 150, dur: 260, delay: -170, opacity: 0.8 },
  { top: 5, width: 120, dur: 300, delay: -230, opacity: 0.7 },
  { top: 40, width: 190, dur: 240, delay: -95, opacity: 0.75 },
  { top: 58, width: 130, dur: 280, delay: -20, opacity: 0.6 },
];

export function DaySky() {
  let seed = 23;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const motes = Array.from({ length: 16 }, (_, i) => ({
    x: (rand() * 100).toFixed(1),
    y: (20 + rand() * 75).toFixed(1),
    s: (2 + rand() * 3).toFixed(1),
    dur: (14 + rand() * 12).toFixed(1),
    delay: (-rand() * 26).toFixed(1),
    i,
  }));

  return (
    <div className="daysky" aria-hidden="true">
      <div className="daysky__wash" />
      <div className="daysky__dusk" />
      <div className="daysky__sunset" />
      <div className="daysky__sunpath">
        <div className="daysky__sun">
          <span className="daysky__sun-warm" />
        </div>
      </div>
      <div className="daysky__night" />
      <div className="daysky__clouds">
        {CLOUDS.map((c, i) => (
          <svg
            key={i}
            className="cloud"
            viewBox="0 0 160 76"
            style={
              {
                top: `${c.top}%`,
                width: c.width,
                opacity: c.opacity,
                "--dur": `${c.dur}s`,
                "--delay": `${c.delay}s`,
              } as React.CSSProperties
            }
          >
            <defs>
              <linearGradient id={`cloud${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0.35" stopColor="#ffffff" />
                <stop offset="1" stopColor="var(--cloud-shade)" />
              </linearGradient>
            </defs>
            <path d={CLOUD} fill={`url(#cloud${i})`} />
          </svg>
        ))}
      </div>
      <div className="daysky__motes">
        {motes.map((m) => (
          <span
            key={m.i}
            className="mote"
            style={
              {
                left: `${m.x}%`,
                top: `${m.y}%`,
                width: `${m.s}px`,
                height: `${m.s}px`,
                "--dur": `${m.dur}s`,
                "--delay": `${m.delay}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <DayCycle />
    </div>
  );
}
