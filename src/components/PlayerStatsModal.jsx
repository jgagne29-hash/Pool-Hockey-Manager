import React from 'react';
import { Drawer, Progress } from 'antd';
import { Activity, Star, Shield, Trophy, Activity as ActivityIcon } from 'lucide-react';
import { calculatePlayerOVR } from '../utils/playerRatings';
import '../styles/cards.css';

export const PlayerStatsModal = ({ player, isOpen, onClose }) => {
  if (!player) return null;

  const ovr = calculatePlayerOVR(player);
  
  // Couleurs pour OVR
  let ovrColor = '#10b981'; // Green for good
  if (ovr >= 90) ovrColor = '#8b5cf6'; // Purple/Elite
  else if (ovr >= 85) ovrColor = '#3b82f6'; // Blue
  else if (ovr < 80) ovrColor = '#f59e0b'; // Yellow/Orange
  if (player.is_injured) ovrColor = '#ef4444'; // Red for AHL callup

  const stats = player.stats || { gp: 0, g: 0, a: 0, pts: 0, plusMinus: '0' };
  
  return (
    <Drawer
      title="Profil du Joueur"
      placement="right"
      onClose={onClose}
      open={isOpen}
      width={450}
      className="player-stats-drawer"
      drawerStyle={{ background: '#0f172a', color: '#f8fafc' }}
      headerStyle={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: '#1e293b' }}
      closeIcon={<span style={{ color: '#fff' }}>✕</span>}
    >
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
        <div 
          style={{ 
            width: '100px', 
            height: '100px', 
            borderRadius: '50%', 
            overflow: 'hidden',
            border: `3px solid ${ovrColor}`,
            boxShadow: `0 0 15px ${ovrColor}40`,
            background: '#1e293b'
          }}
        >
          <img 
            src={player.image || `https://assets.nhle.com/mugs/nhl/latest/${player.nhl_id}.png`} 
            alt={player.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.1) translateY(5px)' }}
            onError={(e) => { e.target.src = 'https://assets.nhle.com/mugs/nhl/latest/8478402.png'; }} // Fallback
          />
        </div>
        
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0', color: '#fff' }}>
            {player.name}
          </h2>
          <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px', fontWeight: '600' }}>
            {player.team} • {player.position} • #{player.number}
          </div>
          
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginTop: '8px',
            background: `${ovrColor}20`,
            padding: '4px 10px',
            borderRadius: '12px',
            border: `1px solid ${ovrColor}40`
          }}>
            <span style={{ color: ovrColor, fontWeight: '900', fontSize: '18px' }}>{ovr}</span>
            <span style={{ color: ovrColor, fontWeight: '700', fontSize: '12px', textTransform: 'uppercase' }}>OVR Overall</span>
          </div>
        </div>
      </div>

      {/* Profil de Carrière & Stats */}
      <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: '#cbd5e1', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Activity size={16} /> Statistiques Saison (Proj. EA)
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 8px', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>GP</div>
            <div style={{ fontSize: '18px', color: '#fff', fontWeight: '900' }}>{stats.gp}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 8px', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>G</div>
            <div style={{ fontSize: '18px', color: '#fff', fontWeight: '900' }}>{stats.g}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 8px', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>A</div>
            <div style={{ fontSize: '18px', color: '#fff', fontWeight: '900' }}>{stats.a}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 8px', borderRadius: '8px', borderBottom: '2px solid #3b82f6' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>PTS</div>
            <div style={{ fontSize: '20px', color: '#fff', fontWeight: '900' }}>{stats.pts}</div>
          </div>
        </div>
      </div>
      
      {player.is_injured && (
        <div style={{ marginTop: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '12px', color: '#ef4444', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
          <ActivityIcon size={16} /> 
          Statut : Blessé (DTD/IR) — Remplacé par une cote AHL (72 OVR).
        </div>
      )}
    </Drawer>
  );
};
