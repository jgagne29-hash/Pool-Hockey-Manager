import React from 'react';
import { Modal, Table, Tag, Badge, Tooltip } from 'antd';
import { Activity, AlertTriangle, TrendingUp, TrendingDown, Stethoscope, FileText, Info } from 'lucide-react';

export const PlayerStatsModal = ({ player, edition, isOpen, onClose }) => {
  if (!player) return null;

  const columns = [
    {
      title: 'Saison',
      dataIndex: 'season',
      key: 'season',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'MJ',
      dataIndex: 'gp',
      key: 'gp',
    },
    {
      title: 'Buts',
      dataIndex: 'goals',
      key: 'goals',
    },
    {
      title: 'Passes',
      dataIndex: 'assists',
      key: 'assists',
    },
    {
      title: 'Points',
      dataIndex: 'points',
      key: 'points',
      render: (val) => <strong style={{ color: '#00ffcc' }}>{val}</strong>
    }
  ];

  // Variations selon la position
  if (player.position === 'G') {
    columns[2] = { title: 'Victoires', dataIndex: 'points', key: 'points' };
    columns.splice(3, 2); // Enlève passes et points
  }

  const isSleeper = player.recent_points / (player.recent_games || 1) > 1.0;
  const isCold = player.recent_points / (player.recent_games || 1) < 0.5;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '18px' }}>
          <Info size={22} color="#00d2ff" />
          <span>Profil & Historique de {player.name}</span>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={600}
      bodyStyle={{ background: '#0a0c12', padding: '24px', color: '#e0e0e0' }}
      wrapClassName="dark-modal-wrap"
    >
      {/* En-tête du joueur */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1f2937, #111827)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #374151',
          overflow: 'hidden'
        }}>
          {player.headshot ? (
            <img src={player.headshot} alt={player.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '24px', color: '#9ca3af' }}>{player.position}</span>
          )}
        </div>
        
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: '22px', color: '#fff', fontWeight: 900 }}>
            {player.name} <span style={{ color: '#00d2ff', fontSize: '16px' }}>#{player.number}</span>
          </h2>
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
            <Tag color="blue">{player.team}</Tag>
            <Tag color="purple">{player.position}</Tag>
            <Tag color="gold">{(player.base_cap_hit / 1000000).toFixed(2)}M $</Tag>
          </div>
        </div>
      </div>

      {/* Flags d'échange (Marché) */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
          Statut sur le Marché
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {player.is_injured ? (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', padding: '8px 12px', borderRadius: '8px', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Stethoscope size={16} /> Blessure active (Valeur -70%)
            </div>
          ) : (
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', padding: '8px 12px', borderRadius: '8px', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} /> En pleine santé
            </div>
          )}

          {player.bad_news_flag && (
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #f59e0b', padding: '8px 12px', borderRadius: '8px', color: '#fcd34d', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} /> Problème disciplinaire (Valeur -20%)
            </div>
          )}

          {isSleeper && (
            <div style={{ background: 'rgba(139, 92, 246, 0.15)', border: '1px solid #8b5cf6', padding: '8px 12px', borderRadius: '8px', color: '#c4b5fd', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={16} /> Séquence incroyable (Valeur +30%)
            </div>
          )}

          {isCold && (
            <div style={{ background: 'rgba(107, 114, 128, 0.15)', border: '1px solid #6b7280', padding: '8px 12px', borderRadius: '8px', color: '#d1d5db', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingDown size={16} /> Séquence à froid (Valeur -30%)
            </div>
          )}
        </div>
      </div>

      {/* Historique */}
      <div>
        <h3 style={{ fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
          Historique de Carrière
        </h3>
        <Table
          dataSource={player.career_history || []}
          columns={columns}
          pagination={false}
          rowKey="season"
          size="small"
          className="dark-table"
          style={{ background: '#111827', borderRadius: '8px', overflow: 'hidden' }}
        />
      </div>
    </Modal>
  );
};
