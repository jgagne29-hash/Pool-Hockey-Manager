import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Button, Input, Select, message, Tag, Badge, Progress, Avatar } from 'antd';
import { Search, Filter, Clock, Trophy, ChevronRight, UserCheck, Activity, ShieldAlert, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PLAYERS, SALARY_CAP_MAX } from '../data/players_generated';
import { HockeyPlayerCard } from './HockeyPlayerCard';
import confetti from 'canvas-confetti';

// Config
const TOTAL_TEAMS = 12;
const TOTAL_ROUNDS = 20;
const TIME_PER_PICK = 45; // seconds

// Generate CPU Teams
const TEAMS = Array.from({ length: TOTAL_TEAMS }, (_, i) => ({
  id: i + 1,
  name: i === 0 ? 'VOUS (Mon D.G.)' : `CPU Team ${i}`,
  isCPU: i !== 0,
  color: i === 0 ? '#ff007f' : `hsl(${(i * 45) % 360}, 70%, 50%)`
}));

export const DraftRoom = ({ onDraftComplete, onClose }) => {
  const [currentPickIndex, setCurrentPickIndex] = useState(0); // 0 to (TOTAL_TEAMS * TOTAL_ROUNDS) - 1
  const [draftedPlayers, setDraftedPlayers] = useState([]); // { pickIndex, teamId, player, capHit }
  const [timeRemaining, setTimeRemaining] = useState(TIME_PER_PICK);
  const [isDraftActive, setIsDraftActive] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const timerRef = useRef(null);

  // Computed state
  const currentRound = Math.floor(currentPickIndex / TOTAL_TEAMS) + 1;
  const isEvenRound = currentRound % 2 === 0;
  // Snake logic: 1 to 12, then 12 to 1
  const currentTeamIndex = isEvenRound 
    ? (TOTAL_TEAMS - 1) - (currentPickIndex % TOTAL_TEAMS)
    : currentPickIndex % TOTAL_TEAMS;
  
  const currentTeam = TEAMS[currentTeamIndex];
  
  // Available players
  const availablePlayers = useMemo(() => {
    const draftedIds = draftedPlayers.map(dp => dp.player.nhl_id);
    let filtered = PLAYERS.filter(p => !draftedIds.includes(p.nhl_id));
    
    if (positionFilter !== 'ALL') {
      filtered = filtered.filter(p => p.position === positionFilter);
    }
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.team.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort by base cap hit (proxy for overall quality for now)
    filtered.sort((a, b) => b.salary - a.salary);
    
    return filtered.slice(0, 100); // Limit to top 100 for performance
  }, [draftedPlayers, positionFilter, searchQuery]);

  // My Team Stats
  const myRoster = draftedPlayers.filter(dp => dp.teamId === TEAMS[0].id);
  const myCapHit = myRoster.reduce((sum, dp) => sum + dp.capHit, 0);

  // Timer logic
  useEffect(() => {
    if (!isDraftActive) return;
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleAutoDraft();
          return TIME_PER_PICK;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timerRef.current);
  }, [isDraftActive, currentPickIndex]);

  // CPU logic
  useEffect(() => {
    if (!isDraftActive || currentRound > TOTAL_ROUNDS) return;
    
    if (currentTeam.isCPU) {
      // CPU thinks for 2-5 seconds
      const thinkTime = Math.random() * 3000 + 1000;
      const timeout = setTimeout(() => {
        handleAutoDraft(currentTeam);
      }, thinkTime);
      return () => clearTimeout(timeout);
    }
  }, [isDraftActive, currentPickIndex, currentTeam]);

  const handleDraftPlayer = (player, team) => {
    if (currentPickIndex >= TOTAL_TEAMS * TOTAL_ROUNDS) return;

    const baseCard = player.cards ? player.cards[0] : { edition_id: `${player.nhl_id}_base`, rarity: 'Base' };
    const capHit = player.salary || 0; // Using raw salary for draft for realism

    // Check cap space for human player
    if (!team.isCPU) {
       if (myCapHit + capHit > SALARY_CAP_MAX) {
          message.error("🚨 Plafond salarial dépassé ! Impossible de repêcher ce joueur.");
          return;
       }
    }

    const newDraftPick = {
      pickIndex: currentPickIndex,
      round: currentRound,
      overall: currentPickIndex + 1,
      teamId: team.id,
      teamName: team.name,
      teamColor: team.color,
      player: player,
      edition: baseCard,
      capHit: capHit
    };

    setDraftedPlayers(prev => [newDraftPick, ...prev]);
    
    // Effects
    if (!team.isCPU) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00d2ff', '#ff007f']
      });
      message.success(`Félicitations ! Vous avez repêché ${player.name} !`);
    }

    // Move to next pick
    setCurrentPickIndex(prev => prev + 1);
    setTimeRemaining(TIME_PER_PICK);
    setSelectedPlayer(null);

    if (currentPickIndex + 1 >= TOTAL_TEAMS * TOTAL_ROUNDS) {
      setIsDraftActive(false);
      message.success("Le repêchage est terminé !");
      if (onDraftComplete) {
        onDraftComplete(draftedPlayers);
      }
    }
  };

  const handleAutoDraft = (team = currentTeam) => {
    // Basic AI: pick the highest salary available (best player)
    const available = PLAYERS.filter(p => !draftedPlayers.some(dp => dp.player.nhl_id === p.nhl_id));
    // Sort by salary
    available.sort((a, b) => (b.salary || 0) - (a.salary || 0));
    
    // Simple logic: CPU just picks the best available regardless of cap (in full version we'd add cap logic)
    if (available.length > 0) {
      handleDraftPlayer(available[0], team);
    }
  };

  const formatCurrency = (val) => {
    if (!val) return '0$';
    return (val / 1000000).toFixed(2) + 'M$';
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '1400px',
      margin: '0 auto',
      background: 'radial-gradient(circle at top, #0f172a 0%, #020617 100%)',
      border: '1px solid rgba(255, 0, 127, 0.2)',
      borderRadius: '24px',
      overflow: 'hidden',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '800px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
    }}>
      {/* Header */}
      <div style={{
        padding: '24px',
        background: 'rgba(0,0,0,0.4)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ background: '#ff007f', padding: '8px', borderRadius: '12px' }}>
              <Trophy size={20} color="#fff" />
            </div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Cyber Draft 2026-2027
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Tag color="cyan">Tour {Math.min(currentRound, TOTAL_ROUNDS)} / {TOTAL_ROUNDS}</Tag>
            <Tag color="purple">Sélection {Math.min(currentPickIndex + 1, TOTAL_ROUNDS * TOTAL_TEAMS)} / {TOTAL_ROUNDS * TOTAL_TEAMS}</Tag>
          </div>
        </div>

        {/* On The Clock */}
        {isDraftActive && currentPickIndex < TOTAL_TEAMS * TOTAL_ROUNDS && (
          <div style={{
            background: currentTeam.isCPU ? 'rgba(0, 210, 255, 0.15)' : 'rgba(255, 0, 127, 0.15)',
            border: `1px solid ${currentTeam.isCPU ? '#00d2ff' : '#ff007f'}`,
            borderRadius: '16px',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            boxShadow: `0 0 20px ${currentTeam.isCPU ? 'rgba(0,210,255,0.2)' : 'rgba(255,0,127,0.3)'}`
          }}>
            <div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 800, marginBottom: '4px' }}>
                SUR L'HORLOGE
              </div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: currentTeam.color, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {currentTeam.isCPU ? <Cpu size={16} /> : <UserCheck size={16} />}
                {currentTeam.name}
              </div>
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: 900,
              color: timeRemaining <= 10 ? '#ff0055' : '#fff',
              fontVariantNumeric: 'tabular-nums',
              textShadow: timeRemaining <= 10 ? '0 0 10px #ff0055' : 'none'
            }}>
              0:{timeRemaining.toString().padStart(2, '0')}
            </div>
          </div>
        )}

        {!isDraftActive && currentPickIndex === 0 && (
          <Button 
            type="primary" 
            size="large"
            onClick={() => setIsDraftActive(true)}
            style={{ background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)', border: 'none', fontWeight: 800 }}
          >
            Démarrer le Repêchage
          </Button>
        )}
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Left Side: Available Players */}
        <div style={{ flex: '2', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <Input.Search
                placeholder="Rechercher (ex: McDavid)"
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '250px' }}
              />
              <Select
                value={positionFilter}
                onChange={setPositionFilter}
                style={{ width: '120px' }}
                options={[
                  { value: 'ALL', label: 'Toutes Pos.' },
                  { value: 'C', label: 'Centres' },
                  { value: 'L', label: 'Ailiers G.' },
                  { value: 'R', label: 'Ailiers D.' },
                  { value: 'D', label: 'Défenseurs' },
                  { value: 'G', label: 'Gardiens' }
                ]}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px'
            }}>
              {availablePlayers.map(p => (
                <div
                  key={p.nhl_id}
                  onClick={() => setSelectedPlayer(p)}
                  style={{
                    background: selectedPlayer?.nhl_id === p.nhl_id ? 'rgba(255,0,127,0.1)' : 'rgba(255,255,255,0.02)',
                    border: selectedPlayer?.nhl_id === p.nhl_id ? '1px solid #ff007f' : '1px solid rgba(255,255,255,0.05)',
                    padding: '16px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                     <img src={`https://assets.nhle.com/mugs/nhl/20262027/${p.team}/${p.nhl_id}.png`} alt={p.name} style={{ width: '100%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = "https://assets.nhle.com/mugs/nhl/default-skater.png"; }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '14px' }}>{p.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{p.team} - {p.position}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#f5af19' }}>{formatCurrency(p.salary)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Draft Board & Action */}
        <div style={{ flex: '1 1 350px', background: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column' }}>
          
          {/* Action Area */}
          <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
             {selectedPlayer ? (
               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ transform: 'scale(0.8)', transformOrigin: 'top center', marginBottom: '-50px' }}>
                    <HockeyPlayerCard 
                      player={selectedPlayer} 
                      selectedEditionId={selectedPlayer.cards?.[0]?.edition_id || `${selectedPlayer.nhl_id}_base`}
                      onSelectEdition={() => {}}
                    />
                  </div>
                  
                  <Button 
                    type="primary" 
                    size="large"
                    disabled={!isDraftActive || currentTeam.isCPU}
                    onClick={() => handleDraftPlayer(selectedPlayer, currentTeam)}
                    style={{ 
                      width: '100%', 
                      background: (!isDraftActive || currentTeam.isCPU) ? '#333' : 'linear-gradient(135deg, #ff007f 0%, #a00030 100%)',
                      border: 'none',
                      fontWeight: 900,
                      height: '50px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      marginTop: '20px'
                    }}
                  >
                    {!isDraftActive ? "Draft en Pause" : currentTeam.isCPU ? "Tour du CPU..." : "REPÊCHER JOUEUR"}
                  </Button>
               </div>
             ) : (
               <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                  <Activity size={48} color="rgba(255,255,255,0.1)" style={{ marginBottom: '16px' }} />
                  <p>Sélectionnez un joueur dans la liste pour voir sa carte et le repêcher.</p>
               </div>
             )}
          </div>

          {/* My Team Summary */}
          <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,0,127,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#ff007f' }}>Mon Alignement</span>
              <span style={{ fontSize: '12px', fontWeight: 800 }}>{myRoster.length} / 20</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              <span>Plafond Salarial</span>
              <span>{formatCurrency(myCapHit)} / {formatCurrency(SALARY_CAP_MAX)}</span>
            </div>
            <Progress 
              percent={Math.min(100, (myCapHit / SALARY_CAP_MAX) * 100)} 
              showInfo={false} 
              strokeColor={myCapHit > SALARY_CAP_MAX ? '#ff0055' : '#00d2ff'}
              trailColor="rgba(255,255,255,0.1)"
              size="small"
            />
          </div>

          {/* Draft History */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Historique du Repêchage
            </div>
            
            {draftedPlayers.length === 0 ? (
              <div style={{ color: '#666', fontSize: '13px' }}>Aucun joueur repêché pour le moment.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {draftedPlayers.map(dp => (
                  <div key={dp.overall} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ 
                      background: 'rgba(255,255,255,0.05)', 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '8px', 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: `1px solid ${dp.teamColor}`
                    }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>R{dp.round}</span>
                      <span style={{ fontSize: '14px', fontWeight: 900, color: dp.teamColor }}>{dp.overall}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800 }}>{dp.player.name}</div>
                      <div style={{ fontSize: '11px', color: dp.teamColor }}>{dp.teamName}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};
