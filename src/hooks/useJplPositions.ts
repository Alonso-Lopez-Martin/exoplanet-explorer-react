import { useEffect, useState } from 'react';
import type * as THREE from 'three';
import { planetsData } from '../data/solarSystem';
import { fetchJPLPosition } from '../utils/jpl';

export interface JplPositionsState {
  positions: Record<string, THREE.Vector3> | null;
  loading: boolean;
  usingFallback: boolean;
}

// Descarga en paralelo (Promise.all) las efemérides de los 8 planetas al montar
// el mapa, sin retardos secuenciales fijos, y expone `usingFallback` para avisar
// al usuario si algún planeta tuvo que usar su órbita aproximada de reserva.
export function useJplPositions(): JplPositionsState {
  const [positions, setPositions] = useState<Record<string, THREE.Vector3> | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const results = await Promise.all(
          planetsData.map((p, i) => fetchJPLPosition(p.id, i, controller.signal))
        );
        if (controller.signal.aborted) return;

        const posMap: Record<string, THREE.Vector3> = {};
        let anyFallback = false;
        planetsData.forEach((p, i) => {
          posMap[p.name] = results[i].position;
          if (results[i].fromFallback) anyFallback = true;
        });

        setPositions(posMap);
        setUsingFallback(anyFallback);
      } catch {
        // Petición cancelada al desmontar el componente; no tocamos el estado.
      }
    })();

    return () => controller.abort();
  }, []);

  return {
    positions,
    loading: positions === null,
    usingFallback,
  };
}