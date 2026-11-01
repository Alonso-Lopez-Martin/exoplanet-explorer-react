import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Stars, useTexture, Html } from '@react-three/drei';
import { useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

// --- INTERFACES ---
interface MoonData {
  name: string;
  size: number;
  distance: number;
  speed: number;
  texture: string;
  type: string;
}

interface PlanetData {
  id: string;
  name: string;
  size: number;
  texture: string;
  type: string;
  moons: MoonData[];
}

// --- BASE DE DATOS COMPLETA ---
const planetsData: PlanetData[] = [
  { id: '199', name: 'Mercurio', size: 0.8, texture: '/Pluto_Charon.jpg', type: 'Planeta Rocoso', moons: [] },
  { id: '299', name: 'Venus', size: 1.2, texture: '/Venus.jpg', type: 'Planeta Rocoso', moons: [] },
  { id: '399', name: 'Tierra', size: 1.3, texture: '/Neptune.jpg', type: 'Planeta Rocoso', moons: [] },
  { id: '499', name: 'Marte', size: 0.9, texture: '/Mars.jpg', type: 'Planeta Rocoso', moons: [
    { name: 'Fobos', size: 0.2, distance: 3.0, speed: 0.02, texture: '/Mars_Phobos.jpg', type: 'Satélite' }
  ]},
  { id: '599', name: 'Júpiter', size: 3.5, texture: '/Jupiter.jpg', type: 'Gigante Gaseoso', moons: [
    { name: 'Europa', size: 0.4, distance: 8, speed: 0.015, texture: '/Jupiter_Europa.jpg', type: 'Satélite Helado' },
    { name: 'Ío', size: 0.45, distance: 10, speed: 0.01, texture: '/Jupiter_Io(B).jpg', type: 'Satélite Volcánico' },
    { name: 'Ganímedes', size: 0.6, distance: 12, speed: 0.008, texture: '/Jupiter_Ganymede.jpg', type: 'Satélite' }
  ]},
  { id: '699', name: 'Saturno', size: 3.0, texture: '/Saturn.jpg', type: 'Gigante Gaseoso', moons: [
    { name: 'Titán', size: 0.6, distance: 9, speed: 0.01, texture: '/Saturn_Titan.jpg', type: 'Satélite con atmósfera' }
  ]},
  { id: '799', name: 'Urano', size: 2.0, texture: '/Neptune.jpg', type: 'Gigante de Hielo', moons: [] },
  { id: '899', name: 'Neptuno', size: 1.9, texture: '/Neptune.jpg', type: 'Gigante de Hielo', moons: [] }
];

const fallbackAU: Record<string, number> = {
  '199': 0.39, '299': 0.72, '399': 1.0, '499': 1.52, '599': 5.2, '699': 9.5, '799': 19.2, '899': 30.1
};

// --- UTILIDAD: Llamada a JPL Horizons ---
async function fetchJPLPosition(commandId: string): Promise<THREE.Vector3> {
  const SCALE = 60; 
  const dist = fallbackAU[commandId] * SCALE;
  const angle = Math.random() * Math.PI * 2;
  const fallbackPos = new THREE.Vector3(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const url = `https://ssd.jpl.nasa.gov/api/horizons.api?format=text&COMMAND='${commandId}'&OBJ_DATA='NO'&MAKE_EPHEM='YES'&EPHEM_TYPE='VECTORS'&CENTER='500@10'&START_TIME='${today}'&STOP_TIME='${tomorrow}'&STEP_SIZE='1%20d'`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) return fallbackPos;
    const text = await res.text();
    const soeIndex = text.indexOf('$$SOE');
    const eoeIndex = text.indexOf('$$EOE');
    
    if (soeIndex !== -1 && eoeIndex !== -1) {
      const dataBlock = text.substring(soeIndex, eoeIndex);
      const xMatch = dataBlock.match(/X\s*=\s*([-0-9.E+]+)/);
      const yMatch = dataBlock.match(/Y\s*=\s*([-0-9.E+]+)/);
      const zMatch = dataBlock.match(/Z\s*=\s*([-0-9.E+]+)/);
      
      if (xMatch && yMatch && zMatch) {
        return new THREE.Vector3(
          parseFloat(xMatch[1]) * SCALE, 
          parseFloat(yMatch[1]) * SCALE, 
          parseFloat(zMatch[1]) * SCALE
        );
      }
    }
  } catch {
    // Variable de error eliminada para satisfacer el linter de TypeScript
    console.warn(`Fallback usado para ${commandId}`);
  }
  return fallbackPos;
}

