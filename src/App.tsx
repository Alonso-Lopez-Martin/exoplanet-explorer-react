import { useState } from 'react';
import { SearchBar } from './components/SearchBar';
import { PlanetList } from './components/PlanetList';
import { PlanetViewer } from './components/PlanetViewer';
import { useNasaApi } from './hooks/useNasaApi';
import type { Exoplanet } from './utils/astro-calc';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [userSelectedPlanet, setUserSelectedPlanet] = useState<Exoplanet | null>(null);

  const { data, loading, error } = useNasaApi(searchQuery);

  // Derivamos el planeta a mostrar durante el render[cite: 19]
  let displayPlanet = userSelectedPlanet;
  if (!userSelectedPlanet && data && data.length > 0) {
      displayPlanet = data.find(p => p.pl_name.toLowerCase() === searchQuery.toLowerCase()) || data[0];
  }

  // Cuando se hace una nueva búsqueda, limpiamos la selección del usuario
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setUserSelectedPlanet(null);
  }

  return (
    <>
      <h1>🪐 Explorador de Exoplanetas</h1>
      
      <SearchBar onSearch={handleSearch} loading={loading} />

      {error && (
        <p className="estado-mensaje error-box">
          ⚠ {error}
        </p>
      )}

      {data.length === 0 && !loading && searchQuery && !error && (
        <p className="estado-mensaje error-box">
          ⚠ No se encontraron resultados para "{searchQuery}".
        </p>
      )}

      <PlanetList 
        planets={data} 
        selectedPlanet={displayPlanet} 
        onSelect={setUserSelectedPlanet} 
      />

      <PlanetViewer 
        planet={displayPlanet} 
        totalMatches={data.length} 
      />
    </>
  );
}

export default App;