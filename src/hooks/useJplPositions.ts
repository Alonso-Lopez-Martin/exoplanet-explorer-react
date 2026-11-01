import { useEffect, useState } from 'react';
import type * as THREE from 'three';
import { planetsData } from '../data/solarSystem';
import { fetchJPLPosition } from '../utils/jpl';

// Pausa entre peticiones para no saturar la API pública de Horizons.
const DELAY_MS = 120;

function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise(resolve => {
    const id = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => { clearTimeout(id); resolve(); }, { once: true });
  });
}

// Carga las posiciones de todos los planetas. `positions` es null mientras se
// descargan (el "cargando" se deriva de ahí, sin estado extra) y las peticiones
// se cancelan con un AbortController si el mapa se desmonta.
export function useJplPositions() {
  const [positions, setPositions] = useState<Record<string, THREE.Vector3> | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      const posMap: Record<string, THREE.Vector3> = {};
      try {
        for (let i = 0; i < planetsData.length; i++) {
          const p = planetsData[i];
          posMap[p.name] = await fetchJPLPosition(p.id, i, signal);
          await wait(DELAY_MS, signal);
          if (signal.aborted) return;
        }
        setPositions(posMap);
      } catch {
        // Solo llega aquí una cancelación (fetchJPLPosition ya cubre los fallos de red).
      }
    })();

    return () => controller.abort();
  }, []);

  return { positions, loading: positions === null };
}
