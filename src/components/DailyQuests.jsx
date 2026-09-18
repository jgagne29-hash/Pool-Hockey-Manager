import React, { useState } from 'react';
import { Card, Checkbox, Progress, Space, Typography, Badge, Button } from 'antd';
import { CheckCircleOutlined, FireOutlined, ThunderboltOutlined, ReloadOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const { Text, Title } = Typography;

export const DailyQuests = ({ onXpGain }) => {
  // Liste des quêtes du jour de l'utilisateur
  const [quests, setQuests] = useState([
    { id: 1, text: "Valider son alignement avant 19h (Plafond respecté)", xp: 50, completed: false },
    { id: 2, text: "Analyser 1 carte de joueur adverse dans la galerie", xp: 30, completed: false },
    { id: 3, text: "Proposer ou évaluer 1 échange équitable (écart ≤ 15%)", xp: 40, completed: false },
    { id: 4, text: "Ouvrir au moins 1 booster de cartes élites", xp: 35, completed: false },
  ]);

  const completedCount = quests.filter(q => q.completed).length;
  const progressPercent = Math.round((completedCount / quests.length) * 100);

  const handleCheck = (id) => {
    setQuests(prev => prev.map(q => {
      if (q.id === id && !q.completed) {
        // Déclenche l'effet de gain d'XP vers le profil principal
        if (onXpGain) onXpGain(q.xp, `Mission : ${q.text}`);

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
              Missions du Jour (Quêtes XP)
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
            strokeColor={progressPercent === 100 ? '#52c41a' : { '0%': '#00d2ff', '100%': '#00ffcc' }} 
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
                count={quest.completed ? '✓ +XP Validé' : `+${quest.xp} XP`} 
                style={{ 
                  backgroundColor: quest.completed ? '#135200' : '#13c2c2',
                  color: quest.completed ? '#52c41a' : '#fff',
                  boxShadow: 'none',
                  fontWeight: 800,
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
          <ThunderboltOutlined style={{ color: '#00ffcc' }} />
          <span>Chaque mission accomplie verse directement l'XP dans votre profil pour débloquer les cartes rares et faire grimper votre cote !</span>
        </div>
      </Space>
    </Card>
  );
};
