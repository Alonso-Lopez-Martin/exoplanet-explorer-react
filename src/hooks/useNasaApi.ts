import { useState, useEffect } from 'react';
import type { Exoplanet } from '../utils/astro-calc';

export function useNasaApi(query: string) {
  const [data, setData] = useState<Exoplanet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;

    const controller = new AbortController();
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const cleanQuery = query.toLowerCase()
          .replaceAll(/centauri/gi, "cen")
          .replaceAll(/pegasi/gi, "peg")
          .replaceAll(/cancri/gi, "cnc")
          .replace(/([0-9])([a-z])/g, '$1 $2') 
          .trim();

        const sqlSafeQuery = cleanQuery
          .replaceAll(/'/g, "''")
          .replaceAll(/%/g, "\\%")
          .replaceAll(/_/g, "\\_");

        const sql = `select pl_name,pl_rade,pl_bmasse,pl_eqt,pl_orbper,discoverymethod,disc_year,hostname,sy_dist from ps where default_flag=1 and lower(pl_name) like '%${sqlSafeQuery}%' ESCAPE '\\'`;
        
        const baseUrl = import.meta.env.DEV ? '/api/nasa' : 'https://exoplanetarchive.ipac.caltech.edu';
        const url = `${baseUrl}/TAP/sync?query=${encodeURIComponent(sql)}&format=json`;

        const response = await fetch(url, { signal: controller.signal });
        
        if (!response.ok) throw new Error(`Error de la API NASA (Código: ${response.status})`);
        
        const json = await response.json();
        
        if (!Array.isArray(json)) throw new Error("Formato de respuesta inválido.");
        
        const validos = json.filter(p => p.pl_name && p.pl_name.trim() !== '');
        const mapaUnicos = new Map(validos.map(p => [p.pl_name.toLowerCase(), p]));
        const unicos = Array.from(mapaUnicos.values());
        
        const ordenados = unicos.toSorted((a, b) => (a.disc_year || 0) - (b.disc_year || 0));

        setData(ordenados);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : "Error desconocido");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, [query]);

  return { data, loading, error };
}