// --- DIBUJO DE ÓRBITAS ---
function OrbitPath({ radius, color = "#444455" }: { radius: number, color?: string }) {
  const lineObj = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, 2 * Math.PI, false, 0);
    const points = curve.getPoints(128).map(p => new THREE.Vector3(p.x, 0, p.y));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.3 });
    return new THREE.Line(geometry, material);
  }, [radius, color]);

  return <primitive object={lineObj} />;
}

// --- COMPONENTE: Luna ---
function MoonBody({ data, isSelected, onClick }: { data: MoonData, isSelected: boolean, onClick: (e: ThreeEvent<MouseEvent>) => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(data.texture);
  const angleRef = useRef(0);

  useEffect(() => {
    angleRef.current = Math.random() * Math.PI * 2;
  }, []);

  useFrame(() => {
    if (meshRef.current) {
      angleRef.current += data.speed;
      meshRef.current.position.x = Math.cos(angleRef.current) * data.distance;
      meshRef.current.position.z = Math.sin(angleRef.current) * data.distance;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group>
      <OrbitPath radius={data.distance} color="#666677" />
      <mesh ref={meshRef} onClick={onClick}>
        <sphereGeometry args={[data.size, 32, 32]} />
        <meshStandardMaterial map={texture} emissive={isSelected ? new THREE.Color(0x333333) : new THREE.Color(0x000000)} />
        {isSelected && (
          <Html position={[0, data.size + 1.0, 0]} center zIndexRange={[100, 0]}>
            <div style={{ background: 'rgba(0,0,0,0.9)', border: '1px solid #ffcc00', padding: '8px', borderRadius: '5px', color: 'white', pointerEvents: 'none', width: 'max-content' }}>
              <h4 style={{ margin: '0 0 4px 0', color: '#ffcc00', fontSize: '14px' }}>{data.name}</h4>
              <p style={{ margin: 0, fontSize: '11px' }}>{data.type}</p>
            </div>
          </Html>
        )}
      </mesh>
    </group>
  );
}

// --- COMPONENTE: Planeta ---
function PlanetBody({ data, position, isFocused, selectedMoon, onPlanetClick, onMoonClick }: 
  { data: PlanetData, position: THREE.Vector3, isFocused: boolean, selectedMoon: string | null, onPlanetClick: () => void, onMoonClick: (moonName: string) => void }) {
  
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(data.texture);
  const orbitRadius = position.length();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group>
      {/* Órbita del planeta centrada en el Sol */}
      {orbitRadius > 0 && <OrbitPath radius={orbitRadius} />}
      
      {/* Planeta trasladado a su posición real */}
      <group position={position}>
        <mesh ref={meshRef} onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onPlanetClick(); }}>
          <sphereGeometry args={[data.size, 64, 64]} />
          <meshStandardMaterial map={texture} emissive={isFocused ? new THREE.Color(0x222222) : new THREE.Color(0x000000)} />
        </mesh>
        
        {isFocused && (
          <Html position={[0, data.size + 2.0, 0]} center zIndexRange={[100, 0]}>
            <div style={{ background: 'rgba(0,0,0,0.8)', border: '1px solid #00d2ff', padding: '10px', borderRadius: '5px', color: 'white', pointerEvents: 'none', width: 'max-content' }}>
              <h3 style={{ margin: '0 0 5px 0', color: '#00d2ff' }}>{data.name}</h3>
              <p style={{ margin: 0, fontSize: '12px' }}>{data.type}</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: '#888' }}>Vectores de Estado (JPL Horizons)</p>
            </div>
          </Html>
        )}

        {isFocused && data.moons.map(moon => (
          <MoonBody 
            key={moon.name} 
            data={moon} 
            isSelected={selectedMoon === moon.name} 
            onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onMoonClick(moon.name); }} 
          />
        ))}
      </group>
    </group>
  );
}

