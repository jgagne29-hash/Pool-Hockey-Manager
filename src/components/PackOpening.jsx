import React, { useState } from 'react';
import { Button, Space, Tag } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, Package, RotateCcw, Flame, Check, Plus } from 'lucide-react';
import { HockeyPlayerCard } from './HockeyPlayerCard';
import { PLAYERS } from '../data/players';
import { calculateMarketValue } from '../utils/market';
import { generateBalancedPack, getDynamicThresholds, calculateXpGain, getCatchupDetails } from '../utils/progression';

const PACK_TYPES = [
  {
    id: 'rookie',
    name: 'Pack Recrue LNH',
    cardCount: 3,
    color: 'linear-gradient(135deg, #135200 0%, #a0d911 100%)',
    shadow: '0 12px 32px rgba(160, 217, 17, 0.4)',
    accent: '#a0d911',
    description: '3 cartes de joueurs adaptées dynamiquement à votre niveau de gérant.'
  },
  {
    id: 'allstar',
    name: 'Pack All-Star Or',
    cardCount: 4,
    color: 'linear-gradient(135deg, #b9935a 0%, #f5af19 50%, #e7c996 100%)',
    shadow: '0 12px 35px rgba(245, 175, 25, 0.5)',
    accent: '#f5af19',
    description: '4 cartes avec probabilités équitables (Accès Ultra dès le Niveau 3).'
  },
  {
    id: 'legend',
    name: 'Pack Légende Stanley Cup',
    cardCount: 5,
    color: 'linear-gradient(135deg, #8a2387 0%, #e94057 50%, #f27121 100%)',
    shadow: '0 15px 40px rgba(233, 64, 87, 0.6)',
    accent: '#e94057',
    description: '5 cartes prestigieuses avec holographies maximales.'
  }
];

