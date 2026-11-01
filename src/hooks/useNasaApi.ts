import type { Exoplanet } from '../utils/astro-calc';
import { useFetch } from './useFetch';

const NO_RESULTS: Exoplanet[] = [];

const API_BASE = import.meta.env.DEV ? '/api/nasa' : 'https://exoplanetarchive.ipac.caltech.edu';

function buildUrl(query: string): string {
  // Normalizamos el input (ej. "Kepler-22b" -> "Kepler-22 b")
  const cleanQuery = query.toLowerCase().trim().replace(/([0-9])([a-z])/g, '$1 $2');
  
  // Escapamos SOLO la comilla simple para mantener la sintaxis SQL intacta.
  const sqlSafe = cleanQuery.replaceAll(/'/g, "''");
  
  // Consulta limpia sin la problemática cláusula ESCAPE que crashea el servidor de la NASA.
  const sql = `select pl_name,pl_rade,pl_bmasse,pl_eqt,pl_orbper,discoverymethod,disc_year,hostname,sy_dist from ps where default_flag=1 and lower(pl_name) like '%${sqlSafe}%'`;
  
  return `${API_BASE}/TAP/sync?query=${encodeURIComponent(sql)}&format=json`;
}

// Función de módulo (identidad estable) para que useFetch no relance el efecto.
function parseExoplanets(json: unknown): Exoplanet[] {
  if (!Array.isArray(json)) throw new Error('Formato inválido.');
  const unique = new Map<string, Exoplanet>();
  for (const p of json as Exoplanet[]) {
    if (p.pl_name) unique.set(p.pl_name.toLowerCase(), p);
  }
  return [...unique.values()].sort((a, b) => (a.disc_year || 0) - (b.disc_year || 0));
}

// Capa fina sobre el hook genérico useFetch
export function useNasaApi(query: string) {
  const { data, loading, error, reload } = useFetch(query ? buildUrl(query) : null, parseExoplanets);
  return { data: data ?? NO_RESULTS, loading, error, reload };
}