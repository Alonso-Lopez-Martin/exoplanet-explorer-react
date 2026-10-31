import { calculateMetrics } from '../utils/astro-calc';
import type{ Exoplanet } from '../utils/astro-calc';

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
        <div
          className="planet-sphere"
          style={{
            width: `${sizePx}px`,
            height: `${sizePx}px`,
            backgroundImage: `url('${metrics.textura}')`,
          }}
        />
      </div>
      <div className="data-corner">
        <div className="metadata-stats">
          Resultados en este sector: {totalMatches}.
        </div>
        <h3>{planet.pl_name}</h3>
        <ul className="data-grid">
          <li><strong>Clasificación</strong> {metrics.tipoPlaneta}</li>
          <li><strong>Habitabilidad</strong> {metrics.habitabilidad}</li>
          <li><strong>Estrella</strong> {planet.hostname || 'Desconocida'}</li>
          <li><strong>Distancia</strong> {metrics.distAL != null ? `${metrics.distAL} Años Luz` : 'Desconocida'}</li>
          <li><strong>Gravedad</strong> {metrics.gravedad != null ? `${Math.round(metrics.gravedad * 100) / 100} x 🌍 (g)` : 'Datos insuficientes'}</li>
          <li><strong>Radio</strong> {planet.pl_rade != null ? `${planet.pl_rade} x 🌍` : `~${Math.round(metrics.radioBase * 10) / 10} x 🌍`}</li>
          <li><strong>Masa</strong> {planet.pl_bmasse != null ? `${planet.pl_bmasse} x 🌍` : 'Desconocida'}</li>
          <li><strong>Densidad</strong> {metrics.densidad != null ? `${Math.round(metrics.densidad * 100) / 100} g/cm³` : 'Desconocida'}</li>
          <li><strong>Temperatura</strong> {planet.pl_eqt != null ? `${planet.pl_eqt} K` : 'Desconocida'}</li>
          <li><strong>Descubrimiento</strong> {planet.disc_year} ({planet.discoverymethod})</li>
        </ul>
      </div>
    </div>
  );
}