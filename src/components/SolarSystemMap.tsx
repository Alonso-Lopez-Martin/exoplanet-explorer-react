import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Stars, useTexture, Html } from '@react-three/drei';
import { useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface MoonData {
  name: string;
  size: number;
  distance: number;
  speed: number;
  texture: string;
  type: string;
  description: string;
}

interface PlanetData {
  id: string;
  name: string;
  size: number;
  texture: string;
  type: string;
  color: string;
  description: string;
  moons: MoonData[];
}

const planetsData: PlanetData[] = [
  { 
    id: '199', name: 'Mercurio', size: 2.4, texture: '/Pluto_Charon.jpg', type: 'Planeta Rocoso', color: '#a8a8a8',
    description: 'El planeta más cercano al Sol y el más pequeño del sistema solar interior.',
    moons: [] 
  },
  { 
    id: '299', name: 'Venus', size: 3.5, texture: '/Venus.jpg', type: 'Planeta Rocoso', color: '#e3bb76',
    description: 'Un mundo abrasador cubierto por una densa atmósfera con efecto invernadero extremo.',
    moons: [] 
  },
  { 
    id: '399', name: 'Tierra', size: 3.8, texture: '/Earth.jpg', type: 'Planeta Rocoso', color: '#00d2ff',
    description: 'Nuestro hogar, el único mundo conocido con océanos de agua líquida en la superficie y vida.',
    moons: [
      { name: 'Luna', size: 0.9, distance: 8, speed: 0.01, texture: '/Pluto_Charon.jpg', type: 'Satélite Natural', description: 'El único satélite natural de la Tierra.' }
    ] 
  },
  { 
    id: '499', name: 'Marte', size: 2.8, texture: '/Mars.jpg', type: 'Planeta Rocoso', color: '#ff5733',
    description: 'El Planeta Rojo, hogar del Monte Olimpo y antiguos lechos fluviales secos.',
    moons: [
      { name: 'Fobos', size: 0.5, distance: 6.0, speed: 0.02, texture: '/Mars_Phobos.jpg', type: 'Satélite Irregular', description: 'La mayor y más cercana de las dos lunas de Marte.' },
      { name: 'Deimos', size: 0.3, distance: 8.5, speed: 0.015, texture: '/Mars_Deimos.jpg', type: 'Satélite Pequeño', description: 'La más pequeña y externa de las lunas marcianas.' }
    ]
  },
  { 
    id: '599', name: 'Júpiter', size: 8.5, texture: '/Jupiter.jpg', type: 'Gigante Gaseoso', color: '#d4a373',
    description: 'El planeta más grande del sistema solar, más del doble de masivo que todos los demás juntos.',
    moons: [
      { name: 'Ío', size: 1.0, distance: 14, speed: 0.018, texture: '/Jupiter_Io(B).jpg', type: 'Satélite Volcánico', description: 'El cuerpo con mayor actividad volcánica del sistema solar.' },
      { name: 'Europa', size: 0.9, distance: 18, speed: 0.014, texture: '/Jupiter_Europa.jpg', type: 'Satélite Helado', description: 'Alberga un vasto océano de agua salada bajo su corteza de hielo.' },
      { name: 'Ganímedes', size: 1.4, distance: 23, speed: 0.01, texture: '/Jupiter_Ganymede.jpg', type: 'Satélite', description: 'La luna más grande del sistema solar, incluso mayor que Mercurio.' },
      { name: 'Calisto', size: 1.2, distance: 28, speed: 0.007, texture: '/Jupiter_Callisto.jpg', type: 'Satélite Craterizado', description: 'Uno de los paisajes con más cráteres y antiguos del sistema solar.' }
    ]
  },
  { 
    id: '699', name: 'Saturno', size: 7.2, texture: '/Saturn.jpg', type: 'Gigante Gaseoso', color: '#f4d58d',
    description: 'Rodeado por un complejo sistema de anillos de hielo y roca, y decenas de lunas.',
    moons: [
      { name: 'Titán', size: 1.3, distance: 15, speed: 0.01, texture: '/Saturn_Titan.jpg', type: 'Satélite con atmósfera', description: 'La única luna con una atmósfera densa y lagos de metano líquido.' },
      { name: 'Dione', size: 0.6, distance: 19, speed: 0.012, texture: '/Saturn_Dione.jpg', type: 'Satélite Helado', description: 'Luna interior de Saturno con grandes acantilados de hielo.' },
      { name: 'Encélado', size: 0.5, distance: 22, speed: 0.015, texture: '/Saturn_Enceladus.jpg', type: 'Satélite Activo', description: 'Emite géiseres de agua al espacio desde su polo sur.' },
      { name: 'Jápeto', size: 0.7, distance: 25, speed: 0.008, texture: '/Saturn_Lapetus.jpg', type: 'Satélite Bicolor', description: 'Famoso por su llamativa coloración en dos tonos contrastados.' },
      { name: 'Mimas', size: 0.4, distance: 12, speed: 0.018, texture: '/Saturn_Mimas.jpg', type: 'Satélite Craterizado', description: 'Destaca por el gigantesco cráter Herschel que le da aspecto similar a la Estrella de la Muerte.' },
      { name: 'Rea', size: 0.8, distance: 28, speed: 0.007, texture: '/Saturn_Rhea.jpg', type: 'Satélite Helado', description: 'La segunda luna más grande de Saturno con tenue atmósfera de oxígeno.' },
      { name: 'Tetis', size: 0.65, distance: 16, speed: 0.013, texture: '/Saturn_Tethys.jpg', type: 'Satélite Helado', description: 'Posee un enorme cañón llamado Ithaca Chasma.' }
    ]
  },
  { 
    id: '799', name: 'Urano', size: 5.0, texture: '/Neptune.jpg', type: 'Gigante de Hielo', color: '#73d2de',
    description: 'Un gigante de hielo único que rota prácticamente de lado respecto a su plano orbital.',
    moons: [
      { name: 'Ariel', size: 0.5, distance: 12, speed: 0.014, texture: '/Uranus_Ariel.jpg', type: 'Satélite', description: 'La más brillante y joven de las lunas de Urano.' },
      { name: 'Miranda', size: 0.4, distance: 10, speed: 0.018, texture: '/Uranus_Miranda.jpg', type: 'Satélite Geológico', description: 'Posee cañones y acantilados extremos de hasta 20 km de altura.' },
      { name: 'Oberón', size: 0.6, distance: 20, speed: 0.008, texture: '/Uranus_Oberon.jpg', type: 'Satélite Exterior', description: 'La segunda luna más grande de Urano, muy craterizada.' },
      { name: 'Titania', size: 0.65, distance: 16, speed: 0.01, texture: '/Uranus_Titania.jpg', type: 'Satélite Mayor', description: 'La mayor de las lunas de Urano.' },
      { name: 'Umbriel', size: 0.55, distance: 14, speed: 0.012, texture: '/Uranus_Umbriel.jpg', type: 'Satélite Oscuro', description: 'La más oscura de las grandes lunas uranianas.' }
    ] 
  },
  { 
    id: '899', name: 'Neptuno', size: 4.8, texture: '/Neptune.jpg', type: 'Gigante de Hielo', color: '#4361ee',
    description: 'El planeta más lejano, oscuro, frío y azotado por vientos supersónicos.',
    moons: [] 
  }
];

const fallbackAU: Record<string, number> = {
  '199': 0.39, '299': 0.72, '399': 1.0, '499': 1.52, '599': 5.2, '699': 9.5, '799': 19.2, '899': 30.1
};

async function fetchJPLPosition(commandId: string, index: number): Promise<THREE.Vector3> {
  const SCALE = 75; 
  const dist = fallbackAU[commandId] * SCALE;
  const fallbackAngle = (index * 1.1) + 0.5;
  const fallbackPos = new THREE.Vector3(Math.cos(fallbackAngle) * dist, 0, Math.sin(fallbackAngle) * dist);

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
          parseFloat(zMatch[1]) * SCALE, 
          -parseFloat(yMatch[1]) * SCALE
        );
      }
    }
  } catch {
    console.warn(`Fallback orbital usado para ${commandId}`);
  }
  return fallbackPos;
}

