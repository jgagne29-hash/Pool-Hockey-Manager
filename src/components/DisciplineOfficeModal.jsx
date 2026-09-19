import React, { useState } from 'react';
import { Modal, Tag, Button, Input, Progress } from 'antd';
import { Shield, AlertTriangle, Scale, Award, Volume2, Flame, UserX, CheckCircle, Info } from 'lucide-react';
import {
  evaluateMessageDiscipline,
  playRefereeWhistle,
  getDisciplinaryRecord,
  getReputationStatus
} from '../utils/refereeBot';

export const DisciplineOfficeModal = ({ isOpen, onClose, pools = [], currentUser }) => {
  const [activeSubTab, setActiveSubTab] = useState('record'); // 'record', 'fairplay', 'simulator'
  const [testMessage, setTestMessage] = useState('');
  const [testResult, setTestResult] = useState(null);

  const disciplinaryRecords = getDisciplinaryRecord();

  // Extraire tous les membres de tous les pools pour le classement Fair-Play
  const allMembersMap = new Map();
  pools.forEach(pool => {
    (pool.members || []).forEach(m => {
      if (!allMembersMap.has(m.name)) {
        allMembersMap.set(m.name, {
          ...m,
          reputation: m.reputation !== undefined ? m.reputation : 100,
          penaltiesCount: m.penaltiesCount || 0,
          pointsDeducted: m.pointsDeducted || 0,
          poolName: pool.name
        });
      }
    });
  });

  const allMembers = Array.from(allMembersMap.values());
  const fairPlayLeaders = [...allMembers].sort((a, b) => (b.reputation || 100) - (a.reputation || 100));
  const badBoys = [...allMembers].filter(m => (m.penaltiesCount || 0) > 0 || (m.reputation || 100) < 100).sort((a, b) => (a.reputation || 100) - (b.reputation || 100));

  // Tester un message dans le simulateur
  const handleTestTrashTalk = () => {
    if (!testMessage.trim()) return;
    const res = evaluateMessageDiscipline(testMessage.trim(), 100);
    setTestResult(res);
    if (res.isInfraction) {
      playRefereeWhistle();
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={780}
      centered
      styles={{
        content: {
          background: '#0c1017',
          border: '1px solid rgba(255, 215, 0, 0.25)',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)',
          padding: '24px',
          color: '#fff'
        }
      }}
    >
      {/* En-tête Bureau de Discipline */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '16px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #111 0%, #2a2d34 100%)',
            border: '2px solid #fff',
            borderRadius: '12px',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(255, 255, 255, 0.2)'
          }}>
            <span style={{ fontSize: '24px' }}>🦓</span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#fff', margin: 0 }}>
                Bureau de Discipline & Arbitrage LNH
              </h3>
              <Tag color="gold" style={{ fontWeight: 800 }}>BOT OFFICIEL EN SERVICE</Tag>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
              Surveillance du fair-play, sanctions de points et maintien de la réputation des directeurs généraux.
            </p>
          </div>
        </div>

        <button
          onClick={playRefereeWhistle}
          title="Tester le coup de sifflet officiel"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '8px',
            padding: '6px 12px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Volume2 size={14} color="#f5af19" />
          Sifflet Fox 40
        </button>
      </div>

      {/* Onglets secondaires */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', background: 'rgba(255, 255, 255, 0.04)', padding: '4px', borderRadius: '10px' }}>
        <button
          onClick={() => setActiveSubTab('record')}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 800,
            fontSize: '12px',
            background: activeSubTab === 'record' ? 'rgba(245, 175, 25, 0.2)' : 'transparent',
            color: activeSubTab === 'record' ? '#f5af19' : '#888',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Scale size={14} />
          Registre des Sanctions ({disciplinaryRecords.length})
        </button>

        <button
          onClick={() => setActiveSubTab('fairplay')}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 800,
            fontSize: '12px',
            background: activeSubTab === 'fairplay' ? 'rgba(0, 210, 255, 0.2)' : 'transparent',
            color: activeSubTab === 'fairplay' ? '#00d2ff' : '#888',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Award size={14} />
          Cotes & Trophée Lady Byng
        </button>

        <button
          onClick={() => setActiveSubTab('simulator')}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 800,
            fontSize: '12px',
            background: activeSubTab === 'simulator' ? 'rgba(255, 75, 75, 0.2)' : 'transparent',
            color: activeSubTab === 'simulator' ? '#ff4b4b' : '#888',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <AlertTriangle size={14} />
          Simulateur de Trash-Talk
        </button>
      </div>

      {/* CONTENU ONGLET 1 : REGISTRE DES SANCTIONS */}
      {activeSubTab === 'record' && (
        <div style={{ maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
          {disciplinaryRecords.map(item => {
            const isSevere = item.severity === 'MAJOR' || item.severity === 'MISCONDUCT';
            return (
              <div
                key={item.id}
                style={{
                  background: isSevere ? 'rgba(255, 75, 75, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                  border: isSevere ? '1px solid rgba(255, 75, 75, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '12px 14px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>{item.managerAvatar || '👤'}</span>
                    <strong style={{ fontSize: '13px', color: '#fff' }}>{item.managerName}</strong>
                    <Tag color={item.severity === 'WARNING' ? 'gold' : item.severity === 'MINOR' ? 'orange' : 'red'} style={{ fontWeight: 800, fontSize: '10px' }}>
                      {item.severity === 'WARNING' && '⚠️ AVERTISSEMENT'}
                      {item.severity === 'MINOR' && '🟨 PÉNALITÉ 2 MIN (-15 PTS)'}
                      {item.severity === 'MAJOR' && '🟧 MAJEURE 5 MIN (-35 PTS)'}
                      {item.severity === 'MISCONDUCT' && '🟥 INCONDUITE (-75 PTS)'}
                    </Tag>
                  </div>
                  <span style={{ fontSize: '11px', color: '#666' }}>{item.dateFormatted}</span>
                </div>

                <p style={{ fontSize: '12px', color: '#ccc', margin: '4px 0 6px 0' }}>
                  <strong>Motif :</strong> {item.reason}
                </p>

                {item.textQuoted && (
                  <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', color: '#f5af19', fontStyle: 'italic', borderLeft: '3px solid #f5af19', marginBottom: '6px' }}>
                    « {item.textQuoted} »
                  </div>
                )}

                <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: '#888' }}>
                  <span>Impact Pool : <strong style={{ color: item.pointsPenalty > 0 ? '#ff4b4b' : '#38ef7d' }}>-{item.pointsPenalty} pts</strong></span>
                  <span>Réputation : <strong style={{ color: '#ff4b4b' }}>-{item.reputationLoss}%</strong></span>
                  <span>Ligue : <span style={{ color: '#aaa' }}>{item.poolName || 'Pool Privé'}</span></span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CONTENU ONGLET 2 : COTES DE RÉPUTATION & FAIR-PLAY */}
      {activeSubTab === 'fairplay' && (
        <div>
          <div style={{ background: 'rgba(0, 210, 255, 0.08)', border: '1px solid rgba(0, 210, 255, 0.2)', padding: '12px 16px', borderRadius: '10px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Award size={24} color="#00d2ff" />
            <div>
              <div style={{ fontWeight: 800, fontSize: '13px', color: '#00d2ff' }}>Trophée Lady Byng des Gérants</div>
              <div style={{ fontSize: '11px', color: '#ccc' }}>
                Maintenir une réputation ≥ 90% octroie un <strong>bonus passif de +5%</strong> sur les Rondelles d'Or lors de vos victoires de simulation !
              </div>
            </div>
          </div>

          <div style={{ maxHeight: '360px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {fairPlayLeaders.map((member, index) => {
              const rep = member.reputation !== undefined ? member.reputation : 100;
              const repStatus = getReputationStatus(rep);
              return (
                <div
                  key={member.id || index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '8px',
                    padding: '10px 14px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '220px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: index === 0 ? '#f5af19' : '#777', width: '20px' }}>#{index + 1}</span>
                    <span style={{ fontSize: '16px' }}>{member.avatar || '👤'}</span>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>{member.name}</div>
                      <div style={{ fontSize: '10px', color: '#777' }}>{member.team || member.poolName}</div>
                    </div>
                  </div>

                  <div style={{ flex: 1, padding: '0 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                      <span style={{ color: '#aaa' }}>{repStatus.icon} {repStatus.label}</span>
                      <strong style={{ color: rep >= 80 ? '#38ef7d' : rep >= 50 ? '#f5af19' : '#ff4b4b' }}>{rep}%</strong>
                    </div>
                    <Progress
                      percent={rep}
                      showInfo={false}
                      strokeColor={rep >= 80 ? '#38ef7d' : rep >= 50 ? '#f5af19' : '#ff4b4b'}
                      trailColor="rgba(255, 255, 255, 0.08)"
                      size="small"
                    />
                  </div>

                  <Tag color={repStatus.tagColor} style={{ fontWeight: 800, fontSize: '10px' }}>
                    {repStatus.label.split(' ')[0]}
                  </Tag>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTENU ONGLET 3 : SIMULATEUR DE TRASH-TALK */}
      {activeSubTab === 'simulator' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <p style={{ fontSize: '12px', color: '#ccc', margin: '0 0 10px 0' }}>
              Testez le moteur sémantique de l'Arbitre Zébré. Tapez un message pour voir quelle sanction serait infligée dans le vestiaire :
            </p>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Input
                placeholder="Ex: T'es trop faible abandonne, ou Bravo bon match !"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                onPressEnter={handleTestTrashTalk}
                style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  borderRadius: '8px'
                }}
              />
              <Button
                type="primary"
                danger
                onClick={handleTestTrashTalk}
                style={{ borderRadius: '8px', fontWeight: 800 }}
              >
                Juger le Propos
              </Button>
            </div>

            {/* Suggestions de test rapide */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
              <span style={{ fontSize: '11px', color: '#777' }}>Exemples :</span>
              {[
                "Bravo pour ton match, bien joué !",
                "T'as juste été chanceux hier soir",
                "T'es trop nul abandonne le pool",
                "T'es un voleur et un tricheur",
                "Ferme ta gueule pauvre idiot"
              ].map(sample => (
                <button
                  key={sample}
                  onClick={() => { setTestMessage(sample); }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    color: '#aaa',
                    fontSize: '10px',
                    cursor: 'pointer'
                  }}
                >
                  "{sample}"
                </button>
              ))}
            </div>
          </div>

          {testResult && (
            <div style={{
              background: testResult.isInfraction ? 'rgba(255, 75, 75, 0.1)' : 'rgba(56, 239, 125, 0.1)',
              border: testResult.isInfraction ? '1px solid rgba(255, 75, 75, 0.35)' : '1px solid rgba(56, 239, 125, 0.35)',
              borderRadius: '12px',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px' }}>{testResult.isInfraction ? '🦓' : '🤝'}</span>
                <h4 style={{ fontSize: '14px', fontWeight: 900, color: testResult.isInfraction ? '#ff4b4b' : '#38ef7d', margin: 0 }}>
                  {testResult.isInfraction ? `INFRACTION DÉTECTÉE : ${testResult.severity}` : 'PROPOS RESPECTUEUX / FAIR-PLAY'}
                </h4>
              </div>

              {testResult.isInfraction ? (
                <div>
                  <div style={{ fontSize: '12px', color: '#fff', marginBottom: '6px' }}>
                    <strong>Verdict de l'Arbitre :</strong> {testResult.botCommentary}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', marginTop: '10px' }}>
                    <span style={{ color: '#ff4b4b', fontWeight: 800 }}>Pénalité Pool : -{testResult.pointsPenalty} pts</span>
                    <span style={{ color: '#f5af19', fontWeight: 800 }}>Baisse Réputation : -{testResult.reputationLoss}%</span>
                    <span style={{ color: '#888' }}>{testResult.ruleViolated}</span>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '12px', color: '#ddd', margin: 0 }}>
                  {testResult.message || "Message propre et conforme à l'esprit sportif de la ligue."}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Pied de page informatif */}
      <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '11px', color: '#666', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Info size={12} />
          <span>Code de Conduite LNH Saison 2026-2027 • Tolérance zéro envers l'acharnement toxique</span>
        </div>
        <Button onClick={onClose} style={{ borderRadius: '8px' }}>
          Fermer
        </Button>
      </div>
    </Modal>
  );
};
