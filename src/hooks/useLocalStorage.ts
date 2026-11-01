import { useState, useEffect } from 'react';

// Hook genérico para persistir estado en localStorage.
// Lo usamos en el explorador para recordar la última búsqueda del usuario
// aunque cambie de vista (al mapa 3D o a la home) o recargue la pestaña.
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      // Si el navegador bloquea localStorage (modo privado estricto o cuota llena),
      // el estado en memoria sigue funcionando sin romper la app.
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}