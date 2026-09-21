import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ThunderboltOutlined, ClockCircleOutlined, CrownOutlined } from '@ant-design/icons';
import './TradingCard.css'; // Pour les effets de reflets et animations

// Configuration des couleurs et styles selon la rareté de la carte
const TIER_CONFIG = {
  "Base": { border: "#434343", bg: "linear-gradient(135deg, #1f1f1f 0%, #111111 100%)", glow: "none", tagColor: "default" },
  "Régulière": { border: "#1890ff", bg: "linear-gradient(135deg, #002766 0%, #000b1a 100%)", glow: "0 0 15px rgba(24, 144, 255, 0.4)", tagColor: "blue" },
  "Super": { border: "#52c41a", bg: "linear-gradient(135deg, #135200 0%, #061100 100%)", glow: "0 0 20px rgba(82, 196, 26, 0.5)", tagColor: "green" },
  "Ultra": { border: "#722ed1", bg: "linear-gradient(135deg, #391085 0%, #120338 100%)", glow: "0 0 25px rgba(114, 46, 209, 0.6)", tagColor: "purple" },
  "Mystique": { border: "#eb2f96", bg: "linear-gradient(135deg, #780650 0%, #29001b 100%)", glow: "0 0 30px rgba(235, 47, 150, 0.8)", tagColor: "magenta" },
  "The Patch (1-of-1)": { border: "#faad14", bg: "linear-gradient(135deg, #ad4e00 0%, #2b1100 100%)", glow: "0 0 40px rgba(250, 173, 20, 1)", tagColor: "gold" }
};

export const TradingCard = ({ player, card }) => {
  // player = { name: "Connor Bedard", team: "CHI", position: "C", photoUrl: "..." }
  // card = { tier: "Mystique", multiplier: 2.5, daysLeft: 28, maxDays: 35 }

  const config = TIER_CONFIG[card.tier] || TIER_CONFIG["Base"];
  const percentDays = Math.round((card.daysLeft / card.maxDays) * 100);

  // Gestion de l'effet d'inclinaison 3D (Tilt) au survol de la souris
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left; //x position within card
    const y = e.clientY - rect.top;  //y position within card
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calcul de l'angle d'inclinaison
    const rX = -(y - centerY) / 10;
    const rY = (x - centerX) / 10;

    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      className="trading-card-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX, rotateY }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{
        background: config.bg,
        borderColor: config.border,
        boxShadow: config.glow,
      }}
    >
      {/* En-tête de la carte */}
      <div className="card-header">
        <span className="card-tier" style={{ borderColor: config.border, color: config.border }}>
          {card.tier === "The Patch (1-of-1)" && <CrownOutlined />} {card.tier}
        </span>
        <span className="card-team">{player.team} • {player.position}</span>
      </div>

      {/* Visuel du joueur (Photo détourée sur fond transparent) */}
      <div className="card-image-wrapper">
        <img src={player.photoUrl || "https://via.placeholder.com/150"} alt={player.name} className="card-player-img" />
        <div className="holographic-sheen" />
      </div>

      {/* Informations et Statistiques */}
      <div className="card-footer">
        <h3 className="card-player-name">{player.name}</h3>
        
        <div className="card-boost-badge">
          <ThunderboltOutlined style={{ color: '#00ffcc' }} />
          <span>Boost x{card.multiplier}</span>
        </div>

        {/* Jauge d'usure des 35 jours */}
        <div className="card-durability">
          <div className="durability-text">
            <span><ClockCircleOutlined /> Durabilité</span>
            <span>{card.daysLeft} / {card.maxDays}j</span>
          </div>
          <div className="durability-bar-bg">
            <div 
              className="durability-bar-fill" 
              style={{ width: `${percentDays}%`, background: card.daysLeft > 7 ? '#52c41a' : '#ff4d4f' }} 
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
