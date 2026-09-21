import React from 'react';
import { ShieldCheck, Trophy, Sparkles, Coins, Gem, ArrowRightLeft } from 'lucide-react';

export const LeagueSwitcher = ({ currentLeague = 'recrue', onSwitchLeague }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      background: 'rgba(15, 23, 42, 0.85)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: '30px',
      padding: '4px',
      gap: '4px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
    }}>
      {/* Ligue Recrue (100% Gratuite / Zéro Pay-to-Win) */}
      <button
        onClick={() => onSwitchLeague('recrue')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '24px',
          border: 'none',
          cursor: 'pointer',
          background: currentLeague === 'recrue'
            ? 'linear-gradient(135deg, #059669, #10b981)'
            : 'transparent',
          color: currentLeague === 'recrue' ? '#fff' : '#94a3b8',
          fontWeight: 700,
          fontSize: '12px',
          transition: 'all 0.2s ease'
        }}
        title="100% gratuit, progression équitable basée sur les quêtes et victoires"
      >
        <ShieldCheck size={15} />
        <span>Ligue Recrue</span>
        <span style={{
          fontSize: '10px',
          padding: '2px 6px',
          borderRadius: '10px',
          background: currentLeague === 'recrue' ? 'rgba(0,0,0,0.25)' : 'rgba(16, 185, 129, 0.15)',
          color: currentLeague === 'recrue' ? '#fff' : '#10b981'
        }}>
          100% Gratuit
        </span>
      </button>

      {/* Ligue Pro (Économie Ouverte & Compétitive) */}
      <button
        onClick={() => onSwitchLeague('pro')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '24px',
          border: 'none',
          cursor: 'pointer',
          background: currentLeague === 'pro'
            ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
            : 'transparent',
          color: currentLeague === 'pro' ? '#fff' : '#94a3b8',
          fontWeight: 700,
          fontSize: '12px',
          transition: 'all 0.2s ease'
        }}
        title="Ligue compétitive, liberté totale d'échanges et boutique avancée"
      >
        <Trophy size={15} />
        <span>Ligue Pro</span>
        <span style={{
          fontSize: '10px',
          padding: '2px 6px',
          borderRadius: '10px',
          background: currentLeague === 'pro' ? 'rgba(0,0,0,0.25)' : 'rgba(168, 85, 247, 0.15)',
          color: currentLeague === 'pro' ? '#fff' : '#c084fc'
        }}>
          ⏳ Bientôt disponible
        </span>
      </button>
    </div>
  );
};
