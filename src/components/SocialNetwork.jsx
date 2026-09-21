import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Badge, Avatar, Tooltip } from 'antd';
import { MessageSquare, Megaphone, ArrowRightLeft, Send, Sparkles, Smile, Trophy, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Données vides pour le réseau (Pas de fausses déclarations) ---
const DUMMY_ANNOUNCEMENTS = [
  { id: 1, type: 'system', text: "🚨 Bienvenue dans le Réseau D.G. Officiel. 🚨", time: 'Maintenant', reactions: {} }
];

const DUMMY_TRADING_FLOOR = [];

const DUMMY_DMS = [];

const DUMMY_CHAT_HISTORY = [];

export const SocialNetwork = () => {
  const [activeTab, setActiveTab] = useState('commissioner'); // commissioner, trading, dms
  const [activeDm, setActiveDm] = useState(null);
  
  // States for interactive parts
  const [announcements, setAnnouncements] = useState(DUMMY_ANNOUNCEMENTS);
  const [tradingMsgs, setTradingMsgs] = useState(DUMMY_TRADING_FLOOR);
  const [chatInput, setChatInput] = useState('');
  const [dmHistory, setDmHistory] = useState(DUMMY_CHAT_HISTORY);
  const [dmInput, setDmInput] = useState('');

  const tradingEndRef = useRef(null);
  const dmEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (activeTab === 'trading' && tradingEndRef.current) {
      tradingEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [tradingMsgs, activeTab]);

  useEffect(() => {
    if (activeTab === 'dms' && activeDm && dmEndRef.current) {
      dmEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [dmHistory, activeTab, activeDm]);

  const handleAddReaction = (msgId, emoji) => {
    setAnnouncements(prev => prev.map(msg => {
      if (msg.id === msgId) {
        const currentCount = msg.reactions[emoji] || 0;
        return {
          ...msg,
          reactions: {
            ...msg.reactions,
            [emoji]: currentCount + 1
          }
        };
      }
      return msg;
    }));
  };

  const handleSendTradingMsg = () => {
    if (!chatInput.trim()) return;
    const newMsg = {
      id: Date.now(),
      user: 'VOUS',
      level: 5,
      avatar: 'V',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setTradingMsgs(prev => [...prev, newMsg]);
    setChatInput('');
  };

  const handleSendDm = () => {
    if (!dmInput.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: 'me',
      text: dmInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setDmHistory(prev => [...prev, newMsg]);
    setDmInput('');
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', color: '#fff', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER DU RÉSEAU */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(20,20,20,0.95) 0%, rgba(30,30,50,0.95) 100%)',
        borderRadius: '16px',
        padding: '20px 24px',
        marginBottom: '20px',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '12px' }}>
          <MessageSquare size={32} color="#ff007f" />
        </div>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Réseau D.G.
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '13px' }}>
            Restez connecté à la ligue. Négociez, discutez et dominez.
          </p>
        </div>
      </div>

      {/* TABS DE NAVIGATION */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('commissioner')}
          style={{
            flex: 1, padding: '12px', borderRadius: '12px', fontWeight: 800, fontSize: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            background: activeTab === 'commissioner' ? 'linear-gradient(135deg, #f5af19 0%, #e65c00 100%)' : 'rgba(0,0,0,0.5)',
            border: activeTab === 'commissioner' ? 'none' : '1px solid rgba(255,255,255,0.1)',
            color: activeTab === 'commissioner' ? '#fff' : 'var(--text-secondary)'
          }}
        >
          <Megaphone size={18} /> Bureau du Commissaire
        </button>
        <button
          onClick={() => setActiveTab('trading')}
          style={{
            flex: 1, padding: '12px', borderRadius: '12px', fontWeight: 800, fontSize: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            background: activeTab === 'trading' ? 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)' : 'rgba(0,0,0,0.5)',
            border: activeTab === 'trading' ? 'none' : '1px solid rgba(255,255,255,0.1)',
            color: activeTab === 'trading' ? '#fff' : 'var(--text-secondary)'
          }}
        >
          <ArrowRightLeft size={18} /> Trading Floor Public
        </button>
        <button
          onClick={() => setActiveTab('dms')}
          style={{
            flex: 1, padding: '12px', borderRadius: '12px', fontWeight: 800, fontSize: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            background: activeTab === 'dms' ? 'linear-gradient(135deg, #ff007f 0%, #a00050 100%)' : 'rgba(0,0,0,0.5)',
            border: activeTab === 'dms' ? 'none' : '1px solid rgba(255,255,255,0.1)',
            color: activeTab === 'dms' ? '#fff' : 'var(--text-secondary)'
          }}
        >
          <MessageSquare size={18} /> Boîte de Réception
          <Badge count={1} style={{ backgroundColor: '#fff', color: '#ff007f', fontWeight: 900 }} />
        </button>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div style={{
        flex: 1,
        background: 'rgba(20,20,20,0.8)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.08)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <AnimatePresence mode="wait">
          
          {/* BUREAU DU COMMISSAIRE */}
          {activeTab === 'commissioner' && (
            <motion.div
              key="commissioner"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ padding: '24px', overflowY: 'auto', flex: 1 }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {announcements.map((msg) => (
                  <div key={msg.id} style={{
                    background: msg.type === 'system' ? 'rgba(245, 175, 25, 0.1)' : 'rgba(0, 210, 255, 0.1)',
                    border: msg.type === 'system' ? '1px solid rgba(245, 175, 25, 0.3)' : '1px solid rgba(0, 210, 255, 0.3)',
                    borderRadius: '12px',
                    padding: '20px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <Avatar style={{ backgroundColor: msg.type === 'system' ? '#f5af19' : '#00d2ff' }} icon={<Megaphone size={14} />} />
                      <strong style={{ color: msg.type === 'system' ? '#f5af19' : '#00d2ff' }}>
                        {msg.type === 'system' ? 'Alerte Système' : 'Ligue Officielle'}
                      </strong>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '12px', marginLeft: 'auto' }}>{msg.time}</span>
                    </div>
                    
                    <div style={{ fontSize: '15px', lineHeight: '1.5', marginBottom: '16px' }}>
                      {msg.text}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['🏒', '✨', '☕', '🔥'].map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => handleAddReaction(msg.id, emoji)}
                          style={{
                            background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '20px', padding: '4px 12px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '6px',
                            color: '#fff', fontSize: '13px'
                          }}
                        >
                          <span>{emoji}</span>
                          <span>{msg.reactions[emoji] || 0}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TRADING FLOOR PUBLIC */}
          {activeTab === 'trading' && (
            <motion.div
              key="trading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
            >
              <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '16px' }}>
                  -- Bienvenue sur le Trading Floor. Négociez avec les autres directeurs généraux. --
                </div>
                {tradingMsgs.map((msg) => (
                  <div key={msg.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <Tooltip title={`Niveau ${msg.level}`}>
                      <div style={{ position: 'relative' }}>
                        <Avatar style={{ backgroundColor: msg.user === 'VOUS' ? '#ff007f' : '#333' }}>
                          {msg.avatar}
                        </Avatar>
                        {msg.badge && (
                          <div style={{ position: 'absolute', bottom: -4, right: -4, background: '#111', borderRadius: '50%', padding: '2px', fontSize: '10px' }}>
                            {msg.badge}
                          </div>
                        )}
                        <Badge count={msg.level} style={{ backgroundColor: '#00d2ff', position: 'absolute', top: -4, left: -4, transform: 'scale(0.7)' }} />
                      </div>
                    </Tooltip>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                        <strong style={{ color: msg.user === 'VOUS' ? '#ff007f' : '#fff', fontSize: '13px' }}>{msg.user}</strong>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{msg.time}</span>
                      </div>
                      <div style={{
                        background: msg.isOffer ? 'rgba(0, 210, 255, 0.1)' : 'rgba(255,255,255,0.05)',
                        border: msg.isOffer ? '1px solid rgba(0, 210, 255, 0.3)' : '1px solid transparent',
                        padding: '10px 14px',
                        borderRadius: '0 12px 12px 12px',
                        display: 'inline-block',
                        color: msg.isOffer ? '#00d2ff' : '#eee',
                        fontSize: '14px'
                      }}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={tradingEndRef} />
              </div>
              <div style={{ padding: '16px', background: 'rgba(0,0,0,0.6)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '12px' }}>
                <Input 
                  placeholder="Écrire un message..." 
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onPressEnter={handleSendTradingMsg}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '8px' }}
                />
                <Button type="primary" icon={<Send size={16} />} onClick={handleSendTradingMsg} style={{ background: '#00d2ff', border: 'none' }} />
              </div>
            </motion.div>
          )}

          {/* BOÎTE DE RÉCEPTION DIRECTE (DM) */}
          {activeTab === 'dms' && (
            <motion.div
              key="dms"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', height: '100%' }}
            >
              {/* Sidebar List */}
              <div style={{ flex: '1 1 30%', minWidth: '220px', borderRight: '1px solid rgba(255,255,255,0.08)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontWeight: 800, color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase' }}>
                    Conversations
                  </div>
                  <Button type="text" icon={<Smile size={14} />} style={{ color: '#ff007f', padding: '0 8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800 }}>Nouveau</span>
                  </Button>
                </div>
                
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {DUMMY_DMS.map(dm => (
                    <div
                      key={dm.id}
                      onClick={() => setActiveDm(dm)}
                      style={{
                        padding: '16px',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        cursor: 'pointer',
                        background: activeDm?.id === dm.id ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'background 0.2s'
                      }}
                    >
                      <div style={{ position: 'relative' }}>
                        <Avatar style={{ backgroundColor: '#333' }}>{dm.avatar}</Avatar>
                        {dm.badge && (
                          <div style={{ position: 'absolute', bottom: -4, right: -4, background: '#111', borderRadius: '50%', padding: '2px', fontSize: '10px' }}>
                            {dm.badge}
                          </div>
                        )}
                        {dm.unread > 0 && (
                          <Badge dot style={{ position: 'absolute', top: -2, right: -2, backgroundColor: '#ff007f' }} />
                        )}
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                          <strong style={{ fontSize: '13px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dm.user}</strong>
                          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{dm.time}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: dm.unread > 0 ? '#fff' : 'var(--text-secondary)', fontWeight: dm.unread > 0 ? 700 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {dm.lastMsg}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <div style={{ flex: '2 1 70%', display: 'flex', flexDirection: 'column' }}>
                {activeDm ? (
                  <>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Avatar style={{ backgroundColor: '#333' }}>{activeDm.avatar}</Avatar>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '15px' }}>{activeDm.user}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Niveau {activeDm.level} D.G.</div>
                      </div>
                    </div>
                    <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {dmHistory.map(msg => (
                        <div key={msg.id} style={{
                          alignSelf: msg.sender === 'me' ? 'flex-end' : 'flex-start',
                          maxWidth: '70%'
                        }}>
                          <div style={{
                            background: msg.sender === 'me' ? 'linear-gradient(135deg, #ff007f 0%, #a00050 100%)' : 'rgba(255,255,255,0.1)',
                            padding: '12px 16px',
                            borderRadius: msg.sender === 'me' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                            color: '#fff',
                            fontSize: '14px',
                            boxShadow: msg.sender === 'me' ? '0 4px 15px rgba(255,0,127,0.3)' : 'none'
                          }}>
                            {msg.text}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px', textAlign: msg.sender === 'me' ? 'right' : 'left' }}>
                            {msg.time}
                          </div>
                        </div>
                      ))}
                      <div ref={dmEndRef} />
                    </div>
                    <div style={{ padding: '16px', background: 'rgba(0,0,0,0.6)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '12px' }}>
                      <Input 
                        placeholder={`Message ${activeDm.user}...`} 
                        value={dmInput}
                        onChange={e => setDmInput(e.target.value)}
                        onPressEnter={handleSendDm}
                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '8px' }}
                      />
                      <Button type="primary" icon={<Send size={16} />} onClick={handleSendDm} style={{ background: '#ff007f', border: 'none' }} />
                    </div>
                  </>
                ) : (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    <MessageSquare size={48} color="rgba(255,255,255,0.1)" style={{ marginBottom: '16px' }} />
                    <div>Sélectionnez une conversation pour envoyer un message</div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default SocialNetwork;
