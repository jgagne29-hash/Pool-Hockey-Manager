import React from 'react';
import { Shield, Users, Trash2, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { SALARY_CAP_MAX } from '../data/players';

const SLOTS = [
  { id: 'C', label: 'Centre (C)', pos: 'C' },
  { id: 'LW', label: 'Ailier Gauche (AG)', pos: 'LW' },
  { id: 'RW', label: 'Ailier Droit (AD)', pos: 'RW' },
  { id: 'D1', label: 'Défenseur 1 (D)', pos: 'D' },
  { id: 'D2', label: 'Défenseur 2 (D)', pos: 'D' },
  { id: 'G', label: 'Gardien (G)', pos: 'G' }
];

export const LineupBuilder = ({ lineup, onRemovePlayer, managerLevel = 2 }) => {
  // Calcul du plafond salarial progressif selon le niveau du gérant
  const allowedCap = managerLevel === 1 ? 65000000 : managerLevel === 2 ? 75000000 : SALARY_CAP_MAX;
  const totalCap = lineup.reduce((sum, item) => sum + item.edition.cap_hit, 0);
  const remainingCap = allowedCap - totalCap;
  const capPct = Math.min(100, (totalCap / allowedCap) * 100);
  const isOverCap = totalCap > allowedCap;

  // Calcul du multiplicateur moyen d'équipe
  const avgMultiplier = lineup.length > 0
    ? (lineup.reduce((sum, item) => sum + item.edition.multiplier, 0) / lineup.length).toFixed(2)
    : '1.00';

  return (
    <div style={{ marginBottom: '32px' }}>
      {/* Barre de Plafond Salarial */}
      <div className="salary-cap-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} color="#00d2ff" />
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
                Plafond Salarial Progressif (Niv. {managerLevel} : {(allowedCap / 1000000).toFixed(0)}M $)
              </h2>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Équité Mid-Saison : Le plafond s'élève de 65M $ à 88M $ avec vos niveaux pour une progression équitable.
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '22px', fontWeight: 900, color: isOverCap ? '#ff0055' : '#00d2ff' }}>
              {(totalCap / 1000000).toFixed(2)}M $
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}> / {(allowedCap / 1000000).toFixed(0)}M $</span>
            <div style={{ fontSize: '11px', color: isOverCap ? '#ff0055' : '#38ef7d', fontWeight: 600 }}>
              {isOverCap
                ? `⚠️ Dépassement de ${(Math.abs(remainingCap) / 1000000).toFixed(2)}M $`
                : `✅ Espace disponible : ${(remainingCap / 1000000).toFixed(2)}M $`}
            </div>
          </div>
        </div>

        {/* Jauge */}
        <div className="cap-bar-track">
          <div
            className={`cap-bar-fill ${isOverCap ? 'exceeded' : capPct > 85 ? 'warning' : 'normal'}`}
            style={{ width: `${Math.min(100, capPct)}%` }}
          />
        </div>

        {/* Indicateurs complémentaires */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', paddingTop: '4px' }}>
          <span>Postes complétés : <strong>{lineup.length} / {SLOTS.length}</strong></span>
          <span>Multiplicateur Global : <strong style={{ color: '#f5af19' }}>x{avgMultiplier}</strong></span>
        </div>
      </div>

      {/* Grille des Postes de l'Alignement */}
      <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Users size={18} color="#f5af19" />
        Mon Alignement de Départ
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px'
      }}>
        {SLOTS.map((slot, idx) => {
          const item = lineup[idx];

          if (item) {
            return (
              <div
                key={slot.id}
                style={{
                  background: 'rgba(18, 22, 32, 0.9)',
                  border: `1px solid ${item.edition.rarity === 'Epic' ? '#e94057' : item.edition.rarity === 'Rare' ? '#f5af19' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '12px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  position: 'relative'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', color: '#00d2ff', fontWeight: 700, textTransform: 'uppercase' }}>
                      {slot.label}
                    </span>
                    <button
                      onClick={() => onRemovePlayer(item.player.nhl_id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '2px'
                      }}
                      title="Retirer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#fff', marginTop: '4px' }}>
                    {item.player.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {item.player.team} • {item.edition.edition_name}
                  </div>
                </div>

                <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: '#fff', fontWeight: 700 }}>
                    {(item.edition.cap_hit / 1000000).toFixed(1)}M $
                  </span>
                  <span style={{ color: item.edition.rarity === 'Epic' ? '#e94057' : '#f5af19', fontWeight: 800 }}>
                    x{item.edition.multiplier}
                  </span>
                </div>
              </div>
            );
          }

          return (
            <div
              key={slot.id}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px dashed rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                padding: '16px 12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                minHeight: '90px'
              }}
            >
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {slot.label}
              </span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
                Emplacement vide
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
