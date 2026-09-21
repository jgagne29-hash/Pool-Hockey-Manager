import React, { useState } from 'react';
import { Lock, Award, TrendingUp, DollarSign, Target, Crown } from 'lucide-react';
import { CHAMPIONSHIP_RINGS, USER_UNLOCKED_RINGS } from '../data/rings';
import supremeRing from '../assets/images/supreme_ring.jpg';
import '../styles/rings.css';

export default function ChampionshipRings({ onClose }) {
  const [selectedRing, setSelectedRing] = useState(null);
  
  // Icon mapping
  const getIcon = (iconName) => {
    switch(iconName) {
      case 'Balance': return <TrendingUp className="gem-icon" size={20} />;
      case 'Ghost': return <Target className="gem-icon" size={20} />;
      case 'DollarSign': return <DollarSign className="gem-icon" size={20} />;
      case 'Flame': return <Award className="gem-icon" size={20} />;
      case 'Crown': return <Crown className="gem-icon" size={24} />;
      default: return <Award className="gem-icon" size={20} />;
    }
  };

  return (
    <div className="vault-container">
      
      <div className="vault-header">
        <button 
          onClick={onClose}
          className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-bold mb-6 transition-colors"
        >
          ← Retour au Cartable
        </button>
        <h1 className="vault-title">Le Coffre-Fort</h1>
        <p className="vault-subtitle">Hall of Fame : Collectionnez les Bagues de Championnat</p>
      </div>

      <div className="rings-grid">
        {CHAMPIONSHIP_RINGS.map((ring) => {
          const isUnlocked = USER_UNLOCKED_RINGS.includes(ring.id);
          const stateClass = isUnlocked ? 'unlocked' : 'locked';
          const ultimateClass = ring.isUltimate ? 'ultimate-glow' : '';

          return (
            <div key={ring.id} className="ring-pedestal-wrapper">
              
              {/* Le Socle et la Bague */}
              <div 
                className={`ring-glass-case ${stateClass} ${ultimateClass}`}
                onClick={() => {
                  if (isUnlocked && ring.isUltimate) {
                    setSelectedRing(ring);
                  }
                }}
              >
                {isUnlocked && <div className="spotlight"></div>}
                
                {ring.isUltimate && isUnlocked ? (
                  <img 
                    src={supremeRing} 
                    alt="Bague Suprême"
                    style={{
                      width: '180px',
                      height: '180px',
                      objectFit: 'cover',
                      borderRadius: '50%',
                      boxShadow: '0 0 40px rgba(255,255,255,0.4)',
                      zIndex: 10,
                      transform: 'translateY(-10px)',
                      filter: ring.rank === 2 ? 'grayscale(1) brightness(1.2)' : ring.rank === 3 ? 'sepia(1) hue-rotate(-30deg) saturate(1.5) brightness(0.9)' : 'none'
                    }}
                  />
                ) : (
                  <div className={`css-ring metal-${ring.metal}`}>
                    <div className={`ring-gem gem-${ring.gemstone}`}>
                      {getIcon(ring.icon)}
                    </div>
                  </div>
                )}

                {!isUnlocked && (
                  <div className="lock-overlay">
                    <Lock size={40} />
                  </div>
                )}
              </div>

              {/* Les Détails de la Bague */}
              <div className="ring-details">
                <h3 className="ring-title">{ring.title}</h3>
                <div className={`ring-subtitle ${stateClass} ${ring.metal === 'platinum' ? 'platinum' : ''}`}>
                  {ring.subtitle}
                </div>
                
                {isUnlocked ? (
                  <p className="ring-desc">{ring.description}</p>
                ) : (
                  <div className="ring-condition">
                    <Lock size={16} className="text-slate-400 shrink-0 mt-1" />
                    <span><strong>Verrouillé:</strong> {ring.condition}</span>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>
      
      {/* Modal / Écrin de Velours pour Bague Suprême */}
      {selectedRing && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
          onClick={() => setSelectedRing(null)}
        >
          <div 
            className="relative flex flex-col items-center animate-in zoom-in duration-500 w-full max-w-5xl"
            onClick={e => e.stopPropagation()}
            style={{ padding: '40px' }}
          >
            <div className="absolute top-[-150px] w-[300px] h-[600px] bg-white/20 blur-[100px] rounded-full pointer-events-none" />
            
            <h2 className="text-4xl font-black text-white mb-12 tracking-widest uppercase text-center" style={{ textShadow: '0 0 20px rgba(255,255,255,0.5)' }}>
              Bague de Certification Officielle
            </h2>
            
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '40px', width: '100%' }}>
              
              {/* Panneau de Gauche : Identité du DG */}
              <div style={{ flex: 1, textAlign: 'right', paddingRight: '20px', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Directeur Général</div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: selectedRing.rank === 1 ? '#f5af19' : selectedRing.rank === 2 ? '#cbd5e1' : '#d97706', textTransform: 'uppercase', textShadow: `0 0 10px ${selectedRing.rank === 1 ? 'rgba(245,175,25,0.4)' : selectedRing.rank === 2 ? 'rgba(203,213,225,0.4)' : 'rgba(217,119,6,0.4)'}` }}>
                  {currentUser?.name || "LÉGENDE"}
                </div>
                <div style={{ fontSize: '18px', color: '#e2e8f0', marginTop: '4px' }}>{currentUser?.username || "@MonDG"}</div>
                
                <div style={{ marginTop: '40px' }}>
                  <div style={{ fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Performance</div>
                  <div style={{ fontSize: '42px', fontWeight: 900, color: '#fff' }}>
                    {totalTeamPoints || 0} <span style={{ fontSize: '20px', color: '#94a3b8' }}>PTS</span>
                  </div>
                </div>
              </div>

              {/* Centre : La Bague */}
              <div style={{ position: 'relative' }}>
                <img 
                  src={supremeRing} 
                  alt="The Ultimate Ring" 
                  className="w-[400px] h-[400px] object-cover rounded-full shadow-[0_0_100px_rgba(255,255,255,0.3)] border-4 border-white/10"
                  style={{
                    filter: selectedRing.rank === 2 ? 'grayscale(1) brightness(1.2)' : selectedRing.rank === 3 ? 'sepia(1) hue-rotate(-30deg) saturate(1.5) brightness(0.9)' : 'none'
                  }}
                />
                
                {/* Overlay Texte sur la bague (Simulation 2.5D) */}
                <div style={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  width: '100%',
                  pointerEvents: 'none'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: selectedRing.rank === 2 ? '#e2e8f0' : selectedRing.rank === 3 ? '#d97706' : 'rgba(255,255,255,0.9)', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                    {selectedRing.rank === 1 ? 'CHAMPION' : selectedRing.rank === 2 ? 'FINALISTE' : '3E PLACE'}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: selectedRing.rank === 1 ? '#f5af19' : selectedRing.rank === 2 ? '#cbd5e1' : '#b45309', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>2026-2027</div>
                </div>
              </div>

              {/* Panneau de Droite : Gravure Intérieure (Séries) */}
              <div style={{ flex: 1, paddingLeft: '20px' }}>
                <div style={{ fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>
                  Gravure Intérieure
                </div>
                <div style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  padding: '24px', 
                  borderRadius: '16px', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontFamily: "'Courier New', Courier, monospace",
                  color: '#fbbf24',
                  fontSize: '16px',
                  lineHeight: '1.8'
                }}>
                  <div><span style={{ color: '#94a3b8' }}>SAISON:</span> DOMINANTE</div>
                  <div><span style={{ color: '#94a3b8' }}>MEILLEUR JOUEUR:</span> M. MARNER</div>
                  <div><span style={{ color: '#94a3b8' }}>MATCHS SIMULÉS:</span> 82</div>
                  <div style={{ borderTop: '1px dashed rgba(255,255,255,0.2)', margin: '12px 0' }}></div>
                  <div style={{ fontStyle: 'italic', textAlign: 'center' }}>"À jamais gravé dans l'histoire"</div>
                </div>
              </div>
              
            </div>
            
            <button 
              onClick={() => setSelectedRing(null)}
              className="mt-12 px-10 py-4 bg-white text-black font-black rounded-full hover:bg-slate-200 transition-colors text-lg"
            >
              Fermer l'Écrin
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
}