// --- CONTROLADOR DE CÁMARA (Zoom Adaptativo) ---
function CameraController({ targetPosition, targetSize, isFocused }: { targetPosition: THREE.Vector3 | null, targetSize: number, isFocused: boolean }) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  useFrame(() => {
    if (!controlsRef.current) return;

    if (isFocused && targetPosition) {
      controlsRef.current.target.lerp(targetPosition, 0.05);
      const offset = new THREE.Vector3(
        targetPosition.x + targetSize * 3.5, 
        targetPosition.y + targetSize * 1.5, 
        targetPosition.z + targetSize * 4.5
      );
      camera.position.lerp(offset, 0.05);
    } else {
      if (controlsRef.current.target.lengthSq() > 0.1) {
        controlsRef.current.target.lerp(new THREE.Vector3(0, 0, 0), 0.05);
      }
    }
  });

  return <OrbitControls ref={controlsRef} makeDefault enableZoom={true} enablePan={true} maxDistance={6000} minDistance={2} />;
}

// --- MAPA PRINCIPAL ---
export function SolarSystemMap() {
  const [positions, setPositions] = useState<Record<string, THREE.Vector3>>({});
  const [loadingJPL, setLoadingJPL] = useState(true);
  
  const [focusedPlanet, setFocusedPlanet] = useState<string | null>(null);
  const [selectedMoon, setSelectedMoon] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function loadPositions() {
      const posMap: Record<string, THREE.Vector3> = {};
      for (const p of planetsData) {
        if (!isMounted) break;
        posMap[p.name] = await fetchJPLPosition(p.id);
        await new Promise(r => setTimeout(r, 200));
      }
      if (isMounted) {
        setPositions(posMap);
        setLoadingJPL(false);
      }
    }
    loadPositions();
    return () => { isMounted = false; };
  }, []);

  const handlePlanetClick = (planetName: string) => {
    setFocusedPlanet(planetName);
    setSelectedMoon(null);
  };

  const handleBackgroundClick = () => {
    setFocusedPlanet(null);
    setSelectedMoon(null);
  };

  const targetData = useMemo(() => {
    if (focusedPlanet === 'Sol') return { pos: new THREE.Vector3(0, 0, 0), size: 10 };
    if (focusedPlanet && positions[focusedPlanet]) {
      const planet = planetsData.find(p => p.name === focusedPlanet);
      return { pos: positions[focusedPlanet], size: planet ? planet.size : 2 };
    }
    return null;
  }, [focusedPlanet, positions]);

  return (
    <div style={{ width: '100%', height: '70vh', background: '#050810', borderRadius: '12px', overflow: 'hidden', border: '1px solid #333', position: 'relative' }}>
      
      {loadingJPL && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.8)', zIndex: 10, color: 'var(--accent)' }}>
          <h2>Cargando efemérides orbitales desde JPL Horizons...</h2>
        </div>
      )}

      <Canvas camera={{ position: [0, 150, 400], fov: 45, far: 15000 }} onClick={handleBackgroundClick}>
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 0, 0]} intensity={3} color="#fff8e7" />
        <Stars radius={600} depth={300} count={15000} factor={6} fade />
        
        <CameraController 
          targetPosition={targetData ? targetData.pos : null} 
          targetSize={targetData ? targetData.size : 1}
          isFocused={focusedPlanet !== null} 
        />
        
        <mesh position={[0, 0, 0]} onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); handlePlanetClick('Sol'); }}>
          <sphereGeometry args={[10, 64, 64]} />
          <meshBasicMaterial color="#ffcc00" />
        </mesh>

        {!loadingJPL && planetsData.map((planet) => (
          <PlanetBody 
            key={planet.name} 
            data={planet} 
            position={positions[planet.name] || new THREE.Vector3(0,0,0)}
            isFocused={focusedPlanet === planet.name}
            selectedMoon={selectedMoon}
            onPlanetClick={() => handlePlanetClick(planet.name)}
            onMoonClick={(moonName) => setSelectedMoon(moonName)}
          />
        ))}
      </Canvas>
    </div>
  );
}