import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, useTexture } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function CelestialBody({ texturePath, position, size, name }: { texturePath: string, position: [number, number, number], size: number, name: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(texturePath);

  useFrame(() => {
    if (meshRef.current) meshRef.current.rotation.y += 0.005;
  });

  return (
    <mesh ref={meshRef} position={position} name={name}>
      <sphereGeometry args={[size, 64, 64]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

export function SolarSystemMap() {
  return (
    <div style={{ width: '100vw', height: '80vh', background: 'black' }}>
      <Canvas camera={{ position: [0, 20, 50], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 0, 0]} intensity={2} color="#fff8e7" />
        <Stars radius={100} depth={50} count={5000} factor={4} fade />
        <OrbitControls enableZoom={true} enablePan={true} />
        
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[5, 32, 32]} />
          <meshBasicMaterial color="#ffcc00" />
        </mesh>

        <CelestialBody name="Jupiter" texturePath="/Jupiter.jpg" position={[20, 0, 0]} size={2.5} />
        <CelestialBody name="Europa" texturePath="/Jupiter_Europa.jpg" position={[24, 0, 2]} size={0.5} />
      </Canvas>
    </div>
  );
}