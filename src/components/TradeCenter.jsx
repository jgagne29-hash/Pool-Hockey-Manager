import React, { useState } from 'react';
import { Button, Progress, Alert, Space, Tag } from 'antd';
import { SwapOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowRightLeft, Shield, Sparkles, UserCheck, Plus, X } from 'lucide-react';
import { PLAYERS } from '../data/players';
import { calculateMarketValue } from '../utils/market';

/**
 * Composant de Validation d'Échange avec Ant Design & Algorithme d'Équité (Marge max 15%)
 */
export const TradeValidation = ({
  userOfferedCards,
  targetOfferedCards,
  onConfirmTrade
}) => {
  // Calcul des totaux de valeur de marché
  const userTotalValue = userOfferedCards.reduce((sum, c) => sum + (c.market_value || 0), 0);
  const targetTotalValue = targetOfferedCards.reduce((sum, c) => sum + (c.market_value || 0), 0);

  // Calcul du ratio d'équité
  const valueDifference = Math.abs(userTotalValue - targetTotalValue);
  const highestValue = Math.max(userTotalValue, targetTotalValue);
  const unfairRatio = highestValue > 0 ? (valueDifference / highestValue) * 100 : 0;

  // L'échange est équitable si l'écart est <= 15%
  const isTradeFair = (userOfferedCards.length > 0 && targetOfferedCards.length > 0) && unfairRatio <= 15;
  const balancePercent = Math.max(0, Math.min(100, Math.round(100 - unfairRatio)));

  return (
    <div style={{
      background: 'rgba(20, 20, 20, 0.95)',
      padding: '24px',
      borderRadius: '16px',
      color: '#fff',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)'
    }}>
      {/* Comparateur des Offres */}
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Votre Offre
          </h3>
          <span style={{ fontSize: '28px', color: '#52c41a', fontWeight: '900' }}>
            {userTotalValue} <span style={{ fontSize: '14px' }}>pts</span>
          </span>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
            {userOfferedCards.length} carte(s) offerte(s)
          </div>
        </div>

        <motion.div
          animate={{ rotate: isTradeFair ? [0, 180, 360] : 0 }}
          transition={{ duration: 0.6 }}
        >
          <SwapOutlined style={{ fontSize: '36px', color: isTradeFair ? '#52c41a' : '#ff4d4f' }} />
        </motion.div>

        <div style={{ textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Leur Offre
          </h3>
          <span style={{ fontSize: '28px', color: '#1890ff', fontWeight: '900' }}>
            {targetTotalValue} <span style={{ fontSize: '14px' }}>pts</span>
          </span>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
            {targetOfferedCards.length} carte(s) demandée(s)
          </div>
        </div>
      </div>

      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '12px' }}>
            <span>Équilibre du marché :</span>
            <span style={{ fontWeight: 800, color: isTradeFair ? '#52c41a' : '#ff4d4f' }}>
              {balancePercent}% ({unfairRatio.toFixed(1)}% d'écart)
            </span>
          </div>
          <Progress
            percent={balancePercent}
            showInfo={false}
            status={isTradeFair ? "success" : "exception"}
            strokeColor={isTradeFair ? { '0%': '#52c41a', '100%': '#73d13d' } : '#ff4d4f'}
            trailColor="rgba(255, 255, 255, 0.1)"
          />
        </div>

        {userOfferedCards.length === 0 || targetOfferedCards.length === 0 ? (
          <Alert
            message="Sélectionnez au moins une carte de chaque côté pour évaluer l'échange."
            type="info"
            showIcon
            style={{ background: 'rgba(24, 144, 255, 0.1)', border: '1px solid rgba(24, 144, 255, 0.3)', color: '#fff' }}
          />
        ) : isTradeFair ? (
          <Alert
            message="✅ Échange équitable selon les lois du marché LNH. Prêt à être scellé !"
            description={`L'écart de valeur (${unfairRatio.toFixed(1)}%) respecte le seuil maximal de tolérance de 15%.`}
            type="success"
            showIcon
            style={{ background: 'rgba(82, 196, 26, 0.1)', border: '1px solid rgba(82, 196, 26, 0.3)', color: '#fff' }}
          />
        ) : (
          <Alert
            message="❌ Échange refusé par le comité d'équité du Pool"
            description={`La différence de valeur est de ${unfairRatio.toFixed(1)}%. Le règlement limite la marge d'écart à un maximum de 15%. Ajustez les cartes proposées !`}
            type="error"
            showIcon
            style={{ background: 'rgba(255, 77, 79, 0.1)', border: '1px solid rgba(255, 77, 79, 0.3)', color: '#fff' }}
          />
        )}

        <Button
          type="primary"
          block
          disabled={!isTradeFair}
          size="large"
          onClick={onConfirmTrade}
          style={{
            background: isTradeFair ? 'linear-gradient(135deg, #52c41a 0%, #237804 100%)' : '#262626',
            borderColor: isTradeFair ? '#52c41a' : '#434343',
            color: isTradeFair ? '#fff' : '#666',
            height: '46px',
            fontSize: '15px',
            fontWeight: 800,
            boxShadow: isTradeFair ? '0 4px 16px rgba(82, 196, 26, 0.4)' : 'none'
          }}
        >
          Confirmer la transaction
        </Button>
      </Space>
    </div>
  );
};

/**
 * Centre d'Échange complet avec sélection interactive des cartes
 */
