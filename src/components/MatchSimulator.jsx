import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Play, Sparkles, Award, RefreshCw, Trophy } from 'lucide-react';

export const MatchSimulator = ({ lineup }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [matchResults, setMatchResults] = useState(null);

  const handleSimulate = () => {
    if (lineup.length === 0) {
      alert("Veuillez ajouter au moins un joueur à votre alignement avant de simuler un match !");
      return;
    }

    setIsSimulating(true);
    setMatchResults(null);

    // Simulation de 1.5 seconde avec suspense
    setTimeout(() => {
      let totalBasePoints = 0;
      let totalBonusPoints = 0;

      const playerPerformances = lineup.map(item => {
        const isGoalie = item.player.position === 'G';
        let basePts = 0;
        let event = '';

        if (isGoalie) {
          const win = Math.random() > 0.35;
          const shutout = win && Math.random() > 0.8;
          const saves = Math.floor(25 + Math.random() * 15);
          basePts = (win ? 2 : 0) + (shutout ? 3 : 0) + (saves > 35 ? 1 : 0);
          event = shutout ? `Blanchissage! (${saves} arrêts)` : win ? `Victoire (${saves} arrêts)` : `Défaite courageuse (${saves} arrêts)`;
        } else {
          const goals = Math.random() > 0.55 ? Math.floor(Math.random() * 3) + 1 : 0;
          const assists = Math.random() > 0.45 ? Math.floor(Math.random() * 3) + 1 : 0;
          basePts = goals * 2 + assists * 1;
          event = goals > 0 ? `${goals} But(s) & ${assists} Passe(s)` : assists > 0 ? `${assists} Passe(s)` : '0 pt, bonne présence physique';
        }

        const multipliedPts = Math.round(basePts * item.edition.multiplier * 10) / 10;
        totalBasePoints += basePts;
        totalBonusPoints += multipliedPts;

        return {
          player: item.player,
          edition: item.edition,
          basePts,
          multipliedPts,
          event
        };
      });

      setMatchResults({
        totalBasePoints,
        totalBonusPoints,
        bonusGain: (totalBonusPoints - totalBasePoints).toFixed(1),
        playerPerformances
      });

      if (onMatchFinished) {
        onMatchFinished(Math.round(totalBonusPoints));
      }

      setIsSimulating(false);

      // Lance des confettis holographiques pour célébrer la soirée de match !
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00d2ff', '#f5af19', '#e94057', '#ffffff']
      });
    }, 1200);
  };

  return (
    <div style={{
      background: 'rgba(18, 22, 32, 0.9)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '32px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={22} color="#f5af19" />
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>
              Simulateur de Soirée de Matchs LNH
            </h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Testez l'impact de vos multiplicateurs d'éditions (x1.0, x1.2, x1.5) sur une ronde de matchs en direct !
          </p>
        </div>

        <button
          onClick={handleSimulate}
          disabled={isSimulating || lineup.length === 0}
          style={{
            background: isSimulating ? '#475569' : 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            padding: '12px 24px',
            fontWeight: 800,
            fontSize: '14px',
            cursor: lineup.length === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 6px 20px rgba(245, 175, 25, 0.4)',
            transition: 'all 0.2s'
          }}
        >
          {isSimulating ? (
            <>
              <RefreshCw size={16} className="animate-spin" /> Simulation en cours...
            </>
          ) : (
            <>
              <Play size={16} /> Lancer la Soirée LNH
            </>
          )}
        </button>
      </div>

      {/* Résultats de simulation */}
      {matchResults && (
        <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            background: 'rgba(0,0,0,0.4)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Points de Base</div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff' }}>{matchResults.totalBasePoints} pts</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#f5af19' }}>Bonus Cartes Étoiles/Épiques</div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#f5af19' }}>+{matchResults.bonusGain} pts</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#00d2ff' }}>Score Final Pooler</div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#00d2ff' }}>{matchResults.totalBonusPoints.toFixed(1)} pts</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {matchResults.playerPerformances.map((perf, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '10px',
                  padding: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#fff' }}>
                    {perf.player.name} <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>({perf.player.team})</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#38ef7d', marginTop: '2px' }}>
                    {perf.event}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: '15px', color: '#00d2ff' }}>
                    {perf.multipliedPts} pts
                  </div>
                  <div style={{ fontSize: '10px', color: perf.edition.rarity === 'Epic' ? '#e94057' : '#f5af19' }}>
                    (Base {perf.basePts} × {perf.edition.multiplier})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
