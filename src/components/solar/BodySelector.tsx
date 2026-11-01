import { planetsData } from '../../data/solarSystem';

interface BodySelectorProps {
  focused: string | null;
  onSelect: (name: string) => void;
}

// Barra inferior para saltar a cualquier astro sin tener que clicar en la escena.
export function BodySelector({ focused, onSelect }: BodySelectorProps) {
  return (
    <div style={{
      position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)',
      display: 'flex', gap: '8px', background: 'rgba(10, 14, 22, 0.85)', padding: '8px 14px',
      borderRadius: '20px', border: '1px solid #2a3546', zIndex: 15, flexWrap: 'wrap', justifyContent: 'center'
    }}>
      <button
        type="button"
        aria-pressed={focused === 'Sol'}
        onClick={() => onSelect('Sol')}
        style={{
          background: focused === 'Sol' ? '#ffcc00' : 'transparent',
          color: focused === 'Sol' ? '#000' : '#ffcc00',
          border: '1px solid #ffcc00', borderRadius: '12px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontWeight: 600
        }}
      >
        ☀ Sol
      </button>
      {planetsData.map(p => {
        const isActive = focused === p.name;
        return (
          <button
            key={p.name}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(p.name)}
            style={{
              background: isActive ? '#00d2ff' : 'transparent',
              color: isActive ? '#000' : '#ddd',
              border: `1px solid ${isActive ? '#00d2ff' : '#334155'}`,
              borderRadius: '12px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontWeight: 600
            }}
          >
            {p.name}
          </button>
        );
      })}
    </div>
  );
}