export const TradeCenter = ({ userLineup = [], onTradeSuccess }) => {
  // Cartes disponibles pour le joueur cible (le reste de la ligue avec instance_id unique)
  const availableLeagueCards = PLAYERS
    .filter(p => !userLineup.some(l => l.player.nhl_id === p.nhl_id))
    .flatMap((p, pIdx) => p.cards.map((edition, eIdx) => ({
      instance_id: `inst_league_${p.nhl_id}_${edition.edition_id}_${eIdx}`,
      player: p,
      edition,
      market_value: calculateMarketValue(p, edition)
    })));

  // Cartes offertes par l'utilisateur (depuis son alignement / inventaire avec instance_id unique)
  const userInventory = userLineup.map((item, idx) => ({
    instance_id: item.instance_id || `inst_user_${item.player.nhl_id}_${item.edition.edition_id}_${idx}`,
    player: item.player,
    edition: item.edition,
    market_value: calculateMarketValue(item.player, item.edition)
  }));

  const [userSelected, setUserSelected] = useState([]);
  const [targetSelected, setTargetSelected] = useState([]);
  const [tradeSuccessMsg, setTradeSuccessMsg] = useState(null);

  const toggleUserCard = (card) => {
    const exists = userSelected.some(c => c.instance_id === card.instance_id);
    if (exists) {
      setUserSelected(prev => prev.filter(c => c.instance_id !== card.instance_id));
    } else {
      setUserSelected(prev => [...prev, card]);
    }
  };

  const toggleTargetCard = (card) => {
    const exists = targetSelected.some(c => c.instance_id === card.instance_id);
    if (exists) {
      setTargetSelected(prev => prev.filter(c => c.instance_id !== card.instance_id));
    } else {
      setTargetSelected(prev => [...prev, card]);
    }
  };

  const handleConfirmTrade = () => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#52c41a', '#1890ff', '#f5af19', '#ffffff']
    });

    setTradeSuccessMsg("🎉 Transaction officielle conclue avec succès ! Les fiches ont été échangées.");
    if (onTradeSuccess) {
      onTradeSuccess(userSelected, targetSelected);
    }
    setUserSelected([]);
    setTargetSelected([]);

    setTimeout(() => setTradeSuccessMsg(null), 5000);
  };

  return (
    <div style={{ marginBottom: '32px' }}>
      {/* Bannière d'introduction */}
      <div style={{
        background: 'rgba(18, 22, 32, 0.9)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ArrowRightLeft size={24} color="#52c41a" />
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#fff' }}>
            Salle des Échanges & Marché des Joueurs LNH
          </h2>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Formule officielle de calcul : <strong>Valeur = (Buts × 3 + Passes × 2 + Différentiel) × Multiplicateur de Rareté</strong>.
          Pour éviter toute tricherie ou collusion entre poolers, une marge d'écart maximale de <strong>15%</strong> est imposée.
        </p>

        {tradeSuccessMsg && (
          <div style={{ marginTop: '14px' }}>
            <Alert message={tradeSuccessMsg} type="success" showIcon />
          </div>
        )}
      </div>

      {/* Grille : Sélection des cartes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {/* Colonne 1 : Votre Alignement */}
        <div style={{
          background: 'rgba(18, 22, 32, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '16px'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#52c41a', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Vos Cartes à Échanger</span>
            <Tag color="green">{userSelected.length} sélectionnée(s)</Tag>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '380px', overflowY: 'auto' }}>
            {userInventory.map((item, idx) => {
              const isSelected = userSelected.some(c => c.instance_id === item.instance_id);

              return (
                <div
                  key={item.instance_id || idx}
                  onClick={() => toggleUserCard(item)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: isSelected ? 'rgba(82, 196, 26, 0.2)' : 'rgba(255,255,255,0.03)',
                    border: isSelected ? '1px solid #52c41a' : '1px solid rgba(255,255,255,0.06)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '13px', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{item.player.name}</span>
                      <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: '6px', color: '#aaa', fontFamily: 'monospace' }}>
                        #{item.instance_id.split('_').slice(-1)[0]}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: item.edition.rarity === 'Epic' ? '#e94057' : item.edition.rarity === 'Rare' ? '#f5af19' : 'var(--text-secondary)' }}>
                      {item.edition.edition_name} (x{item.edition.multiplier})
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '14px', fontWeight: 900, color: '#52c41a' }}>
                      {item.market_value} pts
                    </span>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                      {(item.edition.cap_hit / 1000000).toFixed(1)}M $
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Colonne 2 : Cartes Disponibles sur le Marché */}
        <div style={{
          background: 'rgba(18, 22, 32, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '16px'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1890ff', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Cartes Disponibles sur le Marché</span>
            <Tag color="blue">{targetSelected.length} sélectionnée(s)</Tag>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '380px', overflowY: 'auto' }}>
            {availableLeagueCards.slice(0, 15).map((item, idx) => {
              const isSelected = targetSelected.some(c => c.instance_id === item.instance_id);

              return (
                <div
                  key={item.instance_id || idx}
                  onClick={() => toggleTargetCard(item)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: isSelected ? 'rgba(24, 144, 255, 0.2)' : 'rgba(255,255,255,0.03)',
                    border: isSelected ? '1px solid #1890ff' : '1px solid rgba(255,255,255,0.06)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '13px', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{item.player.name}</span>
                      <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: '6px', color: '#aaa', fontFamily: 'monospace' }}>
                        #{item.instance_id.split('_').slice(-1)[0]}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: item.edition.rarity === 'Epic' ? '#e94057' : item.edition.rarity === 'Rare' ? '#f5af19' : 'var(--text-secondary)' }}>
                      {item.edition.edition_name} (x{item.edition.multiplier})
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '14px', fontWeight: 900, color: '#1890ff' }}>
                      {item.market_value} pts
                    </span>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                      {(item.edition.cap_hit / 1000000).toFixed(1)}M $
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Module de Validation Mathématique de l'Échange */}
      <TradeValidation
        userOfferedCards={userSelected}
        targetOfferedCards={targetSelected}
        onConfirmTrade={handleConfirmTrade}
      />
    </div>
  );
};
