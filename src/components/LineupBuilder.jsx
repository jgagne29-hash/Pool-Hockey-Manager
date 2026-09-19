import React from 'react';
import { Shield, Users, Trash2, Zap, Flame, Award, Trophy, Star } from 'lucide-react';
import { Tag } from 'antd';
import { SALARY_CAP_MAX } from '../data/players';

// Définition officielle des 20 postes LNH
export const FULL_ROSTER_SLOTS = [
  // LIGNE 1 • ÉLITE
  { id: 'L1_LW', line: 'Trio 1 • Première Ligne', label: 'AG 1', role: 'Ailier Gauche', group: 'forwards', pos: 'LW' },
  { id: 'L1_C',  line: 'Trio 1 • Première Ligne', label: 'C 1',  role: 'Centre',        group: 'forwards', pos: 'C' },
  { id: 'L1_RW', line: 'Trio 1 • Première Ligne', label: 'AD 1', role: 'Ailier Droit',  group: 'forwards', pos: 'RW' },

  // LIGNE 2 • TOP 6
  { id: 'L2_LW', line: 'Trio 2 • Deuxième Ligne', label: 'AG 2', role: 'Ailier Gauche', group: 'forwards', pos: 'LW' },
  { id: 'L2_C',  line: 'Trio 2 • Deuxième Ligne', label: 'C 2',  role: 'Centre',        group: 'forwards', pos: 'C' },
  { id: 'L2_RW', line: 'Trio 2 • Deuxième Ligne', label: 'AD 2', role: 'Ailier Droit',  group: 'forwards', pos: 'RW' },

  // LIGNE 3 • VÉRIFICATION
  { id: 'L3_LW', line: 'Trio 3 • Troisième Ligne', label: 'AG 3', role: 'Ailier Gauche', group: 'forwards', pos: 'LW' },
  { id: 'L3_C',  line: 'Trio 3 • Troisième Ligne', label: 'C 3',  role: 'Centre',        group: 'forwards', pos: 'C' },
  { id: 'L3_RW', line: 'Trio 3 • Troisième Ligne', label: 'AD 3', role: 'Ailier Droit',  group: 'forwards', pos: 'RW' },

  // LIGNE 4 • ÉNERGIE
  { id: 'L4_LW', line: 'Trio 4 • Quatrième Ligne', label: 'AG 4', role: 'Ailier Gauche', group: 'forwards', pos: 'LW' },
  { id: 'L4_C',  line: 'Trio 4 • Quatrième Ligne', label: 'C 4',  role: 'Centre',        group: 'forwards', pos: 'C' },
  { id: 'L4_RW', line: 'Trio 4 • Quatrième Ligne', label: 'AD 4', role: 'Ailier Droit',  group: 'forwards', pos: 'RW' },

  // DÉFENSE • PAIRE 1 (25+ min)
  { id: 'D1_LD', line: 'Paire 1 • Première Paire', label: 'DG 1', role: 'Défenseur Gauche', group: 'defense', pos: 'D' },
  { id: 'D1_RD', line: 'Paire 1 • Première Paire', label: 'DD 1', role: 'Défenseur Droit',  group: 'defense', pos: 'D' },

  // DÉFENSE • PAIRE 2 (Top 4)
  { id: 'D2_LD', line: 'Paire 2 • Deuxième Paire', label: 'DG 2', role: 'Défenseur Gauche', group: 'defense', pos: 'D' },
  { id: 'D2_RD', line: 'Paire 2 • Deuxième Paire', label: 'DD 2', role: 'Défenseur Droit',  group: 'defense', pos: 'D' },

  // DÉFENSE • PAIRE 3 (Soutien)
  { id: 'D3_LD', line: 'Paire 3 • Troisième Paire', label: 'DG 3', role: 'Défenseur Gauche', group: 'defense', pos: 'D' },
  { id: 'D3_RD', line: 'Paire 3 • Troisième Paire', label: 'DD 3', role: 'Défenseur Droit',  group: 'defense', pos: 'D' },

  // GARDIENS
  { id: 'G_1', line: 'Devant le Filet', label: 'G 1', role: 'Gardien Partant', group: 'goalies', pos: 'G' },
  { id: 'G_2', line: 'Devant le Filet', label: 'G 2', role: 'Gardien Auxiliaire', group: 'goalies', pos: 'G' }
];

