import React, { useState, useRef } from 'react';
import { Shield, Zap, Check, Plus, Star, Sparkles } from 'lucide-react';

const RARITY_LABELS = {
  Common: 'Régulière',
  Rare: 'Étoile',
  Epic: 'Légendaire',
  'Ultra-Rare': '💎 Ultra (1%)'
};

export const HockeyPlayerCard = ({
  player,
  selectedEditionId,
  onSelectEdition,
  isInLineup,
  onToggleLineup
}) => {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Édition courante
  const currentEdition = player.cards.find(c => c.edition_id === selectedEditionId) || player.cards[0];
  const rarity = currentEdition.rarity;

  // Calcul du Tilt 3D dynamique selon la position de la souris
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position dans la carte
    const y = e.clientY - rect.top;  // y position dans la carte

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -12; // inclinaison axe X
    const rY = ((x - centerX) / centerX) * 12;  // inclinaison axe Y

    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  const [imageFailed, setImageFailed] = useState(false);

  // Image officielle LNH avec fallback
  const mugshotUrl = `https://assets.nhle.com/mugs/nhl/latest/${player.nhl_id}.png`;

  return (
    <div className="card-perspective-wrap">
      <div
        ref={cardRef}
        className={`hockey-card rarity-${rarity}`}
        style={{
          transform: isHovered
            ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`
            : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          background: currentEdition.bg_color
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Ruban de rareté */}
        <div className={`rarity-ribbon ${rarity}`}>
          {RARITY_LABELS[rarity]}
        </div>

        {/* Partie supérieure / Visuel du joueur */}
        <div className="card-photo-wrapper">
          <div className="card-team-pill">
            <span>{player.team}</span>
            <span style={{ opacity: 0.5 }}>•</span>
            <span>{player.position}</span>
          </div>

          <span className="card-number-badge">#{player.number}</span>

          {!imageFailed ? (
            <img
              src={mugshotUrl}
              alt={player.name}
              className="card-player-img"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="card-player-fallback" style={{
              height: '180px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
              opacity: 0.9
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(0,210,255,0.25))',
                border: '2px solid rgba(0, 210, 255, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 25px rgba(0, 210, 255, 0.25)'
              }}>
                <span style={{ fontSize: '28px', fontWeight: 900, color: '#fff', letterSpacing: '1px' }}>
                  {player.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <span style={{ marginTop: '10px', fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                {player.position} • {player.team}
              </span>
            </div>
          )}
        </div>

        {/* Corps de la carte */}
        <div className="card-body">
          <div>
            <h3 className="card-player-name">{player.name}</h3>
            <p className="card-edition-title">{currentEdition.edition_name}</p>
          </div>

          {/* Grille de stats & Cap Hit */}
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-label">
                <Shield size={11} style={{ display: 'inline', marginRight: 3 }} />
                Masse
              </span>
              <span className="stat-value">
                {(currentEdition.cap_hit / 1000000).toFixed(1)}M $
              </span>
            </div>

            <div className="stat-item">
              <span className="stat-label">
                <Zap size={11} style={{ display: 'inline', marginRight: 3 }} />
                Multiplicateur
              </span>
              <span className={`stat-value ${rarity === 'Ultra-Rare' ? 'ultra' : rarity === 'Epic' ? 'purple' : rarity === 'Rare' ? 'gold' : ''}`}>
                x{currentEdition.multiplier}
              </span>
            </div>
          </div>

          {/* Sélecteur d'éditions (Régulière, Étoile, Légendaire, Ultra-Rare) */}
          <div className="edition-selector">
            {player.cards.map((edition) => (
              <button
                key={edition.edition_id}
                className={`edition-btn ${edition.rarity} ${
                  currentEdition.edition_id === edition.edition_id ? `active ${edition.rarity}` : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectEdition(player.nhl_id, edition.edition_id);
                }}
              >
                {edition.rarity === 'Common' ? 'Base' : edition.rarity === 'Rare' ? '⭐ Rare' : edition.rarity === 'Epic' ? '🔥 Épique' : '💎 1%'}
              </button>
            ))}
          </div>

          {/* Bouton pour drafter dans le Pool */}
          <button
            className={`btn-draft ${isInLineup ? 'in-lineup' : 'available'}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleLineup(player, currentEdition);
            }}
          >
            {isInLineup ? (
              <>
                <Check size={14} /> Dans mon alignement
              </>
            ) : (
              <>
                <Plus size={14} /> Sélectionner dans le Pool
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
