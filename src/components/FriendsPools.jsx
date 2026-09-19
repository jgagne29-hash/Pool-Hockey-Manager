import React, { useState, useEffect } from 'react';
import { Button, Input, Modal, Tag, message, Tooltip } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Trophy, Copy, MessageSquare, Send, Shield, Sparkles, CheckCircle2, Flame, UserCheck, Share2, Scale, AlertTriangle, Volume2 } from 'lucide-react';
import {
  evaluateMessageDiscipline,
  playRefereeWhistle,
  logDisciplinarySanction,
  getReputationStatus
} from '../utils/refereeBot';
import { DisciplineOfficeModal } from './DisciplineOfficeModal';

// Aucune fausse ligue au départ : les ligues sont créées et gérées par les vrais DG
const INITIAL_POOLS = [];

export const FriendsPools = ({ userPoints = 1420, currentUser, onPointsDeducted }) => {
  const [pools, setPools] = useState(() => {
    try {
      const saved = localStorage.getItem('nhl_friends_pools');
      if (!saved) return INITIAL_POOLS;
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return INITIAL_POOLS;
      // Nettoyage strict : purge des anciennes fausses ligues mockées (chums, dtd, simulated)
      const cleaned = parsed.filter(p => 
        p.id !== 'pool_chums_2026' && 
        p.id !== 'pool_dtd_ligue' && 
        !p.id.includes('simulated') &&
        !p.id.includes('pool_joined_')
      );
      return cleaned;
    } catch {
      return INITIAL_POOLS;
    }
  });

  const [activePoolId, setActivePoolId] = useState(pools[0]?.id || null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isDisciplineOfficeOpen, setIsDisciplineOfficeOpen] = useState(false);

  // Formulaire création de pool
  const [newPoolName, setNewPoolName] = useState('');
  const [newPoolDesc, setNewPoolDesc] = useState('');
  const [newPoolMax, setNewPoolMax] = useState(10);

  // Formulaire rejoindre
  const [joinCodeInput, setJoinCodeInput] = useState('');

  // Clavardage / Chat
  const [chatInput, setChatInput] = useState('');

  // Sauvegarde persistante
  useEffect(() => {
    try {
      localStorage.setItem('nhl_friends_pools', JSON.stringify(pools));
    } catch (e) {
      console.error("Erreur sauvegarde pools:", e);
    }
  }, [pools]);

  const currentPool = pools.find(p => p.id === activePoolId) || pools[0];

  // Copier le code d'invitation
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    message.success(`Code d'invitation "${code}" copié dans le presse-papier ! Envoyez-le à vos amis.`);
  };

  // Créer un nouveau pool
  const handleCreatePool = () => {
    if (!currentUser) {
      message.warning("Veuillez vous connecter ou créer votre profil de DG avant de créer une ligue.");
      return;
    }
    if (!newPoolName.trim()) {
      message.error("Veuillez entrer un nom pour votre pool d'amis !");
      return;
    }

    const uniqueCode = `POOL-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const newPool = {
      id: `pool_${Date.now()}`,
      code: uniqueCode,
      name: newPoolName.trim(),
      description: newPoolDesc.trim() || 'Pool amical sur NHL Pool Master',
      commissioner: currentUser.name,
      maxMembers: Number(newPoolMax) || 12,
      members: [
        {
          id: currentUser.deviceId || `u_${Date.now()}`,
          name: currentUser.name,
          username: currentUser.username || '@DG_Meneur',
          avatar: currentUser.avatar || '🦁',
          team: currentUser.team || 'Mon Équipe LNH',
          points: userPoints,
          rank: 1,
          trend: '+0'
        }
      ],
      messages: [
        {
          id: `msg_${Date.now()}`,
          author: currentUser.name,
          avatar: currentUser.avatar || '🦁',
          time: 'À l\'instant',
          text: `Bienvenue dans ${newPoolName} ! Partagez le code ${uniqueCode} avec vos amis pour démarrer la compétition.`
        }
      ]
    };

    setPools(prev => [newPool, ...prev]);
    setActivePoolId(newPool.id);
    setIsCreateModalOpen(false);
    setNewPoolName('');
    setNewPoolDesc('');
    message.success(`Pool "${newPool.name}" créé avec succès ! Code d'invitation : ${uniqueCode}`);
  };

  // Rejoindre un pool avec un code
  const handleJoinPool = () => {
    if (!currentUser) {
      message.warning("Veuillez vous connecter ou créer votre profil de DG avant de rejoindre une ligue.");
      return;
    }
    const cleanCode = joinCodeInput.trim().toUpperCase();
    if (!cleanCode) {
      message.error("Veuillez entrer un code d'invitation valide.");
      return;
    }

    const target = pools.find(p => p.code.toUpperCase() === cleanCode);
    if (!target) {
      message.error(`Aucune ligue trouvée avec le code "${cleanCode}". Vérifiez le code partagé par votre ami ou fondez votre propre pool.`);
      return;
    }

    // Si déjà membre
    const alreadyMember = currentUser && target.members.some(m => m.name === currentUser.name || m.username === currentUser.username);
    if (alreadyMember) {
      setActivePoolId(target.id);
      setIsJoinModalOpen(false);
      setJoinCodeInput('');
      message.info(`Vous êtes déjà membre de "${target.name}".`);
      return;
    }

    // Ajouter le membre
    const updated = pools.map(p => {
      if (p.id === target.id) {
        return {
          ...p,
          members: [
            ...p.members,
            {
              id: `u_${Date.now()}`,
              name: currentUser?.name || 'Moi',
              username: currentUser?.username || '@NouveauDG',
              avatar: currentUser?.avatar || '🦁',
              team: 'Mon Alignement',
              points: userPoints,
              rank: p.members.length + 1,
              trend: '+0'
            }
          ]
        };
      }
      return p;
    });

    setPools(updated);
    setActivePoolId(target.id);
    setIsJoinModalOpen(false);
    setJoinCodeInput('');
    message.success(`Vous avez rejoint "${target.name}" avec succès !`);
  };

  // Envoyer un message dans le vestiaire du pool avec arbitrage IA
  const handleSendMessage = () => {
    if (!currentUser) {
      message.warning("Veuillez vous connecter ou créer votre profil de DG avant de clavarder dans le vestiaire.");
      return;
    }
    if (!chatInput.trim()) return;

    const senderName = currentUser.name;
    const senderAvatar = currentUser.avatar || '🦁';
    const text = chatInput.trim();

    // Trouver le membre actuel dans le pool
    const currentMember = currentPool.members.find(m => m.name === senderName) || {
      reputation: 100
    };
    const currentReputation = currentMember.reputation !== undefined ? currentMember.reputation : 100;

    // Analyse sémantique par le Bot Arbitre Zébré
    const evalResult = evaluateMessageDiscipline(text, currentReputation);

    const newMsg = {
      id: `msg_${Date.now()}`,
      author: senderName,
      avatar: senderAvatar,
      time: "À l'instant",
      text: text
    };

    let refereeMsg = null;
    if (evalResult.isInfraction) {
      playRefereeWhistle();

      refereeMsg = {
        id: `ref_${Date.now() + 1}`,
        author: 'Arbitre Zébré LNH (Bot)',
        avatar: '🦓',
        isReferee: true,
        severity: evalResult.severity,
        time: "À l'instant",
        text: evalResult.botCommentary,
        pointsPenalty: evalResult.pointsPenalty,
        reputationLoss: evalResult.reputationLoss,
        reason: evalResult.reason
      };

      // Enregistrer au bureau de discipline officiel
      logDisciplinarySanction({
        managerName: senderName,
        managerAvatar: senderAvatar,
        poolName: currentPool.name,
        severity: evalResult.severity,
        reason: evalResult.reason,
        pointsPenalty: evalResult.pointsPenalty,
        reputationLoss: evalResult.reputationLoss,
        textQuoted: text
      });

      // Alerte instantanée à l'écran
      message.error(
        `🚨 ${evalResult.severity === 'WARNING' ? 'Avertissement Arbitral' : `PÉNALITÉ LNH : -${evalResult.pointsPenalty} pts & -${evalResult.reputationLoss}% Réputation !`}`
      );

      // Si le prop onPointsDeducted est passé, déduire des points globaux
      if (evalResult.pointsPenalty > 0 && onPointsDeducted) {
        onPointsDeducted(evalResult.pointsPenalty, evalResult.reason);
      }
    }

    setPools(prev => prev.map(p => {
      if (p.id === currentPool.id) {
        let updatedMembers = p.members;
        if (evalResult.isInfraction) {
          updatedMembers = p.members.map(m => {
            if (m.name === senderName) {
              const newPts = Math.max(0, m.points - evalResult.pointsPenalty);
              const newRep = Math.max(0, (m.reputation !== undefined ? m.reputation : 100) - evalResult.reputationLoss);
              return {
                ...m,
                points: newPts,
                reputation: newRep,
                penaltiesCount: (m.penaltiesCount || 0) + (evalResult.pointsPenalty > 0 ? 1 : 0),
                pointsDeducted: (m.pointsDeducted || 0) + evalResult.pointsPenalty
              };
            }
            return m;
          });
        }

        const newMessagesList = refereeMsg
          ? [...(p.messages || []), newMsg, refereeMsg]
          : [...(p.messages || []), newMsg];

        return {
          ...p,
          members: updatedMembers,
          messages: newMessagesList
        };
      }
      return p;
    }));

    setChatInput('');
  };

  // Signaler un message à l'Arbitre Zébré (Appel de l'arbitre)
  const handleCallReferee = (targetMsg) => {
    if (targetMsg.isReferee) return;
    const currentMember = currentPool.members.find(m => m.name === targetMsg.author) || { reputation: 100 };
    const evalResult = evaluateMessageDiscipline(targetMsg.text, currentMember.reputation || 100);

    playRefereeWhistle();

    if (evalResult.isInfraction) {
      const refMsg = {
        id: `ref_${Date.now()}`,
        author: 'Arbitre Zébré LNH (Bot)',
        avatar: '🦓',
        isReferee: true,
        severity: evalResult.severity,
        time: "À l'instant",
        text: `Suite au signalement d'un DG : ${evalResult.botCommentary}`,
        pointsPenalty: evalResult.pointsPenalty,
        reputationLoss: evalResult.reputationLoss,
        reason: evalResult.reason
      };

      logDisciplinarySanction({
        managerName: targetMsg.author,
        managerAvatar: targetMsg.avatar,
        poolName: currentPool.name,
        severity: evalResult.severity,
        reason: evalResult.reason,
        pointsPenalty: evalResult.pointsPenalty,
        reputationLoss: evalResult.reputationLoss,
        textQuoted: targetMsg.text
      });

      setPools(prev => prev.map(p => {
        if (p.id === currentPool.id) {
          const updatedMembers = p.members.map(m => {
            if (m.name === targetMsg.author) {
              return {
                ...m,
                points: Math.max(0, m.points - evalResult.pointsPenalty),
                reputation: Math.max(0, (m.reputation !== undefined ? m.reputation : 100) - evalResult.reputationLoss),
                penaltiesCount: (m.penaltiesCount || 0) + 1,
                pointsDeducted: (m.pointsDeducted || 0) + evalResult.pointsPenalty
              };
            }
            return m;
          });
          return {
            ...p,
            members: updatedMembers,
            messages: [...(p.messages || []), refMsg]
          };
        }
        return p;
      }));

      message.success(`L'Arbitre Zébré a sanctionné ${targetMsg.author} suite à votre signalement !`);
    } else {
      const refMsg = {
        id: `ref_${Date.now()}`,
        author: 'Arbitre Zébré LNH (Bot)',
        avatar: '🦓',
        isReferee: true,
        time: "À l'instant",
        text: `Après révision vidéo par l'Arbitre : Aucun contact illégal ou infraction détectée sur le message de @${targetMsg.author}. Le jeu se poursuit !`
      };
      setPools(prev => prev.map(p => {
        if (p.id === currentPool.id) {
          return {
            ...p,
            messages: [...(p.messages || []), refMsg]
          };
        }
        return p;
      }));
      message.info("L'Arbitre n'a retenu aucune infraction sur ce message.");
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* En-tête des Pools d'Amis */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px',
        background: 'linear-gradient(135deg, rgba(0, 210, 255, 0.1) 0%, rgba(58, 123, 213, 0.15) 100%)',
        border: '1px solid rgba(0, 210, 255, 0.25)',
        borderRadius: '16px',
        padding: '20px 24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
            padding: '12px',
            borderRadius: '14px',
            boxShadow: '0 4px 20px rgba(0, 210, 255, 0.4)'
          }}>
            <Users size={26} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', margin: 0 }}>
                Pools Privés entre Amis
              </h2>
              <Tag color="cyan" style={{ fontWeight: 800 }}>LIGUES AMICALES</Tag>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Affrontez vos collègues, votre famille ou vos amis dans vos propres ligues privées !
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
              border: 'none',
              fontWeight: 800,
              borderRadius: '10px',
              boxShadow: '0 4px 14px rgba(0, 210, 255, 0.3)'
            }}
          >
            Créer un Pool
          </Button>

          <Button
            icon={<Share2 size={16} />}
            onClick={() => setIsJoinModalOpen(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#fff',
              fontWeight: 800,
              borderRadius: '10px'
            }}
          >
            Rejoindre avec un Code
          </Button>
        </div>
      </div>

      {/* Bannière d'avertissement si non connecté */}
      {!currentUser && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px dashed rgba(255, 255, 255, 0.18)',
          borderRadius: '14px',
          padding: '14px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#aaa',
          fontSize: '12px'
        }}>
          <span style={{ fontSize: '22px' }}>👤</span>
          <div>
            <strong style={{ color: '#fff', fontSize: '13px' }}>Mode Consultation :</strong> Aucun DG n'est connecté sur cet appareil. Vous pouvez consulter les ligues et les pointages. Connectez-vous ou créez votre DG pour fonder une ligue, inviter vos amis ou clavarder dans le vestiaire.
          </div>
        </div>
      )}

      {/* Onglets de sélection du Pool actif */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '20px'
      }}>
        {pools.map(p => (
          <button
            key={p.id}
            onClick={() => setActivePoolId(p.id)}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              border: activePoolId === p.id ? '2px solid #00d2ff' : '1px solid rgba(255,255,255,0.08)',
              background: activePoolId === p.id ? 'rgba(0, 210, 255, 0.15)' : 'rgba(18, 22, 32, 0.7)',
              color: activePoolId === p.id ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              boxShadow: activePoolId === p.id ? '0 0 15px rgba(0, 210, 255, 0.25)' : 'none'
            }}
          >
            <Trophy size={14} color={activePoolId === p.id ? '#ffd700' : 'currentColor'} />
            <span>{p.name}</span>
            <span style={{
              background: 'rgba(0,0,0,0.3)',
              padding: '2px 6px',
              borderRadius: '8px',
              fontSize: '11px',
              color: '#00d2ff'
            }}>
              {p.members?.length || 0} amis
            </span>
          </button>
        ))}
      </div>

      {currentPool && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 360px', gap: '24px' }}>
          {/* COLONNE GAUCHE : CLASSEMENT DU POOL */}
          <div>
            <div style={{
              background: 'rgba(18, 22, 32, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '20px',
              backdropFilter: 'blur(10px)'
            }}>
              {/* Entête du pool sélectionné */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '12px',
                paddingBottom: '16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '16px'
              }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#fff', margin: 0 }}>
                    {currentPool.name}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                    {currentPool.description} • Commissaire : <strong>{currentPool.commissioner}</strong>
                  </p>
                </div>

                {/* Badge Code d'invitation avec bouton copier */}
                <div
                  onClick={() => handleCopyCode(currentPool.code)}
                  title="Cliquez pour copier le code d'invitation"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(245, 175, 25, 0.15)',
                    border: '1px dashed #f5af19',
                    padding: '6px 14px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: '11px', color: '#f5af19', fontWeight: 800 }}>
                    CODE : <strong>{currentPool.code}</strong>
                  </span>
                  <Copy size={13} color="#f5af19" />
                </div>
              </div>

              {/* Tableau du classement des membres */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentPool.members
                  .sort((a, b) => b.points - a.points)
                  .map((member, idx) => {
                    const isMe = currentUser && (member.name === currentUser.name || member.username === currentUser.username);
                    const rankMedal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
                    const rep = member.reputation !== undefined ? member.reputation : 100;
                    const repStatus = getReputationStatus(rep);

                    return (
                      <div
                        key={member.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          background: isMe
                            ? 'linear-gradient(135deg, rgba(0, 210, 255, 0.15) 0%, rgba(58, 123, 213, 0.1) 100%)'
                            : 'rgba(255, 255, 255, 0.03)',
                          border: isMe ? '1px solid rgba(0, 210, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '16px', fontWeight: 900, width: '28px', textAlign: 'center' }}>
                            {rankMedal}
                          </span>
                          <span style={{ fontSize: '24px' }}>{member.avatar}</span>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>
                                {member.name}
                              </span>
                              {isMe && (
                                <span style={{
                                  background: '#00d2ff',
                                  color: '#000',
                                  fontSize: '9px',
                                  fontWeight: 900,
                                  padding: '1px 5px',
                                  borderRadius: '6px'
                                }}>
                                  VOUS
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                              {member.team} • {member.username}
                            </div>
                            {/* Badge de Réputation & Fair-Play */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                              <Tag color={repStatus.tagColor} style={{ fontSize: '9px', fontWeight: 800, padding: '0 5px', margin: 0, borderRadius: '4px' }}>
                                {repStatus.icon} {rep}% Fair-Play
                              </Tag>
                              {(member.penaltiesCount || 0) > 0 && (
                                <span style={{ fontSize: '10px', color: '#ff4b4b', fontWeight: 700 }} title={`${member.penaltiesCount} punition(s) infligée(s) par l'Arbitre Zébré`}>
                                  🟨 {member.penaltiesCount} pénalité{member.penaltiesCount > 1 ? 's' : ''} (-{member.pointsDeducted || 0} pts)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '16px', fontWeight: 900, color: '#ffd700' }}>
                            {member.points.toLocaleString()} pts
                          </div>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: member.trend.startsWith('+') ? '#52c41a' : '#ff4d4f' }}>
                            {member.trend} cette semaine
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* COLONNE DROITE : VESTIAIRE & TRASH TALK SURVEILLÉ PAR L'ARBITRE IA */}
          <div>
            <div style={{
              background: 'rgba(18, 22, 32, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '20px',
              backdropFilter: 'blur(10px)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '12px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={16} color="#00d2ff" />
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#fff', margin: 0 }}>
                    Vestiaire & Clavardage
                  </h4>
                </div>

                <Button
                  size="small"
                  onClick={() => setIsDisciplineOfficeOpen(true)}
                  style={{
                    background: 'rgba(245, 175, 25, 0.15)',
                    border: '1px solid rgba(245, 175, 25, 0.4)',
                    color: '#f5af19',
                    fontSize: '11px',
                    fontWeight: 800,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>🦓</span>
                  Bureau de Discipline
                </Button>
              </div>

              {/* Indicateur d'arbitrage en direct */}
              <div style={{
                background: 'rgba(255, 215, 0, 0.06)',
                border: '1px dashed rgba(255, 215, 0, 0.3)',
                borderRadius: '8px',
                padding: '6px 10px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ffdd59' }}>
                  <Scale size={13} />
                  <span>Arbitre Zébré IA actif : Trash-talk modéré & sanctions de points</span>
                </div>
                <Tooltip title="Tester le coup de sifflet officiel">
                  <span onClick={playRefereeWhistle} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', color: '#888' }}>
                    <Volume2 size={12} />
                  </span>
                </Tooltip>
              </div>

              {/* Liste des messages */}
              <div style={{
                flex: 1,
                maxHeight: '380px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                paddingRight: '6px',
                marginBottom: '14px'
              }}>
                {(!currentPool.messages || currentPool.messages.length === 0) ? (
                  <div style={{ textAlign: 'center', color: '#666', fontSize: '12px', padding: '20px' }}>
                    Aucun message pour l'instant. Soyez le premier à lancer les hostilités sportives !
                  </div>
                ) : (
                  currentPool.messages.map(msg => (
                    msg.isReferee ? (
                      /* Message Officiel de l'Arbitre Zébré */
                      <div
                        key={msg.id}
                        style={{
                          background: 'linear-gradient(135deg, rgba(20, 22, 28, 0.95) 0%, rgba(35, 30, 20, 0.95) 100%)',
                          border: msg.severity === 'MAJOR' || msg.severity === 'MISCONDUCT'
                            ? '1px solid rgba(255, 75, 75, 0.5)'
                            : '1px solid rgba(245, 175, 25, 0.5)',
                          borderRadius: '10px',
                          padding: '10px 12px',
                          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '16px' }}>🦓</span>
                            <span style={{ fontSize: '11px', fontWeight: 900, color: '#fff' }}>ARBITRE ZÉBRÉ LNH</span>
                            <Tag color={msg.severity === 'WARNING' ? 'gold' : msg.severity === 'MINOR' ? 'orange' : msg.severity ? 'red' : 'blue'} style={{ fontSize: '9px', fontWeight: 800, margin: 0, padding: '0 4px' }}>
                              {msg.severity ? `SANCTION ${msg.severity}` : 'RÉVISION'}
                            </Tag>
                          </div>
                          <span style={{ fontSize: '10px', color: '#888' }}>{msg.time}</span>
                        </div>
                        <p style={{ fontSize: '11px', color: '#ffdd59', margin: '4px 0', lineHeight: '1.4', fontWeight: 600 }}>
                          {msg.text}
                        </p>
                        {msg.pointsPenalty > 0 && (
                          <div style={{ display: 'flex', gap: '10px', fontSize: '10px', color: '#ff4b4b', fontWeight: 800, marginTop: '4px' }}>
                            <span>⚠️ Déduction : -{msg.pointsPenalty} pts</span>
                            <span>📉 Réputation : -{msg.reputationLoss}%</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Message standard de DG */
                      <div
                        key={msg.id}
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '10px',
                          padding: '10px 12px',
                          position: 'relative'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '14px' }}>{msg.avatar}</span>
                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>{msg.author}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '10px', color: '#777' }}>{msg.time}</span>
                            {/* Bouton pour appeler l'arbitre sur ce message */}
                            <Tooltip title="Signaler à l'Arbitre Zébré (Coup de sifflet)">
                              <button
                                onClick={() => handleCallReferee(msg)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#777',
                                  cursor: 'pointer',
                                  padding: '2px',
                                  borderRadius: '4px',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                              >
                                <span style={{ fontSize: '12px' }}>🦓</span>
                              </button>
                            </Tooltip>
                          </div>
                        </div>
                        <p style={{ fontSize: '12px', color: '#ddd', margin: 0, lineHeight: '1.4' }}>
                          {msg.text}
                        </p>
                      </div>
                    )
                  ))
                )}
              </div>

              {/* Saisie de message */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <Input
                  placeholder="Écrivez dans le vestiaire (attention au trash-talk !)..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onPressEnter={handleSendMessage}
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Button
                  type="primary"
                  icon={<Send size={14} />}
                  onClick={handleSendMessage}
                  style={{
                    background: '#00d2ff',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#000',
                    fontWeight: 800
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* État vide si aucune ligue active */}
      {(!currentPool || pools.length === 0) && (
        <div style={{
          background: 'rgba(18, 22, 32, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '48px 24px',
          textAlign: 'center',
          maxWidth: '680px',
          margin: '30px auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(0, 210, 255, 0.12)',
            border: '1px solid rgba(0, 210, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px'
          }}>
            <Users size={32} color="#00d2ff" />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#fff', margin: '0 0 8px' }}>
            Aucune ligue active
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '480px', margin: '0 auto 24px' }}>
            Zéro fausse ligue enregistrée. Fondez votre propre ligue d'amis ou entrez le code officiel partagé par votre commissaire pour démarrer.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Button
              type="primary"
              icon={<Plus size={16} />}
              size="large"
              onClick={() => setIsCreateModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                border: 'none',
                fontWeight: 800,
                borderRadius: '10px'
              }}
            >
              Créer ma Première Ligue
            </Button>
            <Button
              size="large"
              icon={<Share2 size={16} />}
              onClick={() => setIsJoinModalOpen(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                fontWeight: 800,
                borderRadius: '10px'
              }}
            >
              Rejoindre avec un Code
            </Button>
          </div>
        </div>
      )}

      {/* MODAL : CRÉER UN POOL D'AMIS */}
      <Modal
        title={<span style={{ color: '#fff', fontWeight: 900, fontSize: '18px' }}>🏒 Créer un Nouveau Pool d'Amis</span>}
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
        destroyOnClose
        styles={{ content: { background: '#121620', border: '1px solid rgba(255,255,255,0.1)' } }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#aaa', display: 'block', marginBottom: '6px' }}>
              Nom de votre Pool / Ligue :
            </label>
            <Input
              placeholder="ex: Pool du Vendredi Soir, Les Gérants d'Estrade..."
              value={newPoolName}
              onChange={(e) => setNewPoolName(e.target.value)}
              style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#aaa', display: 'block', marginBottom: '6px' }}>
              Description ou règles amicales :
            </label>
            <Input.TextArea
              rows={2}
              placeholder="ex: 20 joueurs par équipe, réinitialisation chaque lundi !"
              value={newPoolDesc}
              onChange={(e) => setNewPoolDesc(e.target.value)}
              style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#aaa', display: 'block', marginBottom: '6px' }}>
              Nombre maximum d'amis :
            </label>
            <Input
              type="number"
              min={2}
              max={32}
              value={newPoolMax}
              onChange={(e) => setNewPoolMax(e.target.value)}
              style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
            />
          </div>

          <Button
            type="primary"
            size="large"
            onClick={handleCreatePool}
            style={{
              background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 800,
              marginTop: '10px'
            }}
          >
            Lancer le Pool & Obtenir le Code
          </Button>
        </div>
      </Modal>

      {/* MODAL : REJOINDRE AVEC UN CODE */}
      <Modal
        title={<span style={{ color: '#fff', fontWeight: 900, fontSize: '18px' }}>🤝 Rejoindre un Pool d'Amis</span>}
        open={isJoinModalOpen}
        onCancel={() => setIsJoinModalOpen(false)}
        footer={null}
        destroyOnClose
        styles={{ content: { background: '#121620', border: '1px solid rgba(255,255,255,0.1)' } }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Entrez le code officiel d'invitation généré par votre ami ou commissaire (ex: <code>POOL-A8F2</code>) :
          </p>

          <Input
            placeholder="Code d'invitation (ex: POOL-A8F2)"
            value={joinCodeInput}
            onChange={(e) => setJoinCodeInput(e.target.value)}
            onPressEnter={handleJoinPool}
            style={{
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid #00d2ff',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 800,
              textAlign: 'center',
              letterSpacing: '1px'
            }}
          />

          <Button
            type="primary"
            size="large"
            onClick={handleJoinPool}
            style={{
              background: 'linear-gradient(135deg, #52c41a 0%, #135200 100%)',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 800,
              marginTop: '6px'
            }}
          >
            Confirmer et Rejoindre le Pool
          </Button>
        </div>
      </Modal>

      {/* MODAL : BUREAU DE DISCIPLINE LNH & ARBITRE ZÉBRÉ */}
      <DisciplineOfficeModal
        isOpen={isDisciplineOfficeOpen}
        onClose={() => setIsDisciplineOfficeOpen(false)}
        pools={pools}
        currentUser={currentUser}
      />
    </div>
  );
};