// Calcul officiel des points fantasy par joueur
export function calculatePlayerPoints(player, edition) {
  if (!player) return 0;
  const mult = edition?.multiplier || 1.0;
  if (player.position === 'G') {
    const wins = player.stats?.wins || 0;
    const so = player.stats?.so || 0;
    const svBonus = (player.stats?.svPct && player.stats.svPct >= .910) ? 5 : 0;
    return Math.round(((wins * 5) + (so * 10) + svBonus) * mult);
  } else {
    const g = player.stats?.g || 0;
    const a = player.stats?.a || 0;
    const diff = parseInt(player.stats?.plusMinus || '0', 10) || 0;
    return Math.round(((g * 3) + (a * 2) + Math.max(-5, diff)) * mult);
  }
}

// Algorithme d'assignation stricte garantissant le respect absolu des positions LNH
// Un gardien ne peut JAMAIS être assigné à un poste d'attaquant ou défenseur, et inversement
export function getLineupSlotMapping(lineup = []) {
  const slotMap = new Map();
  const usedSlots = new Set();
  const unassigned = [];

  // Étape 1 : Assigner les joueurs ayant un slotId explicite et strictement compatible
  for (const item of lineup) {
    if (!item || !item.player) continue;
    const pos = item.player.position;

    if (item.slotId) {
      const slotDef = FULL_ROSTER_SLOTS.find(s => s.id === item.slotId);
      const isCompatible = slotDef && (
        (pos === 'G' && slotDef.group === 'goalies') ||
        (pos === 'D' && slotDef.group === 'defense') ||
        (pos === 'C' && slotDef.pos === 'C') ||
        (pos === 'LW' && (slotDef.pos === 'LW' || slotDef.pos === 'RW')) ||
        (pos === 'RW' && (slotDef.pos === 'RW' || slotDef.pos === 'LW'))
      );

      if (isCompatible && !usedSlots.has(slotDef.id)) {
        slotMap.set(slotDef.id, item);
        usedSlots.add(slotDef.id);
        continue;
      }
    }
    unassigned.push(item);
  }

  // Étape 2 : Pour chaque joueur restant, trouver le premier slot libre strictement dédié à son rôle
  for (const item of unassigned) {
    const pos = item.player.position;
    let target = null;

    if (pos === 'G') {
      // STRICTEMENT Gardien de but
      target = FULL_ROSTER_SLOTS.find(s => s.group === 'goalies' && !usedSlots.has(s.id));
    } else if (pos === 'D') {
      // STRICTEMENT Défenseur
      target = FULL_ROSTER_SLOTS.find(s => s.group === 'defense' && !usedSlots.has(s.id));
    } else if (pos === 'C') {
      // STRICTEMENT Joueur de Centre
      target = FULL_ROSTER_SLOTS.find(s => s.pos === 'C' && !usedSlots.has(s.id));
    } else if (pos === 'LW') {
      // Ailier Gauche (priorité AG, sinon AD disponible)
      target = FULL_ROSTER_SLOTS.find(s => s.pos === 'LW' && !usedSlots.has(s.id)) ||
               FULL_ROSTER_SLOTS.find(s => s.pos === 'RW' && !usedSlots.has(s.id));
    } else if (pos === 'RW') {
      // Ailier Droit (priorité AD, sinon AG disponible)
      target = FULL_ROSTER_SLOTS.find(s => s.pos === 'RW' && !usedSlots.has(s.id)) ||
               FULL_ROSTER_SLOTS.find(s => s.pos === 'LW' && !usedSlots.has(s.id));
    }

    if (target) {
      slotMap.set(target.id, item);
      usedSlots.add(target.id);
    }
  }

  return slotMap;
}

