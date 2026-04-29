import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

const partyColors = {
  'BJP': '#FF6B35',
  'Congress': '#4A90D9',
  'AAP': '#00B4D8',
  'TMC': '#00A86B',
  'DMK': '#E63946',
  'BRS': '#F4A261',
  'SP': '#E76F51',
  'JD(U)': '#2A9D8F',
  'YSR Congress': '#9B5DE5',
  'BJD': '#F77F00',
  'Shiv Sena (UBT)': '#FF9F1C',
  'NCP (SP)': '#A8DADC',
  'JD(S)': '#457B9D',
  'JMM': '#2EC4B6',
  'NPP': '#FFBE0B',
  'NC': '#3A86FF',
  'PDP': '#8338EC',
  'SDF': '#06D6A0',
};

export default function MapChart({ stateRulings }) {
  const [selected, setSelected] = useState(null);

  const partyGroups = stateRulings.reduce((acc, s) => {
    const key = s.alliance || s.party;
    if (!acc[key]) acc[key] = { color: s.color, states: [] };
    acc[key].states.push(s.state);
    return acc;
  }, {});

  return (
    <div>
      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2.5rem', justifyContent: 'center' }}>
        {Object.entries(partyGroups).map(([alliance, { color, states }]) => (
          <div key={alliance} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--surface)', padding: '0.35rem 0.8rem', borderRadius: '999px', border: `1px solid ${color}44` }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text)' }}>{alliance}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({states.length})</span>
          </div>
        ))}
      </div>

      {/* State Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
        {stateRulings.map((stateInfo, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.03 }}
            className="card"
            onClick={() => setSelected(selected?.state === stateInfo.state ? null : stateInfo)}
            style={{
              borderLeft: `4px solid ${stateInfo.color}`,
              cursor: 'pointer',
              background: selected?.state === stateInfo.state
                ? `linear-gradient(135deg, ${stateInfo.color}22, var(--surface))`
                : 'var(--surface)',
              transition: 'all 0.2s ease',
              padding: '1rem 1.25rem',
            }}
            whileHover={{ scale: 1.02 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.4rem', color: 'var(--text)' }}>{stateInfo.state}</h3>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: stateInfo.color }}>{stateInfo.party}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{stateInfo.chiefMinister}</p>
              </div>
              <span style={{
                background: `${stateInfo.color}22`, color: stateInfo.color,
                border: `1px solid ${stateInfo.color}55`,
                padding: '0.2rem 0.5rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, flexShrink: 0
              }}>{stateInfo.alliance}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
