import React from 'react';
import { HockeyPlayerCard } from './HockeyPlayerCard';
import { Crown, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import '../styles/cards.css';

export const HallOfFame = ({ inventory = [], exhibitedCards = [], onToggleExhibit }) => {
  // Récupérer les données complètes des cartes exposées
  const displayedCards = exhibitedCards
    .map(instanceId => inventory.find(c => c.instance_id === instanceId))
    .filter(Boolean);

  return (
    <div className="hall-of-fame-container" style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at center, #1a1c29 0%, #05070a 100%)',
      padding: '40px 20px',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Effet de lumières dynamiques en arrière-plan */}
      <div className="spotlight-left"></div>
      <div className="spotlight-right"></div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Crown size={50} color="#f5af19" style={{ marginBottom: '16px', filter: 'drop-shadow(0 0 15px rgba(245,175,25,0.6))' }} />
            <h1 style={{
              fontSize: '48px',
              fontWeight: 900,
              margin: 0,
              background: 'linear-gradient(to right, #f5af19, #f12711)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontFamily: "'Playfair Display', serif"
            }}>
              Le Temple de la Renommée
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '18px', marginTop: '12px', maxWidth: '600px', margin: '12px auto' }}>
              La chambre forte officielle. Seules vos pièces de collection les plus précieuses méritent d'être exposées sous ces projecteurs.
            </p>
          </motion.div>
        </div>

        {displayedCards.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '20px',
            border: '1px dashed rgba(255,255,255,0.1)'
          }}>
            <AlertCircle size={40} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '20px', margin: '0 0 8px 0', color: '#e2e8f0' }}>Aucune carte exposée</h3>
            <p style={{ color: '#94a3b8', maxWidth: '400px', margin: '0 auto' }}>
              Rendez-vous dans votre <strong>Cartable</strong> pour sélectionner vos meilleures cartes et les ajouter au Temple de la Renommée.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '60px',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {displayedCards.map((card, index) => (
              <motion.div
                key={card.instance_id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                style={{ position: 'relative' }}
              >
                {/* Le boîtier One-Touch (Magnetic Case) et/ou Slab PSA */}
                <div className={`premium-slab-case ${card.rarity.includes('Patch') ? 'psa-slab' : 'one-touch-case'}`}>
                  
                  {/* Label PSA si applicable */}
                  {card.rarity.includes('Patch') && (
                    <div className="psa-label">
                      <div className="psa-header">
                        <span className="psa-year">2025-26 POOLDG</span>
                        <span className="psa-grade">GEM MT 10</span>
                      </div>
                      <div className="psa-player">{card.name.toUpperCase()}</div>
                      <div className="psa-details">{card.rarity} - {card.serial || '1/1'}</div>
                      <div className="psa-barcode">||| ||||||| ||| |||</div>
                    </div>
                  )}
                  
                  {/* Sticker Holographique pour One-Touch */}
                  {!card.rarity.includes('Patch') && (
                    <div className="one-touch-sticker"></div>
                  )}

                  <div className="slab-card-wrapper">
                    <HockeyPlayerCard
                      player={card.playerData}
                      selectedEditionId={card.edition_id}
                      isInLineup={false}
                      customDurabilityDays={card.durability_days}
                    />
                  </div>

                  {/* Reflet de vitre / acrylique par-dessus la carte */}
                  <div className="acrylic-reflection"></div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                  <button
                    onClick={() => onToggleExhibit(card.instance_id)}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      color: '#f87171',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
                  >
                    Retirer du Temple
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
