import { cn } from '../utils/cn';

interface RecentSearchesProps {
  history: string[];
  currentQuery: string;
  onSelectQuery: (query: string) => void;
  onClear: () => void;
}

// Barra de búsquedas recientes persistida en localStorage. Permite saltar con un
// clic a consultas anteriores sin volver a teclearlas.
export function RecentSearches({ history, currentQuery, onSelectQuery, onClear }: RecentSearchesProps) {
  if (history.length === 0) return null;

  return (
    <div className="recent-searches">
      <span className="matches-label">Búsquedas recientes:</span>
      {history.map((item) => {
        const isCurrent = item.toLowerCase() === currentQuery.toLowerCase();
        return (
          <button
            key={item}
            type="button"
            aria-pressed={isCurrent}
            className={cn('match-btn', isCurrent && 'active')}
            onClick={() => onSelectQuery(item)}
          >
            {item}
          </button>
        );
      })}
      <button type="button" className="recent-clear-btn" onClick={onClear}>
        Limpiar historial
      </button>
    </div>
  );
}