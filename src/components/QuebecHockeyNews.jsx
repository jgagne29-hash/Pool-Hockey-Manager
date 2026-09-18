import React, { useState, useEffect } from 'react';
import { Card, Tag, List, Typography, Space, Button, Radio, Input, Spin, Badge } from 'antd';
import { Newspaper, ExternalLink, RefreshCw, Search, Flame, Shield, Radio as RadioIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getQuebecHockeyNews } from '../utils/quebecNewsService';

const { Text, Title } = Typography;

function formatRelativeTime(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 1) return "À l'instant";
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Il y a ${diffHours} h`;
  return `Il y a ${Math.floor(diffHours / 24)} j`;
}

export const QuebecHockeyNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState('ALL'); // 'ALL', 'RDS', 'TVA Sports'
  const [searchFilter, setSearchFilter] = useState('');

  const fetchNews = async () => {
    setLoading(true);
    try {
      const articles = await getQuebecHockeyNews();
      setNews(articles);
    } catch (err) {
      console.error("Erreur chargement nouvelles québécoises :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const filteredNews = news.filter(item => {
    const matchesSource = sourceFilter === 'ALL' || item.source === sourceFilter;
    const matchesSearch = item.title.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesSource && matchesSearch;
  });

  return (
    <div style={{ maxWidth: 760, margin: '20px auto', padding: '0 16px' }}>
      <Card
        style={{
          background: 'rgba(15, 20, 30, 0.95)',
          borderRadius: '16px',
          border: '1px solid rgba(0, 210, 255, 0.2)',
          boxShadow: '0 10px 35px rgba(0, 0, 0, 0.6)'
        }}
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #00d2ff 0%, #0050b3 100%)',
                padding: '6px 10px',
                borderRadius: '10px',
                color: '#fff'
              }}>
                <Newspaper size={18} />
              </div>
              <div>
                <span style={{ fontSize: '16px', fontWeight: 900, color: '#fff' }}>
                  Fil de Nouvelles LNH (100% Québécois)
                </span>
                <div style={{ fontSize: '11px', color: '#00d2ff', fontWeight: 600 }}>
                  Filtre strict : Uniquement RDS & TVA Sports
                </div>
              </div>
            </div>

            <Button
              type="text"
              icon={<RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />}
              onClick={fetchNews}
              style={{ color: '#00d2ff', fontWeight: 700 }}
            >
              Rafraîchir
            </Button>
          </div>
        }
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* Barre de filtre et recherche */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <Radio.Group
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              buttonStyle="solid"
              size="small"
            >
              <Radio.Button value="ALL">
                Tous ({news.length})
              </Radio.Button>
              <Radio.Button value="RDS" style={{ color: sourceFilter === 'RDS' ? '#fff' : '#40a9ff' }}>
                🔵 RDS ({news.filter(n => n.source === 'RDS').length})
              </Radio.Button>
              <Radio.Button value="TVA Sports" style={{ color: sourceFilter === 'TVA Sports' ? '#fff' : '#fa8c16' }}>
                🟠 TVA Sports ({news.filter(n => n.source === 'TVA Sports').length})
              </Radio.Button>
            </Radio.Group>

            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={14} color="#888" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Filtrer (Suzuki, Hutson...)"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px 6px 30px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Bannière explicative */}
          <div style={{
            background: 'rgba(0, 210, 255, 0.06)',
            border: '1px solid rgba(0, 210, 255, 0.18)',
            borderRadius: '10px',
            padding: '8px 14px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#e6f7ff'
          }}>
            <RadioIcon size={14} color="#00d2ff" />
            <span>
              Les articles sont récupérés via l'endpoint <code>/api/quebec-hockey-news</code> et triés en temps réel pour alimenter vos décisions de gérant de pool !
            </span>
          </div>

          {/* Liste des articles */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin tip="Chargement des actualités francophones..." />
            </div>
          ) : (
            <List
              dataSource={filteredNews}
              renderItem={(article, index) => {
                const isRds = article.source === 'RDS';
                return (
                  <motion.div
                    key={article.title + index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{
                      background: isRds ? 'rgba(0, 40, 90, 0.25)' : 'rgba(90, 40, 0, 0.25)',
                      border: isRds ? '1px solid rgba(0, 140, 255, 0.25)' : '1px solid rgba(250, 140, 22, 0.25)',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      marginBottom: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <Tag color={article.tagColor || (isRds ? 'blue' : 'orange')} style={{ fontWeight: 800, fontSize: '11px', margin: 0 }}>
                          {article.source}
                        </Tag>
                        <span style={{ fontSize: '11px', color: '#888' }}>
                          {formatRelativeTime(article.publishedAt)}
                        </span>
                      </div>

                      <a
                        href={article.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '13px',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          lineHeight: 1.4
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = isRds ? '#40a9ff' : '#ffa940'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#fff'}
                      >
                        {article.title}
                        <ExternalLink size={13} style={{ opacity: 0.7 }} />
                      </a>
                    </div>
                  </motion.div>
                );
              }}
            />
          )}
        </Space>
      </Card>
    </div>
  );
};
