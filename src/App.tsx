import { useState, useMemo } from 'react';
import { SearchBar } from './components/SearchBar';
import { PlanetList } from './components/PlanetList';
import { PlanetViewer } from './components/PlanetViewer';
import { SolarSystemMap } from './components/SolarSystemMap';
import { useNasaApi } from './hooks/useNasaApi';
import type { Exoplanet } from './utils/astro-calc';

export default function App() {
  const [view, setView] = useState<'home' | 'exo' | 'solar'>('home');
  
  // El trigger fuerza la recarga aunque la búsqueda sea idéntica
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [userSelectedPlanet, setUserSelectedPlanet] = useState<Exoplanet | null>(null);

  const { data, loading, error } = useNasaApi(searchQuery, searchTrigger);

  // Derivación inmutable y limpia
  const displayPlanet = useMemo(() => {
    if (userSelectedPlanet) return userSelectedPlanet;
    if (data && data.length > 0) {
      return data.find(p => p.pl_name.toLowerCase() === searchQuery.toLowerCase()) || data[0];
    }
    return null;
  }, [userSelectedPlanet, data, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSearchTrigger(Date.now());
    setUserSelectedPlanet(null);
  };

  const isNotFound = data.length === 0 && !loading && searchQuery && !error;

  if (view === 'home') {
    return (
      <div className="home-container">
        <h1>Centro de Mando Astrofísico</h1>
        <div className="home-grid">
          <button type="button" className="nav-btn" onClick={() => setView('solar')}>
             Dentro de nuestro Sistema Solar (Horizons 3D)
          </button>
          <button type="button" className="nav-btn" onClick={() => setView('exo')}>
             Fuera de nuestro Sistema Solar (Exoplanetas)
          </button>
        </div>
      </div>
    );
  }

  if (view === 'solar') {
    return (
      <>
        <button type="button" className="back-btn" onClick={() => setView('home')}>← Volver</button>
        <SolarSystemMap />
      </>
    );
  }

  return (
    <>
      <button type="button" className="back-btn" onClick={() => setView('home')}>← Volver</button>
      <h1>🪐 Explorador de Exoplanetas</h1>
      <SearchBar onSearch={handleSearch} loading={loading} />
      
      {error && <p className="estado-mensaje error-box">⚠ {error}</p>}
      {isNotFound && <p className="estado-mensaje error-box">⚠ No se encontraron resultados para "{searchQuery}".</p>}

      <PlanetList planets={data} selectedPlanet={displayPlanet} onSelect={setUserSelectedPlanet} />
      <PlanetViewer planet={displayPlanet} totalMatches={data.length} />
    </>
  );
}