export const LineupBuilder = ({ lineup = [], onRemovePlayer, onResetLineup, managerLevel = 2, onOpenRewardsModal, onNavigateToPacks }) => {
  // Détermination stricte des places occupées selon les positions légitimes
  const slotMapping = getLineupSlotMapping(lineup);

  // Calcul du plafond salarial officiel (104M$ officiel LNH)
  const allowedCap = managerLevel === 1 ? 95000000 : SALARY_CAP_MAX;
  const totalCap = lineup.reduce((sum, item) => sum + (item.edition?.cap_hit || 0), 0);
  const remainingCap = allowedCap - totalCap;
  const capPct = Math.min(100, (totalCap / allowedCap) * 100);
  const isOverCap = totalCap > allowedCap;

  // Calcul des points totaux de l'équipe active
  const totalTeamPoints = lineup.reduce((sum, item) => {
    return sum + calculatePlayerPoints(item.player, item.edition);
  }, 0);

  // Multiplicateur moyen de l'équipe
  const avgMultiplier = lineup.length > 0
    ? (lineup.reduce((sum, item) => sum + item.edition.multiplier, 0) / lineup.length).toFixed(2)
    : '1.00';

  // Regroupement des slots par lignes pour affichage en vestiaire LNH
  const sections = [
    {
      title: "🏒 ATTAQUE — 4 LIGNES OFFENSIVES (12 Postes)",
      color: "#00d2ff",
      slots: FULL_ROSTER_SLOTS.filter(s => s.group === 'forwards')
    },
    {
      title: "🛡️ DÉFENSE — 3 PAIRES DÉFENSIVES (6 Postes)",
      color: "#38ef7d",
      slots: FULL_ROSTER_SLOTS.filter(s => s.group === 'defense')
    },
    {
      title: "🥅 GARDIENS — DEVANT LE FILET (2 Postes)",
      color: "#f5af19",
      slots: FULL_ROSTER_SLOTS.filter(s => s.group === 'goalies')
    }
  ];

  return (
    <div style={{ marginBottom: '32px' }}>
      {/* Alerte Onboarding si l'alignement est vide (Départ de A à Z) */}
      {lineup.length === 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 175, 25, 0.12) 0%, rgba(0, 210, 255, 0.15) 100%)',
          border: '1px solid rgba(245, 175, 25, 0.4)',
          borderRadius: '16px',
          padding: '18px 24px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '22px' }}>🏒</span>
              <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#f5af19', margin: 0 }}>
                Nouveau DG : Montez votre franchise LNH de A à Z !
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: '#e0e0e0', margin: '6px 0 0', maxWidth: 650 }}>
              Votre alignement officiel est actuellement vide (<strong>0 / 20 postes</strong>). Vous disposez de votre <strong>budget de départ de 5 000 🪙 Rondelles d'Or</strong> pour ouvrir des paquets de cartes, repêcher vos recrues et revendre les surplus contre des pièces.
            </p>
          </div>

          {onNavigateToPacks && (
            <button
              onClick={onNavigateToPacks}
              style={{
                background: 'linear-gradient(135deg, #f5af19 0%, #e65c00 100%)',
                border: 'none',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: 900,
                fontSize: '13px',
                boxShadow: '0 4px 18px rgba(245, 175, 25, 0.5)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              📦 Ouvrir des Paquets (5 000 🪙)
            </button>
          )}
        </div>
      )}

      {/* Tableau de Bord Tactique : Points & Plafond Salarial */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 20, 30, 0.95) 0%, rgba(10, 12, 18, 0.98) 100%)',
        border: '1px solid rgba(0, 210, 255, 0.25)',
        borderRadius: '16px',
        padding: '20px 24px',
        marginBottom: '24px',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={20} color="#00d2ff" />
              <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#fff', margin: 0 }}>
                Alignement Officiel LNH ({lineup.length}/20 Joueurs) • Plafond {(allowedCap / 1000000).toFixed(0)}M $
              </h2>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
              4 Lignes d'Avants (12) • 3 Paires de Défense (6) • 2 Gardiens Partant et Auxiliaire
            </p>
          </div>

          {/* Actions Alignement */}
          {lineup.length > 0 && onResetLineup && (
            <button
              onClick={onResetLineup}
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#f87171',
                padding: '6px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Vider l'alignement pour recommencer de A à Z"
            >
              <Trash2 size={13} />
              Recommencer de A à Z
            </button>
          )}

          {/* Grand Compteur de Points en Direct */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '10px 18px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                Points Cumulés LNH
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: '#00ffcc', textShadow: '0 0 15px rgba(0,255,204,0.4)' }}>
                {totalTeamPoints.toLocaleString()} <span style={{ fontSize: '14px' }}>pts</span>
              </div>
              <div style={{ fontSize: '10px', color: '#f5af19', fontWeight: 800, marginTop: '2px' }}>
                ≈ {(totalTeamPoints * 2).toLocaleString()} 🪙 en valeur
              </div>
            </div>

            {onOpenRewardsModal && (
              <button
                onClick={onOpenRewardsModal}
                style={{
                  background: 'linear-gradient(135deg, #f5af19 0%, #e65c00 100%)',
                  border: 'none',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '11px',
                  boxShadow: '0 2px 10px rgba(245, 175, 25, 0.4)',
                  whiteSpace: 'nowrap'
                }}
              >
                🎁 Réclamer Lots
              </button>
            )}

            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', height: '36px' }} />


            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                Masse Salariale
              </div>
              <span style={{ fontSize: '22px', fontWeight: 900, color: isOverCap ? '#ff0055' : '#00d2ff' }}>
                {(totalCap / 1000000).toFixed(2)}M $
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}> / {(allowedCap / 1000000).toFixed(0)}M $</span>
            </div>
          </div>
        </div>

        {/* Barre de Progression du Plafond Salarial */}
        <div style={{ marginTop: '16px' }}>
          <div style={{
            height: '8px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, capPct)}%`,
                background: isOverCap ? '#ff0055' : capPct > 90 ? 'linear-gradient(90deg, #faad14, #ff0055)' : 'linear-gradient(90deg, #00b96b, #00ffcc)',
                transition: 'width 0.4s ease'
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '6px', color: 'var(--text-secondary)' }}>
            <span>
              {isOverCap ? (
                <strong style={{ color: '#ff0055' }}>⚠️ Dépassement de {(Math.abs(remainingCap) / 1000000).toFixed(2)}M $</strong>
              ) : (
                <strong style={{ color: '#00ffcc' }}>✅ Espace sous le plafond : {(remainingCap / 1000000).toFixed(2)}M $</strong>
              )}
            </span>
            <span>
              Postes Complétés : <strong style={{ color: '#fff' }}>{lineup.length} / 20</strong> • Multiplicateur Moyen : <strong style={{ color: '#f5af19' }}>x{avgMultiplier}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Sections du Vestiaire : Attaque, Défense, Gardiens */}
      {sections.map((sec, secIdx) => (
        <div key={secIdx} style={{ marginBottom: '28px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '14px',
            paddingBottom: '8px',
            borderBottom: `2px solid ${sec.color}33`
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: sec.color, margin: 0 }}>
              {sec.title}
            </h3>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '12px'
          }}>
            {sec.slots.map((slot) => {
              // Récupération stricte du joueur légitime selon sa vraie position LNH
              const item = slotMapping.get(slot.id);

              if (item && item.player) {
                const pts = calculatePlayerPoints(item.player, item.edition);

                return (
                  <div
                    key={slot.id}
                    style={{
                      background: 'rgba(18, 22, 32, 0.95)',
                      border: `1px solid ${
                        item.edition?.rarity === 'Ultra-Rare' ? '#ff0055' :
                        item.edition?.rarity === 'Epic' ? '#8a2387' :
                        item.edition?.rarity === 'Rare' ? '#b9935a' :
                        'rgba(255,255,255,0.1)'
                      }`,
                      borderRadius: '12px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                      position: 'relative'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', color: sec.color, fontWeight: 800, textTransform: 'uppercase' }}>
                          {slot.label} • {slot.role}
                        </span>
                        <button
                          onClick={() => onRemovePlayer(item.player.nhl_id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Retirer de l'alignement"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div style={{ fontWeight: 800, fontSize: '14px', color: '#fff', marginTop: '4px' }}>
                        #{item.player.number} {item.player.name}
                      </div>

                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {item.player.team} • {item.edition?.edition_name || 'Série Régulière'}
                      </div>
                    </div>

                    <div style={{
                      marginTop: '10px',
                      paddingTop: '8px',
                      borderTop: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '11px'
                    }}>
                      <span style={{ color: '#fff', fontWeight: 700 }}>
                        {((item.edition?.cap_hit || item.player.base_cap_hit) / 1000000).toFixed(2)}M $
                      </span>

                      <span style={{
                        background: 'rgba(0, 255, 204, 0.12)',
                        color: '#00ffcc',
                        padding: '1px 6px',
                        borderRadius: '6px',
                        fontWeight: 800
                      }}>
                        {pts} pts (x{item.edition?.multiplier || 1.0})
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
                    border: '1px dashed rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    padding: '16px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    minHeight: '85px'
                  }}
                >
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700 }}>
                    {slot.label} • {slot.role}
                  </span>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
                    Poste vacant (Cliquez sur une carte pour assigner)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

