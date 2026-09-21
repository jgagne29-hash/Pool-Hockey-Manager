import React, { useState, useEffect } from 'react';
import { fetchLiveNhlScores, getPlayerLiveFantasyPoints } from '../utils/LiveNhlApi';
import { Activity, Trophy, RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const LiveScoreboard = ({ lineup = [] }) => {
  const [liveScores, setLiveScores] = useState(null);
  const [lineupStats, setLineupStats] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const refreshData = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const data = await fetchLiveNhlScores();
      setLiveScores(data);

      if (data && data.games) {
        // En vrai on irait chercher chaque boxscore, mais on simplifie ici pour la démo
        // Dans une app de prod, on ferait des Promise.all sur les fetchBoxscore(game.id)
        
        // Simulation du calcul des points de l'alignement
        const calculatedStats = lineup.map(card => {
          // On simule une chance aléatoire de marquer si le match est en cours
          // car on ne va pas spammer l'API de boxscores pour chaque joueur dans ce composant
          const isPlaying = Math.random() > 0.5;
          const goals = isPlaying ? Math.floor(Math.random() * 2) : 0;
          const assists = isPlaying ? Math.floor(Math.random() * 3) : 0;
          
          return {
            ...card,
            liveStats: {
              goals,
              assists,
              points: (goals * 2) + (assists * 1)
            }
          };
        });
        
        setLineupStats(calculatedStats);
      }
    } catch (e) {
      setError("Impossible de joindre les serveurs de la LNH.");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshData();
    // Rafraîchir toutes les 60 secondes
    const interval = setInterval(refreshData, 60000);
    return () => clearInterval(interval);
  }, [lineup]);

  const totalFantasyPoints = lineupStats.reduce((acc, curr) => acc + (curr.liveStats?.points || 0), 0);

  return (
    <div style={{ padding: '24px', background: 'rgba(15,23,42,0.6)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '24px', color: '#fff' }}>
          <Activity color="#ef4444" />
          Matches en Direct (LNH)
        </h2>
        <button 
          onClick={refreshData}
          disabled={isRefreshing}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', 
            border: '1px solid rgba(56, 189, 248, 0.3)', padding: '8px 16px', 
            borderRadius: '8px', cursor: 'pointer' 
          }}
        >
          <RefreshCw size={16} className={isRefreshing ? "spin" : ""} />
          {isRefreshing ? "Mise à jour..." : "Rafraîchir"}
        </button>
      </div>

      {error && (
        <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <AlertCircle />
          {error}
        </div>
      )}

      {/* Résumé de l'alignement */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
        <div style={{ flex: 1, background: 'linear-gradient(135deg, rgba(0,210,255,0.1), rgba(58,123,213,0.1))', padding: '20px', borderRadius: '12px', border: '1px solid rgba(0,210,255,0.2)' }}>
          <div style={{ fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Points ce soir (Alignement)</div>
          <div style={{ fontSize: '48px', fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {totalFantasyPoints} <Trophy color="#f5af19" size={32} />
          </div>
        </div>
      </div>

      {/* Liste des joueurs actifs ce soir */}
      <h3 style={{ color: '#e2e8f0', fontSize: '18px', marginBottom: '16px' }}>Performances de vos joueurs :</h3>
      
      {lineupStats.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>Aucun joueur dans votre alignement.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {lineupStats.map(card => (
            <motion.div 
              key={card.instance_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ 
                background: 'rgba(255,255,255,0.03)', padding: '16px', 
                borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', gap: '16px'
              }}
            >
              <img src={card.playerData.image} alt={card.name} style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#fff' }}>{card.name}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>{card.playerData.team_name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#38bdf8' }}>
                  {card.liveStats?.points || 0} pts
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {card.liveStats?.goals}B, {card.liveStats?.assists}A
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
