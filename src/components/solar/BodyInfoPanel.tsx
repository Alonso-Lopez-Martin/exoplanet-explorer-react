import type { MoonData, PlanetData } from '../../data/solarSystem';

const SUN_TEXT = 'El Sol contiene el 99.8% de la masa de todo el Sistema Solar.';

interface BodyInfoPanelProps {
  focusedName: string;
  planet: PlanetData | null;
  moon: MoonData | null;
  selectedMoon: string | null;
  onSelectMoon: (moonName: string) => void;
  onReset: () => void;
}

export function BodyInfoPanel({ focusedName, planet, moon, selectedMoon, onSelectMoon, onReset }: BodyInfoPanelProps) {
  const kicker = moon ? `${focusedName} › Satélite` : (planet?.type ?? 'Estrella Central');
  const title = moon ? moon.name : focusedName;
  const description = moon ? moon.description : (planet?.description ?? SUN_TEXT);

  return (
    <div style={{
      position: 'absolute', top: '20px', left: '20px', width: '290px',
      background: 'rgba(12, 16, 24, 0.92)', border: '1px solid #2a3546',
      borderRadius: '10px', padding: '18px', color: '#fff', zIndex: 15,
      backdropFilter: 'blur(8px)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', textAlign: 'left'
    }}>
      <div style={{ fontSize: '11px', color: '#00d2ff', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '4px' }}>
        {kicker}
      </div>
      <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', color: '#fff' }}>{title}</h2>
      <p style={{ fontSize: '13px', lineHeight: '1.5', color: '#bdc6d4', margin: '0 0 16px 0' }}>{description}</p>

      {planet && planet.moons.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', color: '#8899aa', marginBottom: '8px', textTransform: 'uppercase' }}>
            Lunas en este sistema ({planet.moons.length}):
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {planet.moons.map(m => {
              const isActive = selectedMoon === m.name;
              return (
                <button
                  key={m.name}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => onSelectMoon(m.name)}
                  style={{
                    background: isActive ? '#ffcc00' : '#1b2230',
                    color: isActive ? '#000' : '#fff',
                    border: '1px solid #334155',
                    borderRadius: '6px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer', fontWeight: 600
                  }}
                >
                  {m.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onReset}
        style={{
          width: '100%', padding: '8px', background: 'transparent',
          border: '1px solid #00d2ff', color: '#00d2ff', borderRadius: '6px',
          cursor: 'pointer', fontSize: '12px', fontWeight: 600
        }}
      >
        ← Vista Global del Sistema Solar
      </button>
    </div>
  );
}
