import React, { useState } from 'react';
import { Card, Tooltip } from 'antd';
import { motion } from 'framer-motion';
import { LineChart, Sparkles } from 'lucide-react';

export const RatingHistoryChart = ({ historyData }) => {
  // historyData ressemble à : [450, 480, 460, 520, 590, 610, 882]
  if (!historyData || historyData.length === 0) return null;

  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Paramètres du graphique SVG
  const width = 460;
  const height = 150;
  const padding = 20;

  // Calculer les coordonnées des points du graphique
  const maxVal = 1000;
  const minVal = 0;

  const points = historyData.map((val, index) => {
    const x = padding + (index / (historyData.length - 1 || 1)) * (width - padding * 2);
    // Inversion de l'axe Y pour le SVG (le haut est 0)
    const y = height - padding - ((val - minVal) / (maxVal - minVal)) * (height - padding * 2);
    return { x, y, val, matchDay: index + 1 };
  });

  // Générer la ligne de commande pour le tracé (path SVG)
  const pathD = points.reduce((acc, p, i) =>
    i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`,
    ""
  );

  // Ligne de repère d'objectif à 700 points (Directeur Général Pro)
  const target700Y = height - padding - (700 / maxVal) * (height - padding * 2);

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#fff', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LineChart size={16} color="#00ffcc" />
            Évolution de votre Cote DG
          </span>
          <span style={{ fontSize: '12px', color: '#00ffcc', fontWeight: 800 }}>
            Dernière cote : {historyData[historyData.length - 1]} / 1000
          </span>
        </div>
      }
      headStyle={{ color: '#fff', borderBottom: '1px solid #303030' }}
      style={{ background: 'rgba(20, 20, 20, 0.95)', border: '1px solid #303030', borderRadius: '14px', marginTop: '20px' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        {/* Info-bulle flottante lors du survol */}
        {hoveredPoint && (
          <div style={{
            position: 'absolute',
            top: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            border: '1px solid #00ffcc',
            borderRadius: '8px',
            padding: '4px 10px',
            fontSize: '11px',
            color: '#fff',
            pointerEvents: 'none',
            zIndex: 10,
            boxShadow: '0 4px 12px rgba(0, 255, 204, 0.3)'
          }}>
            Soirée {hoveredPoint.matchDay} : <strong style={{ color: '#00ffcc' }}>{hoveredPoint.val} pts</strong>
          </div>
        )}

        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
          {/* Grille de fond subtile */}
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.08)" />
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.08)" />

          {/* Ligne de fond (Repère d'objectif à 700 points pour devenir Pro) */}
          <line
            x1={padding}
            y1={target700Y}
            x2={width - padding}
            y2={target700Y}
            stroke="#faad14"
            strokeDasharray="4 4"
            strokeOpacity={0.4}
            strokeWidth={1.5}
          />
          <text x={width - padding - 4} y={target700Y - 5} fill="#faad14" fontSize="10" fontWeight="bold" textAnchor="end">
            Palier DG Pro (700)
          </text>

          {/* TRACÉ DE LA LIGNE ANIMÉE AVEC FRAMER MOTION */}
          <motion.path
            d={pathD}
            fill="none"
            stroke="#00ffcc" // Vert néon dynamique
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
            style={{ filter: 'drop-shadow(0 0 8px rgba(0, 255, 204, 0.4))' }}
          />

          {/* Points cliquables ou visibles pour chaque match */}
          {points.map((p, i) => (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={p.val >= 700 ? 5 : 4}
              fill={p.val >= 900 ? '#ff0055' : p.val >= 700 ? '#faad14' : '#00ffcc'}
              stroke="#141414"
              strokeWidth={2}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8 + i * 0.08, type: "spring", stiffness: 150 }}
              whileHover={{ scale: 2 }}
              onMouseEnter={() => setHoveredPoint(p)}
              onMouseLeave={() => setHoveredPoint(null)}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </svg>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: '11px', marginTop: '10px' }}>
        <span>Début de la saison</span>
        <span style={{ color: '#faad14', fontWeight: 600 }}>Objectif Or (700 pts)</span>
        <span>Aujourd'hui ({historyData.length} soirées)</span>
      </div>
    </Card>
  );
};
