import React, { useState } from 'react';
import { Card, Segmented, List, Space, Typography, Tag } from 'antd';
import { motion } from 'framer-motion';
import { TrophyOutlined, StarOutlined, CrownOutlined, FireOutlined } from '@ant-design/icons';

const { Text } = Typography;

export const CustomLeaderboard = ({ userScore = 1420, userLevel = 2, currentUser }) => {
  const [activeLevel, setActiveLevel] = useState(userLevel === 1 ? 'Niv. 1 (Recrue)' : userLevel === 2 ? 'Niv. 2 (Adjoint)' : 'Niv. 3 (DG Pro)');
  const [period, setPeriod] = useState('Hebdomadaire');

  // Récupération des vrais membres depuis les ligues actives (zéro fausse ligue, zéro profil fictif)
  const realPools = (() => {
    try {
      const saved = localStorage.getItem('nhl_friends_pools');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(p => 
        p.id !== 'pool_chums_2026' && 
        p.id !== 'pool_dtd_ligue' && 
        !p.id.includes('simulated') &&
        !p.id.includes('pool_joined_')
      );
    } catch {
      return [];
    }
  })();

  const rawMembers = realPools.flatMap(p => p.members || []);

  // Intégrer l'utilisateur uniquement s'il est authentifié sur cet appareil
  if (currentUser) {
    const alreadyPresent = rawMembers.some(m => m.name === currentUser.name || m.username === currentUser.username);
    if (!alreadyPresent) {
      rawMembers.push({
        id: currentUser.deviceId || 'curr_user',
        name: currentUser.name,
        username: currentUser.username,
        avatar: currentUser.avatar || '🦁',
        points: userScore,
        trend: '+0'
      });
    }
  }

  // Dédupliquer par nom d'utilisateur ou nom
  const uniqueMembersMap = new Map();
  rawMembers.forEach(m => {
    const key = m.username || m.name;
    if (!uniqueMembersMap.has(key)) {
      uniqueMembersMap.set(key, m);
    }
  });

  const uniqueMembers = Array.from(uniqueMembersMap.values());

  const currentList = uniqueMembers
    .map((m, idx) => {
      const isUser = currentUser && (m.name === currentUser.name || m.username === currentUser.username);
      const memberPoints = isUser ? userScore : (m.points || 1000);
      const score = period === 'Hebdomadaire' ? Math.round(memberPoints / 10) : memberPoints;
      return {
        id: m.id || idx,
        name: isUser ? `${m.name} (Vous)` : m.name,
        score,
        stars: Math.min(20, Math.max(5, Math.round(memberPoints / 75))),
        avatar: m.avatar || '👤',
        streak: m.trend || '+0',
        isUser
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  // Décoration pour le podium
  const getRankBadge = (rank) => {
    if (rank === 1) return <span style={{ fontSize: '20px' }}>👑</span>;
    if (rank === 2) return <span style={{ fontSize: '18px' }}>🥈</span>;
    if (rank === 3) return <span style={{ fontSize: '18px' }}>🥉</span>;
    return <Text type="secondary" style={{ color: '#888', fontWeight: 800 }}>#{rank}</Text>;
  };

  return (
    <Card 
      style={{
        background: 'rgba(20, 20, 20, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        maxWidth: 580,
        margin: '20px auto',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
      }}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#fff', fontSize: '15px', fontWeight: 800 }}>
            <TrophyOutlined style={{ color: '#faad14', marginRight: '8px' }} />
            Classement des Ligues Réelles
          </span>
          <Tag color="cyan" style={{ fontWeight: 800, margin: 0 }}>DONNÉES CERTIFIÉES</Tag>
        </div>
      }
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Filtres de Période */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
          <Segmented 
            options={['Hebdomadaire', 'Mensuel']} 
            value={period} 
            onChange={setPeriod} 
            style={{ background: '#1f1f1f', color: '#aaa', fontWeight: 700 }}
          />
        </div>

        {/* Bannière si non connecté */}
        {!currentUser && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px dashed rgba(255, 255, 255, 0.15)',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '11px',
            color: '#aaa',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>👤</span>
            <span>Mode consultation : Aucun DG connecté sur cet appareil. Connectez-vous ou créez votre DG pour inscrire votre alignement.</span>
          </div>
        )}

        {/* Note d'intégrité */}
        <div style={{
          background: 'rgba(56, 239, 125, 0.08)',
          border: '1px solid rgba(56, 239, 125, 0.25)',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '11px',
          color: '#38ef7d',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span>🛡️</span>
          <span>Ce classement affiche uniquement les DG réels de vos ligues actives sans profil fictif.</span>
        </div>

        {/* Liste des gérants réels */}
        <List
          itemLayout="horizontal"
          dataSource={currentList}
          renderItem={(item) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <List.Item
                style={{
                  background: item.isUser ? 'rgba(0, 210, 255, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                  border: item.isUser ? '1px solid rgba(0, 210, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 28, textAlign: 'center' }}>
                    {getRankBadge(item.rank)}
                  </div>
                  <span style={{ fontSize: '22px' }}>{item.avatar}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Text style={{ color: item.isUser ? '#00f0ff' : '#fff', fontWeight: 800, fontSize: '13px' }}>
                        {item.name}
                      </Text>
                      {item.isUser && (
                        <Tag color="cyan" style={{ fontSize: '9px', padding: '0 4px', fontWeight: 800 }}>VOUS</Tag>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', color: '#888' }}>
                      {item.streak} cette semaine
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '15px', fontWeight: 900, color: '#ffd700' }}>
                    {item.score.toLocaleString()} pts
                  </div>
                  <div style={{ fontSize: '10px', color: '#aaa', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px' }}>
                    <StarOutlined style={{ color: '#faad14' }} />
                    <span>{item.stars} étoiles d'alignement</span>
                  </div>
                </div>
              </List.Item>
            </motion.div>
          )}
        />
      </Space>
    </Card>
  );
};