function OrbitPath({ radius, color = "#444455", opacity = 0.35 }: { radius: number, color?: string, opacity?: number }) {
  const lineObj = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, 2 * Math.PI, false, 0);
    const points = curve.getPoints(180).map(p => new THREE.Vector3(p.x, 0, p.y));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
    return new THREE.Line(geometry, material);
  }, [radius, color, opacity]);

  return <primitive object={lineObj} />;
}

function MoonBody({ data, isSelected, onSelect }: { data: MoonData, isSelected: boolean, onSelect: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(data.texture);
  const angleRef = useRef(0);

  useEffect(() => {
    angleRef.current = (data.distance * 1.7) % (Math.PI * 2);
  }, [data.distance]);

  useFrame(() => {
    if (!isSelected && groupRef.current) {
      angleRef.current += data.speed * 0.3;
      groupRef.current.position.x = Math.cos(angleRef.current) * data.distance;
      groupRef.current.position.z = Math.sin(angleRef.current) * data.distance;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group>
      <OrbitPath radius={data.distance} color="#8899aa" opacity={0.4} />
      <group ref={groupRef} position={[data.distance, 0, 0]}>
        <mesh 
          ref={meshRef} 
          onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(); }}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        >
          <sphereGeometry args={[data.size, 32, 32]} />
          <meshStandardMaterial map={texture} emissive={isSelected ? new THREE.Color(0x333333) : new THREE.Color(0x000000)} />
        </mesh>

        <Html position={[0, data.size + 0.8, 0]} center zIndexRange={[100, 0]}>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            style={{
              background: isSelected ? 'rgba(255, 204, 0, 0.25)' : 'rgba(5, 8, 16, 0.75)',
              border: isSelected ? '1px solid #ffcc00' : '1px solid rgba(255,255,255,0.3)',
              color: isSelected ? '#ffcc00' : '#ddd',
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '11px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit'
            }}
          >
            {data.name.toUpperCase()}
          </button>
        </Html>
      </group>
    </group>
  );
}

function PlanetBody({ data, position, isFocused, selectedMoon, onPlanetClick, onMoonClick }: 
  { data: PlanetData, position: THREE.Vector3, isFocused: boolean, selectedMoon: string | null, onPlanetClick: () => void, onMoonClick: (moonName: string) => void }) {
  
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(data.texture);
  const orbitRadius = Math.hypot(position.x, position.z);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group>
      {orbitRadius > 0 && <OrbitPath radius={orbitRadius} color={data.color} opacity={isFocused ? 0.65 : 0.35} />}
      
      <group position={position}>
        <mesh 
          ref={meshRef} 
          onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onPlanetClick(); }}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        >
          <sphereGeometry args={[data.size, 64, 64]} />
          <meshStandardMaterial map={texture} emissive={isFocused ? new THREE.Color(0x181818) : new THREE.Color(0x050505)} />
        </mesh>
        
        <Html position={[0, data.size + 1.8, 0]} center zIndexRange={[90, 0]}>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onPlanetClick(); }}
            style={{
              background: isFocused ? 'rgba(0, 210, 255, 0.25)' : 'rgba(5, 8, 16, 0.75)',
              border: `1px solid ${isFocused ? '#00d2ff' : data.color}`,
              color: '#fff',
              padding: '4px 10px',
              borderRadius: '14px',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '1px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 10px rgba(0,0,0,0.6)'
            }}
          >
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: data.color, display: 'inline-block' }} />
            {data.name.toUpperCase()}
          </button>
        </Html>

        {isFocused && data.moons.map(moon => (
          <MoonBody 
            key={moon.name} 
            data={moon} 
            isSelected={selectedMoon === moon.name} 
            onSelect={() => onMoonClick(moon.name)} 
          />
        ))}
      </group>
    </group>
  );
}

