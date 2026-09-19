import React from 'react';
import { Card, Alert, Typography, Timeline, Modal, Button, Tag } from 'antd';
import { RocketOutlined, LockOutlined, UnlockOutlined, TrophyOutlined, SafetyOutlined, ThunderboltOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getCatchupDetails } from '../utils/progression';

const { Title, Text, Paragraph } = Typography;

export const MidSeasonWelcome = ({ isOpen, onClose, currentMonth = 1, managerLevel = 1 }) => {
  const catchup = getCatchupDetails(currentMonth);
  const isCatchUpActive = currentMonth >= 1 && currentMonth <= 4;

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button
          key="ok"
          type="primary"
          size="large"
          onClick={onClose}
          style={{
            background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 800,
            padding: '0 24px'
          }}
        >
          C'est parti, je bâtis mon alignement ! 🏒
        </Button>
      ]}
      width={640}
      centered
      bodyStyle={{ padding: 0, overflow: 'hidden', borderRadius: '16px' }}
      style={{ top: 20 }}
    >
      <div style={{
        background: '#0d111a',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#fff'
      }}>
        {/* En-tête immersif */}
        <div style={{
          background: 'linear-gradient(135deg, #091a2e 0%, #003a8c 50%, #0050b3 100%)',
          padding: '28px 24px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <RocketOutlined style={{ fontSize: '48px', color: '#00d2ff', marginBottom: '10px', filter: 'drop-shadow(0 2px 10px rgba(0,210,255,0.5))' }} />
          <Title level={2} style={{ color: '#fff', margin: '0 0 6px', fontWeight: 900, letterSpacing: '-0.5px' }}>
            Bienvenue dans l'Arène du Pool LNH !
          </Title>
          <Text style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '13px' }}>
            100% Gratuit • Équité Mid-Saison • Progression Sportive
          </Text>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Alerte Rattrapage Saisonnier Actif */}
          {isCatchUpActive ? (
            <Alert
              message={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ThunderboltOutlined style={{ color: catchup.tagColor, fontSize: '16px' }} />
                  <span style={{ fontWeight: 800, color: '#fff' }}>{catchup.label} Actif !</span>
                </div>
              }
              description={
                <div style={{ fontSize: '12px', color: '#ccc', marginTop: '4px' }}>
                  Vous rejoignez la ligue en cours de saison ? Pas de panique ! Toute l'expérience (XP) gagnée est <strong>multipliée par {catchup.multiplier}</strong> pour vous permettre de franchir rapidement les paliers de gérant sans pénalité de retard.
                </div>
              }
              type="info"
              style={{
                marginBottom: '20px',
                background: 'rgba(0, 35, 41, 0.8)',
                border: `1px solid ${catchup.tagColor}55`,
                borderRadius: '12px'
              }}
            />
          ) : (
            <Alert
              message="Saison Régulière en cours"
              description="Chaque décision de gérant (simulation, trade, composition) compte pour bâtir votre dynastie !"
              type="success"
              style={{ marginBottom: '20px', borderRadius: '12px' }}
            />
          )}

          {/* Les 3 Règles d'Or de l'Équité */}
          <Title level={4} style={{ color: '#fff', fontSize: '15px', marginBottom: '14px' }}>
            ⚖️ Les 3 Piliers d'Équité (Anti-Dépassement Artificiel) :
          </Title>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f5af19', fontWeight: 800, fontSize: '12px', marginBottom: '4px' }}>
                <TrophyOutlined />
                <span>1. Double Classement</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                Un classement général (saison) + un classement de la semaine qui remet tout le monde à égalité chaque lundi !
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00d2ff', fontWeight: 800, fontSize: '12px', marginBottom: '4px' }}>
                <SafetyOutlined />
                <span>2. Plafond Progressif</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                Masse de départ adaptée au niveau (95M $ au Niv. 1, 104M $ au Niv. 2+) selon les normes officielles de la LNH.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff0055', fontWeight: 800, fontSize: '12px', marginBottom: '4px' }}>
                <LockOutlined />
                <span>3. Paliers de Rareté</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                Les cartes Épiques et Ultra-Rares sont verrouillées au début : vous devez prouver vos compétences pour les mériter.
              </p>
            </div>
          </div>

          {/* Feuille de route du Manager */}
          <Title level={4} style={{ color: '#fff', fontSize: '15px', marginBottom: '14px' }}>
            🗺️ Votre Feuille de Route de Gérant :
          </Title>

          <Timeline
            mode="left"
            style={{ color: '#fff', marginLeft: '6px' }}
            items={[
              {
                label: <span style={{ color: '#aaa', fontWeight: 700 }}>Niv. 1 (0 XP)</span>,
                children: (
                  <div>
                    <span style={{ color: '#fff', fontWeight: 700 }}>
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '6px' }} />
                      Cartes Communes & Rares de départ (Plafond 95M $)
                    </span>
                    <div style={{ fontSize: '11px', color: '#888' }}>Accès immédiat à la galerie et aux premiers échanges</div>
                  </div>
                )
              },
              {
                label: <span style={{ color: '#aaa', fontWeight: 700 }}>Niv. 2 (300 XP)</span>,
                children: (
                  <div>
                    <span style={{ color: '#fff', fontWeight: 700 }}>
                      {managerLevel >= 2 ? <UnlockOutlined style={{ color: '#faad14', marginRight: '6px' }} /> : <LockOutlined style={{ color: '#888', marginRight: '6px' }} />}
                      Débloque les Cartes Épiques (Plafond officiel 104M $)
                    </span>
                    <div style={{ fontSize: '11px', color: '#888' }}>5% de chance de piger des cartes à multiplicateur x1.5</div>
                  </div>
                )
              },
              {
                label: <span style={{ color: '#aaa', fontWeight: 700 }}>Niv. 3+ (800 XP)</span>,
                children: (
                  <div>
                    <span style={{ color: '#fff', fontWeight: 700 }}>
                      {managerLevel >= 3 ? <UnlockOutlined style={{ color: '#ff0055', marginRight: '6px' }} /> : <LockOutlined style={{ color: '#888', marginRight: '6px' }} />}
                      Directeur Général Pro — Ultra-Rares 1% (Plafond officiel 104M $)
                    </span>
                    <div style={{ fontSize: '11px', color: '#888' }}>Accès complet aux cartes Diamant Cosmique x2.0 et au plein plafond salarial</div>
                  </div>
                )
              }
            ]}
          />
        </div>
      </div>
    </Modal>
  );
};
