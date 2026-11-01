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

const ORIGIN = new THREE.Vector3(0, 0, 0);

// Orquestador del mapa: guarda solo el foco (planeta y luna elegidos) y delega
// el dibujo en los componentes de esta carpeta. Todo lo demás se deriva.
export function SolarSystemMap() {
  const { positions, loading } = useJplPositions();
  const [focusedPlanet, setFocusedPlanet] = useState<string | null>(null);
  const [selectedMoon, setSelectedMoon] = useState<string | null>(null);

  const handlePlanetClick = (planetName: string) => {
    setFocusedPlanet(planetName);
    setSelectedMoon(null);
  };

  const handleResetView = () => {
    setFocusedPlanet(null);
    setSelectedMoon(null);
  };

  // Valores derivados: son búsquedas baratas sobre un array de 8 elementos,
  // por eso se calculan en cada render en vez de memoizarlas o guardarlas en estado.
  const currentPlanet = planetsData.find(p => p.name === focusedPlanet) ?? null;
  const currentMoon = currentPlanet?.moons.find(m => m.name === selectedMoon) ?? null;

  let target: { pos: THREE.Vector3; size: number } | null = null;
  if (focusedPlanet === 'Sol') target = { pos: ORIGIN, size: SUN_RADIUS };
  else if (currentPlanet && positions?.[currentPlanet.name]) target = { pos: positions[currentPlanet.name], size: currentPlanet.size };

  return (
    <div style={{ width: '100%', height: '75vh', background: '#050810', borderRadius: '12px', overflow: 'hidden', border: '1px solid #333', position: 'relative' }}>
      {loading && (
        <div role="status" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(5,8,16,0.85)', zIndex: 20, color: 'var(--accent)' }}>
          <h2>Cargando datos de NASA JPL Horizons para crear el mapa interactivo del sistema solar</h2>
        </div>
      )}

      {focusedPlanet && (
        <BodyInfoPanel
          focusedName={focusedPlanet}
          planet={currentPlanet}
          moon={currentMoon}
          selectedMoon={selectedMoon}
          onSelectMoon={setSelectedMoon}
          onReset={handleResetView}
        />
      )}

      <BodySelector focused={focusedPlanet} onSelect={handlePlanetClick} />

      <Canvas camera={{ position: [0, 180, 420], fov: 45, far: 20000 }} onPointerMissed={handleResetView}>
        <ambientLight intensity={0.45} />
        <pointLight position={[0, 0, 0]} intensity={3.5} color="#fff8e7" />
        <Stars radius={800} depth={400} count={15000} factor={6} fade />

        <CameraController
          targetPosition={target ? target.pos : null}
          targetSize={target ? target.size : 1}
          focusKey={`${focusedPlanet ?? 'home'}-${selectedMoon ?? 'none'}`}
        />

        <Sun onSelect={() => handlePlanetClick('Sol')} />

        {positions && planetsData.map(planet => (
          <PlanetBody
            key={planet.name}
            data={planet}
            position={positions[planet.name] ?? ORIGIN}
            isFocused={focusedPlanet === planet.name}
            selectedMoon={selectedMoon}
            onPlanetClick={() => handlePlanetClick(planet.name)}
            onMoonClick={setSelectedMoon}
          />
        ))}
      </Canvas>
    </div>
  );
}
