import React, { useState } from 'react';
import { Button, Progress, Alert, Space, Tag, message, Slider } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowRightLeft, Shield, Sparkles, UserCheck, Plus, X, Coins, Stethoscope, AlertTriangle } from 'lucide-react';
import { PLAYERS } from '../data/players';

/**
 * Calcule la valeur marchande d'un joueur en temps réel
 */
function calculatePlayerMarketValue(player) {
  let baseValue = player.base_cap_hit;

  // 1. Ajustement selon la performance récente
  const pointsPerGame = (player.recent_points || 0) / (player.recent_games || 1);
  let performanceMultiplier = pointsPerGame > 1.0 ? 1.3 : (pointsPerGame < 0.5 ? 0.7 : 1.0);

  // 2. Ajustement selon la santé (Blessure)
  let healthMultiplier = player.is_injured ? 0.3 : 1.0;

  // 3. Ajustement selon les manchettes (Moral / Comportement)
  let mediaMultiplier = player.bad_news_flag ? 0.8 : 1.0;

  // Valeur finale arrondie
  const marketValue = baseValue * performanceMultiplier * healthMultiplier * mediaMultiplier;
  return Math.round(marketValue);
}

/**
 * Évalue l'offre selon les règles du CPU
 */
function evaluateTradeOffer(offeredPlayerTotal, requestedPlayerTotal, retentionPercent = 0) {
  // Ajustement de la valeur perçue si le Gérant absorbe une partie du salaire (Max 50%)
  const adjustedValueForBuyer = offeredPlayerTotal * (1 + (retentionPercent / 100));

  // Différence de valeur
  const diff = adjustedValueForBuyer - requestedPlayerTotal;
  const ratio = requestedPlayerTotal > 0 ? (diff / requestedPlayerTotal) * 100 : 0;

  if (ratio >= -15) {
    return { 
      status: "ACCEPTED", 
      message: "Échange validé par le réseau de la LNH !" 
    };
  } else {
    return { 
      status: "COUNTER_OFFER", 
      message: `Le prix est trop élevé. Le CPU exige une offre meilleure ou une rétention de salaire plus élevée.` 
    };
  }
}

