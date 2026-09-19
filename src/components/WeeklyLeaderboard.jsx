import React, { useState } from 'react';
import { Card, Table, Tag, Radio, Badge, Avatar, Progress } from 'antd';
import { TrophyOutlined, CalendarOutlined, StarOutlined, RocketOutlined, CrownOutlined, UserOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

export const WeeklyLeaderboard = ({ currentPoolerPoints = 1420, currentRating = 882, currentUser }) => {
  const [boardType, setBoardType] = useState('weekly'); // 'weekly' vs 'season'

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

  // Récupérer uniquement les membres réels des ligues créées
  const leagueMembers = realPools.flatMap(p => p.members || []);
  const rawMembers = [...leagueMembers];

  // Intégrer l'utilisateur uniquement s'il est réellement connecté sur cet appareil
  if (currentUser) {
    const alreadyPresent = rawMembers.some(m => m.name === currentUser.name || m.username === currentUser.username);
    if (!alreadyPresent) {
      rawMembers.push({
        id: currentUser.deviceId || 'curr_user',
        name: currentUser.name,
        username: currentUser.username,
        avatar: currentUser.avatar || '🦁',
        team: currentUser.team || 'Mon Équipe LNH',
        points: currentPoolerPoints,
        trend: '+0'
      });
    }
  }

  // Dédupliquer strictement
  const uniqueMembersMap = new Map();
  rawMembers.forEach(m => {
    const key = m.username || m.name;
    if (!uniqueMembersMap.has(key)) {
      uniqueMembersMap.set(key, m);
    }
  });

  const POOLERS = Array.from(uniqueMembersMap.values()).map((m, idx) => {
    const isMe = currentUser && (m.name === currentUser.name || m.username === currentUser.username);
    return {
      id: m.id || `m_${idx}`,
      name: isMe ? `${m.name} (Vous)` : m.name,
      username: m.username || `@DG_${idx + 1}`,
      joinedMonth: 'Saison 2026-2027',
      weeklyPoints: isMe ? Math.round(currentPoolerPoints / 10) : Math.round((m.points || 0) / 10),
      seasonPoints: isMe ? currentPoolerPoints : (m.points || 0),
      managerRating: isMe ? currentRating : Math.max(500, Math.round((m.points || 0) * 0.6)),
      capUsage: '82.5M / 88.0M',
      streak: m.trend || '+0',
      avatar: m.avatar || '👤',
      isMe
    };
  });

  // Tri selon l'onglet
  const sortedData = [...POOLERS].sort((a, b) => {
    if (boardType === 'weekly') {
      return b.weeklyPoints - a.weeklyPoints;
    }
    return b.seasonPoints - a.seasonPoints;
  }).map((item, idx) => ({ ...item, displayRank: idx + 1 }));

  return (
    <div style={{ maxWidth: 840, margin: '20px auto', padding: '0 16px' }}>
      <Card
        style={{
          background: 'rgba(15, 20, 30, 0.95)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* En-tête avec Sélecteur Semaine vs Saison */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrophyOutlined style={{ fontSize: '20px', color: '#f5af19' }} />
              <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#fff', margin: 0 }}>
                {boardType === 'weekly' ? 'Classement de la Semaine (Matchup Actif)' : 'Classement Général (Saison 2026-2027)'}
              </h2>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Membres réels de votre ligue principale • Zéro profil fictif
            </p>
          </div>

          <Radio.Group
            value={boardType}
            onChange={(e) => setBoardType(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="weekly" style={{ fontWeight: 700 }}>
              <CalendarOutlined style={{ marginRight: '6px' }} />
              Cette Semaine
            </Radio.Button>
            <Radio.Button value="season" style={{ fontWeight: 700 }}>
              <CrownOutlined style={{ marginRight: '6px' }} />
              Saison Complète
            </Radio.Button>
          </Radio.Group>
        </div>

        {/* Bannière d'avertissement si non connecté */}
        {!currentUser && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px dashed rgba(255, 255, 255, 0.15)',
            borderRadius: '10px',
            padding: '10px 16px',
            marginBottom: '16px',
            fontSize: '12px',
            color: '#aaa',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>👤</span>
            <span><strong>Mode consultation</strong> : Aucun DG connecté sur cet appareil. Connectez-vous ou créez votre DG pour inscrire votre alignement au classement officiel.</span>
          </div>
        )}

        {/* Tableau du Classement Réel */}
        <Table
          dataSource={sortedData}
          rowKey="id"
          pagination={false}
          rowClassName={(record) => record.isMe ? 'leaderboard-current-user-row' : ''}
          columns={[
            {
              title: 'Rang',
              dataIndex: 'displayRank',
              key: 'displayRank',
              width: 70,
              render: (rank) => {
                if (rank === 1) return <span style={{ fontSize: '18px' }}>🥇</span>;
                if (rank === 2) return <span style={{ fontSize: '18px' }}>🥈</span>;
                if (rank === 3) return <span style={{ fontSize: '18px' }}>🥉</span>;
                return <span style={{ fontWeight: 800, color: '#888' }}>#{rank}</span>;
              }
            },
            {
              title: 'Gérant & Équipe',
              key: 'manager',
              render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '24px' }}>{record.avatar}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 800, color: record.isMe ? '#00f0ff' : '#fff' }}>
                        {record.name}
                      </span>
                      {record.isMe && (
                        <Tag color="cyan" style={{ fontSize: '10px', padding: '0 4px', fontWeight: 800 }}>
                          VOUS
                        </Tag>
                      )}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {record.username} • {record.joinedMonth}
                    </span>
                  </div>
                </div>
              )
            },
            {
              title: boardType === 'weekly' ? 'Pts Semaine' : 'Pts Saison',
              key: 'points',
              align: 'right',
              render: (_, record) => (
                <div>
                  <span style={{
                    fontSize: '15px',
                    fontWeight: 900,
                    color: boardType === 'weekly' ? '#00f0ff' : '#ffd700'
                  }}>
                    {(boardType === 'weekly' ? record.weeklyPoints : record.seasonPoints).toLocaleString()} pts
                  </span>
                  <div style={{ fontSize: '10px', color: '#888' }}>
                    {record.streak}
                  </div>
                </div>
              )
            },
            {
              title: 'Cote DG /1000',
              dataIndex: 'managerRating',
              key: 'managerRating',
              align: 'center',
              render: (rating) => (
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '11px',
                  background: rating >= 800 ? 'rgba(56, 239, 125, 0.15)' : 'rgba(245, 175, 25, 0.15)',
                  color: rating >= 800 ? '#38ef7d' : '#f5af19',
                  border: `1px solid ${rating >= 800 ? '#38ef7d44' : '#f5af1944'}`
                }}>
                  ⭐ {rating}
                </span>
              )
            }
          ]}
        />
      </Card>
    </div>
  );
};
