import React, { useState } from 'react';
import { Button, Space, Tag, message } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, Package, RotateCcw, Flame, Check, Plus, Coins, DollarSign, Lock, AlertCircle } from 'lucide-react';
import { HockeyPlayerCard } from './HockeyPlayerCard';
import { PLAYERS } from '../data/players';
import { calculateMarketValue, getQuickSellCoinValue, PACK_DEFINITIONS } from '../utils/market';
import { generateBalancedPack, getDynamicThresholds, calculateXpGain, getCatchupDetails } from '../utils/progression';

const PACK_LIST = Object.values(PACK_DEFINITIONS);

export const PackOpening = ({
  onAddToLineup,
  currentLineup = [],
  managerLevel = 2,
  onLevelChange,
  onAddXp,
  userCoins = 1500,
  onDeductCoins,
  openedPackCounts = {},
  onOpenPackRecord,
  onQuickSellCard,
  onOpenRewardsModal,
  onCardsCollected,
  currentMonth = new Date().getMonth() + 1
}) => {
  const [selectedPack, setSelectedPack] = useState(PACK_LIST[0]); // Pack Standard par défaut
  const [packPhase, setPackPhase] = useState('select'); // 'select', 'ripping', 'revealing'
  const [flippedCards, setFlippedCards] = useState({});
  const [generatedCards, setGeneratedCards] = useState([]);
  const [shakeScreen, setShakeScreen] = useState(false);
  const [epicRarityGlow, setEpicRarityGlow] = useState(null);

  // Générateur de sons synthétiques rétro via Web Audio API
  const playSynthSound = (type) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      if (type === 'rip') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'flip') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'epic') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.2);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
        osc.start();
        osc.stop(ctx.currentTime + 1.5);
      }
      
      osc.connect(gain);
      gain.connect(ctx.destination);
    } catch (e) {
      console.warn("Web Audio API non supportée ou bloquée", e);
    }
  };

  // Récupération des seuils dynamiques selon le niveau actuel du joueur
  const currentThresholds = getDynamicThresholds(managerLevel);
  const catchup = getCatchupDetails(currentMonth);

  const packOpensToday = openedPackCounts[selectedPack.id] || 0;
  const remainingToday = Math.max(0, selectedPack.dailyLimit - packOpensToday);
  const hasEnoughCoins = userCoins >= selectedPack.price;

  const generatePackCards = (pack) => {
    // 1. Vérification du budget de rondelles
    if (userCoins < pack.price) {
      message.error(`Rondelles insuffisantes ! Il vous faut ${pack.price} 🪙 (Solde actuel : ${userCoins} 🪙).`);
      return;
    }

    // 2. Vérification de la limite quotidienne
    if (remainingToday <= 0) {
      message.warning(`Quota journalier atteint pour le ${pack.name} (${pack.dailyLimit}/${pack.dailyLimit}). Choisissez un autre paquet !`);
      return;
    }

    // 3. Déduction du prix du paquet en rondelles
    if (onDeductCoins) {
      onDeductCoins(pack.price);
    }
    if (onOpenPackRecord) {
      onOpenPackRecord(pack.id);
    }

    // 4. Appel du générateur officiel des 6 variantes PoolDG.cards
    const rawCards = generateBalancedPack(PLAYERS, managerLevel, pack.cardCount, pack.id);

    const cards = rawCards.map(c => ({
      player: c.playerData,
      edition: {
        edition_id: c.edition_id,
        edition_name: c.edition_name,
        rarity: c.rarity,
        cap_hit: c.cap_hit,
        multiplier: c.multiplier,
        bg_color: c.bg_color,
        instance_id: c.instance_id,
        serial: c.serial,
        is_one_of_one: c.is_one_of_one,
        durability_days: c.durability_days || 35
      },
      marketVal: calculateMarketValue(c.playerData, c, c.durability_days || 35)
    }));

    setGeneratedCards(cards);
    
    // Au lieu d'ouvrir tout de suite, on lance l'animation de déchirure
    setPackPhase('ripping');
    playSynthSound('rip');

    setTimeout(() => {
      setPackPhase('revealing');
      setFlippedCards({});
      setEpicRarityGlow(null);
    }, 800); // Durée de l'animation de déchirure

    // Envoi des cartes vers le Cartable (Binder) du D.G.
    if (onCardsCollected) {
      onCardsCollected(rawCards);
    }

    // Gain d'XP avec rattrapage saisonnier
    if (onAddXp) {
      const xpGained = calculateXpGain(30, currentMonth);
      onAddXp(xpGained, `Tirage ${pack.name}`);
    }
  };

  const handleOpenPack = () => {
    generatePackCards(selectedPack);
  };

  const handleFlipCard = (index, rarity) => {
    if (flippedCards[index]) return; // Déjà retournée

    setFlippedCards(prev => ({ ...prev, [index]: true }));

    const isEpic = rarity === 'Ultra' || rarity === 'Mystique' || rarity.includes('Patch') || rarity === 'Édition Givrée' || rarity === 'Édition La Relève';

    if (isEpic) {
      playSynthSound('epic');
      setShakeScreen(true);
      setEpicRarityGlow(
        rarity === 'Mystique' ? '#ff0055' : 
        rarity.includes('Patch') ? '#fbbf24' : 
        rarity === 'Ultra' ? '#b026ff' : '#00d2ff'
      );

      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#ff0055', '#fbbf24', '#00d2ff', '#ffffff']
      });

      setTimeout(() => setShakeScreen(false), 800);
    } else {
      playSynthSound('flip');
    }
  };

  // Vérifier si toutes les cartes sont retournées pour afficher les actions de fin
  const allCardsFlipped = generatedCards.length > 0 && generatedCards.every((_, i) => flippedCards[i]);

  return (
    <div style={{
      textAlign: 'center',
      padding: '36px 20px',
      background: epicRarityGlow 
        ? `radial-gradient(circle at 50% 50%, ${epicRarityGlow}33 0%, #0a0c12 85%)` 
        : 'radial-gradient(circle at 50% 30%, #151d30 0%, #0a0c12 85%)',
      borderRadius: '20px',
      border: epicRarityGlow ? `1px solid ${epicRarityGlow}88` : '1px solid rgba(255, 255, 255, 0.08)',
      minHeight: '65vh',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.4s ease',
      transform: shakeScreen ? 'translate(2px, 2px)' : 'none'
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

        {/* Portefeuille de Rondelles d'Or */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(245, 175, 25, 0.15)',
          border: '1px solid rgba(245, 175, 25, 0.4)',
          padding: '6px 16px',
          borderRadius: '20px',
          marginTop: '6px',
          boxShadow: '0 0 15px rgba(245, 175, 25, 0.2)'
        }}>
          <Coins size={15} color="#f5af19" />
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#f5af19' }}>
            Portefeuille : {userCoins.toLocaleString()} Rondelles 🪙
          </span>
        </div>

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

        {/* Sélecteur de types de paquets selon la valeur réelle des joueurs */}
        {!isOpen && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '12px',
            marginTop: '18px',
            textAlign: 'left'
          }}>
            {PACK_LIST.map(pack => {
              const countToday = openedPackCounts[pack.id] || 0;
              const quotaLeft = Math.max(0, pack.dailyLimit - countToday);
              const isSelected = selectedPack.id === pack.id;
              const canAfford = userCoins >= pack.price;
              const isQuotaFull = quotaLeft <= 0;

              return (
                <div
                  key={pack.id}
                  onClick={() => setSelectedPack(pack)}
                  style={{
                    padding: '14px',
                    borderRadius: '14px',
                    border: isSelected ? `2px solid ${pack.accent}` : '1px solid rgba(255,255,255,0.08)',
                    background: isSelected ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.35)',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    position: 'relative',
                    boxShadow: isSelected ? `0 0 20px ${pack.accent}44` : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: `${pack.accent}22`,
                        color: pack.accent,
                        border: `1px solid ${pack.accent}55`,
                        textTransform: 'uppercase'
                      }}>
                        {pack.tier}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: isQuotaFull ? '#ff4d4f' : '#aaa'
                      }}>
                        {isQuotaFull ? 'Épuisé (0)' : `${quotaLeft}/${pack.dailyLimit} restants`}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>
                      {pack.name}
                    </h4>

                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 10px', lineHeight: '1.4' }}>
                      {pack.description}
                    </p>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    paddingTop: '8px'
                  }}>
                    <span style={{ fontSize: '11px', color: '#888' }}>
                      {pack.cardCount} cartes
                    </span>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 900,
                      color: canAfford ? '#f5af19' : '#ff4d4f',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Coins size={14} />
                      {pack.price.toLocaleString()} 🪙
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bouton pour réclamer des lots gratuits si le solde est bas */}
        {!isOpen && userCoins < selectedPack.price && (
          <div style={{
            marginTop: '16px',
            padding: '10px 16px',
            background: 'rgba(255, 77, 79, 0.1)',
            border: '1px solid rgba(255, 77, 79, 0.3)',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <span style={{ color: '#ff7875', fontSize: '12px', fontWeight: 700 }}>
              ⚠️ Rondelles insuffisantes ({userCoins} 🪙 / {selectedPack.price} 🪙 requis).
            </span>
            {onOpenRewardsModal && (
              <button
                onClick={onOpenRewardsModal}
                style={{
                  background: 'linear-gradient(135deg, #f5af19 0%, #e65c00 100%)',
                  border: 'none',
                  color: '#fff',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 10px rgba(245, 175, 25, 0.4)'
                }}
              >
                🎁 Réclamer des Lots Gratuits
              </button>
            )}
          </div>
        )}

        {/* Bannière des Probabilités & Raretés du Paquet Sélectionné */}
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
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Tirage {selectedPack.name} :</span>
              <span style={{ color: selectedPack.accent, fontWeight: 700 }}>{selectedPack.chancesText}</span>
              <span>•</span>
              <span style={{ color: '#aaa' }}>Capacité : {selectedPack.dailyLimit} par jour max</span>
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
        {packPhase === 'select' && (
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
            whileHover={hasEnoughCoins && remainingToday > 0 ? {
              scale: 1.06,
              rotate: [0, -3, 3, -3, 0],
              transition: { duration: 0.45, repeat: Infinity }
            } : { scale: 0.98 }}
            whileTap={hasEnoughCoins && remainingToday > 0 ? { scale: 0.95 } : {}}
            onClick={handleOpenPack}
            style={{
              width: 250,
              height: 360,
              background: selectedPack.color,
              borderRadius: '20px',
              margin: '20px auto',
              cursor: hasEnoughCoins && remainingToday > 0 ? 'pointer' : 'not-allowed',
              boxShadow: selectedPack.shadow,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '24px 16px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              filter: hasEnoughCoins && remainingToday > 0 ? 'none' : 'grayscale(0.6) opacity(0.85)'
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
              background: 'rgba(0, 0, 0, 0.45)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>{selectedPack.tier}</span>
              <span>•</span>
              <Coins size={12} color="#f5af19" />
              <span>{selectedPack.price} 🪙</span>
            </div>

            <div style={{ textAlign: 'center' }}>
              <Sparkles size={42} color="#fff" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }} />
              <h2 style={{
                color: '#fff',
                fontSize: '20px',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                margin: '12px 0 4px',
                textShadow: '0 2px 10px rgba(0,0,0,0.5)'
              }}>
                {selectedPack.name}
              </h2>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
                {selectedPack.cardCount} CARTES JOUEURS
              </span>
            </div>

            <div style={{
              background: hasEnoughCoins && remainingToday > 0 ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(8px)',
              padding: '8px 20px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 800,
              color: hasEnoughCoins && remainingToday > 0 ? '#fff' : '#ff7875',
              letterSpacing: '1px'
            }}>
              {remainingToday <= 0
                ? '🔒 QUOTA QUOTIDIEN ATTEINT'
                : hasEnoughCoins
                ? `⚡ OUVRIR POUR ${selectedPack.price} 🪙`
                : `🔒 ${selectedPack.price} 🪙 REQUIS`}
            </div>
          </motion.div>
        )}

        {packPhase === 'ripping' && (
          <motion.div
            key="ripping"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1.2, 1.8, 2] }}
            transition={{ duration: 0.8 }}
            style={{ 
              position: 'absolute', 
              inset: 0, 
              background: '#fff', 
              zIndex: 100,
              borderRadius: '20px'
            }}
          />
        )}

        {packPhase === 'revealing' && (
          /* LES CARTES RÉVÉLÉES UNE PAR UNE (Face Cachée au départ) */
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
              marginBottom: '28px',
              perspective: '1200px'
            }}>
              {generatedCards.map((item, index) => {
                const isInLineup = currentLineup.some(l => l.player.nhl_id === item.player.nhl_id);
                const isFlipped = flippedCards[index];

                return (
                  <motion.div
                    key={item.edition.edition_id + index}
                    initial={{ scale: 0, opacity: 0, y: 60 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{
                      delay: index * 0.15, // Délai d'apparition face cachée
                      type: "spring",
                      stiffness: 120,
                      damping: 14
                    }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                  >
                    {/* Conteneur 3D de la carte */}
                    <div style={{ position: 'relative', width: 280, height: 420 }}>
                      <motion.div
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ type: "spring", stiffness: 60, damping: 12 }}
                        style={{
                          width: '100%',
                          height: '100%',
                          transformStyle: 'preserve-3d',
                          position: 'relative'
                        }}
                      >
                        {/* DOS DE LA CARTE */}
                        <div
                          onClick={() => handleFlipCard(index, item.edition.rarity)}
                          style={{
                            position: 'absolute',
                            inset: 0,
                            backfaceVisibility: 'hidden',
                            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                            borderRadius: '12px',
                            border: '3px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8), 0 10px 20px rgba(0,0,0,0.5)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            zIndex: 2
                          }}
                        >
                           <div style={{
                             width: '85%', height: '85%',
                             border: '2px solid rgba(160,217,17,0.3)',
                             borderRadius: '8px',
                             display: 'flex', alignItems: 'center', justifyContent: 'center',
                             background: 'radial-gradient(circle, rgba(160,217,17,0.15) 0%, transparent 70%)'
                           }}>
                             <h3 style={{ 
                               color: '#a0d911', 
                               fontSize: '32px', 
                               fontWeight: 900, 
                               transform: 'rotate(-25deg)', 
                               textShadow: '0 4px 15px rgba(160,217,17,0.6)',
                               margin: 0,
                               letterSpacing: '2px',
                               textAlign: 'center'
                             }}>
                               POOL DG<br/>CARDS
                             </h3>
                           </div>
                        </div>

                        {/* FACE VISIBLE */}
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                            zIndex: 1
                          }}
                        >
                          <HockeyPlayerCard
                            player={item.player}
                            selectedEditionId={item.edition.edition_id}
                            onSelectEdition={() => {}}
                            isInLineup={isInLineup}
                            onToggleLineup={(p, e) => onAddToLineup && onAddToLineup(p, e)}
                          />
                        </div>
                      </motion.div>
                    </div>

                    {/* Actions contextuelles (seulement si retournée) */}
                    <div style={{
                      marginTop: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      alignItems: 'center',
                      width: '100%',
                      opacity: isFlipped ? 1 : 0,
                      pointerEvents: isFlipped ? 'auto' : 'none',
                      transition: 'opacity 0.4s'
                    }}>
                      <div style={{
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

                      <button
                        onClick={() => {
                          const val = getQuickSellCoinValue(item.edition.rarity);
                          if (onQuickSellCard) onQuickSellCard(val, item);
                          setGeneratedCards(prev => prev.filter((_, i) => i !== index));
                          message.success(`Carte #${item.player.number} vendue pour +${val} 🪙 !`);
                        }}
                        style={{
                          background: 'rgba(245, 175, 25, 0.15)',
                          border: '1px solid #f5af19',
                          color: '#f5af19',
                          borderRadius: '8px',
                          padding: '4px 12px',
                          fontSize: '11px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.2s'
                        }}
                      >
                        <Coins size={13} />
                        Vente Rapide (+{getQuickSellCoinValue(item.edition.rarity)} 🪙)
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Bouton de fin, apparait quand tout est retourné */}
            {allCardsFlipped && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}
              >
                <Button
                  type="primary"
                  size="large"
                  icon={<RotateCcw size={16} />}
                  onClick={() => setPackPhase('select')}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
