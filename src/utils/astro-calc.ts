export interface Exoplanet {
  pl_name: string;
  pl_rade: number | null;
  pl_bmasse: number | null;
  pl_eqt: number | null;
  pl_orbper: number | null;
  discoverymethod: string;
  disc_year: number;
  hostname: string;
  sy_dist: number | null;
}

export interface FormattedStat {
  label: string;
  value: string | number | null;
  unit?: string;
}

export interface PlanetMetrics {
  densidad: number | null;
  gravedad: number | null;
  distAL: number | null;
  habitabilidad: string;
  tipoPlaneta: string;
  textura: string;
  radioBase: number;
  sizePx: number;
  stats: FormattedStat[];
}

// Helper puro para redondear a N decimales sin ensuciar el JSX de los componentes.
function roundTo(val: number | null, decimals = 2): number | null {
  if (val === null) return null;
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}

export function calculateMetrics(planet: Exoplanet): PlanetMetrics {
  const radioBase = planet.pl_rade != null ? planet.pl_rade : (planet.pl_bmasse != null ? Math.pow(planet.pl_bmasse, 0.33) : 1);
  const masa = planet.pl_bmasse;
  const temp = planet.pl_eqt;

  let densidad: number | null = null;
  let gravedad: number | null = null;

  if (masa != null && planet.pl_rade != null && planet.pl_rade !== 0) {
    densidad = (masa / Math.pow(planet.pl_rade, 3)) * 5.51;
    gravedad = masa / Math.pow(planet.pl_rade, 2);
  }

  const distAL = planet.sy_dist != null ? Math.round(planet.sy_dist * 3.26156) : null;

  let habitabilidad = "Desconocida";
  if (temp != null) {
    if (temp >= 273 && temp <= 373 && (densidad == null || densidad > 3.5)) {
      habitabilidad = "Potencialmente Habitable 💧";
    } else if (temp < 273) {
      habitabilidad = "Demasiado Frío ❄️";
    } else {
      habitabilidad = "Demasiado Caliente 🔥";
    }
  }

  const texturas = {
    lava: ['/Venus.jpg', '/Jupiter_Io(B).jpg'],
    templado: ['/Mars.jpg'],
    helado: ['/Pluto.jpg', '/Pluto_Charon.jpg', '/Jupiter_Europa.jpg', '/Jupiter_Ganymede.jpg', '/Jupiter_Callisto.jpg'],
    enano: ['/Mars_Phobos.jpg'],
    gaseoso: ['/Jupiter.jpg', '/Saturn.jpg'],
    oceano: ['/Neptune.jpg', '/Saturn_Titan.jpg']
  };

  let tipoPlaneta: string;
  let texturaCategoria: keyof typeof texturas;
  
  const orbitalSeed = Math.floor((planet.pl_orbper ?? planet.disc_year ?? 1) * 123.45);

  if (radioBase < 0.5) {
    tipoPlaneta = "Planeta Enano / Asteroide";
    texturaCategoria = 'enano';
  } else if (densidad != null) {
    if (densidad >= 4) {
      if (temp != null && temp > 800) { tipoPlaneta = "Rocoso (Mundo de Lava)"; texturaCategoria = 'lava'; }
      else if (temp != null && temp > 200 && temp < 400) { tipoPlaneta = "Rocoso (Templado)"; texturaCategoria = 'templado'; }
      else { tipoPlaneta = "Rocoso (Helado/Yermo)"; texturaCategoria = 'helado'; }
    } else if (densidad >= 2 && densidad < 4) {
      tipoPlaneta = "Mundo Océano / Minineptuno"; texturaCategoria = 'oceano';
    } else {
      tipoPlaneta = "Gigante Gaseoso"; texturaCategoria = 'gaseoso';
    }
  } else {
    if (radioBase < 1.6) {
      if (temp != null && temp > 800) { tipoPlaneta = "Rocoso (Lava)"; texturaCategoria = 'lava'; }
      else if (temp != null && temp > 200 && temp < 400) { tipoPlaneta = "Rocoso (Templado)"; texturaCategoria = 'templado'; }
      else { tipoPlaneta = "Rocoso (Helado)"; texturaCategoria = 'helado'; }
    } else if (radioBase < 4) {
      tipoPlaneta = "Supertierra / Gigante de Hielo"; texturaCategoria = 'oceano';
    } else {
      tipoPlaneta = "Gigante Gaseoso"; texturaCategoria = 'gaseoso';
    }
  }

  const arraySeleccionado = texturas[texturaCategoria];
  const textura = arraySeleccionado[orbitalSeed % arraySeleccionado.length];

  // Calculamos el tamaño en píxeles y formateamos todas las tarjetas de datos aquí,
  // de modo que PlanetViewer se limite a pintar datos ya listos sin ternarios inline.
  const sizePx = Math.round(150 * Math.min(Math.max(radioBase, 0.5), 2.5));
  const radioFormateado = planet.pl_rade != null ? planet.pl_rade : `~${roundTo(radioBase, 1)}`;

  const stats: FormattedStat[] = [
    { label: 'Clasificación', value: tipoPlaneta },
    { label: 'Habitabilidad', value: habitabilidad },
    { label: 'Estrella', value: planet.hostname },
    { label: 'Distancia', value: distAL, unit: 'Años Luz' },
    { label: 'Gravedad', value: roundTo(gravedad, 2), unit: 'x 🌍 (g)' },
    { label: 'Radio', value: radioFormateado, unit: 'x 🌍' },
    { label: 'Masa', value: planet.pl_bmasse, unit: 'x 🌍' },
    { label: 'Densidad', value: roundTo(densidad, 2), unit: 'g/cm³' },
    { label: 'Temperatura', value: planet.pl_eqt, unit: 'K' },
    { label: 'Descubrimiento', value: `${planet.disc_year} (${planet.discoverymethod})` },
  ];

  return { densidad, gravedad, distAL, habitabilidad, tipoPlaneta, textura, radioBase, sizePx, stats };
}