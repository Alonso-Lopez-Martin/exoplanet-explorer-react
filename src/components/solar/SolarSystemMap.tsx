import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { useState } from 'react';
import * as THREE from 'three';
import { planetsData } from '../../data/solarSystem';
import { useJplPositions } from '../../hooks/useJplPositions';
import { CameraController } from './CameraController';
import { PlanetBody } from './PlanetBody';
import { Sun, SUN_RADIUS } from './Sun';
import { BodyInfoPanel } from './BodyInfoPanel';
import { BodySelector } from './BodySelector';
import { SolarLoadingOverlay } from './SolarLoadingOverlay';

const ORIGIN = new THREE.Vector3(0, 0, 0);

interface FocusState {
  planet: string | null;
  moon: string | null;
}

const INITIAL_FOCUS: FocusState = { planet: null, moon: null };

// Orquestador del mapa: guarda el foco en un único estado { planet, moon } para
// no tener que resetear `selectedMoon` a mano en varios handlers, y delega el
// dibujo en los componentes de esta carpeta. Todo lo demás se deriva.
export function SolarSystemMap() {
  const { positions, loading, usingFallback } = useJplPositions();
  const [focus, setFocus] = useState<FocusState>(INITIAL_FOCUS);

  const handlePlanetClick = (planetName: string) => {
    setFocus({ planet: planetName, moon: null });
  };

  const handleMoonClick = (moonName: string) => {
    setFocus(prev => ({ ...prev, moon: moonName }));
  };

  const handleResetView = () => {
    setFocus(INITIAL_FOCUS);
  };

  // Valores derivados: son búsquedas baratas sobre un array de 8 elementos,
  // por eso se calculan en cada render en vez de memoizarlas o guardarlas en estado.
  const currentPlanet = planetsData.find(p => p.name === focus.planet) ?? null;
  const currentMoon = currentPlanet?.moons.find(m => m.name === focus.moon) ?? null;

  let targetCoords: [number, number, number] | null = null;
  let targetSize = 1;

  if (focus.planet === 'Sol') {
    targetCoords = [0, 0, 0];
    targetSize = SUN_RADIUS;
  } else if (currentPlanet && positions?.[currentPlanet.name]) {
    const pos = positions[currentPlanet.name];
    targetCoords = [pos.x, pos.y, pos.z];
    targetSize = currentPlanet.size;
  }

  return (
    <div className="solar-map-container">
      {loading && <SolarLoadingOverlay />}

      {!loading && usingFallback && (
        <div role="status" className="solar-fallback-banner">
          ℹ Efemérides en vivo no disponibles temporalmente; mostrando posiciones orbitales aproximadas.
        </div>
      )}

      {focus.planet && (
        <BodyInfoPanel
          focusedName={focus.planet}
          planet={currentPlanet}
          moon={currentMoon}
          selectedMoon={focus.moon}
          onSelectMoon={handleMoonClick}
          onReset={handleResetView}
        />
      )}

      <BodySelector focused={focus.planet} onSelect={handlePlanetClick} />

      <Canvas camera={{ position: [0, 180, 420], fov: 45, far: 20000 }} onPointerMissed={handleResetView}>
        <ambientLight intensity={0.45} />
        <pointLight position={[0, 0, 0]} intensity={3.5} color="#fff8e7" />
        <Stars radius={800} depth={400} count={15000} factor={6} fade />

        <CameraController
          targetCoords={targetCoords}
          targetSize={targetSize}
          focusKey={`${focus.planet ?? 'home'}-${focus.moon ?? 'none'}`}
        />

        <Sun onSelect={() => handlePlanetClick('Sol')} />

        {positions && planetsData.map(planet => (
          <PlanetBody
            key={planet.name}
            data={planet}
            position={positions[planet.name] ?? ORIGIN}
            isFocused={focus.planet === planet.name}
            selectedMoon={focus.moon}
            onPlanetClick={() => handlePlanetClick(planet.name)}
            onMoonClick={handleMoonClick}
          />
        ))}
      </Canvas>
    </div>
  );
}