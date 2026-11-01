import { StatItem } from './StatItem';
import { PlanetSphere } from './PlanetSphere';
import { calculateMetrics } from '../utils/astro-calc';
import type { Exoplanet } from '../utils/astro-calc';

interface PlanetViewerProps {
  planet: Exoplanet | null;
  totalMatches: number;
}

export function PlanetViewer({ planet, totalMatches }: PlanetViewerProps) {
  if (!planet) {
    return (
      <div className="viewer-container">
        <div id="planet-display">
          <p style={{ color: '#666' }}>Inicia una búsqueda para visualizar telemetría.</p>
        </div>
      </div>
    );
  }

  const metrics = calculateMetrics(planet);
  const sizePx = Math.round(150 * Math.min(Math.max(metrics.radioBase, 0.5), 2.5));

  return (
    <div className="viewer-container">
      <div id="planet-display">
        <PlanetSphere sizePx={sizePx} textureUrl={metrics.textura} />
      </div>
      <div className="data-corner">
        <div className="metadata-stats">
          Resultados en este sector: {totalMatches}.
        </div>
        <h3>{planet.pl_name}</h3>
        <ul className="data-grid">
          <StatItem label="Clasificación" value={metrics.tipoPlaneta} />
          <StatItem label="Habitabilidad" value={metrics.habitabilidad} />
          <StatItem label="Estrella" value={planet.hostname} />
          <StatItem label="Distancia" value={metrics.distAL} unit="Años Luz" />
          <StatItem label="Gravedad" value={metrics.gravedad ? Math.round(metrics.gravedad * 100) / 100 : null} unit="x 🌍 (g)" />
          <StatItem label="Radio" value={planet.pl_rade != null ? planet.pl_rade : `~${Math.round(metrics.radioBase * 10) / 10}`} unit="x 🌍" />
          <StatItem label="Masa" value={planet.pl_bmasse} unit="x 🌍" />
          <StatItem label="Densidad" value={metrics.densidad ? Math.round(metrics.densidad * 100) / 100 : null} unit="g/cm³" />
          <StatItem label="Temperatura" value={planet.pl_eqt} unit="K" />
          <StatItem label="Descubrimiento" value={`${planet.disc_year} (${planet.discoverymethod})`} />
        </ul>
      </div>
    </div>
  );
}