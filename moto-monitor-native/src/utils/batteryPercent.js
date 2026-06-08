// Mapea voltaje de batería de plomo-ácido 12V a porcentaje
// Curva de descarga real: 10.5V = 0%, 12.7V = 100%

const CURVA = [
  { v: 10.5, p: 0 },
  { v: 11.3, p: 10 },
  { v: 11.8, p: 25 },
  { v: 12.0, p: 40 },
  { v: 12.2, p: 55 },
  { v: 12.4, p: 70 },
  { v: 12.6, p: 85 },
  { v: 12.7, p: 100 },
];

export function voltajePorcentaje(v) {
  if (v <= CURVA[0].v) return 0;
  if (v >= CURVA[CURVA.length - 1].v) return 100;

  for (let i = 1; i < CURVA.length; i++) {
    if (v <= CURVA[i].v) {
      const tramo = CURVA[i].v - CURVA[i - 1].v;
      const pos   = v - CURVA[i - 1].v;
      const rango = CURVA[i].p - CURVA[i - 1].p;
      return Math.round(CURVA[i - 1].p + (pos / tramo) * rango);
    }
  }
}
