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
                      transform: 'translateY(-10px)'
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
            className="relative flex flex-col items-center animate-in zoom-in duration-500"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-[-150px] w-[300px] h-[600px] bg-white/20 blur-[100px] rounded-full pointer-events-none" />
            
            <h2 className="text-4xl font-black text-white mb-8 tracking-widest uppercase" style={{ textShadow: '0 0 20px rgba(255,255,255,0.5)' }}>
              Célébration du Champion
            </h2>
            
            <img 
              src={supremeRing} 
              alt="The Ultimate Ring" 
              className="w-[600px] h-[600px] object-cover rounded-3xl shadow-[0_0_100px_rgba(255,255,255,0.3)] border-2 border-white/20"
            />
            
            <p className="mt-8 text-xl text-slate-300 font-bold max-w-2xl text-center">
              Félicitations, Directeur Général ! Vous avez remporté le titre suprême et cette bague prestigieuse est gravée à votre nom pour l'éternité.
            </p>
            
            <button 
              onClick={() => setSelectedRing(null)}
              className="mt-8 px-8 py-3 bg-white text-black font-black rounded-full hover:bg-slate-200 transition-colors"
            >
              Fermer l'Écrin
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
}
