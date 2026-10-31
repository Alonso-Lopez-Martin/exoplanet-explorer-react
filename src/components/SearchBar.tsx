import { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading: boolean;
}

export function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input.trim());
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