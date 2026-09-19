import React from 'react';
import { Modal, Tag, Progress } from 'antd';
import { Users, Activity, Trophy, ArrowRightLeft, Package, Shield, Globe, Sparkles } from 'lucide-react';

export const CommunityStatsModal = ({ isOpen, onClose }) => {
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={640}
      styles={{
        content: {
          background: 'radial-gradient(circle at 50% 10%, #162032 0%, #0d111a 90%)',
          border: '1px solid rgba(56, 239, 125, 0.4)',
          borderRadius: '20px',
          boxShadow: '0 0 35px rgba(56, 239, 125, 0.25)',
          padding: '28px 24px'
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
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
          marginBottom: '12px'
        }}>
          <Users size={30} color="#fff" />
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>
          Statistiques de la Communauté LNH
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Vue en temps réel des gérants (poolers), ligues actives et transactions sur la plateforme.
        </p>

        {/* 4 Compteurs Clés */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          margin: '20px 0',
          textAlign: 'left'
        }}>
          {/* Gérants actifs en direct */}
          <div style={{
            background: 'rgba(56, 239, 125, 0.08)',
            border: '1px solid rgba(56, 239, 125, 0.35)',
            borderRadius: '14px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#38ef7d',
                boxShadow: '0 0 8px #38ef7d',
                display: 'inline-block'
              }} />
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#38ef7d', textTransform: 'uppercase' }}>
                En Ligne Présentement
              </span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>
              1 284 <span style={{ fontSize: '14px', color: '#38ef7d', fontWeight: 700 }}>DG connectés</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Gérants ajustant leur alignement de 20 joueurs en ce moment.
            </p>
          </div>

          {/* Total Poolers Enregistrés */}
          <div style={{
            background: 'rgba(0, 210, 255, 0.08)',
            border: '1px solid rgba(0, 210, 255, 0.3)',
            borderRadius: '14px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Globe size={14} color="#00d2ff" />
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#00d2ff', textTransform: 'uppercase' }}>
                Total Poolers Inscrits
              </span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>
              14 890 <span style={{ fontSize: '14px', color: '#00d2ff', fontWeight: 700 }}>Gérants</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              À travers le Québec, le Canada et l'Amérique du Nord.
            </p>
          </div>

          {/* Ligues & Pools Actifs */}
          <div style={{
            background: 'rgba(245, 175, 25, 0.08)',
            border: '1px solid rgba(245, 175, 25, 0.3)',
            borderRadius: '14px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Trophy size={14} color="#f5af19" />
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#f5af19', textTransform: 'uppercase' }}>
                Pools & Ligues Privées
              </span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>
              842 <span style={{ fontSize: '14px', color: '#f5af19', fontWeight: 700 }}>Ligues actives</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Compétitions amicales entre amis et collègues de travail.
            </p>
          </div>

          {/* Échanges Complétés */}
          <div style={{
            background: 'rgba(255, 77, 79, 0.08)',
            border: '1px solid rgba(255, 77, 79, 0.3)',
            borderRadius: '14px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <ArrowRightLeft size={14} color="#ff7875" />
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#ff7875', textTransform: 'uppercase' }}>
                Échanges Négociés
              </span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>
              3 140 <span style={{ fontSize: '14px', color: '#ff7875', fontWeight: 700 }}>Aujourd'hui</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Transactions équitables validées avec l'algorithme d'équité.
            </p>
          </div>
        </div>

        {/* Répartition par Division de Gérants */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '16px',
          textAlign: 'left',
          marginBottom: '16px'
        }}>
          <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#fff', margin: '0 0 12px', textTransform: 'uppercase' }}>
            📊 Répartition des Gérants par Rang DG
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: '#aaa' }}>🥉 Niveau 1 : Recrues (0 - 299 XP)</span>
                <span style={{ color: '#fff', fontWeight: 700 }}>6 420 DG (43%)</span>
              </div>
              <Progress percent={43} strokeColor="#cd7f32" showInfo={false} size="small" />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: '#aaa' }}>🥈 Niveau 2 : Directeurs Adjoints (300 - 799 XP)</span>
                <span style={{ color: '#00d2ff', fontWeight: 700 }}>5 810 DG (39%) — <Tag color="cyan">Votre Division</Tag></span>
              </div>
              <Progress percent={39} strokeColor="#00d2ff" showInfo={false} size="small" />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: '#aaa' }}>🥇 Niveau 3+ : DG Professionnels (800+ XP)</span>
                <span style={{ color: '#ffd700', fontWeight: 700 }}>2 660 DG (18%)</span>
              </div>
              <Progress percent={18} strokeColor="#ffd700" showInfo={false} size="small" />
            </div>
          </div>
        </div>

        {/* Résumé de vos Pools Privés */}
        <div style={{
          background: 'rgba(0, 210, 255, 0.05)',
          border: '1px solid rgba(0, 210, 255, 0.2)',
          borderRadius: '12px',
          padding: '12px 16px',
          textAlign: 'left',
          fontSize: '12px',
          color: '#e6f7ff',
          lineHeight: '1.5'
        }}>
          👥 <strong>Vos Pools Privés :</strong> Vous êtes actuellement membre de <strong>2 ligues privées</strong> (Pool des Chums du Vendredi : 5 amis, Ligue DTD : 3 amis) et vous occupez la <strong>1re place</strong> dans les deux !
        </div>
      </div>
    </Modal>
  );
};
