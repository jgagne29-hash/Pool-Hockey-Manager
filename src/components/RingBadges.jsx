import React from 'react';
import { CHAMPIONSHIP_RINGS, USER_UNLOCKED_RINGS } from '../data/rings';

export default function RingBadges({ onOpenVault }) {
  
  const unlockedRings = CHAMPIONSHIP_RINGS.filter(ring => 
    USER_UNLOCKED_RINGS.includes(ring.id)
  );

  if (unlockedRings.length === 0) return null;

  return (
    <div 
      className="flex flex-wrap items-center gap-2 mt-3 cursor-pointer p-2 rounded-lg hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
      onClick={onOpenVault}
      title="Voir le Hall of Fame"
    >
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">
        Bagues Remportées :
      </span>
      {unlockedRings.map(ring => {
        
        let ringGradient = "";
        let borderGlow = "";

        if (ring.metal === 'silver') {
          ringGradient = "from-slate-300 via-slate-100 to-slate-400 text-slate-900";
          borderGlow = "border-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]";
        } else if (ring.metal === 'bronze') {
          ringGradient = "from-amber-700 via-amber-600 to-amber-900 text-white";
          borderGlow = "border-amber-900 shadow-[0_0_8px_rgba(217,119,6,0.5)]";
        } else if (ring.metal === 'gold') {
          ringGradient = "from-yellow-400 via-yellow-200 to-yellow-600 text-yellow-900";
          borderGlow = "border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]";
        } else if (ring.metal === 'gold-red') {
          ringGradient = "from-red-500 via-orange-400 to-yellow-500 text-white";
          borderGlow = "border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.6)]";
        } else if (ring.metal === 'platinum') {
          ringGradient = "from-white via-slate-200 to-slate-400 text-slate-900";
          borderGlow = "border-white shadow-[0_0_15px_rgba(255,255,255,0.8)]";
        }

        return (
          <div 
            key={ring.id}
            className={`
              flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black
              bg-gradient-to-br ${ringGradient} border-2 ${borderGlow}
              transform transition-transform hover:scale-110
            `}
          >
            <span>{ring.title}</span>
          </div>
        )
      })}
    </div>
  );
}
