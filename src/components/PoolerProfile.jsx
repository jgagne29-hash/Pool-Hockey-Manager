import React, { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, Space, Avatar, Progress, Radio, Tag, Tooltip } from 'antd';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { TrophyOutlined, WalletOutlined, TransactionOutlined, UserOutlined, StarOutlined, ThunderboltOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { calculateManagerRating, calculateSimpleRating, getRankDetails, getStarsForRarity } from '../utils/managerLogic';
import { getManagerLevelInfo, getCatchupDetails, calculateXpGain } from '../utils/progression';
import { RatingHistoryChart } from './RatingHistoryChart';

export const PoolerProfile = ({ poolerData, onMonthChange, onAddXp }) => {
  // Mode de calcul : 'stars' (Le Pouvoir des Étoiles - Idéal Jeunes) vs 'pro' (Masse Salariale en Millions)
  const [calculationMode, setCalculationMode] = useState('stars');

  // Données de progression XP et Niveau
  const managerXp = poolerData.managerXp || 450;
  const currentMonth = poolerData.currentMonth || (new Date().getMonth() + 1);
  const levelInfo = getManagerLevelInfo(managerXp);
  const catchup = getCatchupDetails(currentMonth);

  // Calcul du nombre total d'étoiles dans l'alignement
  const totalStars = poolerData.lineup
    ? poolerData.lineup.reduce((sum, item) => sum + getStarsForRarity(item.edition.rarity), 0)
    : 14;

  // Calcul selon le mode sélectionné
  const proScores = calculateManagerRating(poolerData.points, poolerData.currentCapHit, poolerData.tradesCount);
  const starScores = calculateSimpleRating(poolerData.points, totalStars, poolerData.tradesCount);

  const activeScores = calculationMode === 'stars' ? starScores : proScores;
  const rating = activeScores.totalRating;
  const rank = getRankDetails(rating);

  // Compteur animé pour le score global
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, rating, { duration: 1.6, ease: "easeOut" });
    return controls.stop;
  }, [rating, calculationMode]);

  return (
    <div style={{ maxWidth: 680, margin: '20px auto', padding: '0 16px' }}>
      {/* SECTION NIVEAU DU GÉRANT & PROGRESSION XP */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '16px' }}
      >
        <Card
          style={{
            background: 'linear-gradient(135deg, rgba(20,25,35,0.95) 0%, rgba(10,12,18,0.98) 100%)',
            borderRadius: '16px',
            border: '1px solid rgba(0, 210, 255, 0.25)',
            boxShadow: '0 8px 24px rgba(0, 210, 255, 0.12)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                fontSize: '28px',
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '4px 10px',
                borderRadius: '12px'
              }}>
                {levelInfo.badge}
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#00d2ff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Niveau {levelInfo.level} • {levelInfo.title}
                </div>
                <div style={{ fontSize: '13px', color: '#fff', fontWeight: 700 }}>
                  {levelInfo.currentXp} XP accumulés
                </div>
              </div>
            </div>

            {/* Badge de Déblocage */}
            <div style={{
              background: levelInfo.level >= 3 ? 'rgba(255, 0, 85, 0.15)' : levelInfo.level === 2 ? 'rgba(138, 35, 135, 0.2)' : 'rgba(255, 255, 255, 0.08)',
              border: levelInfo.level >= 3 ? '1px solid #ff0055' : levelInfo.level === 2 ? '1px solid #8a2387' : '1px solid #555',
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '11px',
              color: levelInfo.level >= 3 ? '#ff0055' : levelInfo.level === 2 ? '#d585d5' : '#aaa',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {levelInfo.level >= 3 ? <UnlockOutlined /> : <LockOutlined />}
              <span>{levelInfo.unlockedMsg}</span>
            </div>
          </div>

          {/* Barre de progression du niveau */}
          <div style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>
              <span>Avancement vers le prochain palier</span>
              <span>{levelInfo.level === 3 ? 'Palier Maximum (DG Pro)' : `${levelInfo.neededForNext} XP requis`}</span>
            </div>
            <Progress
              percent={levelInfo.progressPct}
              strokeColor={{
                '0%': '#00d2ff',
                '100%': levelInfo.level === 1 ? '#a0d911' : levelInfo.level === 2 ? '#8a2387' : '#ff0055'
              }}
              status={levelInfo.level === 3 ? 'success' : 'active'}
            />
          </div>

          {/* MÉCANISME DE RATTRAPAGE SAISONNIER (CATCH-UP XP) */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '12px',
            padding: '12px',
            marginTop: '12px',
            border: `1px solid ${catchup.tagColor}33`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ThunderboltOutlined style={{ color: catchup.tagColor, fontSize: '14px' }} />
                <span style={{ fontSize: '12px', fontWeight: 800, color: catchup.tagColor }}>
                  {catchup.label}
                </span>
              </div>

              {/* Bouton de test du mois */}
              {onMonthChange && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: '#888' }}>Tester le mois :</span>
                  {[
                    { m: 10, label: 'Oct (x1)' },
                    { m: 1, label: 'Jan (x2)' },
                    { m: 3, label: 'Mars (x3)' }
                  ].map(btn => (
                    <button
                      key={btn.m}
                      onClick={() => onMonthChange(btn.m)}
                      style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 700,
                        border: currentMonth === btn.m ? '1px solid #00d2ff' : '1px solid #444',
                        background: currentMonth === btn.m ? 'rgba(0, 210, 255, 0.2)' : 'transparent',
                        color: currentMonth === btn.m ? '#00d2ff' : '#aaa',
                        cursor: 'pointer'
                      }}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
              {catchup.description} (Simuler match: +{calculateXpGain(50, currentMonth)} XP, Trade: +{calculateXpGain(75, currentMonth)} XP)
            </p>
          </div>
        </Card>
      </motion.div>

      {/* SÉLECTEUR DE MODE DE CALCUL */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(20, 20, 20, 0.8)',
        padding: '10px 16px',
        borderRadius: '12px',
        marginBottom: '16px',
        border: '1px solid rgba(255,255,255,0.08)',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Mode d'évaluation :
        </div>
        <Radio.Group
          value={calculationMode}
          onChange={(e) => setCalculationMode(e.target.value)}
          buttonStyle="solid"
          size="small"
        >
          <Radio.Button value="stars">
            ⭐ Pouvoir des Étoiles (Jeunes)
          </Radio.Button>
          <Radio.Button value="pro">
            💼 Plafond Salarial DG Pro
          </Radio.Button>
        </Radio.Group>
      </div>

      {/* SECTION DU BADGE DE RANG ANIMÉ */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <Card
          style={{
            background: 'rgba(20, 20, 20, 0.95)',
            borderRadius: '16px',
            border: `2px solid ${rank.color}`,
            boxShadow: `0 8px 32px ${rank.color}33`,
            textAlign: 'center',
            marginBottom: '20px',
            overflow: 'hidden'
          }}
        >
          {/* Avatar & Nom du Pooler */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
            <Avatar
              size={48}
              src="https://avatars.githubusercontent.com/u/272560094?v=4"
              icon={<UserOutlined />}
              style={{ border: `2px solid ${rank.color}` }}
            />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 800, fontSize: '17px', color: '#fff' }}>
                {poolerData.name || "Jonathan Gagné"}
              </div>
              <div style={{ fontSize: '11px', color: '#00d2ff', fontWeight: 600 }}>
                @{poolerData.username || "Notorious_Hockey"} • Franchise DG
              </div>
            </div>
          </div>

          <div style={{ padding: '8px 0' }}>
            {/* Effet pulsant sur le badge holographique */}
            <motion.div
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
              style={{ fontSize: '64px', marginBottom: '8px', filter: `drop-shadow(0 0 16px ${rank.color})` }}
            >
              {rank.badge}
            </motion.div>

            <h2 style={{
              background: rank.gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              fontSize: '24px',
              fontWeight: 900,
              margin: '0 0 4px 0'
            }}>
              {rank.title}
            </h2>

            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              {rank.description}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', color: '#fff' }}>
              <span style={{ fontSize: '14px', marginRight: '6px', color: '#aaa' }}>Cote Globale DG :</span>
              <motion.span style={{ fontSize: '48px', fontWeight: '900', color: rank.color }}>
                {rounded}
              </motion.span>
              <span style={{ fontSize: '20px', color: '#aaa' }}> /1000</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* STATISTIQUES DÉTAILLÉES (GRILLE ANT DESIGN) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
      >
        <Card
          title={<span style={{ color: '#fff', fontSize: '14px', fontWeight: 700 }}>Indicateurs de Performance du Pooler</span>}
          headStyle={{ color: '#fff', borderBottom: '1px solid #303030' }}
          style={{ background: 'rgba(20, 20, 20, 0.95)', borderRadius: '14px', border: '1px solid #303030', marginBottom: '20px' }}
        >
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Statistic
                title={<span style={{ color: '#aaa', fontSize: '12px' }}><TrophyOutlined /> Points Cumulés</span>}
                value={poolerData.points}
                valueStyle={{ color: '#fff', fontSize: '22px', fontWeight: 800 }}
              />
            </Col>
            <Col span={8}>
              {calculationMode === 'stars' ? (
                <Statistic
                  title={<span style={{ color: '#aaa', fontSize: '12px' }}><StarOutlined /> Étoiles Alignées</span>}
                  value={totalStars}
                  suffix="⭐"
                  valueStyle={{ color: '#faad14', fontSize: '22px', fontWeight: 800 }}
                />
              ) : (
                <Statistic
                  title={<span style={{ color: '#aaa', fontSize: '12px' }}><WalletOutlined /> Masse Active</span>}
                  value={(poolerData.currentCapHit / 1000000).toFixed(1)}
                  suffix="M $"
                  valueStyle={{ color: poolerData.currentCapHit > 88000000 ? '#ff4d4f' : '#38ef7d', fontSize: '22px', fontWeight: 800 }}
                />
              )}
            </Col>
            <Col span={8}>
              <Statistic
                title={<span style={{ color: '#aaa', fontSize: '12px' }}><TransactionOutlined /> Trades Validés</span>}
                value={poolerData.tradesCount}
                valueStyle={{ color: '#00d2ff', fontSize: '22px', fontWeight: 800 }}
              />
            </Col>
          </Row>
        </Card>

        {/* DÉCOMPOSITION ANALYTIQUE DES 1000 POINTS */}
        <Card
          title={
            <span style={{ color: '#fff', fontSize: '14px', fontWeight: 700 }}>
              {calculationMode === 'stars' ? "Formule des Étoiles ⭐ (/1000)" : "Décomposition Salariale Pro (/1000)"}
            </span>
          }
          headStyle={{ color: '#fff', borderBottom: '1px solid #303030' }}
          style={{ background: 'rgba(20, 20, 20, 0.95)', borderRadius: '14px', border: '1px solid #303030' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: '#aaa' }}>1. Performance de l'Équipe (Points accumulés)</span>
                <span style={{ color: '#fff', fontWeight: 800 }}>{activeScores.performanceScore} / 500 pts</span>
              </div>
              <Progress percent={Math.round((activeScores.performanceScore / 500) * 100)} strokeColor="#00d2ff" showInfo={false} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: '#aaa' }}>
                  {calculationMode === 'stars'
                    ? `2. Efficacité des Étoiles (${starScores.starEfficiency} pts / ⭐)`
                    : `2. Efficacité Salariale (${proScores.pointsParMillion} pts / M $)`}
                </span>
                <span style={{ color: '#fff', fontWeight: 800 }}>{activeScores.roiScore} / 350 pts</span>
              </div>
              <Progress percent={Math.round((activeScores.roiScore / 350) * 100)} strokeColor="#f5af19" showInfo={false} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: '#aaa' }}>3. Flair & Activité ({poolerData.tradesCount} transactions × 15 pts)</span>
                <span style={{ color: '#fff', fontWeight: 800 }}>{activeScores.activityScore || activeScores.strategyScore} / 150 pts</span>
              </div>
              <Progress percent={Math.round(((activeScores.activityScore || activeScores.strategyScore) / 150) * 100)} strokeColor="#52c41a" showInfo={false} />
            </div>
          </div>
        </Card>

        {/* GRAPHIQUE LINÉAIRE D'ÉVOLUTION DE LA COTE */}
        <RatingHistoryChart
          historyData={poolerData.history || [450, 480, 460, 520, 590, 610, 750, rating]}
        />
      </motion.div>
    </div>
  );
};
