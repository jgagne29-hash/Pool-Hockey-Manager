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
  currentMonth = new Date().getMonth() + 1
}) => {
  const [selectedPack, setSelectedPack] = useState(PACK_LIST[2]); // All-Star par défaut
  const [isOpen, setIsOpen] = useState(false);
  const [generatedCards, setGeneratedCards] = useState([]);

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

    // 4. Appel du générateur équitable basé sur le niveau du gérant ET le type de paquet
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
        instance_id: c.instance_id
      },
      marketVal: calculateMarketValue(c.playerData, { multiplier: c.multiplier })
    }));

    setGeneratedCards(cards);
    setIsOpen(true);

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

                    {/* Badges de Valeur & Vente Rapide */}
                    <div style={{
                      marginTop: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      alignItems: 'center',
                      width: '100%'
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

                      {/* Bouton Vente Rapide contre pièces d'or */}
                      <button
                        onClick={() => {
                          const val = getQuickSellCoinValue(item.edition.rarity);
                          if (onQuickSellCard) {
                            onQuickSellCard(val, item);
                          }
                          // Retirer visuellement la carte vendue
                          setGeneratedCards(prev => prev.filter((_, i) => i !== index));
                          message.success(`Carte #${item.player.number} ${item.player.name} vendue pour +${val} 🪙 !`);
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
