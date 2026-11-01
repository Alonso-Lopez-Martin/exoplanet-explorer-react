import { useState } from 'react';
import { SearchBar } from './SearchBar';
import { PlanetList } from './PlanetList';
import { PlanetViewer } from './PlanetViewer';
import { useNasaApi } from '../hooks/useNasaApi';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Vista del explorador. El estado de búsqueda vive aquí y no en App, porque
// solo esta pantalla lo usa, pero persiste en localStorage mediante nuestro
// custom hook useLocalStorage para no perder la última búsqueda al volver a la home.
//
// Estado mínimo: el texto buscado (persistido) y el NOMBRE del planeta que eligió
// el usuario. El planeta mostrado, los resultados vacíos, etc. se derivan en cada
// render (no hay useMemo: son operaciones baratas sobre una lista corta).
export function ExoplanetExplorer() {
  const [searchQuery, setSearchQuery] = useLocalStorage<string>('space-explorer:last-query', '');
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const { data, loading, error } = useNasaApi(searchQuery);

  // Prioridad: elección manual > coincidencia exacta con lo buscado > primer resultado.
  const displayPlanet =
    data.find(p => p.pl_name === selectedName) ??
    data.find(p => p.pl_name.toLowerCase() === searchQuery.toLowerCase()) ??
    data[0] ??
    null;

  const handleSearch = (query: string) => {
    setSelectedName(null);
    setSearchQuery(query);
  };

  const isNotFound: boolean = searchQuery !== '' && !loading && !error && data.length === 0;

  return (
    <>
      <SearchBar initialQuery={searchQuery} onSearch={handleSearch} loading={loading} />

      {error && <p className="estado-mensaje error-box">⚠ {error}</p>}
      {isNotFound && <p className="estado-mensaje error-box">⚠ No se encontraron resultados para "{searchQuery}".</p>}

      <PlanetList planets={data} selectedPlanet={displayPlanet} onSelect={planet => setSelectedName(planet.pl_name)} />
      <PlanetViewer planet={displayPlanet} totalMatches={data.length} />
    </>
  );
}