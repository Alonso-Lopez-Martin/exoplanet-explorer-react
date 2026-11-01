import type { Exoplanet } from '../utils/astro-calc';

interface PlanetListProps {
  planets: Exoplanet[];
  selectedPlanet: Exoplanet | null;
  onSelect: (planet: Exoplanet) => void;
}

export function PlanetList({ planets, selectedPlanet, onSelect }: PlanetListProps) {
  if (planets.length <= 1) return null;

  return (
    <div className="matches-container">
      <span style={{ color: 'var(--text-color)', marginRight: '10px' }}>Encontrados en este sector:</span>
      {planets.map((planet) => (
        <button
          type="button"
          key={planet.pl_name}
          aria-pressed={selectedPlanet?.pl_name === planet.pl_name}
          className={`match-btn ${selectedPlanet?.pl_name === planet.pl_name ? 'active' : ''}`}
          onClick={() => onSelect(planet)}
        >
          {planet.pl_name}
        </button>
      ))}
    </div>
  );
}