import { useState, useEffect } from 'react';

// Hook genérico para persistir estado en localStorage.
// - No escribe en disco si el valor serializado ya coincide con el almacenado (evita escrituras redundantes en el montaje).
// - Escucha el evento 'storage' de window para mantener sincronizadas varias pestañas abiertas de la app.
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Sincroniza hacia localStorage solo cuando el valor cambia de verdad respecto a lo que hay guardado.
  useEffect(() => {
    try {
      const serialized = JSON.stringify(storedValue);
      if (window.localStorage.getItem(key) !== serialized) {
        window.localStorage.setItem(key, serialized);
      }
    } catch {
      // Si el navegador bloquea localStorage, el estado en memoria sigue funcionando.
    }
  }, [key, storedValue]);

  // Escucha cambios hechos en otras pestañas sobre la misma clave.
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key) return;
      try {
        setStoredValue(e.newValue !== null ? (JSON.parse(e.newValue) as T) : initialValue);
      } catch {
        setStoredValue(initialValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setStoredValue];
}