import React, { useState, useRef } from 'react';
import { Shield, Zap, Check, Plus, Clock, Sparkles, Flame, Award } from 'lucide-react';
import { getCardCondition } from '../utils/boosts';

const RARITY_LABELS = {
  Base: 'Base',
  Common: 'Base',
  Régulière: 'Régulière (x1.2)',
  Super: 'Super (x1.5)',
  Rare: 'Super (x1.5)',
  Ultra: '💎 Ultra (x1.9)',
  'Ultra-Rare': '💎 Ultra (x1.9)',
  Mystique: '🔮 Mystique (x2.5)',
  Epic: '🔮 Mystique (x2.5)',
  'The Patch (1-of-1)': '⭐ The Patch 1/1 (x3.5)',
  Patch: '⭐ The Patch 1/1 (x3.5)'
};

export const HockeyPlayerCard = ({
  player,
  selectedEditionId,
  onSelectEdition,
  isInLineup,
  onToggleLineup,
  customDurabilityDays,
  showBoostAction = false,
  onAttachBoost
}) => {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Édition courante
  const currentEdition = player.cards?.find(c => c.edition_id === selectedEditionId) || player.cards?.[0] || {};
  const rarity = currentEdition.rarity || 'Base';
  const isOneOfOne = currentEdition.is_one_of_one || rarity.includes('Patch') || currentEdition.serial === '1/1';

  // Durabilité & Condition
  const daysLeft = customDurabilityDays !== undefined
    ? customDurabilityDays
    : (currentEdition.durability_days !== undefined ? currentEdition.durability_days : 35);
  const condition = getCardCondition(daysLeft);

  // Normalisation du nom de classe CSS pour la rareté
  const rarityClass = rarity.replace(/[^a-zA-Z0-9]/g, '');

  // Calcul du Tilt 3D dynamique
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -12;
    const rY = ((x - centerX) / centerX) * 12;

    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  const primaryUrl = player.image || `https://assets.nhle.com/mugs/nhl/latest/${player.nhl_id}.png`;
  const [imgSrc, setImgSrc] = useState(primaryUrl);
  const [imageFailed, setImageFailed] = useState(false);

  React.useEffect(() => {
    setImgSrc(player.image || `https://assets.nhle.com/mugs/nhl/latest/${player.nhl_id}.png`);
    setImageFailed(false);
  }, [player.nhl_id, player.image]);

  const handleImageError = () => {
    const fallbackUrl = `https://assets.nhle.com/mugs/nhl/latest/${player.nhl_id}.png`;
    if (imgSrc !== fallbackUrl) {
      setImgSrc(fallbackUrl);
    } else {
      setImageFailed(true);
    }
  };

  return (
    <div className="card-perspective-wrap">
      <div
        ref={cardRef}
        className={`hockey-card rarity-${rarityClass} ${rarity}`}
        style={{
          transform: isHovered
            ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`
            : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          background: currentEdition.bg_color || '#161922'
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Ruban de rareté */}
        <div className={`rarity-ribbon ${rarityClass}`}>
          {RARITY_LABELS[rarity] || rarity}
        </div>

        {/* Cachet doré 1/1 strictly limited pour The Patch */}
        {isOneOfOne && (
          <div className="one-of-one-stamp">
            ⭐ 1-OF-1 UNIQUE
          </div>
        )}

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
              src={imgSrc}
              alt={player.name}
              className="card-player-img"
              loading="lazy"
              onError={handleImageError}
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
            <p className="card-edition-title">{currentEdition.edition_name || 'Édition Spéciale'}</p>
          </div>

          {/* Grille de stats & Cap Hit */}
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-label">
                <Shield size={11} style={{ display: 'inline', marginRight: 3 }} />
                Masse
              </span>
              <span className="stat-value">
                {((currentEdition.cap_hit || player.base_cap_hit || 0) / 1000000).toFixed(1)}M $
              </span>
            </div>

            <div className="stat-item">
              <span className="stat-label">
                <Zap size={11} style={{ display: 'inline', marginRight: 3 }} />
                Multiplicateur
              </span>
              <span className={`stat-value ${rarity.includes('Patch') ? 'gold' : rarity.includes('Mystique') ? 'purple' : rarity.includes('Ultra') ? 'ultra' : ''}`}>
                x{currentEdition.multiplier || 1.0}
              </span>
            </div>
          </div>

          {/* Jauge de Durabilité 35 Jours & État de Condition */}
          <div className="card-durability-container">
            <div className="durability-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#94a3b8' }}>
                <Clock size={10} />
                Boost : {daysLeft}/35j
              </span>
              <span className={`condition-badge ${condition.badgeClass}`}>
                {condition.status}
              </span>
            </div>
            <div className="durability-bar-bg">
              <div
                className="durability-bar-fill"
                style={{
                  width: `${condition.percentage}%`,
                  background: condition.color,
                  boxShadow: `0 0 8px ${condition.color}`
                }}
              />
            </div>
          </div>

          {/* Sélecteur des 6 variantes */}
          {player.cards && player.cards.length > 1 && (
            <div className="edition-selector" style={{ marginTop: 8, display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2 }}>
              {player.cards.map((edition) => {
                const label = edition.rarity === 'Base' ? 'Base' :
                              edition.rarity === 'Régulière' ? 'Rég.' :
                              edition.rarity === 'Super' ? 'Super' :
                              edition.rarity === 'Ultra' ? 'Ultra' :
                              edition.rarity === 'Mystique' ? 'Myst.' : '1/1';
                const isActive = currentEdition.edition_id === edition.edition_id;

                return (
                  <button
                    key={edition.edition_id}
                    className={`edition-btn ${edition.rarity} ${isActive ? 'active' : ''}`}
                    style={{
                      fontSize: '10px',
                      padding: '3px 6px',
                      borderRadius: '4px',
                      border: isActive ? '1px solid #00d2ff' : '1px solid rgba(255,255,255,0.1)',
                      background: isActive ? 'rgba(0, 210, 255, 0.2)' : 'rgba(0,0,0,0.4)',
                      color: isActive ? '#fff' : '#94a3b8',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectEdition) {
                        onSelectEdition(player.nhl_id, edition.edition_id);
                      }
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Action : Drafter dans le Pool OU Attacher en Boost */}
          {showBoostAction ? (
            <button
              className="btn-draft available"
              style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', marginTop: 8 }}
              onClick={(e) => {
                e.stopPropagation();
                if (onAttachBoost) onAttachBoost(player, currentEdition);
              }}
            >
              <Sparkles size={14} /> Attacher ce Boost (35j)
            </button>
          ) : (
            <button
              className={`btn-draft ${isInLineup ? 'in-lineup' : 'available'}`}
              style={{ marginTop: 8 }}
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleLineup) onToggleLineup(player, currentEdition);
              }}
            >
              {isInLineup ? (
                <>
                  <Check size={14} /> Dans mon alignement
                </>
              ) : (
                <>
                  <Plus size={14} /> Repêcher dans le Pool
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
