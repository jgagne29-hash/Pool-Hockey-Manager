import React, { useState, useRef } from 'react';
import { Shield, Zap, Check, Plus, Clock, Sparkles, Crown } from 'lucide-react';
import { getCardCondition } from '../utils/boosts';
import { PlayerStatsModal } from './PlayerStatsModal';
import { calculatePlayerOVR } from '../utils/playerRatings';

const RARITY_LABELS = {
  Base: 'Base',
  Common: 'Base',
  Régulière: 'Régulière (x1.2)',
  Super: 'Super (x1.5)',
  Rare: 'Super (x1.5)',
  'Édition Retro 90s': '📼 Retro 90s (x1.6)',
  Ultra: '💎 Ultra (x1.9)',
  'Ultra-Rare': '💎 Ultra (x1.9)',
  'Édition La Relève': '🌟 La Relève (x1.8)',
  Mystique: '🔮 Mystique (x2.5)',
  Epic: '🔮 Mystique (x2.5)',
  'Édition Givrée': '🧊 Clear Cut (x3.0)',
  'Clear Cut': '🧊 Clear Cut (x3.0)',
  'The Patch (1-of-1)': '⭐ The Patch 1/1 (x3.5)',
  Patch: '⭐ The Patch 1/1 (x3.5)'
};

