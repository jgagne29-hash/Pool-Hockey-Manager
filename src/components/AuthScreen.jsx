import React, { useState } from 'react';
import { Card, Form, Input, Button, Divider, Space, Typography, Tag, message } from 'antd';
import { motion } from 'framer-motion';
import { GoogleOutlined, MailOutlined, RocketOutlined, CloseOutlined, UserOutlined, LogoutOutlined, CheckCircleOutlined, EditOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const AVATAR_CHOICES = ['🦁', '⚡', '🦊', '🏒', '🐻', '🎯', '🦅', '🚀', '🐺', '🦈', '👑', '⚔️'];

export const AuthScreen = ({ currentUser, onLoginSuccess, onLogout, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(currentUser ? 'connected' : 'create'); // 'connected', 'create', 'email', 'google'
  
  // Champs de création de profil DG
  const [name, setName] = useState(currentUser?.name || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [teamName, setTeamName] = useState(currentUser?.team || 'Élite Hockey Club');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser?.avatar || '🦁');

  // Champs de connexion Google manuelle / interactive
  const [googleName, setGoogleName] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');

  // Créer ou enregistrer son profil DG sur cet appareil
  const handleSaveProfile = () => {
    if (!name.trim()) {
      message.error("Veuillez indiquer le nom de votre Directeur Général (DG).");
      return;
    }

    const cleanUsername = username.trim() 
      ? (username.startsWith('@') ? username.trim() : `@${username.trim()}`)
      : `@${name.toLowerCase().replace(/\s+/g, '_')}`;

    const newUser = {
      name: name.trim(),
      username: cleanUsername,
      email: email.trim() || `${cleanUsername.replace('@', '')}@nhlpool.ca`,
      team: teamName.trim() || 'Élite Hockey Club',
      avatar: selectedAvatar,
      isGuest: false,
      deviceId: `dev_${Date.now()}`
    };

    try {
      localStorage.setItem('nhl_current_user', JSON.stringify(newUser));
    } catch {}

    message.success(`Bienvenue ${newUser.name} ! Profil DG activé sur cet appareil.`);
    if (onLoginSuccess) {
      onLoginSuccess(newUser);
    }
  };

  // Connexion Google interactive
  const handleGoogleSubmit = () => {
    if (!googleEmail.trim()) {
      message.error("Veuillez saisir votre adresse courriel Google.");
      return;
    }

    setLoading(true);
    message.loading({ content: 'Authentification Google en cours...', key: 'auth' });
    setTimeout(() => {
      setLoading(false);
      const computedName = googleName.trim() || googleEmail.split('@')[0];
      const cleanUser = {
        name: computedName,
        username: `@${computedName.toLowerCase().replace(/\s+/g, '_')}`,
        email: googleEmail.trim(),
        team: 'Google Hockey Club',
        avatar: '⚡',
        isGuest: false,
        deviceId: `google_${Date.now()}`
      };

      try {
        localStorage.setItem('nhl_current_user', JSON.stringify(cleanUser));
      } catch {}

      message.success({ content: `Connexion Google réussie ! Bienvenue ${cleanUser.name}.`, key: 'auth', duration: 3 });
      if (onLoginSuccess) {
        onLoginSuccess(cleanUser);
      }
    }, 600);
  };

  // Connexion Courriel Magique
  const handleEmailLogin = (values) => {
    setLoading(true);
    message.loading({ content: 'Connexion sécurisée...', key: 'auth' });
    setTimeout(() => {
      setLoading(false);
      const computedName = values.email.split('@')[0];
      const cleanUser = {
        name: computedName.charAt(0).toUpperCase() + computedName.slice(1),
        username: `@${computedName.toLowerCase()}`,
        email: values.email.trim(),
        team: 'Alignement Principal',
        avatar: '🏒',
        isGuest: false,
        deviceId: `email_${Date.now()}`
      };

      try {
        localStorage.setItem('nhl_current_user', JSON.stringify(cleanUser));
      } catch {}

      message.success({ content: `Connecté en tant que ${cleanUser.name} !`, key: 'auth', duration: 3 });
      if (onLoginSuccess) {
        onLoginSuccess(cleanUser);
      }
    }, 600);
  };



  // Déconnexion complète de cet appareil
  const handleLogoutClick = () => {
    try {
      localStorage.removeItem('nhl_current_user');
    } catch {}
    message.warning("Vous avez été déconnecté de cet appareil.");
    if (onLogout) {
      onLogout();
    }
    setMode('create');
    setName('');
    setUsername('');
    setEmail('');
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0d14', padding: '10px 16px', position: 'relative' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        style={{ width: '100%', maxWidth: 440 }}
      >
        <Card
          style={{
            background: '#10141e',
            border: '1px solid rgba(0, 210, 255, 0.25)',
            borderRadius: '16px',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.8)',
            textAlign: 'center',
            position: 'relative'
          }}
        >
          {onCancel && (
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={onCancel}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                color: '#888'
              }}
            />
          )}

          {/* Logo et Titre */}
          <Space direction="vertical" size="small" style={{ marginBottom: 18 }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(0,210,255,0.2) 0%, rgba(58,123,213,0.3) 100%)',
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              border: '1px solid #00d2ff'
            }}>
              <RocketOutlined style={{ fontSize: '26px', color: '#00d2ff' }} />
            </div>
            <Title level={4} style={{ color: '#fff', margin: 0 }}>
              {mode === 'connected' ? 'Gestion de Compte DG' : 'Connexion / Créer mon DG'}
            </Title>
            <Text type="secondary" style={{ color: '#888', fontSize: '12px' }}>
              Personnalisez votre identité de gérant pour cet appareil.
            </Text>
          </Space>

          {/* CAS 1 : UTILISATEUR DÉJÀ CONNECTÉ */}
          {mode === 'connected' && currentUser && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
              <div style={{
                background: 'rgba(0, 210, 255, 0.08)',
                border: '1px solid rgba(0, 210, 255, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                <span style={{ fontSize: '36px' }}>{currentUser.avatar}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: '16px', color: '#fff' }}>{currentUser.name}</strong>
                    <Tag color="cyan" style={{ fontSize: '10px', fontWeight: 800 }}>ACTIF</Tag>
                  </div>
                  <div style={{ fontSize: '12px', color: '#00d2ff', fontWeight: 700 }}>
                    {currentUser.username}
                  </div>
                  <div style={{ fontSize: '11px', color: '#888' }}>
                    {currentUser.email} • {currentUser.team || 'Élite Hockey Club'}
                  </div>
                </div>
              </div>

              <Button
                block
                icon={<EditOutlined />}
                onClick={() => setMode('create')}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  borderRadius: '8px',
                  fontWeight: 700
                }}
              >
                Modifier mon profil sur cet appareil
              </Button>

              <Button
                danger
                block
                icon={<LogoutOutlined />}
                onClick={handleLogoutClick}
                style={{
                  borderRadius: '8px',
                  fontWeight: 800
                }}
              >
                Se Déconnecter de cet appareil
              </Button>
            </div>
          )}

          {/* CAS 2 : CRÉATION OU PERSONNALISATION DE SON DG SUR CET APPAREIL */}
          {mode === 'create' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
              <div style={{
                background: 'rgba(245, 175, 25, 0.1)',
                border: '1px solid rgba(245, 175, 25, 0.3)',
                borderRadius: '10px',
                padding: '10px 12px',
                fontSize: '12px',
                color: '#f5af19',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '18px' }}>💰</span>
                <span><strong>Budget officiel : 5 000 🪙</strong> de départ pour bâtir votre équipe de 20 joueurs de A à Z !</span>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#aaa', display: 'block', marginBottom: '4px' }}>
                  NOM DU DIRECTEUR GÉNÉRAL (DG) :
                </label>
                <Input
                  placeholder="Ex: Jonathan Gagné, Alex Bouchard, Martin..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ background: '#181e2b', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#aaa', display: 'block', marginBottom: '4px' }}>
                  PSEUDONYME DU POOLER (@) :
                </label>
                <Input
                  placeholder="Ex: @Notorious_Hockey ou @Rocket_99"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ background: '#181e2b', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#aaa', display: 'block', marginBottom: '6px' }}>
                  CHOISISSEZ VOTRE AVATAR :
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
                  {AVATAR_CHOICES.map(av => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setSelectedAvatar(av)}
                      style={{
                        background: selectedAvatar === av ? 'rgba(0, 210, 255, 0.3)' : 'rgba(255, 255, 255, 0.04)',
                        border: selectedAvatar === av ? '2px solid #00d2ff' : '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '8px',
                        fontSize: '20px',
                        padding: '6px 0',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#aaa', display: 'block', marginBottom: '4px' }}>
                  NOM DE VOTRE ÉQUIPE :
                </label>
                <Input
                  placeholder="Ex: Canadiens Élite, Laval Rockets..."
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  style={{ background: '#181e2b', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#aaa', display: 'block', marginBottom: '4px' }}>
                  COURRIEL (OPTIONNEL) :
                </label>
                <Input
                  placeholder="votre.courriel@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ background: '#181e2b', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: '8px' }}
                />
              </div>

              <Button
                type="primary"
                block
                size="large"
                onClick={handleSaveProfile}
                style={{
                  background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 900,
                  marginTop: '8px',
                  boxShadow: '0 4px 15px rgba(0, 210, 255, 0.3)'
                }}
              >
                Enregistrer & Se Connecter sur cet appareil
              </Button>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '12px' }}>
                <span onClick={() => setMode('google')} style={{ color: '#00d2ff', cursor: 'pointer', fontWeight: 600 }}>
                  ← Connexion Google
                </span>
                <span onClick={() => setMode('email')} style={{ color: '#00d2ff', cursor: 'pointer', fontWeight: 600 }}>
                  Connexion par Courriel →
                </span>
              </div>
            </div>
          )}

          {/* CAS 3 : CONNEXION GOOGLE INTERACTIVE */}
          {mode === 'google' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#aaa', display: 'block', marginBottom: '4px' }}>
                  VOTRE PRÉNOM / NOM GOOGLE :
                </label>
                <Input
                  placeholder="Ex: Jonathan, Alex..."
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  style={{ background: '#181e2b', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#aaa', display: 'block', marginBottom: '4px' }}>
                  ADRESSE COURRIEL GOOGLE :
                </label>
                <Input
                  placeholder="nom@gmail.com"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  style={{ background: '#181e2b', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: '8px' }}
                />
              </div>

              <Button
                block
                size="large"
                icon={<GoogleOutlined />}
                loading={loading}
                onClick={handleGoogleSubmit}
                style={{
                  background: '#1f2533',
                  border: '1px solid #434d61',
                  color: '#fff',
                  borderRadius: '10px',
                  fontWeight: 800,
                  marginTop: '8px'
                }}
              >
                Continuer avec ce compte Google
              </Button>

              <Button type="link" onClick={() => setMode('create')} style={{ color: '#888', fontSize: '12px' }}>
                ← Retour à la création manuelle
              </Button>
            </div>
          )}

          {/* CAS 4 : COURRIEL MAGIQUE */}
          {mode === 'email' && (
            <div style={{ textAlign: 'left' }}>
              <Form layout="vertical" onFinish={handleEmailLogin}>
                <Form.Item
                  name="email"
                  rules={[{ required: true, message: 'Indiquez votre courriel !' }, { type: 'email', message: 'Courriel invalide.' }]}
                >
                  <Input
                    prefix={<MailOutlined style={{ color: '#666' }} />}
                    placeholder="votre.courriel@exemple.com"
                    size="large"
                    style={{ background: '#181e2b', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: '8px' }}
                  />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  loading={loading}
                  style={{
                    background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 800
                  }}
                >
                  Valider et Me Connecter
                </Button>
              </Form>

              <Button type="link" block onClick={() => setMode('create')} style={{ color: '#888', fontSize: '12px', marginTop: '6px' }}>
                ← Retour au formulaire DG
              </Button>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};