function CameraController({ targetPosition, targetSize, focusKey }: { targetPosition: THREE.Vector3 | null, targetSize: number, focusKey: string }) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const isTransitioning = useRef(false);
  const desiredCameraPos = useRef(new THREE.Vector3(0, 180, 420));
  const desiredTarget = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    isTransitioning.current = true;
    if (targetPosition) {
      desiredTarget.current.copy(targetPosition);
      const dist = Math.max(targetSize * 4.2, 12);
      desiredCameraPos.current.set(
        targetPosition.x + dist * 0.8,
        targetPosition.y + dist * 0.45,
        targetPosition.z + dist
      );
    } else {
      desiredTarget.current.set(0, 0, 0);
      desiredCameraPos.current.set(0, 180, 420);
    }
  }, [focusKey, targetPosition, targetSize]);

  useFrame(() => {
    if (!controlsRef.current || !isTransitioning.current) return;

    controlsRef.current.target.lerp(desiredTarget.current, 0.08);
    camera.position.lerp(desiredCameraPos.current, 0.08);
    controlsRef.current.update();

    if (camera.position.distanceTo(desiredCameraPos.current) < 0.8) {
      isTransitioning.current = false;
    }
  });

  return (
    <OrbitControls 
      ref={controlsRef} 
      makeDefault 
      enableZoom={true} 
      enablePan={true} 
      maxDistance={5000} 
      minDistance={3}
      onStart={() => { isTransitioning.current = false; }}
    />
  );
}

