import React from 'react';
import { Modal, Tag, Button } from 'antd';
import { Users, UserCheck, Trophy, ArrowRightLeft, Shield, CheckCircle2, LogIn, Sparkles } from 'lucide-react';

export const CommunityStatsModal = ({
  isOpen,
  onClose,
  currentUser,
  realPools = [],
  tradesCount = 0,
  teamPoints = 0,
  onOpenAuth
}) => {
  // Liste réelle et dédoublée des gérants
  const registeredManagers = [];
  if (currentUser) {
    registeredManagers.push({
      id: 'current_user',
      name: currentUser.name || 'Directeur Général',
      username: currentUser.username || '@MonDG',
      avatar: currentUser.avatar || '🏒',
      isYou: true,
      role: 'Votre Profil (Cet appareil)'
    });
  }

  realPools.forEach(p => {
    (p.members || []).forEach(m => {
      const name = typeof m === 'object' ? (m.name || m.username) : m;
      if (name && !registeredManagers.some(r => r.name === name || r.username === name)) {
        registeredManagers.push({
          id: `member_${name}`,
          name: name,
          username: typeof m === 'object' && m.username ? m.username : `@${name.toLowerCase().replace(/\s+/g, '')}`,
          avatar: typeof m === 'object' && m.avatar ? m.avatar : '👤',
          isYou: false,
          role: `Membre : ${p.name}`
        });
      }
    });
  });

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={600}
      styles={{
        content: {
          background: 'radial-gradient(circle at 50% 10%, #162032 0%, #0a0d14 90%)',
          border: '1px solid rgba(56, 239, 125, 0.4)',
          borderRadius: '20px',
          boxShadow: '0 0 35px rgba(56, 239, 125, 0.25)',
          padding: '28px 24px',
          color: '#fff'
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
          background: currentUser ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(255, 255, 255, 0.1)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: currentUser ? '0 4px 20px rgba(16, 185, 129, 0.4)' : 'none',
          marginBottom: '12px'
        }}>
          {currentUser ? <UserCheck size={28} color="#fff" /> : <Users size={28} color="#94a3b8" />}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <Tag color="cyan" style={{ fontWeight: 800 }}>SAISON LNH 2026-2027</Tag>
          <Tag color={currentUser ? "green" : "default"} style={{ fontWeight: 800 }}>
            {currentUser ? "DG AUTHENTIFIÉ" : "MODE VISITEUR"}
          </Tag>
        </div>

        <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>
          Statut des Gérants & Ligues en Ligne
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Affichage strict en temps réel des comptes enregistrés sur votre session. Zéro faux profil.
        </p>

        {/* Carte du Gérant Connecté */}
        <div style={{
          background: currentUser ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.05)',
          border: currentUser ? '1px solid rgba(16, 185, 129, 0.4)' : '1px dashed rgba(255, 255, 255, 0.2)',
          borderRadius: '14px',
          padding: '16px',
          marginTop: '18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '28px' }}>
              {currentUser ? currentUser.avatar || '🏒' : '👤'}
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: '15px', color: '#fff' }}>
                {currentUser ? currentUser.name : 'Visiteur non connecté'}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                {currentUser ? (currentUser.username || '@MonDG') : 'Vos données sont stockées en invité sur ce navigateur'}
              </div>
            </div>
          </div>

          {currentUser ? (
            <Tag color="success" style={{ fontWeight: 800, padding: '4px 10px' }}>
              🟢 Connecté
            </Tag>
          ) : (
            <Button
              type="primary"
              size="small"
              icon={<LogIn size={13} />}
              onClick={onOpenAuth}
              style={{
                background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                border: 'none',
                fontWeight: 800,
                borderRadius: '8px'
              }}
            >
              Se Connecter
            </Button>
          )}
        </div>

        {/* 4 Compteurs Clés 100% Réels */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          margin: '18px 0',
          textAlign: 'left'
        }}>
          {/* Gérants connectés */}
          <div style={{
            background: 'rgba(56, 239, 125, 0.08)',
            border: '1px solid rgba(56, 239, 125, 0.35)',
            borderRadius: '14px',
            padding: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: currentUser ? '#38ef7d' : '#94a3b8',
                display: 'inline-block'
              }} />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#38ef7d', textTransform: 'uppercase' }}>
                DG Actif Réel
              </span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>
              {registeredManagers.length} <span style={{ fontSize: '12px', color: '#38ef7d', fontWeight: 700 }}>DG enregistré</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              {currentUser ? 'Votre compte est actif et synchronisé' : 'Aucun compte connecté'}
            </p>
          </div>

          {/* Pools & Ligues Privées */}
          <div style={{
            background: 'rgba(0, 210, 255, 0.08)',
            border: '1px solid rgba(0, 210, 255, 0.3)',
            borderRadius: '14px',
            padding: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Trophy size={14} color="#00d2ff" />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#00d2ff', textTransform: 'uppercase' }}>
                Vos Ligues d'Amis
              </span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>
              {realPools.length} <span style={{ fontSize: '12px', color: '#00d2ff', fontWeight: 700 }}>créée(s)</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              {realPools.length === 0 ? 'Créez-en une dans Pools d\'Amis' : 'Ligues privées actives'}
            </p>
          </div>
        </div>

        {/* Liste détaillée des Gérants Réels */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '16px',
          textAlign: 'left',
          marginBottom: '16px'
        }}>
          <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#fff', margin: '0 0 10px', textTransform: 'uppercase' }}>
            📋 Liste des Gérants sur cet Appareil ({registeredManagers.length})
          </h4>

          {registeredManagers.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {registeredManagers.map(mgr => (
                <div key={mgr.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: mgr.isYou ? 'rgba(0, 210, 255, 0.1)' : 'rgba(255, 255, 255, 0.04)',
                  border: mgr.isYou ? '1px solid rgba(0, 210, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{mgr.avatar}</span>
                    <div>
                      <span style={{ fontWeight: 800, color: '#fff', fontSize: '13px' }}>
                        {mgr.name}
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '6px' }}>
                        {mgr.username}
                      </span>
                    </div>
                  </div>
                  <Tag color={mgr.isYou ? "cyan" : "default"} style={{ fontWeight: 700, margin: 0 }}>
                    {mgr.isYou ? "Vous (DG Actif)" : "Ami"}
                  </Tag>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
              Aucun profil de DG connecté. Cliquez sur le bouton de connexion ci-dessus pour vous identifier.
            </div>
          )}
        </div>

        {/* Note de sincérité */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          justifyContent: 'center',
          fontSize: '11px',
          color: '#8be9fd'
        }}>
          <CheckCircle2 size={13} color="#00d2ff" />
          <span>Données 100% sincères : aucun faux joueur simulé ni bot de remplissage.</span>
        </div>
      </div>
    </Modal>
  );
};
