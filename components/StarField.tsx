/** Cielo de estrellas que aparece de fondo en el modo noche. Determinista, sin JavaScript. */
export function StarField({ count = 110 }: { count?: number }) {
  let seed = 17;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const stars = Array.from({ length: count }, (_, i) => {
    const big = rand() < 0.1;
    return {
      x: (rand() * 100).toFixed(2),
      y: (rand() * 100).toFixed(2),
      r: big ? 1.6 + rand() * 0.8 : 0.6 + rand() * 0.8,
      gold: rand() < 0.12,
      dur: (2.5 + rand() * 4).toFixed(2),
      delay: (rand() * 5).toFixed(2),
      i,
    };
  });
  return (
    <div className="stars" aria-hidden="true">
      <svg width="100%" height="100%">
        {stars.map((st) => (
          <circle
            key={st.i}
            cx={`${st.x}%`}
            cy={`${st.y}%`}
            r={st.r}
            className={st.gold ? "star star--gold" : "star"}
            style={
              {
                "--dur": `${st.dur}s`,
                "--delay": `${st.delay}s`,
                "--i": st.i,
              } as React.CSSProperties
            }
          />
        ))}
      </svg>
      <span className="shooting shooting--1" />
      <span className="shooting shooting--2" />
    </div>
  );
}
