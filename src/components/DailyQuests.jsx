import React, { useState } from 'react';
import { Card, Checkbox, Progress, Space, Typography, Badge, Button } from 'antd';
import { CheckCircleOutlined, FireOutlined, ThunderboltOutlined, ReloadOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const { Text, Title } = Typography;

export const DailyQuests = ({ onCoinGain, onXpGain }) => {
  // Liste des quêtes du jour de l'utilisateur
  const [quests, setQuests] = useState([
    { id: 1, text: "Garder son cap salarial sous les 104M$", coins: 200, completed: false },
    { id: 2, text: "Faire un échange rentable sur le Marché", coins: 300, completed: false },
    { id: 3, text: "Activer un rappel de la LAH", coins: 200, completed: false },
    { id: 4, text: "Ouvrir au moins 1 Booster Standard", coins: 250, completed: false },
  ]);

  const completedCount = quests.filter(q => q.completed).length;
  const progressPercent = Math.round((completedCount / quests.length) * 100);

  const handleCheck = (id) => {
    setQuests(prev => prev.map(q => {
      if (q.id === id && !q.completed) {
        // Déclenche l'effet de gain d'or vers le profil principal
        if (onCoinGain) onCoinGain(q.coins, `Mission : ${q.text}`);

        // Petit effet confetti si toutes les quêtes sont accomplies
        if (completedCount + 1 === quests.length) {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#00ffcc', '#faad14', '#13c2c2', '#ffffff']
          });
        }

        return { ...q, completed: true };
      }
      return q;
    }));
  };

  const handleReset = () => {
    setQuests(prev => prev.map(q => ({ ...q, completed: false })));
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FireOutlined style={{ color: '#ff4d4f', fontSize: '18px' }} />
            <span style={{ color: '#fff', fontSize: '15px', fontWeight: 800 }}>
              Missions du Jour (Quêtes 🪙)
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Badge 
              count={`${completedCount}/${quests.length}`} 
              style={{ backgroundColor: completedCount === quests.length ? '#52c41a' : '#ff4d4f', fontWeight: 800 }} 
            />
            {completedCount > 0 && (
              <Button
                type="text"
                size="small"
                icon={<ReloadOutlined style={{ color: '#888' }} />}
                onClick={handleReset}
                title="Réinitialiser pour tester"
              />
            )}
          </div>
        </div>
      }
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Barre de progression globale du jour */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text type="secondary" style={{ color: '#aaa', fontSize: '12px' }}>
              Progression des Quêtes du Jour
            </Text>
            <Text strong style={{ color: progressPercent === 100 ? '#52c41a' : '#00ffcc', fontWeight: 900 }}>
              {progressPercent}% {progressPercent === 100 && '🎉 Journée Complétée !'}
            </Text>
          </div>
          <Progress 
            percent={progressPercent} 
            showInfo={false} 
            strokeColor={progressPercent === 100 ? '#52c41a' : { '0%': '#f5af19', '100%': '#f5af19' }} 
            trailColor="#262626" 
          />
        </div>

        {/* Affichage des quêtes individuelles */}
        <div style={{ marginTop: '10px' }}>
          {quests.map((quest) => (
            <motion.div
              key={quest.id}
              whileTap={{ scale: 0.98 }}
              style={{
                background: quest.completed ? 'rgba(9, 43, 26, 0.85)' : '#1f1f1f',
                border: quest.completed ? '1px solid #237804' : '1px solid #303030',
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.3s ease',
                boxShadow: quest.completed ? '0 0 12px rgba(35, 120, 4, 0.3)' : 'none'
              }}
            >
              <Checkbox 
                checked={quest.completed} 
                onChange={() => handleCheck(quest.id)}
                disabled={quest.completed}
                style={{ color: quest.completed ? '#aaa' : '#fff' }}
              >
                <span style={{ 
                  textDecoration: quest.completed ? 'line-through' : 'none',
                  color: quest.completed ? '#aaa' : '#fff',
                  fontWeight: quest.completed ? 500 : 700,
                  fontSize: '13px'
                }}>
                  {quest.text}
                </span>
              </Checkbox>
              
              <Badge 
                count={quest.completed ? '✓ +🪙 Validé' : `+${quest.coins} 🪙`} 
                style={{ 
                  backgroundColor: quest.completed ? '#135200' : '#f5af19',
                  color: quest.completed ? '#52c41a' : '#000',
                  boxShadow: 'none',
                  fontWeight: 900,
                  fontSize: '11px',
                  borderRadius: '6px'
                }} 
              />
            </motion.div>
          ))}
        </div>

        {/* Note de récompense pour les jeunes */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '11px',
          color: '#aaa',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <ThunderboltOutlined style={{ color: '#f5af19' }} />
          <span>Chaque mission accomplie verse directement des Rondelles d'Or dans votre portefeuille pour acheter des boosters !</span>
        </div>
      </Space>
    </Card>
  );
};