export const TradeCenter = ({ userLineup = [], onTradeSuccess }) => {
  // On liste tous les joueurs de la ligue qui ne sont pas dans l'alignement
  const availableLeaguePlayers = PLAYERS.filter(
    p => !userLineup.some(l => l.player.nhl_id === p.nhl_id)
  ).slice(0, 50); // Limite d'affichage pour les perfs

  const userInventory = userLineup.map(item => item.player);

  const [userSelected, setUserSelected] = useState([]);
  const [targetSelected, setTargetSelected] = useState([]);
  const [retentionPercent, setRetentionPercent] = useState(0);
  const [tradeSuccessMsg, setTradeSuccessMsg] = useState(null);

  const toggleUserCard = (player) => {
    const exists = userSelected.some(c => c.nhl_id === player.nhl_id);
    if (exists) {
      setUserSelected(prev => prev.filter(c => c.nhl_id !== player.nhl_id));
    } else {
      setUserSelected(prev => [...prev, player]);
    }
  };

  const toggleTargetCard = (player) => {
    const exists = targetSelected.some(c => c.nhl_id === player.nhl_id);
    if (exists) {
      setTargetSelected(prev => prev.filter(c => c.nhl_id !== player.nhl_id));
    } else {
      setTargetSelected(prev => [...prev, player]);
    }
  };

  const userTotalValue = userSelected.reduce((sum, p) => sum + calculatePlayerMarketValue(p), 0);
  const targetTotalValue = targetSelected.reduce((sum, p) => sum + calculatePlayerMarketValue(p), 0);
  
  const hasInjured = userSelected.some(p => p.is_injured);
  
  // Évaluation
  let evaluation = { status: "PENDING", message: "Sélectionnez des joueurs pour évaluer l'offre." };
  
  if (userSelected.length > 0 && targetSelected.length > 0) {
    if (hasInjured && retentionPercent === 0) {
      evaluation = { status: "REFUSED", message: "Un de vos joueurs est blessé. Aucune équipe n'en veut sans rétention de salaire." };
    } else {
      evaluation = evaluateTradeOffer(userTotalValue, targetTotalValue, retentionPercent);
    }
  }

  const isTradeFair = evaluation.status === "ACCEPTED";
  const adjustedValue = userTotalValue * (1 + (retentionPercent / 100));
  const diffRatio = targetTotalValue > 0 ? ((adjustedValue - targetTotalValue) / targetTotalValue) * 100 : 0;
  const balancePercent = Math.max(0, Math.min(100, 50 + diffRatio));

  const handleConfirmTrade = () => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#52c41a', '#1890ff', '#f5af19', '#ffffff']
    });

    setTradeSuccessMsg("🎉 Transaction officielle conclue avec succès !");
    if (onTradeSuccess) {
      // Le composant parent devra gérer l'ajout des targetSelected et le retrait des userSelected
      onTradeSuccess(userSelected, targetSelected, retentionPercent);
    }
    setUserSelected([]);
    setTargetSelected([]);
    setRetentionPercent(0);

    setTimeout(() => setTradeSuccessMsg(null), 5000);
  };

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ background: 'rgba(18, 22, 32, 0.9)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ArrowRightLeft size={24} color="#52c41a" />
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', margin: 0 }}>Salle des Échanges LNH</h2>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
          La valeur des joueurs fluctue selon leurs performances, blessures et controverses.
        </p>

        {tradeSuccessMsg && (
          <div style={{ marginTop: '14px' }}>
            <Alert message={tradeSuccessMsg} type="success" showIcon />
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Colonne 1 : Votre Alignement */}
        <div style={{ background: 'rgba(18, 22, 32, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#52c41a', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Votre Bloc de Départ</span>
            <Tag color="green">{userSelected.length} sélectionné(s)</Tag>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto' }}>
            {userInventory.map((p, idx) => {
              const isSelected = userSelected.some(c => c.nhl_id === p.nhl_id);
              return (
                <div key={p.nhl_id} onClick={() => toggleUserCard(p)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: '10px', background: isSelected ? 'rgba(82, 196, 26, 0.2)' : 'rgba(255,255,255,0.03)', border: isSelected ? '1px solid #52c41a' : '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '13px', color: '#fff' }}>#{p.number} {p.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', gap: '4px', marginTop: '4px' }}>
                      <span>{p.team}</span> • <span>{p.position}</span>
                      {p.is_injured && <Stethoscope size={12} color="#ef4444" />}
                      {p.bad_news_flag && <AlertTriangle size={12} color="#f59e0b" />}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: '#52c41a' }}>{(calculatePlayerMarketValue(p) / 1000000).toFixed(2)}M</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Colonne 2 : Marché (Joueurs de la Ligue) */}
        <div style={{ background: 'rgba(18, 22, 32, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1890ff', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Cibles d'Échange (Ligue)</span>
            <Tag color="blue">{targetSelected.length} sélectionné(s)</Tag>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto' }}>
            {availableLeaguePlayers.map((p, idx) => {
              const isSelected = targetSelected.some(c => c.nhl_id === p.nhl_id);
              return (
                <div key={p.nhl_id} onClick={() => toggleTargetCard(p)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: '10px', background: isSelected ? 'rgba(24, 144, 255, 0.2)' : 'rgba(255,255,255,0.03)', border: isSelected ? '1px solid #1890ff' : '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '13px', color: '#fff' }}>{p.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{p.team} • {p.position}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: '#1890ff' }}>{(calculatePlayerMarketValue(p) / 1000000).toFixed(2)}M</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Module d'Évaluation */}
      <div style={{ background: 'rgba(20, 20, 20, 0.95)', padding: '24px', borderRadius: '16px', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase' }}>Valeur de votre offre</h3>
            <span style={{ fontSize: '28px', color: '#52c41a', fontWeight: '900' }}>{(userTotalValue / 1000000).toFixed(2)}<span style={{ fontSize: '14px' }}>M</span></span>
          </div>
          <motion.div animate={{ rotate: isTradeFair ? [0, 180, 360] : 0 }} transition={{ duration: 0.6 }}>
            <SwapOutlined style={{ fontSize: '36px', color: isTradeFair ? '#52c41a' : '#ff4d4f' }} />
          </motion.div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase' }}>Valeur demandée</h3>
            <span style={{ fontSize: '28px', color: '#1890ff', fontWeight: '900' }}>{(targetTotalValue / 1000000).toFixed(2)}<span style={{ fontSize: '14px' }}>M</span></span>
          </div>
        </div>

        {/* Option de Rétention de Salaire */}
        {userTotalValue > 0 && targetTotalValue > 0 && (
          <div style={{ marginBottom: '24px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Rétention de salaire (Pour adoucir l'offre)</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Slider 
                min={0} max={50} 
                value={retentionPercent} 
                onChange={setRetentionPercent} 
                style={{ flex: 1 }}
                trackStyle={{ background: '#52c41a' }}
              />
              <span style={{ fontSize: '16px', fontWeight: 900, color: '#52c41a', width: '40px' }}>{retentionPercent}%</span>
            </div>
            {retentionPercent > 0 && (
              <div style={{ fontSize: '12px', color: '#f5af19', marginTop: '8px' }}>
                Vous conserverez {((userTotalValue * (retentionPercent / 100)) / 1000000).toFixed(2)}M sur votre masse salariale (Cap Hit).
              </div>
            )}
          </div>
        )}

        {/* Status de l'offre */}
        <div style={{ marginBottom: '24px' }}>
          {evaluation.status === "PENDING" && <Alert message={evaluation.message} type="info" showIcon />}
          {evaluation.status === "ACCEPTED" && <Alert message={evaluation.message} type="success" showIcon />}
          {evaluation.status === "COUNTER_OFFER" && <Alert message={evaluation.message} type="warning" showIcon />}
          {evaluation.status === "REFUSED" && <Alert message={evaluation.message} type="error" showIcon />}
        </div>

        <Button
          type="primary" block size="large"
          disabled={!isTradeFair}
          onClick={handleConfirmTrade}
          style={{
            background: isTradeFair ? 'linear-gradient(135deg, #52c41a 0%, #237804 100%)' : '#262626',
            borderColor: isTradeFair ? '#52c41a' : '#434343',
            color: isTradeFair ? '#fff' : '#666',
            fontWeight: 800, height: '46px'
          }}
        >
          Soumettre l'offre d'échange
        </Button>
      </div>
    </div>
  );
};
