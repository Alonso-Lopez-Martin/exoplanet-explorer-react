import { useState, useMemo } from 'react';
import { SearchBar } from './components/SearchBar';
import { PlanetList } from './components/PlanetList';
import { PlanetViewer } from './components/PlanetViewer';
import { SolarSystemMap } from './components/SolarSystemMap';
import { useNasaApi } from './hooks/useNasaApi';
import type { Exoplanet } from './utils/astro-calc';
import './index.css';

export default function App() {
  const [view, setView] = useState<'home' | 'exo' | 'solar'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [userSelectedPlanet, setUserSelectedPlanet] = useState<Exoplanet | null>(null);

  const { data, loading, error } = useNasaApi(searchQuery, searchTrigger);

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

  // Ley de la Gestalt: Semejanza y Proximidad (Agrupamos título, imagen y botón)
  if (view === 'home') {
    return (
      <div className="home-container">
        <h1>Centro de Mando Astrofísico</h1>
        <div className="home-grid">
          
          <div className="module-card" onClick={() => setView('solar')}>
            <div className="module-image" style={{ backgroundImage: "url('/Jupiter_Ganymede.jpg')" }}></div>
            <h2>Dentro de nuestro Sistema Solar</h2>
            <p>Simulador 3D (Horizons JPL)</p>
          </div>

          <div className="module-card" onClick={() => setView('exo')}>
            <div className="module-image" style={{ backgroundImage: "url('/Saturn.jpg')" }}></div>
            <h2>Fuera de nuestro Sistema Solar</h2>
            <p>Explorador de Exoplanetas</p>
          </div>

        </div>
      </div>
    );
  }

  if (view === 'solar') {
    return (
      <div className="view-wrapper">
        <h1>Simulador del Sistema Solar</h1>
        <SolarSystemMap />
        {/* Botón de volver abajo */}
        <div className="navigation-footer">
           <button type="button" className="btn-secondary" onClick={() => setView('home')}>← Volver al Centro de Mando</button>
        </div>
      </div>
    );
  }

  return (
    <div className="view-wrapper">
      <h1>🪐 Explorador de Exoplanetas</h1>
      <SearchBar onSearch={handleSearch} loading={loading} />
      
      {error && <p className="estado-mensaje error-box">⚠ {error}</p>}
      {isNotFound && <p className="estado-mensaje error-box">⚠ No se encontraron resultados para "{searchQuery}".</p>}

      <PlanetList planets={data} selectedPlanet={displayPlanet} onSelect={setUserSelectedPlanet} />
      <PlanetViewer planet={displayPlanet} totalMatches={data.length} />
      
      {/* Botón de volver abajo */}
      <div className="navigation-footer">
          <button type="button" className="btn-secondary" onClick={() => setView('home')}>← Volver al Centro de Mando</button>
      </div>
    </div>
  );
}