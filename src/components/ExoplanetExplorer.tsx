import { useState } from 'react';
import { SearchBar } from './SearchBar';
import { PlanetList } from './PlanetList';
import { PlanetViewer } from './PlanetViewer';
import { useNasaApi } from '../hooks/useNasaApi';

// Vista del explorador. El estado de búsqueda vive aquí y no en App, porque
// solo esta pantalla lo usa.
//
// Estado mínimo: el texto buscado y el NOMBRE del planeta que eligió el
// usuario. El planeta mostrado, los resultados vacíos, etc. se derivan en cada
// render (no hay useMemo: son operaciones baratas sobre una lista corta).
export function ExoplanetExplorer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const { data, loading, error, reload } = useNasaApi(searchQuery);

  // Prioridad: elección manual > coincidencia exacta con lo buscado > primer resultado.
  const displayPlanet =
    data.find(p => p.pl_name === selectedName) ??
    data.find(p => p.pl_name.toLowerCase() === searchQuery.toLowerCase()) ??
    data[0] ??
    null;

  const handleSearch = (query: string) => {
    setSelectedName(null);
    // Repetir la misma búsqueda ya no necesita ningún "truco" con Date.now():
    // si el texto no cambia, el hook ofrece reload() para volver a pedir los datos.
    if (query === searchQuery) reload();
    else setSearchQuery(query);
  };

  const isNotFound: boolean = searchQuery !== '' && !loading && !error && data.length === 0;

  return (
    <>
      <SearchBar onSearch={handleSearch} loading={loading} />

      {error && <p className="estado-mensaje error-box">⚠ {error}</p>}
      {isNotFound && <p className="estado-mensaje error-box">⚠ No se encontraron resultados para "{searchQuery}".</p>}

      <PlanetList planets={data} selectedPlanet={displayPlanet} onSelect={planet => setSelectedName(planet.pl_name)} />
      <PlanetViewer planet={displayPlanet} totalMatches={data.length} />
    </>
  );
}