const TIER_STYLES = {
  Base: { frameClass: 'card-base', badgeColor: '#555', accentColor: '#8c8c8c' },
  Common: { frameClass: 'card-base', badgeColor: '#555', accentColor: '#8c8c8c' },
  Régulière: { frameClass: 'card-reguliere', badgeColor: '#1890ff', accentColor: '#1890ff' },
  Super: { frameClass: 'card-super', badgeClass: 'holographic-foil-green', accentColor: '#52c41a' },
  Rare: { frameClass: 'card-super', badgeClass: 'holographic-foil-green', accentColor: '#52c41a' },
  'Édition Retro 90s': { frameClass: 'card-retro', badgeColor: '#ff0055', accentColor: '#00d2ff' },
  Ultra: { frameClass: 'card-ultra', badgeClass: 'holographic-foil-purple', accentColor: '#722ed1' },
  'Ultra-Rare': { frameClass: 'card-ultra', badgeClass: 'holographic-foil-purple', accentColor: '#722ed1' },
  'Édition La Relève': { frameClass: 'card-releve', badgeClass: 'holographic-foil-silver', accentColor: '#94a3b8' },
  Mystique: { frameClass: 'card-mystique', badgeClass: 'holographic-foil-magenta', accentColor: '#eb2f96' },
  Epic: { frameClass: 'card-mystique', badgeClass: 'holographic-foil-magenta', accentColor: '#eb2f96' },
  'Édition Givrée': { frameClass: 'card-clearcut', badgeClass: 'clear-glass', accentColor: '#00d2ff' },
  'Clear Cut': { frameClass: 'card-clearcut', badgeClass: 'clear-glass', accentColor: '#00d2ff' },
  'The Patch (1-of-1)': { frameClass: 'card-patch-one', badgeClass: 'gold-foil-unique', accentColor: '#faad14' },
  Patch: { frameClass: 'card-patch-one', badgeClass: 'gold-foil-unique', accentColor: '#faad14' }
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Édition courante
  const currentEdition = player.cards?.find(c => c.edition_id === selectedEditionId) || player.cards?.[0] || {};
  const rarity = currentEdition.rarity || 'Base';
  const isOneOfOne = currentEdition.is_one_of_one || rarity.includes('Patch') || currentEdition.serial === '1/1';

  const styleConfig = TIER_STYLES[rarity] || TIER_STYLES['Base'];

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

  // Logique d'images dynamiques (avec fallback CSS sur l'image standard si absent)
  const defaultImage = player.image || `https://assets.nhle.com/mugs/nhl/latest/${player.nhl_id}.png`;
  const rarityKey = rarity.toLowerCase().replace(/[^a-z0-9]/g, '');
  const targetImageUrl = player.images?.[rarityKey] || defaultImage;

  const [imgSrc, setImgSrc] = useState(targetImageUrl);
  const [imageFailed, setImageFailed] = useState(false);

  React.useEffect(() => {
    setImgSrc(player.images?.[rarityKey] || defaultImage);
    setImageFailed(false);
  }, [player.nhl_id, player.image, player.images, rarityKey, defaultImage]);

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
        className={`hockey-card pro-card-container rarity-${rarityClass} ${styleConfig.frameClass}`}
        style={{
          transform: isHovered
            ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`
            : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          background: currentEdition.bg_color || '#161922'
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => setIsModalOpen(true)}
      >
        {/* Nouvelle Top Bar style Pro */}
        <div className="pro-card-top-bar">
          <span className="pro-team-tag">{player.team} • {player.position}</span>
          {isOneOfOne ? (
            <span className="pro-tier-badge patch-badge" style={{ borderColor: styleConfig.accentColor, color: styleConfig.accentColor }}>
              <Crown size={12} style={{ marginRight: 4, display: 'inline' }} /> 1-OF-1
            </span>
          ) : (
             <span className="pro-tier-badge" style={{ borderColor: styleConfig.accentColor, color: styleConfig.accentColor }}>
              {RARITY_LABELS[rarity] || rarity}
            </span>
          )}
        </div>

        {/* Partie supérieure / Visuel du joueur (Dynamique selon Rareté) */}
        <div className={`pro-image-frame ${rarityKey}`}>
          
          {/* Encart Holographique pour "La Relève" */}
          {rarity === 'Édition La Relève' && (
            <div className="releve-foil-banner">
              LA RELÈVE
            </div>
          )}

          <span className="card-number-badge">#{player.number}</span>
          <span className="card-ovr-badge" style={{
            position: 'absolute',
            bottom: '8px',
            right: '12px',
            fontSize: '16px',
            fontWeight: '900',
            color: '#fff',
            textShadow: '0 2px 4px rgba(0,0,0,0.8)',
            background: 'rgba(0,0,0,0.5)',
            padding: '2px 6px',
            borderRadius: '6px',
            zIndex: 3
          }}>{calculatePlayerOVR(player)} OVR</span>

          {!imageFailed ? (
            <img
              src={imgSrc}
              alt={player.name}
              className={`card-player-img pro-player-photo style-${rarityKey}`}
              loading="lazy"
              onError={handleImageError}
            />
          ) : (
            <div className="card-player-fallback">
              <div className="fallback-avatar" style={{ border: `2px solid ${styleConfig.accentColor}`, boxShadow: `0 0 15px ${styleConfig.accentColor}` }}>
                <span>{player.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
              </div>
            </div>
          )}

          {/* Incrustation Patch Réel simulé */}
          {isOneOfOne && (
            <div className="jersey-patch-texture">
              <div className="patch-inner">
                <span>PATCH OFFICIEL</span>
                <strong>{currentEdition.patch_piece ? `PIÈCE ${currentEdition.patch_piece} / 6` : '1 / 1'}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Corps de la carte */}
        <div className="pro-card-content card-body">
          <div className="player-title-section">
            <h2 className="pro-player-name card-player-name">{player.name}</h2>
            <p className="card-edition-title">{currentEdition.edition_name || 'Édition Spéciale'}</p>
          </div>

          {/* Grille de stats & Cap Hit */}
          <div className="pro-stats-grid stats-row">
            <div className="pro-stat-box stat-item">
              <span className="stat-label">
                <Shield size={11} style={{ display: 'inline', marginRight: 3 }} />
                Masse
              </span>
              <strong className="stat-value">
                {((currentEdition.cap_hit || player.base_cap_hit || 0) / 1000000).toFixed(1)}M $
              </strong>
            </div>

            <div className="pro-stat-box stat-item highlight">
              <span className="stat-label">
                <Zap size={11} style={{ display: 'inline', marginRight: 3 }} />
                MULTIPLICATEUR
              </span>
              <strong className={`stat-value ${rarity.includes('Patch') ? 'gold' : rarity.includes('Mystique') ? 'purple' : rarity.includes('Ultra') ? 'ultra' : ''}`} style={{ color: styleConfig.accentColor }}>
                x{currentEdition.multiplier || 1.0}
              </strong>
            </div>
          </div>

          {/* Jauge de Durabilité 35 Jours & État de Condition */}
          <div className="pro-boost-status card-durability-container">
            <div className="boost-info-text durability-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#94a3b8' }}>
                <Clock size={10} />
                Boost : {daysLeft}/35j
              </span>
              <span className={`condition-badge ${condition.badgeClass}`}>
                {condition.status}
              </span>
            </div>
            <div className="pro-progress-bar durability-bar-bg">
              <div
                className="pro-progress-fill durability-bar-fill"
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
                              edition.rarity === 'Édition Retro 90s' ? 'Retro' :
                              edition.rarity === 'Ultra' ? 'Ultra' :
                              edition.rarity === 'Édition La Relève' ? 'Relève' :
                              edition.rarity === 'Mystique' ? 'Myst.' :
                              edition.rarity === 'Édition Givrée' ? 'Givrée' : '1/1';
                const isActive = currentEdition.edition_id === edition.edition_id;

                return (
                  <button
                    key={edition.edition_id}
                    className={`edition-btn ${edition.rarity} ${isActive ? 'active' : ''}`}
                    style={{
                      fontSize: '10px',
                      padding: '3px 6px',
                      borderRadius: '4px',
                      border: isActive ? `1px solid ${styleConfig.accentColor}` : '1px solid rgba(255,255,255,0.1)',
                      background: isActive ? `${styleConfig.accentColor}33` : 'rgba(0,0,0,0.4)',
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
      <PlayerStatsModal 
        player={player} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};