export function SolarSystemMap() {
  const [positions, setPositions] = useState<Record<string, THREE.Vector3>>({});
  const [loadingJPL, setLoadingJPL] = useState(true);
  
  const [focusedPlanet, setFocusedPlanet] = useState<string | null>(null);
  const [selectedMoon, setSelectedMoon] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function loadPositions() {
      const posMap: Record<string, THREE.Vector3> = {};
      for (let i = 0; i < planetsData.length; i++) {
        if (!isMounted) break;
        const p = planetsData[i];
        posMap[p.name] = await fetchJPLPosition(p.id, i);
        await new Promise(r => setTimeout(r, 120));
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

  const handleResetView = () => {
    setFocusedPlanet(null);
    setSelectedMoon(null);
  };

  const currentPlanetObj = useMemo(() => planetsData.find(p => p.name === focusedPlanet) || null, [focusedPlanet]);
  const currentMoonObj = useMemo(() => currentPlanetObj?.moons.find(m => m.name === selectedMoon) || null, [currentPlanetObj, selectedMoon]);

  const targetData = useMemo(() => {
    if (focusedPlanet === 'Sol') return { pos: new THREE.Vector3(0, 0, 0), size: 14 };
    if (focusedPlanet && positions[focusedPlanet]) {
      const basePos = positions[focusedPlanet];
      const planet = planetsData.find(p => p.name === focusedPlanet);
      return { pos: basePos, size: planet ? planet.size : 4 };
    }
    return null;
  }, [focusedPlanet, positions]);

  return (
    <div style={{ width: '100%', height: '75vh', background: '#050810', borderRadius: '12px', overflow: 'hidden', border: '1px solid #333', position: 'relative' }}>
      
      {loadingJPL && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(5,8,16,0.85)', zIndex: 20, color: 'var(--accent)' }}>
          <h2>Cargando datos de NASA JPL Horizons para crear el mapa interactivo del sistema solar</h2>
        </div>
      )}

      {focusedPlanet && (
        <div style={{
          position: 'absolute', top: '20px', left: '20px', width: '290px',
          background: 'rgba(12, 16, 24, 0.92)', border: '1px solid #2a3546',
          borderRadius: '10px', padding: '18px', color: '#fff', zIndex: 15,
          backdropFilter: 'blur(8px)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', textAlign: 'left'
        }}>
          <div style={{ fontSize: '11px', color: '#00d2ff', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '4px' }}>
            {currentMoonObj ? `${focusedPlanet} › Satélite` : (currentPlanetObj?.type || 'Estrella Central')}
          </div>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', color: '#fff' }}>
            {currentMoonObj ? currentMoonObj.name : focusedPlanet}
          </h2>
          <p style={{ fontSize: '13px', lineHeight: '1.5', color: '#bdc6d4', margin: '0 0 16px 0' }}>
            {currentMoonObj 
              ? currentMoonObj.description 
              : (currentPlanetObj?.description || 'El Sol contiene el 99.8% de la masa de todo el Sistema Solar.')}
          </p>

          {currentPlanetObj && currentPlanetObj.moons.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: '#8899aa', marginBottom: '8px', textTransform: 'uppercase' }}>
                Lunas en este sistema ({currentPlanetObj.moons.length}):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {currentPlanetObj.moons.map(m => (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => setSelectedMoon(m.name)}
                    style={{
                      background: selectedMoon === m.name ? '#ffcc00' : '#1b2230',
                      color: selectedMoon === m.name ? '#000' : '#fff',
                      border: '1px solid #334155',
                      borderRadius: '6px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer', fontWeight: 600
                    }}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleResetView}
            style={{
              width: '100%', padding: '8px', background: 'transparent',
              border: '1px solid #00d2ff', color: '#00d2ff', borderRadius: '6px',
              cursor: 'pointer', fontSize: '12px', fontWeight: 600
            }}
          >
            ← Vista Global del Sistema Solar
          </button>
        </div>
      )}

      <div style={{
        position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: '8px', background: 'rgba(10, 14, 22, 0.85)', padding: '8px 14px',
        borderRadius: '20px', border: '1px solid #2a3546', zIndex: 15, flexWrap: 'wrap', justifyContent: 'center'
      }}>
        <button
          type="button"
          onClick={() => handlePlanetClick('Sol')}
          style={{
            background: focusedPlanet === 'Sol' ? '#ffcc00' : 'transparent',
            color: focusedPlanet === 'Sol' ? '#000' : '#ffcc00',
            border: '1px solid #ffcc00', borderRadius: '12px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontWeight: 600
          }}
        >
          ☀ Sol
        </button>
        {planetsData.map(p => (
          <button
            key={p.name}
            type="button"
            onClick={() => handlePlanetClick(p.name)}
            style={{
              background: focusedPlanet === p.name ? '#00d2ff' : 'transparent',
              color: focusedPlanet === p.name ? '#000' : '#ddd',
              border: `1px solid ${focusedPlanet === p.name ? '#00d2ff' : '#334155'}`,
              borderRadius: '12px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontWeight: 600
            }}
          >
            {p.name}
          </button>
        ))}
      </div>

      <Canvas camera={{ position: [0, 180, 420], fov: 45, far: 20000 }} onPointerMissed={handleResetView}>
        <ambientLight intensity={0.45} />
        <pointLight position={[0, 0, 0]} intensity={3.5} color="#fff8e7" />
        <Stars radius={800} depth={400} count={15000} factor={6} fade />
        
        <CameraController 
          targetPosition={targetData ? targetData.pos : null} 
          targetSize={targetData ? targetData.size : 1}
          focusKey={`${focusedPlanet || 'home'}-${selectedMoon || 'none'}`} 
        />
        
        <group position={[0, 0, 0]}>
          <mesh 
            onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); handlePlanetClick('Sol'); }}
            onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { document.body.style.cursor = 'auto'; }}
          >
            <sphereGeometry args={[14, 64, 64]} />
            <meshBasicMaterial color="#ffcc00" />
          </mesh>
          <Html position={[0, 17, 0]} center zIndexRange={[90, 0]}>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handlePlanetClick('Sol'); }}
              style={{
                background: 'rgba(5, 8, 16, 0.75)', border: '1px solid #ffcc00', color: '#ffcc00',
                padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, cursor: 'pointer'
              }}
            >
              SOL
            </button>
          </Html>
        </group>

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