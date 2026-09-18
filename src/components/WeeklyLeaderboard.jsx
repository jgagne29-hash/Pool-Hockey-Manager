import React, { useState } from 'react';
import { Card, Table, Tag, Radio, Badge, Avatar, Progress } from 'antd';
import { TrophyOutlined, CalendarOutlined, StarOutlined, RocketOutlined, CrownOutlined, UserOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

export const WeeklyLeaderboard = ({ currentPoolerPoints = 1280, currentRating = 882 }) => {
  const [boardType, setBoardType] = useState('weekly'); // 'weekly' vs 'season'

  // Poolers fictifs de la ligue
  const POOLERS = [
    {
      id: 'user',
      rank: 1,
      weeklyRank: 1,
      name: 'Jonathan Gagné (Vous)',
      username: '@Notorious_Hockey',
      joinedMonth: 'Janvier (Nouveau)',
      weeklyPoints: 142,
      seasonPoints: currentPoolerPoints,
      managerRating: currentRating,
      capUsage: '55.4M / 88.0M',
      streak: '🔥 3 victoires',
      avatar: 'https://avatars.githubusercontent.com/u/272560094?v=4'
    },
    {
      id: 'p2',
      rank: 2,
      weeklyRank: 3,
      name: 'Marc-André Fleury Fan',
      username: '@Flower29',
      joinedMonth: 'Octobre (Ancien)',
      weeklyPoints: 118,
      seasonPoints: 1410,
      managerRating: 840,
      capUsage: '82.1M / 88.0M',
      streak: '👍 Stable',
      avatar: null
    },
    {
      id: 'p3',
      rank: 3,
      weeklyRank: 2,
      name: 'Patrice Bergeron Jr',
      username: '@Bergy37',
      joinedMonth: 'Novembre (Ancien)',
      weeklyPoints: 135,
      seasonPoints: 1350,
      managerRating: 790,
      capUsage: '76.8M / 88.0M',
      streak: '⚡ En hausse',
      avatar: null
    },
    {
      id: 'p4',
      rank: 4,
      weeklyRank: 5,
      name: 'Slafkovsky Goal Machine',
      username: '@Juraj_Slaf20',
      joinedMonth: 'Octobre (Ancien)',
      weeklyPoints: 88,
      seasonPoints: 1220,
      managerRating: 670,
      capUsage: '85.2M / 88.0M',
      streak: '❄️ Séquence froide',
      avatar: null
    },
    {
      id: 'p5',
      rank: 5,
      weeklyRank: 4,
      name: 'Maxime Talbot Fan',
      username: '@Talbot25',
      joinedMonth: 'Février (Nouveau)',
      weeklyPoints: 104,
      seasonPoints: 620,
      managerRating: 720,
      capUsage: '62.0M / 75.0M',
      streak: '🚀 Progression rapide',
      avatar: null
    }
  ];

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
        {/* En-tête et basculeur de vue */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrophyOutlined style={{ fontSize: '20px', color: '#f5af19' }} />
              <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#fff', margin: 0 }}>
                {boardType === 'weekly' ? 'Classement de la Semaine (Matchup Actif)' : 'Classement Général (Saison 2024-2025)'}
              </h2>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              {boardType === 'weekly'
                ? "Remise à zéro chaque lundi : N'importe quel pooler peut gagner la semaine !"
                : "Régularité globale depuis octobre : Récompense la constance des anciens."}
            </p>
          </div>

          <Radio.Group
            value={boardType}
            onChange={(e) => setBoardType(e.target.value)}
            buttonStyle="solid"
            size="middle"
          >
            <Radio.Button value="weekly">
              ⚡ Semaine en Cours
            </Radio.Button>
            <Radio.Button value="season">
              🏆 Saison Complète
            </Radio.Button>
          </Radio.Group>
        </div>

        {/* Note pédagogique d'équité */}
        <div style={{
          background: boardType === 'weekly' ? 'rgba(0, 210, 255, 0.08)' : 'rgba(245, 175, 25, 0.08)',
          border: boardType === 'weekly' ? '1px solid rgba(0, 210, 255, 0.2)' : '1px solid rgba(245, 175, 25, 0.2)',
          borderRadius: '10px',
          padding: '10px 14px',
          marginBottom: '16px',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {boardType === 'weekly' ? (
            <>
              <RocketOutlined style={{ color: '#00d2ff', fontSize: '16px' }} />
              <span style={{ color: '#e6f7ff' }}>
                <strong>Équité Absolue :</strong> Les nouveaux arrivés en cours de saison affrontent les vétérans sur un pied d'égalité dans les points de la semaine en cours.
              </span>
            </>
          ) : (
            <>
              <CrownOutlined style={{ color: '#f5af19', fontSize: '16px' }} />
              <span style={{ color: '#fffbe6' }}>
                <strong>Respect de l'Ancienneté :</strong> Les points cumulés récompensent ceux présents depuis le match d'ouverture. Un nouveau ne peut pas voler ce titre juste sur un tirage chanceux.
              </span>
            </>
          )}
        </div>

        {/* Tableau des meneurs */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#888', fontSize: '11px', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 8px' }}>Rang</th>
                <th style={{ padding: '10px 8px' }}>Gérant</th>
                <th style={{ padding: '10px 8px' }}>Arrivée</th>
                <th style={{ padding: '10px 8px', textAlign: 'right' }}>
                  {boardType === 'weekly' ? 'Pts Semaine' : 'Pts Saison'}
                </th>
                <th style={{ padding: '10px 8px', textAlign: 'right' }}>Cote DG</th>
                <th style={{ padding: '10px 8px' }}>Masse Active</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((p) => {
                const isUser = p.id === 'user';
                return (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      background: isUser ? 'rgba(0, 210, 255, 0.12)' : 'transparent',
                      fontWeight: isUser ? 800 : 500
                    }}
                  >
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{
                        display: 'inline-block',
                        width: '24px',
                        height: '24px',
                        lineHeight: '24px',
                        borderRadius: '50%',
                        textAlign: 'center',
                        fontWeight: 900,
                        fontSize: '12px',
                        background: p.displayRank === 1 ? '#ffd700' : p.displayRank === 2 ? '#c0c0c0' : p.displayRank === 3 ? '#cd7f32' : 'rgba(255,255,255,0.08)',
                        color: p.displayRank <= 3 ? '#000' : '#fff'
                      }}>
                        {p.displayRank}
                      </span>
                    </td>

                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Avatar
                          size={28}
                          src={p.avatar}
                          icon={<UserOutlined />}
                          style={{ border: isUser ? '2px solid #00d2ff' : '1px solid #444' }}
                        />
                        <div>
                          <div style={{ color: isUser ? '#00d2ff' : '#fff', fontSize: '13px' }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: '10px', color: '#888' }}>
                            {p.username} • {p.streak}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '12px 8px' }}>
                      <Tag color={p.joinedMonth.includes('Nouveau') ? 'cyan' : 'gold'} style={{ fontSize: '11px', margin: 0 }}>
                        {p.joinedMonth}
                      </Tag>
                    </td>

                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                      <span style={{
                        fontSize: '15px',
                        fontWeight: 900,
                        color: boardType === 'weekly' ? '#00d2ff' : '#f5af19'
                      }}>
                        {boardType === 'weekly' ? `${p.weeklyPoints} pts` : `${p.seasonPoints} pts`}
                      </span>
                    </td>

                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                      <span style={{ color: p.managerRating >= 800 ? '#ff0055' : p.managerRating >= 700 ? '#faad14' : '#52c41a', fontWeight: 800 }}>
                        {p.managerRating}
                      </span>
                      <span style={{ fontSize: '10px', color: '#666' }}>/1000</span>
                    </td>

                    <td style={{ padding: '12px 8px', fontSize: '11px', color: '#aaa' }}>
                      {p.capUsage}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
