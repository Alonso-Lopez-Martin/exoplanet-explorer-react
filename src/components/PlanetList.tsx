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
      {planets.map((planet) => {
        // Se calcula una sola vez por botón y se reutiliza en aria y en la clase.
        const isActive = selectedPlanet?.pl_name === planet.pl_name;
        // Evitamos dejar un espacio final sobrante ("match-btn ") cuando isActive es false.
        const btnClass = ['match-btn', isActive && 'active'].filter(Boolean).join(' ');
        return (
          <button
            type="button"
            key={planet.pl_name}
            aria-pressed={isActive}
            className={btnClass}
            onClick={() => onSelect(planet)}
          >
            {planet.pl_name}
          </button>
        );
      })}
    </div>
  );
}