import React, { useState } from 'react';
import { Modal, Button, List, Avatar } from 'antd';
import { Ambulance, ArrowDownToLine } from 'lucide-react';
import { AHL_AFFILIATIONS } from '../data/ahl';
import { AHL_PLAYERS } from '../data/ahl_players';
import { calculatePlayerOVR } from '../utils/playerRatings';

export const AhlCallupModal = ({ isOpen, onClose, injuredPlayer, onSelectReplacement }) => {
  if (!injuredPlayer) return null;

  const affiliation = AHL_AFFILIATIONS[injuredPlayer.team];
  
  // Filtrer les joueurs AHL de la même équipe et de la même position générale
  // (Pour simplifier, on permet d'appeler n'importe quel joueur du même club-école)
  const availableAhlPlayers = AHL_PLAYERS.filter(p => p.team === injuredPlayer.team);

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
          <Ambulance size={24} />
          <span>Rappel d'urgence (AHL Call-up)</span>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      width={600}
      className="ahl-callup-modal"
      bodyStyle={{ background: '#0f172a', padding: '24px', color: '#f8fafc' }}
      headerStyle={{ background: '#1e293b', borderBottom: '1px solid rgba(239, 68, 68, 0.2)' }}
      closeIcon={<span style={{ color: '#fff' }}>✕</span>}
    >
      <div style={{ marginBottom: '20px', background: 'rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#f8fafc' }}>
          <strong>{injuredPlayer.name}</strong> est blessé et a été placé sur la liste des blessés. 
          Vous devez le remplacer temporairement par un joueur du club-école : <strong>{affiliation?.teamName || "Club Inconnu"}</strong>.
        </p>
      </div>

      <h3 style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', marginBottom: '12px' }}>
        Joueurs Disponibles ({affiliation?.teamName})
      </h3>

      <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
        <List
          dataSource={availableAhlPlayers}
          renderItem={(ahlPlayer) => (
            <List.Item
              key={ahlPlayer.nhl_id}
              style={{ 
                background: 'rgba(255,255,255,0.02)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '8px', 
                marginBottom: '8px',
                padding: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Avatar 
                  size={48} 
                  src={`https://assets.nhle.com/mugs/nhl/latest/${ahlPlayer.nhl_id}.png`}
                  style={{ background: '#1e293b', border: '1px solid #3b82f6' }}
                >
                  AHL
                </Avatar>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#fff' }}>{ahlPlayer.name}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {ahlPlayer.position} • {ahlPlayer.ahl_team} • {calculatePlayerOVR(ahlPlayer)} OVR
                  </div>
                </div>
              </div>
              <Button 
                type="primary" 
                icon={<ArrowDownToLine size={16} />}
                style={{ background: '#3b82f6', borderColor: '#3b82f6', fontWeight: 'bold' }}
                onClick={() => {
                  onSelectReplacement(injuredPlayer.nhl_id, ahlPlayer);
                  onClose();
                }}
              >
                Rappeler
              </Button>
            </List.Item>
          )}
        />
        {availableAhlPlayers.length === 0 && (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>
            Aucun joueur AHL disponible pour ce club-école.
          </div>
        )}
      </div>
    </Modal>
  );
};
