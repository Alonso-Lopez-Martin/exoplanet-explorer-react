import { useEffect, useState } from 'react';

interface Settled<T> {
  key: string;
  data: T | null;
  error: string | null;
}

export interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

// Hook genérico de lectura JSON.
// - `url === null` significa "no pedir nada": no hay petición y data vuelve a null.
// - `parse` valida/transforma el JSON; debe tener identidad estable (función de
//   módulo) porque forma parte de las dependencias del efecto.
// - `loading` NO se guarda en estado: se deriva comparando la clave de la
//   petición actual con la de la última respuesta recibida. Así no hace falta
//   llamar a setLoading dentro del efecto y no puede quedarse colgado en true
//   si una petición se aborta justo antes de lanzar la siguiente.
// - Cada petición lleva su AbortController y el cleanup la cancela.
export function useFetch<T>(url: string | null, parse: (json: unknown) => T): FetchState<T> {
  const [settled, setSettled] = useState<Settled<T> | null>(null);
  const [reloads, setReloads] = useState(0);

  // `key` incluye tanto el contador de recargas como la propia `url`.
  // Así el efecto depende solo de `[key, parse]` sin duplicar `url` en las dependencias.
  const key = url === null ? null : `${reloads}:${url}`;

  useEffect(() => {
    if (key === null) return;

    // Extraemos la URL de la propia clave para no tener que poner `url` como dependencia redundante.
    const separatorIndex = key.indexOf(':');
    const requestUrl = key.slice(separatorIndex + 1);
    const controller = new AbortController();

    (async () => {
      try {
        const response = await fetch(requestUrl, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const rawJson: unknown = await response.json();
        if (controller.signal.aborted) return;
        const data = parse(rawJson);
        if (controller.signal.aborted) return;
        setSettled({ key, data, error: null });
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        setSettled({ key, data: null, error: err instanceof Error ? err.message : 'Error desconocido' });
      }
    })();

    return () => controller.abort();
  }, [key, parse]);

  // Solo cuenta la respuesta que corresponde a la petición actual; una anterior ya es obsoleta.
  const current = settled !== null && settled.key === key ? settled : null;

  return {
    data: current?.data ?? null,
    loading: key !== null && current === null,
    error: current?.error ?? null,
    reload: () => setReloads(n => n + 1),
  };
}