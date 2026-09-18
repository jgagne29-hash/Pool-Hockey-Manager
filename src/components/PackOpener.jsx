import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Package, Sparkles, RefreshCw } from 'lucide-react';
import { HockeyPlayerCard } from './HockeyPlayerCard';
import { PLAYERS } from '../data/players';

export const PackOpener = ({ onAddCardToLineup }) => {
  const [isOpening, setIsOpening] = useState(false);
  const [pulledCard, setPulledCard] = useState(null);

  const handleOpenPack = () => {
    setIsOpening(true);
    setPulledCard(null);

    setTimeout(() => {
      // Choix aléatoire d'un joueur
      const randomPlayer = PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
      // Chance de rareté : 50% Rare, 30% Epic, 20% Base
      const roll = Math.random();
      let chosenRarity = 'Common';
      if (roll > 0.65) chosenRarity = 'Epic';
      else if (roll > 0.25) chosenRarity = 'Rare';

      const chosenEdition = randomPlayer.cards.find(c => c.rarity === chosenRarity) || randomPlayer.cards[0];

      setPulledCard({
        player: randomPlayer,
        edition: chosenEdition
      });
      setIsOpening(false);

      // Tir de confettis
      confetti({
        particleCount: chosenRarity === 'Epic' ? 120 : 60,
        spread: 90,
        origin: { y: 0.5 },
        colors: chosenRarity === 'Epic' ? ['#8a2387', '#e94057', '#f27121'] : ['#f5af19', '#e7c996', '#ffffff']
      });
    }, 1000);
  };

  return (
    <div style={{
      background: 'rgba(18, 22, 32, 0.9)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '32px',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(245, 175, 25, 0.1)', borderRadius: '50%', marginBottom: '12px' }}>
          <Package size={32} color="#f5af19" />
        </div>

        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff' }}>
          Booster Mystère : Tirage de Cartes Rares
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: '20px' }}>
          Tentez votre chance pour débloquer une édition <strong>Étoile (x1.2)</strong> ou <strong>Légendaire (x1.5)</strong> avec effet holographique immersif !
        </p>

        <button
          onClick={handleOpenPack}
          disabled={isOpening}
          style={{
            background: 'linear-gradient(135deg, #8a2387 0%, #e94057 50%, #f27121 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            padding: '14px 28px',
            fontSize: '15px',
            fontWeight: 800,
            cursor: isOpening ? 'wait' : 'pointer',
            boxShadow: '0 6px 25px rgba(233, 64, 87, 0.5)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          {isOpening ? (
            <>
              <RefreshCw size={18} className="animate-spin" /> Déballage du paquet...
            </>
          ) : (
            <>
              <Sparkles size={18} /> Déballer un Paquet Mystère
            </>
          )}
        </button>

        {pulledCard && (
          <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              fontSize: '14px',
              fontWeight: 800,
              color: pulledCard.edition.rarity === 'Epic' ? '#e94057' : '#f5af19',
              marginBottom: '16px'
            }}>
              🎉 Tirage réussi : Édition {pulledCard.edition.rarity === 'Epic' ? '🔥 ÉPIQUE LÉGENDAIRE' : pulledCard.edition.rarity === 'Rare' ? '⭐ RARE ÉTOILE' : 'Régulière'} !
            </div>

            <HockeyPlayerCard
              player={pulledCard.player}
              selectedEditionId={pulledCard.edition.edition_id}
              onSelectEdition={() => {}}
              isInLineup={false}
              onToggleLineup={(p, e) => onAddCardToLineup(p, e)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
