import React, { useState } from 'react';
import { Modal, Button, Tag, message } from 'antd';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Gift, Coins, Check, Flame, Trophy, Calendar, Zap, Sparkles } from 'lucide-react';
import { POINTS_TO_COINS_RATIO } from '../utils/market';

export const FreeRewardsModal = ({
  isOpen,
  onClose,
  userCoins = 1500,
  onAddCoins,
  teamPoints = 0,
  claimedMilestones = [],
  onClaimMilestone,
  lastDailyClaim = null,
  onClaimDailyBonus
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const isDailyClaimed = lastDailyClaim === todayStr;

  const MILESTONES = [
    { id: 'ms_250', requiredPoints: 250, rewardCoins: 500, label: 'Bâtisseur Recrue (250 pts)' },
    { id: 'ms_500', requiredPoints: 500, rewardCoins: 1000, label: 'Alignement Compétitif (500 pts)' },
    { id: 'ms_1000', requiredPoints: 1000, rewardCoins: 2500, label: 'Équipe Légendaire (1 000 pts)' },
    { id: 'ms_1500', requiredPoints: 1500, rewardCoins: 5000, label: 'Dynastie de la Coupe (1 500 pts)' }
  ];

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#ffd700', '#f5af19', '#00d2ff', '#ffffff']
    });
  };

  const handleClaimDaily = () => {
    if (isDailyClaimed) return;
    const amount = 250;
    if (onClaimDailyBonus) onClaimDailyBonus(amount);
    triggerConfetti();
    message.success(`Lot Quotidien Réclamé : +${amount} 🪙 Rondelles d'Or ajoutées à votre portefeuille !`);
  };

  const handleClaimMs = (ms) => {
    if (claimedMilestones.includes(ms.id) || teamPoints < ms.requiredPoints) return;
    if (onClaimMilestone) onClaimMilestone(ms.id, ms.rewardCoins);
    triggerConfetti();
    message.success(`Palier Débloqué ! +${ms.rewardCoins.toLocaleString()} 🪙 Rondelles d'Or gratuites !`);
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={620}
      styles={{
        content: {
          background: 'radial-gradient(circle at 50% 10%, #1a2236 0%, #0d111a 90%)',
          border: '1px solid rgba(245, 175, 25, 0.4)',
          borderRadius: '20px',
          boxShadow: '0 0 35px rgba(245, 175, 25, 0.25)',
          padding: '28px 24px'
        }
      }}
      centered
    >
      <div style={{ textAlign: 'center' }}>
        {/* En-tête */}
        <div style={{
          width: 56,
          height: 56,
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #f5af19 0%, #e65c00 100%)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(245, 175, 25, 0.5)',
          marginBottom: '12px'
        }}>
          <Gift size={30} color="#fff" />
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>
          Coffre de Récompenses Gratuites
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Accumulez des lots de <strong>Rondelles d'Or (Puck Coins 🪙)</strong> gratuits pour ouvrir vos paquets !
        </p>

        {/* Solde actuel */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(245, 175, 25, 0.15)',
          border: '1px solid rgba(245, 175, 25, 0.4)',
          padding: '6px 18px',
          borderRadius: '20px',
          margin: '12px 0 20px'
        }}>
          <Coins size={16} color="#f5af19" />
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#f5af19' }}>
            Votre Solde : {userCoins.toLocaleString()} 🪙
          </span>
        </div>

        {/* SECTION 1 : LOT QUOTIDIEN GRATUIT */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '16px',
          textAlign: 'left',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'rgba(0, 210, 255, 0.15)',
              padding: '10px',
              borderRadius: '12px',
              border: '1px solid rgba(0, 210, 255, 0.3)'
            }}>
              <Calendar size={22} color="#00d2ff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>
                  Lot Quotidien de Connexion
                </span>
                <Tag color={isDailyClaimed ? "default" : "gold"}>
                  {isDailyClaimed ? "Réclamé aujourd'hui" : "+250 🪙 GRATUIT"}
                </Tag>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                Revenez chaque jour pour obtenir 250 rondelles sans frais !
              </p>
            </div>
          </div>

          <Button
            type="primary"
            disabled={isDailyClaimed}
            onClick={handleClaimDaily}
            style={{
              background: isDailyClaimed ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #f5af19 0%, #e65c00 100%)',
              border: 'none',
              fontWeight: 800,
              borderRadius: '10px',
              color: isDailyClaimed ? '#777' : '#fff'
            }}
          >
            {isDailyClaimed ? '✓ Réclamé' : 'Réclamer (+250 🪙)'}
          </Button>
        </div>

        {/* SECTION 2 : PALIERS DE POINTS D'ÉQUIPE (MILESTONES) */}
        <div style={{ textAlign: 'left', marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Paliers de Performance d'Alignement ({teamPoints.toLocaleString()} pts actuels)
            </span>
            <span style={{ fontSize: '11px', color: '#00d2ff', fontWeight: 700 }}>
              1 point d'équipe = 2 🪙
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {MILESTONES.map(ms => {
              const isClaimed = claimedMilestones.includes(ms.id);
              const isEligible = teamPoints >= ms.requiredPoints;
              const progressPct = Math.min(100, Math.round((teamPoints / ms.requiredPoints) * 100));

              return (
                <div
                  key={ms.id}
                  style={{
                    background: isClaimed
                      ? 'rgba(255, 255, 255, 0.02)'
                      : isEligible
                      ? 'rgba(245, 175, 25, 0.08)'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: isClaimed
                      ? '1px solid rgba(255, 255, 255, 0.05)'
                      : isEligible
                      ? '1px solid rgba(245, 175, 25, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.07)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Trophy size={15} color={isEligible ? '#ffd700' : '#888'} />
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>
                        {ms.label}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#f5af19' }}>
                        +{ms.rewardCoins.toLocaleString()} 🪙
                      </span>
                    </div>

                    {/* Jauge de progression */}
                    <div style={{
                      width: '100%',
                      height: '6px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${progressPct}%`,
                        height: '100%',
                        background: isEligible ? 'linear-gradient(90deg, #52c41a, #00d2ff)' : '#00d2ff',
                        borderRadius: '4px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>

                  <Button
                    type="primary"
                    disabled={isClaimed || !isEligible}
                    onClick={() => handleClaimMs(ms)}
                    style={{
                      background: isClaimed
                        ? 'rgba(255, 255, 255, 0.08)'
                        : isEligible
                        ? 'linear-gradient(135deg, #52c41a 0%, #135200 100%)'
                        : 'rgba(255, 255, 255, 0.08)',
                      border: 'none',
                      fontWeight: 800,
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: isClaimed ? '#777' : isEligible ? '#fff' : '#666'
                    }}
                  >
                    {isClaimed ? '✓ Réclamé' : isEligible ? 'Débloquer' : `${progressPct}%`}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Astuce de management */}
        <div style={{
          marginTop: '16px',
          padding: '8px 14px',
          background: 'rgba(0, 210, 255, 0.06)',
          border: '1px solid rgba(0, 210, 255, 0.2)',
          borderRadius: '10px',
          fontSize: '11px',
          color: '#8be9fd'
        }}>
          💡 <strong>Astuce DG :</strong> Disputez des matchs dans l'onglet <strong>« Soirée LNH »</strong> pour faire grimper les points de vos 20 joueurs et débloquer plus de rondelles !
        </div>
      </div>
    </Modal>
  );
};