export const PackOpening = ({
  onAddToLineup,
  currentLineup = [],
  managerLevel = 2,
  onLevelChange,
  onAddXp,
  currentMonth = new Date().getMonth() + 1
}) => {
  const [selectedPack, setSelectedPack] = useState(PACK_TYPES[1]); // All-Star par défaut
  const [isOpen, setIsOpen] = useState(false);
  const [generatedCards, setGeneratedCards] = useState([]);

  // Récupération des seuils dynamiques selon le niveau actuel du joueur
  const currentThresholds = getDynamicThresholds(managerLevel);
  const catchup = getCatchupDetails(currentMonth);

  const generatePackCards = (pack) => {
    // 1. Appel du générateur équitable basé sur le niveau du gérant
    const rawCards = generateBalancedPack(PLAYERS, managerLevel, pack.cardCount);

    const cards = rawCards.map(c => ({
      player: c.playerData,
      edition: {
        edition_id: c.edition_id,
        edition_name: c.edition_name,
        rarity: c.rarity,
        cap_hit: c.cap_hit,
        multiplier: c.multiplier,
        bg_color: c.bg_color,
        instance_id: c.instance_id
      },
      marketVal: calculateMarketValue(c.playerData, { multiplier: c.multiplier })
    }));

    setGeneratedCards(cards);

    // Gain d'XP avec rattrapage saisonnier
    if (onAddXp) {
      const xpGained = calculateXpGain(30, currentMonth);
      onAddXp(xpGained, `Tirage ${pack.name}`);
    }

    // Célébration si Ultra-Rare ou Épique
    const hasUltra = cards.some(c => c.edition.rarity === 'Ultra-Rare');
    const hasEpic = cards.some(c => c.edition.rarity === 'Epic');

    setTimeout(() => {
      confetti({
        particleCount: hasUltra ? 220 : hasEpic ? 140 : 80,
        spread: hasUltra ? 110 : 80,
        origin: { y: 0.6 },
        colors: hasUltra
          ? ['#ff0055', '#ff0844', '#ffb199', '#ffffff', '#ffd700']
          : hasEpic
          ? ['#8a2387', '#e94057', '#f27121', '#ffffff']
          : ['#a0d911', '#00d2ff', '#f5af19']
      });
    }, pack.cardCount * 250);
  };

  const handleOpenPack = () => {
    generatePackCards(selectedPack);
    setIsOpen(true);
  };

  return (
    <div style={{
      textAlign: 'center',
      padding: '36px 20px',
      background: 'radial-gradient(circle at 50% 30%, #151d30 0%, #0a0c12 85%)',
      borderRadius: '20px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      minHeight: '65vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* En-tête du Pack Opening */}
      <div style={{ maxWidth: '720px', margin: '0 auto 28px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.05)', padding: '6px 14px', borderRadius: '20px', marginBottom: '12px' }}>
          <Package size={16} color={selectedPack.accent} />
          <span style={{ fontSize: '12px', fontWeight: 800, color: selectedPack.accent, letterSpacing: '1px', textTransform: 'uppercase' }}>
            Pack Opening Dynamique (Niveau Adaptatif)
          </span>
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>
          Tirage de Cartes Holographiques
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Les chances de tirage s'ajustent à votre niveau pour garantir une progression saine et équitable !
        </p>

        {/* Sélecteur de niveau interactif pour tester l'algorithme */}
        {!isOpen && onLevelChange && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '6px 12px',
            borderRadius: '12px',
            marginTop: '10px'
          }}>
            <span style={{ fontSize: '12px', color: '#aaa', fontWeight: 600 }}>Niveau du Gérant :</span>
            {[
              { lvl: 1, label: '🥉 Niv. 1 (Recrue)', color: '#cd7f32' },
              { lvl: 2, label: '🥈 Niv. 2 (Adjoint)', color: '#c0c0c0' },
              { lvl: 3, label: '🥇 Niv. 3+ (DG Pro)', color: '#ffd700' }
            ].map(item => (
              <button
                key={item.lvl}
                onClick={() => onLevelChange(item.lvl)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: managerLevel === item.lvl ? `1px solid ${item.color}` : '1px solid transparent',
                  background: managerLevel === item.lvl ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: managerLevel === item.lvl ? item.color : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '11px',
                  transition: 'all 0.2s'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* Sélecteur de types de paquets */}
        {!isOpen && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
            {PACK_TYPES.map(pack => (
              <button
                key={pack.id}
                onClick={() => setSelectedPack(pack)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: selectedPack.id === pack.id ? `2px solid ${pack.accent}` : '1px solid rgba(255,255,255,0.1)',
                  background: selectedPack.id === pack.id ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.3)',
                  color: selectedPack.id === pack.id ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 700,
                  transition: 'all 0.2s'
                }}
              >
                {pack.name} ({pack.cardCount} cartes)
              </button>
            ))}
          </div>
        )}

        {/* Bannière des Probabilités Dynamiques et Verrous de Rareté */}
        {!isOpen && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            marginTop: '16px'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 16px',
              background: 'rgba(0, 0, 0, 0.45)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '12px',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Probabilités Niv. {managerLevel} :</span>
              <span style={{ color: '#94a3b8' }}>Commune (<strong>{currentThresholds.chances.common}%</strong>)</span>
              <span>•</span>
              <span style={{ color: '#b9935a' }}>⭐ Rare (<strong>{currentThresholds.chances.rare}%</strong>)</span>
              <span>•</span>
              <span style={{
                color: currentThresholds.unlocked.epic ? '#e94057' : '#666',
                textDecoration: currentThresholds.unlocked.epic ? 'none' : 'line-through'
              }}>
                {currentThresholds.unlocked.epic ? '🔓' : '🔒'} Épique (<strong>{currentThresholds.chances.epic}%</strong>)
              </span>
              <span>•</span>
              <span style={{
                color: currentThresholds.unlocked.ultra ? '#ff0055' : '#666',
                fontWeight: 800,
                textDecoration: currentThresholds.unlocked.ultra ? 'none' : 'line-through'
              }}>
                {currentThresholds.unlocked.ultra ? '💎' : '🔒'} Ultra-Rare (<strong>{currentThresholds.chances.ultra}%</strong>)
              </span>
            </div>

            {/* Badge de Rattrapage XP Actif */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${catchup.tagColor}44`,
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '11px',
              color: catchup.tagColor
            }}>
              <span>{catchup.label}</span>
              <span style={{ color: '#fff', opacity: 0.8 }}>— +{calculateXpGain(30, currentMonth)} XP par paquet ouvert</span>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!isOpen ? (
          /* LE PAQUET DE CARTES FÉBRILE (Levitation + Vibration au survol) */
          <motion.div
            key="pack"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              y: [0, -10, 0] // Effet de lévitation continu
            }}
            transition={{ y: { repeat: Infinity, duration: 2.2, ease: "easeInOut" } }}
            exit={{ scale: 0.4, opacity: 0, filter: "blur(14px)" }}
            whileHover={{
              scale: 1.06,
              rotate: [0, -3, 3, -3, 0], // Vibre et tremble fébrilement au survol
              transition: { duration: 0.45, repeat: Infinity }
            }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenPack}
            style={{
              width: 240,
              height: 350,
              background: selectedPack.color,
              borderRadius: '20px',
              margin: '20px auto',
              cursor: 'pointer',
              boxShadow: selectedPack.shadow,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '24px 16px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Lignes d'ornement métalliques sur le booster */}
            <div style={{
              position: 'absolute',
              top: '-40%',
              left: '-40%',
              width: '180%',
              height: '180%',
              background: 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)',
              pointerEvents: 'none'
            }} />

            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              LNH POOL MASTER
            </div>

            <div style={{ textAlign: 'center' }}>
              <Sparkles size={42} color="#fff" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }} />
              <h2 style={{
                color: '#fff',
                fontSize: '22px',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                margin: '12px 0 4px',
                textShadow: '0 2px 10px rgba(0,0,0,0.5)'
              }}>
                {selectedPack.name}
              </h2>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
                {selectedPack.cardCount} CARTES ÉLITES
              </span>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(8px)',
              padding: '8px 20px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '1px'
            }}>
              ⚡ CLIQUEZ POUR OUVRIR
            </div>
          </motion.div>
        ) : (
          /* LES CARTES RÉVÉLÉES UNE PAR UNE AVEC DÉLAI PROGRESSIF (Effet Wow !) */
          <motion.div
            key="cards"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ marginTop: '10px' }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '20px',
              marginBottom: '28px'
            }}>
              {generatedCards.map((item, index) => {
                const isInLineup = currentLineup.some(l => l.player.nhl_id === item.player.nhl_id);

                return (
                  <motion.div
                    key={item.edition.edition_id + index}
                    initial={{ scale: 0, opacity: 0, y: 60, rotateY: 180 }}
                    animate={{ scale: 1, opacity: 1, y: 0, rotateY: 0 }}
                    transition={{
                      delay: index * 0.32, // Délai progressif pour chaque carte
                      type: "spring",
                      stiffness: 90,
                      damping: 12
                    }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                  >
                    <HockeyPlayerCard
                      player={item.player}
                      selectedEditionId={item.edition.edition_id}
                      onSelectEdition={() => {}}
                      isInLineup={isInLineup}
                      onToggleLineup={(p, e) => onAddToLineup && onAddToLineup(p, e)}
                    />

                    {/* Badge de Valeur Marchande calculée */}
                    <div style={{
                      marginTop: '8px',
                      background: 'rgba(0, 0, 0, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      padding: '4px 12px',
                      fontSize: '12px',
                      color: '#38ef7d',
                      fontWeight: 800
                    }}>
                      Valeur Marchande : <strong>{item.marketVal} pts</strong>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <Button
              type="primary"
              size="large"
              icon={<RotateCcw size={16} />}
              onClick={() => setIsOpen(false)}
              style={{
                background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 800,
                boxShadow: '0 4px 16px rgba(0, 210, 255, 0.4)'
              }}
            >
              Ouvrir un autre Paquet
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
