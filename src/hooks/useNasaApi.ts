import { useState, useEffect } from 'react';
import type { Exoplanet } from '../utils/astro-calc';

export function useNasaApi(query: string, trigger: number) {
  const [data, setData] = useState<Exoplanet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;

    const controller = new AbortController();
    
    const fetchData = async () => {
      // Movido dentro de la función asíncrona para evitar el aviso del linter
      setLoading(true);
      setError(null);
      
      try {
        const cleanQuery = query.toLowerCase().trim().replace(/([0-9])([a-z])/g, '$1 $2');
        const sqlSafe = cleanQuery.replaceAll(/'/g, "''").replaceAll(/%/g, "\\%").replaceAll(/_/g, "\\_");
        const sql = `select pl_name,pl_rade,pl_bmasse,pl_eqt,pl_orbper,discoverymethod,disc_year,hostname,sy_dist from ps where default_flag=1 and lower(pl_name) like '%${sqlSafe}%' ESCAPE '\\'`;
        
        const url = `${import.meta.env.DEV ? '/api/nasa' : 'https://exoplanetarchive.ipac.caltech.edu'}/TAP/sync?query=${encodeURIComponent(sql)}&format=json`;
        
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const json = await response.json();
        if (!Array.isArray(json)) throw new Error("Formato inválido.");
        
        const unicos = Array.from(new Map(json.filter((p: Exoplanet) => p.pl_name).map((p: Exoplanet) => [p.pl_name.toLowerCase(), p])).values());
        setData([...unicos].sort((a, b) => (a.disc_year || 0) - (b.disc_year || 0)));
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [query, trigger]);

  return { data, loading, error };
}