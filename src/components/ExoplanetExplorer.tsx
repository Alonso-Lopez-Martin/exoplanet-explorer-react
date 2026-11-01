import { useState } from 'react';
import { SearchBar } from './SearchBar';
import { PlanetList } from './PlanetList';
import { PlanetViewer } from './PlanetViewer';
import { RecentSearches } from './RecentSearches';
import { PlanetComparison } from './PlanetComparison';
import { useNasaApi } from '../hooks/useNasaApi';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { selectDisplayPlanet, type Exoplanet } from '../utils/astro-calc';

const MAX_HISTORY = 6;

// Vista del explorador. El estado de búsqueda vive aquí y no en App, porque
// solo esta pantalla lo usa, y persiste en localStorage mediante useLocalStorage.
//
// Nota sobre la sincronización de SearchBar: pasamos `key={searchQuery}` a SearchBar
// para que, si `searchQuery` cambia desde fuera (por ejemplo al pulsar un botón
// del historial de búsquedas recientes), React reinicie el borrador del input con
// el nuevo `initialQuery` de forma limpia sin necesitar un useEffect en SearchBar.
export function ExoplanetExplorer() {
  const [searchQuery, setSearchQuery] = useLocalStorage<string>('space-explorer:last-query', '');
  const [history, setHistory] = useLocalStorage<string[]>('space-explorer:history', []);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [comparedPlanet, setComparedPlanet] = useState<Exoplanet | null>(null);

  const { data, loading, error, reload } = useNasaApi(searchQuery);

  // Función pura extraída a astro-calc.ts con la prioridad de selección.
  const displayPlanet = selectDisplayPlanet(data, selectedName, searchQuery);

  const handleSearch = (query: string) => {
    setSelectedName(null);
    if (query.toLowerCase() === searchQuery.toLowerCase()) {
      reload();
    } else {
      setSearchQuery(query);
    }
    setHistory(prev => {
      const filtered = prev.filter(item => item.toLowerCase() !== query.toLowerCase());
      return [query, ...filtered].slice(0, MAX_HISTORY);
    });
  };

  const handleToggleCompare = (planet: Exoplanet) => {
    setComparedPlanet(prev => (prev?.pl_name === planet.pl_name ? null : planet));
  };

  const isNotFound: boolean = searchQuery !== '' && !loading && !error && data.length === 0;
  const showComparison =
    comparedPlanet !== null && displayPlanet !== null && comparedPlanet.pl_name !== displayPlanet.pl_name;

  return (
    <>
      <SearchBar key={searchQuery} initialQuery={searchQuery} onSearch={handleSearch} loading={loading} />

      <RecentSearches
        history={history}
        currentQuery={searchQuery}
        onSelectQuery={handleSearch}
        onClear={() => setHistory([])}
      />

      {error && <p className="estado-mensaje error-box">⚠ {error}</p>}
      {isNotFound && <p className="estado-mensaje error-box">⚠ No se encontraron resultados para "{searchQuery}".</p>}

      <PlanetList
        planets={data}
        selectedPlanet={displayPlanet}
        onSelect={planet => setSelectedName(planet.pl_name)}
      />

      {showComparison && displayPlanet && (
        <PlanetComparison
          basePlanet={comparedPlanet}
          currentPlanet={displayPlanet}
          onClose={() => setComparedPlanet(null)}
        />
      )}

      <PlanetViewer
        planet={displayPlanet}
        totalMatches={data.length}
        comparedPlanet={comparedPlanet}
        onToggleCompare={handleToggleCompare}
      />
    </>
  );
}