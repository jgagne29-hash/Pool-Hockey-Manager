import React, { useState } from 'react';
import { Card, Segmented, List, Avatar, Space, Typography, Tag } from 'antd';
import { motion } from 'framer-motion';
import { TrophyOutlined, StarOutlined, CrownOutlined, FireOutlined } from '@ant-design/icons';

const { Text } = Typography;

// Données simulées par niveau et période
const LEADERBOARD_DATA = {
  'Hebdomadaire': {
    'Niv. 1 (Recrue)': [
      { rank: 1, name: 'Malik_G', score: 185, stars: 6, avatar: '🦊', streak: '🔥 3v' },
      { rank: 2, name: 'Louis_Hockey', score: 162, stars: 5, avatar: '🦁', streak: '⚡ 2v' },
      { rank: 3, name: 'Théo_Go', score: 140, stars: 5, avatar: '🐯', streak: '👍 1v' },
      { rank: 4, name: 'Léa_Canadiens', score: 128, stars: 4, avatar: '🐼', streak: '❄️' },
    ],
    'Niv. 2 (Adjoint)': [
      { rank: 1, name: 'Jonathan_DG (Vous)', score: 245, stars: 11, avatar: '🦅', streak: '🔥 4v', isUser: true },
      { rank: 2, name: 'Gérant_Elite', score: 210, stars: 12, avatar: '🐺', streak: '⚡ 3v' },
      { rank: 3, name: 'Flower29_Fan', score: 198, stars: 10, avatar: '🌸', streak: '👍 2v' },
    ],
    'Niv. 3 (DG Pro)': [
      { rank: 1, name: 'McDavid_Master', score: 320, stars: 18, avatar: '👑', streak: '🔥 6v' },
      { rank: 2, name: 'Cap_Wizard_99', score: 305, stars: 17, avatar: '⚡', streak: '🔥 5v' },
    ]
  },
  'Mensuel': {
    'Niv. 1 (Recrue)': [
      { rank: 1, name: 'Louis_Hockey', score: 580, stars: 5, avatar: '🦁', streak: '🔥 8v' },
      { rank: 2, name: 'Malik_G', score: 540, stars: 6, avatar: '🦊', streak: '⚡ 6v' },
      { rank: 3, name: 'Théo_Go', score: 490, stars: 5, avatar: '🐯', streak: '👍 5v' },
    ],
    'Niv. 2 (Adjoint)': [
      { rank: 1, name: 'Jonathan_DG (Vous)', score: 890, stars: 11, avatar: '🦅', streak: '🔥 10v', isUser: true },
      { rank: 2, name: 'Gérant_Elite', score: 810, stars: 12, avatar: '🐺', streak: '⚡ 9v' },
    ],
    'Niv. 3 (DG Pro)': [
      { rank: 1, name: 'Cap_Wizard_99', score: 1240, stars: 17, avatar: '⚡', streak: '🔥 14v' },
      { rank: 2, name: 'McDavid_Master', score: 1190, stars: 18, avatar: '👑', streak: '🔥 12v' },
    ]
  }
};

export const CustomLeaderboard = ({ userScore = 245, userLevel = 2 }) => {
  const [activeLevel, setActiveLevel] = useState(userLevel === 1 ? 'Niv. 1 (Recrue)' : userLevel === 2 ? 'Niv. 2 (Adjoint)' : 'Niv. 3 (DG Pro)');
  const [period, setPeriod] = useState('Hebdomadaire');

  const currentList = LEADERBOARD_DATA[period]?.[activeLevel] || [];

  // Décoration pour le podium
  const getRankBadge = (rank) => {
    if (rank === 1) return <span style={{ fontSize: '20px' }}>👑</span>;
    if (rank === 2) return <span style={{ fontSize: '18px' }}>🥈</span>;
    if (rank === 3) return <span style={{ fontSize: '18px' }}>🥉</span>;
    return <Text type="secondary" style={{ color: '#888', fontWeight: 800 }}>{rank}</Text>;
  };

  return (
    <Card 
      style={{
        background: 'rgba(20, 20, 20, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        maxWidth: 520,
        margin: '20px auto',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
      }}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#fff', fontSize: '15px', fontWeight: 800 }}>
            <TrophyOutlined style={{ color: '#faad14', marginRight: '8px' }} />
            Classement par Niveau & Période
          </span>
          <Tag color="#722ed1" style={{ fontWeight: 800, margin: 0 }}>Ant Design Segmented</Tag>
        </div>
      }
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Filtres de Période & Niveau avec le composant Segmented d'Ant Design */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
          <Segmented 
            options={['Hebdomadaire', 'Mensuel']} 
            value={period} 
            onChange={setPeriod} 
            style={{ background: '#1f1f1f', color: '#aaa', fontWeight: 700 }}
          />
          <Segmented 
            options={['Niv. 1 (Recrue)', 'Niv. 2 (Adjoint)', 'Niv. 3 (DG Pro)']} 
            value={activeLevel} 
            onChange={setActiveLevel} 
            style={{ background: '#1f1f1f', color: '#aaa', fontWeight: 700 }}
          />
        </div>

        {/* Note pédagogique d'équité */}
        <div style={{
          background: 'rgba(0, 210, 255, 0.08)',
          border: '1px solid rgba(0, 210, 255, 0.2)',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '11px',
          color: '#e6f7ff'
        }}>
          💡 <strong>Équité par division :</strong> Vous affrontez uniquement les gérants de votre palier de compte ({activeLevel}) sur la période sélectionnée ({period}).
        </div>

        {/* Liste animée des meneurs */}
        <List
          dataSource={currentList}
          renderItem={(user, index) => {
            const isFirst = user.rank === 1;
            const isUser = user.isUser;
            return (
              <motion.div
                key={user.name + period + activeLevel}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                style={{
                  background: isUser
                    ? 'linear-gradient(90deg, rgba(0, 210, 255, 0.2) 0%, rgba(20, 20, 20, 0.9) 100%)'
                    : isFirst
                    ? 'linear-gradient(90deg, #2b2108 0%, #141414 100%)'
                    : '#1a1a1a',
                  border: isUser
                    ? '1.5px solid #00d2ff'
                    : isFirst
                    ? '1px solid #faad14'
                    : '1px solid #262626',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: isFirst ? '0 4px 15px rgba(250, 173, 20, 0.15)' : 'none'
                }}
              >
                <Space size="middle">
                  <div style={{ width: 28, textAlign: 'center' }}>{getRankBadge(user.rank)}</div>
                  <Avatar style={{ backgroundColor: '#262626', fontSize: '20px', border: isUser ? '1px solid #00d2ff' : '1px solid #444' }}>
                    {user.avatar}
                  </Avatar>
                  <div>
                    <Text strong style={{ color: isUser ? '#00d2ff' : '#fff', fontSize: '13px' }}>
                      {user.name}
                    </Text>
                    <div style={{ fontSize: '10px', color: '#888' }}>
                      {user.streak}
                    </div>
                  </div>
                </Space>

                <Space size="large">
                  <span style={{ color: '#aaa', fontSize: '12px' }}>
                    <StarOutlined style={{ color: '#faad14' }} /> {user.stars}⭐
                  </span>
                  <Text strong style={{ color: '#00ffcc', fontSize: '16px', textShadow: '0 0 8px rgba(0,255,204,0.4)' }}>
                    {user.score} pts
                  </Text>
                </Space>
              </motion.div>
            );
          }}
        />
      </Space>
    </Card>
  );
};
