import { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
  loading: boolean;
}

// SearchBar mantiene su propio estado `draft` para el texto que el usuario está
// tecleando. Es deliberado: si compartiera directamente `searchQuery` del padre,
// cada tecla pulsada dispararía una petición HTTP al servidor TAP de la NASA.
// Así disparamos la búsqueda únicamente al hacer submit del formulario.
export function SearchBar({ initialQuery = '', onSearch, loading }: SearchBarProps) {
  const [input, setInput] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed) {
      onSearch(trimmed);
    }
  };

  return (
    <form className="search-panel" onSubmit={handleSubmit}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ej: Kepler-22 b, TRAPPIST-1..."
        disabled={loading}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Escaneando...' : <><Search size={18} style={{marginRight: '8px', verticalAlign: 'middle'}}/> Buscar</>}
      </button>
      <a href="https://science.nasa.gov/exoplanet-catalog/" target="_blank" rel="noreferrer" className="btn-secondary">
        Catálogo de la NASA
      </a>
    </form>
  );
}