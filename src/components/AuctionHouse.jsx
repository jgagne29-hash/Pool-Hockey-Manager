import React, { useState, useEffect } from 'react';
import { Button, InputNumber, Select, message, Tabs, Empty, Tag, Statistic, Badge } from 'antd';
import { ClockCircleOutlined, DollarOutlined, SwapOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, TrendingUp, Tag as TagIcon, Search, Coins, AlertCircle } from 'lucide-react';
import HockeyPlayerCard from './HockeyPlayerCard';
import { PLAYERS } from '../data/players';
import { calculateMarketValue } from '../utils/market';

const { Countdown } = Statistic;

// Composant utilitaire pour formater le temps
const formatTimeRemaining = (ms) => {
  if (ms <= 0) return "Terminé";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${h}h ${m}m ${s}s`;
};

export const AuctionHouse = ({ 
  userCoins, 
  onDeductCoins, 
  onAddCoins, 
  binderCards = [], 
  onRemoveCardFromBinder,
  onAddCardToBinder 
}) => {
  const [activeTab, setActiveTab] = useState('market');
  
  // Simulations des enchères actives du marché
  const [activeAuctions, setActiveAuctions] = useState([]);
  
  // Simulations des enchères créées par le joueur
  const [myAuctions, setMyAuctions] = useState([]);
  
  // Simulations des enchères sur lesquelles le joueur a misé
  const [myBids, setMyBids] = useState([]);

  // Variables de vente
  const [selectedCardToSell, setSelectedCardToSell] = useState(null);
  const [sellStartingBid, setSellStartingBid] = useState(500);
  const [sellDurationHours, setSellDurationHours] = useState(24);

  // Initialisation avec de fausses enchères
  useEffect(() => {
    // Génère 8 fausses enchères avec des joueurs aléatoires
    const dummyAuctions = [];
    for (let i = 0; i < 8; i++) {
      const p = PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
      const isRare = Math.random() > 0.7;
      const rarity = isRare ? 'Ultra-Rare' : 'Base';
      const c = p.cards ? p.cards[0] : { edition_id: `${p.nhl_id}_base`, rarity: rarity };
      
      const baseVal = calculateMarketValue(p, c, 35);
      
      dummyAuctions.push({
        id: `auction_${Date.now()}_${i}`,
        seller: `@DG_${Math.random().toString(36).substring(2, 6)}`,
        player: p,
        edition: c,
        marketVal: baseVal,
        currentBid: Math.floor(baseVal * (0.8 + Math.random() * 0.5)),
        highestBidder: Math.random() > 0.5 ? `@User_${Math.random().toString(36).substring(2, 5)}` : null,
        endTime: Date.now() + Math.floor(Math.random() * 10000000), // Random time between 0 and 3 hours
        bidsCount: Math.floor(Math.random() * 15)
      });
    }
    setActiveAuctions(dummyAuctions);
  }, []);

  // TICK pour mettre à jour les temps restants (déclencher un re-render)
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePlaceBid = (auction, amount) => {
    if (userCoins < amount) {
      message.error(`Fonds insuffisants ! Il vous faut ${amount} 🪙.`);
      return;
    }
    
    if (amount <= auction.currentBid) {
      message.warning(`Votre mise doit être supérieure à la mise actuelle de ${auction.currentBid} 🪙.`);
      return;
    }

    // Déduire les fonds (Dans un vrai jeu, l'argent est mis "en escroc" / bloqué)
    if (onDeductCoins) onDeductCoins(amount);
    
    // Si on avait déjà la meilleure mise, rembourser l'ancienne mise
    // Pour simplifier ce prototype, on assume qu'on rembourse si l'utilisateur était déjà le highestBidder
    if (auction.highestBidder === 'VOUS' && onAddCoins) {
       onAddCoins(auction.currentBid);
    }

    message.success(`Mise de ${amount} 🪙 placée avec succès sur ${auction.player.name} !`);

    // Mettre à jour l'enchère
    const updatedAuctions = activeAuctions.map(a => {
      if (a.id === auction.id) {
        return { ...a, currentBid: amount, highestBidder: 'VOUS', bidsCount: a.bidsCount + 1 };
      }
      return a;
    });
    setActiveAuctions(updatedAuctions);

    // L'ajouter à nos "My Bids"
    if (!myBids.some(b => b.id === auction.id)) {
      setMyBids(prev => [...prev, auction.id]);
    }
  };

  const handleCreateAuction = () => {
    if (!selectedCardToSell) return;

    if (sellStartingBid < 100) {
      message.warning("La mise de départ doit être d'au moins 100 🪙.");
      return;
    }

    const endTime = Date.now() + (sellDurationHours * 3600000);
    
    const newAuction = {
      id: `my_auction_${Date.now()}`,
      seller: 'VOUS',
      player: selectedCardToSell.playerData,
      edition: {
        edition_id: selectedCardToSell.edition_id,
        rarity: selectedCardToSell.rarity,
        bg_color: selectedCardToSell.bg_color
      },
      marketVal: calculateMarketValue(selectedCardToSell.playerData, selectedCardToSell, 35),
      currentBid: sellStartingBid,
      highestBidder: null,
      endTime: endTime,
      bidsCount: 0
    };

    // Retirer de l'inventaire
    if (onRemoveCardFromBinder) {
      onRemoveCardFromBinder(selectedCardToSell.instance_id);
    }

    // Ajouter au marché
    setActiveAuctions(prev => [newAuction, ...prev]);
    setMyAuctions(prev => [...prev, newAuction.id]);
    setSelectedCardToSell(null);
    message.success("Carte mise en vente avec succès !");
    setActiveTab('my_bids');
  };

  // Filtrer les enchères selon le tab
  const marketItems = activeAuctions.filter(a => a.endTime > now && a.seller !== 'VOUS');
  const myAuctionsItems = activeAuctions.filter(a => myAuctions.includes(a.id));
  const myBidsItems = activeAuctions.filter(a => myBids.includes(a.id) && a.seller !== 'VOUS');

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', color: '#fff' }}>
      
      {/* HEADER DU MARCHÉ */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(20,20,20,0.95) 0%, rgba(30,40,60,0.95) 100%)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '12px',
            borderRadius: '12px'
          }}>
            <Gavel size={32} color="#00d2ff" />
          </div>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Marché des Enchères
            </h2>
            <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '13px' }}>
              Misez, vendez et remportez les enchères contre les autres D.G. !
            </p>
          </div>
        </div>
        
        <div style={{ 
          background: 'rgba(0,0,0,0.5)', 
          padding: '12px 24px', 
          borderRadius: '16px',
          border: '1px solid rgba(245, 175, 25, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Coins size={24} color="#f5af19" />
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 800 }}>Votre Solde</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#f5af19' }}>{userCoins} 🪙</div>
          </div>
        </div>
      </div>

      {/* NAVIGATION INTERNE */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('market')}
          style={{
            padding: '10px 20px', borderRadius: '10px', fontWeight: 800, fontSize: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
            background: activeTab === 'market' ? 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)' : 'rgba(255,255,255,0.05)',
            border: activeTab === 'market' ? 'none' : '1px solid rgba(255,255,255,0.1)',
            color: activeTab === 'market' ? '#fff' : 'var(--text-secondary)'
          }}
        >
          <Search size={16} /> Parcourir le Marché
        </button>
        <button
          onClick={() => setActiveTab('sell')}
          style={{
            padding: '10px 20px', borderRadius: '10px', fontWeight: 800, fontSize: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
            background: activeTab === 'sell' ? 'linear-gradient(135deg, #f5af19 0%, #e65c00 100%)' : 'rgba(255,255,255,0.05)',
            border: activeTab === 'sell' ? 'none' : '1px solid rgba(255,255,255,0.1)',
            color: activeTab === 'sell' ? '#fff' : 'var(--text-secondary)'
          }}
        >
          <TagIcon size={16} /> Vendre une Carte
        </button>
        <button
          onClick={() => setActiveTab('my_bids')}
          style={{
            padding: '10px 20px', borderRadius: '10px', fontWeight: 800, fontSize: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
            background: activeTab === 'my_bids' ? 'linear-gradient(135deg, #ff0055 0%, #a00030 100%)' : 'rgba(255,255,255,0.05)',
            border: activeTab === 'my_bids' ? 'none' : '1px solid rgba(255,255,255,0.1)',
            color: activeTab === 'my_bids' ? '#fff' : 'var(--text-secondary)'
          }}
        >
          <TrendingUp size={16} /> Mes Activités (Offres & Ventes)
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* ONGLET 1 : PARCOURIR LE MARCHÉ */}
        {activeTab === 'market' && (
          <motion.div
            key="market"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px'
            }}>
              {marketItems.map(auction => (
                <AuctionCardItem key={auction.id} auction={auction} now={now} onBid={handlePlaceBid} userCoins={userCoins} />
              ))}
              {marketItems.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px' }}>
                  <Empty description={<span style={{ color: 'var(--text-secondary)' }}>Aucune carte sur le marché actuellement.</span>} />
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ONGLET 2 : VENDRE UNE CARTE */}
        {activeTab === 'sell' && (
          <motion.div
            key="sell"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              background: 'rgba(20,20,20,0.8)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.08)'
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TagIcon size={20} color="#f5af19" /> Créer une enchère
            </h3>
            
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              
              {/* Panneau de configuration de la vente */}
              <div style={{ flex: '1 1 300px', background: 'rgba(0,0,0,0.5)', padding: '20px', borderRadius: '12px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    1. Sélectionner une carte de votre Cartable
                  </label>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Choisir une carte..."
                    onChange={(val) => {
                      const card = binderCards.find(c => c.instance_id === val);
                      setSelectedCardToSell(card);
                    }}
                    value={selectedCardToSell?.instance_id}
                    options={binderCards.map(c => ({
                      value: c.instance_id,
                      label: `${c.name} (${c.rarity}) - #${c.number} ${c.team}`
                    }))}
                  />
                  {binderCards.length === 0 && (
                    <div style={{ fontSize: '12px', color: '#ff4d4f', marginTop: '6px' }}>
                      Votre cartable est vide. Vous devez ouvrir des paquets !
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    2. Mise de départ (Minimum Bid)
                  </label>
                  <InputNumber
                    min={100}
                    step={50}
                    value={sellStartingBid}
                    onChange={setSellStartingBid}
                    style={{ width: '100%' }}
                    addonAfter="🪙"
                  />
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                    Note: Une taxe de transaction de 5% sera appliquée sur le montant final de la vente.
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    3. Durée de l'enchère
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[12, 24, 48, 72].map(hours => (
                      <button
                        key={hours}
                        onClick={() => setSellDurationHours(hours)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          background: sellDurationHours === hours ? 'rgba(245, 175, 25, 0.2)' : 'rgba(255,255,255,0.05)',
                          border: sellDurationHours === hours ? '1px solid #f5af19' : '1px solid transparent',
                          borderRadius: '8px',
                          color: sellDurationHours === hours ? '#f5af19' : '#fff',
                          cursor: 'pointer',
                          fontWeight: 700
                        }}
                      >
                        {hours}h
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="primary"
                  block
                  size="large"
                  disabled={!selectedCardToSell}
                  onClick={handleCreateAuction}
                  style={{
                    background: selectedCardToSell ? 'linear-gradient(135deg, #f5af19 0%, #e65c00 100%)' : '#333',
                    border: 'none',
                    fontWeight: 800,
                    height: '46px'
                  }}
                >
                  Mettre aux Enchères
                </Button>
              </div>

              {/* Aperçu de la carte */}
              <div style={{ flex: '0 0 280px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h4 style={{ color: 'var(--text-secondary)', marginTop: 0, marginBottom: '16px' }}>Aperçu de l'enchère</h4>
                {selectedCardToSell ? (
                  <div style={{ transform: 'scale(0.9)', transformOrigin: 'top center' }}>
                    <HockeyPlayerCard
                      player={selectedCardToSell.playerData}
                      selectedEditionId={selectedCardToSell.edition_id}
                      onSelectEdition={() => {}}
                    />
                  </div>
                ) : (
                  <div style={{ 
                    width: '100%', 
                    height: '350px', 
                    border: '2px dashed rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)'
                  }}>
                    Aucune carte sélectionnée
                  </div>
                )}
              </div>
              
            </div>
          </motion.div>
        )}

        {/* ONGLET 3 : MES ACTIVITÉS */}
        {activeTab === 'my_bids' && (
          <motion.div
            key="my_bids"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#f5af19', marginBottom: '16px' }}>Cartes que je vends</h3>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px'
            }}>
              {myAuctionsItems.map(auction => (
                <AuctionCardItem key={auction.id} auction={auction} now={now} isMine={true} />
              ))}
              {myAuctionsItems.length === 0 && (
                <div style={{ gridColumn: '1 / -1', padding: '30px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', textAlign: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Vous n'avez aucune carte en vente.</span>
                </div>
              )}
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#00d2ff', marginBottom: '16px' }}>Mes Mises (Bids)</h3>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px'
            }}>
              {myBidsItems.map(auction => (
                <AuctionCardItem key={auction.id} auction={auction} now={now} onBid={handlePlaceBid} userCoins={userCoins} />
              ))}
              {myBidsItems.length === 0 && (
                <div style={{ gridColumn: '1 / -1', padding: '30px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', textAlign: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Vous n'avez misé sur aucune carte.</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


// SOUS-COMPOSANT : La carte individuelle dans le marché
const AuctionCardItem = ({ auction, now, onBid, userCoins, isMine = false }) => {
  const timeLeftMs = auction.endTime - now;
  const isExpired = timeLeftMs <= 0;
  
  // Suggested bid amounts
  const minBid = auction.currentBid + 50;
  
  const amIWinning = auction.highestBidder === 'VOUS';

  return (
    <div style={{
      background: 'rgba(20,20,20,0.8)',
      border: isMine ? '1px solid rgba(245, 175, 25, 0.4)' : amIWinning ? '1px solid rgba(0, 210, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '16px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: amIWinning ? '0 0 20px rgba(0,210,255,0.1)' : 'none'
    }}>
      {/* Header Info */}
      <div style={{ 
        padding: '10px 12px', 
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          Vendeur: <strong style={{ color: '#fff' }}>{auction.seller}</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isExpired ? '#ff4d4f' : '#38ef7d', fontSize: '12px', fontWeight: 700 }}>
          <ClockCircleOutlined />
          {formatTimeRemaining(timeLeftMs)}
        </div>
      </div>

      {/* Card Display */}
      <div style={{ padding: '16px', display: 'flex', justifyContent: 'center', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)' }}>
        <div style={{ transform: 'scale(0.85)', transformOrigin: 'center center', margin: '-20px 0' }}>
          <HockeyPlayerCard
            player={auction.player}
            selectedEditionId={auction.edition.edition_id}
            onSelectEdition={() => {}}
          />
        </div>
      </div>

      {/* Footer / Bidding UI */}
      <div style={{ padding: '16px', background: 'rgba(0,0,0,0.4)', marginTop: 'auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Mise Actuelle
            </div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#f5af19', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {auction.currentBid} <Coins size={16} />
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Enchérisseur</div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: amIWinning ? '#00d2ff' : '#fff' }}>
              {auction.highestBidder || '---'}
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>{auction.bidsCount} offres</div>
          </div>
        </div>

        {!isMine && !isExpired && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button 
              type="primary" 
              onClick={() => onBid(auction, minBid)}
              disabled={userCoins < minBid}
              style={{
                flex: 1,
                background: amIWinning ? '#222' : 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                borderColor: amIWinning ? '#444' : 'transparent',
                color: amIWinning ? '#888' : '#fff',
                fontWeight: 800
              }}
            >
              {amIWinning ? 'Vous menez' : `Miser ${minBid} 🪙`}
            </Button>
          </div>
        )}

        {isExpired && (
          <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(255,77,79,0.1)', color: '#ff4d4f', borderRadius: '8px', fontWeight: 700 }}>
            Enchère Terminée
          </div>
        )}
        
        {isMine && !isExpired && (
          <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(245, 175, 25, 0.1)', color: '#f5af19', borderRadius: '8px', fontWeight: 700 }}>
            Votre Vente
          </div>
        )}

      </div>
    </div>
  );
};

export default AuctionHouse;
