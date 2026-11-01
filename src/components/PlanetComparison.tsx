import { calculateMetrics, roundTo, type Exoplanet } from '../utils/astro-calc';
import { PlanetSphere } from './PlanetSphere';

interface PlanetComparisonProps {
  basePlanet: Exoplanet;
  currentPlanet: Exoplanet;
  onClose: () => void;
}

// Comparador cara a cara entre un exoplaneta fijado en memoria y el que se está
// visualizando actualmente. Deriva todas las métricas al vuelo con calculateMetrics.
export function PlanetComparison({ basePlanet, currentPlanet, onClose }: PlanetComparisonProps) {
  const baseMetrics = calculateMetrics(basePlanet);
  const currentMetrics = calculateMetrics(currentPlanet);

  const rows = [
    { label: 'Clasificación', a: baseMetrics.tipoPlaneta, b: currentMetrics.tipoPlaneta },
    { label: 'Habitabilidad', a: baseMetrics.habitabilidad, b: currentMetrics.habitabilidad },
    {
      label: 'Radio (x 🌍)',
      a: basePlanet.pl_rade ?? `~${roundTo(baseMetrics.radioBase, 1)}`,
      b: currentPlanet.pl_rade ?? `~${roundTo(currentMetrics.radioBase, 1)}`,
    },
    { label: 'Masa (x 🌍)', a: basePlanet.pl_bmasse ?? 'Desconocida', b: currentPlanet.pl_bmasse ?? 'Desconocida' },
    {
      label: 'Gravedad (g)',
      a: roundTo(baseMetrics.gravedad, 2) ?? 'Desconocida',
      b: roundTo(currentMetrics.gravedad, 2) ?? 'Desconocida',
    },
    {
      label: 'Densidad (g/cm³)',
      a: roundTo(baseMetrics.densidad, 2) ?? 'Desconocida',
      b: roundTo(currentMetrics.densidad, 2) ?? 'Desconocida',
    },
    {
      label: 'Temperatura (K)',
      a: basePlanet.pl_eqt ?? 'Desconocida',
      b: currentPlanet.pl_eqt ?? 'Desconocida',
    },
    {
      label: 'Distancia (Años Luz)',
      a: baseMetrics.distAL ?? 'Desconocida',
      b: currentMetrics.distAL ?? 'Desconocida',
    },
  ];

  return (
    <section className="comparison-panel" aria-label="Comparador de exoplanetas">
      <div className="comparison-header">
        <h3>🔬 Comparativa directa: {basePlanet.pl_name} vs {currentPlanet.pl_name}</h3>
        <button type="button" className="recent-clear-btn" onClick={onClose}>
          Cerrar comparativa
        </button>
      </div>

      <div className="comparison-spheres">
        <div className="comparison-sphere-card">
          <PlanetSphere sizePx={Math.round(baseMetrics.sizePx * 0.55)} textureUrl={baseMetrics.textura} />
          <strong>{basePlanet.pl_name}</strong>
        </div>
        <div className="comparison-sphere-card">
          <PlanetSphere sizePx={Math.round(currentMetrics.sizePx * 0.55)} textureUrl={currentMetrics.textura} />
          <strong>{currentPlanet.pl_name}</strong>
        </div>
      </div>

      <table className="comparison-table">
        <thead>
          <tr>
            <th>Parámetro</th>
            <th>{basePlanet.pl_name}</th>
            <th>{currentPlanet.pl_name}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.label}>
              <td>{row.label}</td>
              <td>{row.a}</td>
              <td>{row.b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}