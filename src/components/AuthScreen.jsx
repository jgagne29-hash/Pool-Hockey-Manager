import React, { useState } from 'react';
import { Card, Form, Input, Button, Divider, Space, Typography, message } from 'antd';
import { motion } from 'framer-motion';
import { GoogleOutlined, MailOutlined, RocketOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export const AuthScreen = ({ onLoginSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = (values) => {
    console.log("Demande de lien magique pour :", values.email);
    // Ici, vous appelez : supabase.auth.signInWithOtp({ email: values.email })
    setLoading(true);
    message.loading({ content: 'Envoi du lien magique sécurisé...', key: 'auth' });
    setTimeout(() => {
      setLoading(false);
      message.success({ content: `Lien magique envoyé à ${values.email} ! Connexion réussie.`, key: 'auth', duration: 3 });
      if (onLoginSuccess) {
        onLoginSuccess({
          email: values.email,
          name: values.email.split('@')[0],
          username: `@${values.email.split('@')[0]}`,
          avatar: '⚡',
          isGuest: false
        });
      }
    }, 600);
  };

  const handleGoogleLogin = () => {
    console.log("Lancement de la connexion Google");
    // Ici, vous appelez : supabase.auth.signInWithOAuth({ provider: 'google' })
    setLoading(true);
    message.loading({ content: 'Connexion Google OAuth en cours...', key: 'auth' });
    setTimeout(() => {
      setLoading(false);
      message.success({ content: 'Connexion Google réussie ! Bienvenue Jonathan.', key: 'auth', duration: 3 });
      if (onLoginSuccess) {
        onLoginSuccess({
          email: 'jonathan.gagne@dtd2009.ca',
          name: 'Jonathan Gagné',
          username: '@Notorious_Hockey',
          avatar: '🦁',
          isGuest: false
        });
      }
    }, 500);
  };

  const handleGuestLogin = () => {
    message.info("Mode invité activé ! Bon match dans le pool.");
    if (onLoginSuccess) {
      onLoginSuccess({
        email: 'invite@nhlpool.ca',
        name: 'Gérant Invité',
        username: '@Recrue_2026',
        avatar: '🦊',
        isGuest: true
      });
    }
  };

  return (
    <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', padding: '0 16px', position: 'relative' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        style={{ width: '100%', maxWidth: 400 }}
      >
        <Card
          style={{
            background: '#141414',
            border: '1px solid #303030',
            borderRadius: '16px',
            boxShadow: '0 12px 40px rgba(0, 255, 204, 0.05)',
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
          <Space direction="vertical" size="small" style={{ marginBottom: 24 }}>
            <RocketOutlined style={{ fontSize: '40px', color: '#00ffcc' }} />
            <Title level={3} style={{ color: '#fff', margin: 0 }}>Rejoins le Pool !</Title>
            <Text type="secondary" style={{ color: '#aaa' }}>Crée ton équipe et commence à piger tes cartes.</Text>
          </Space>

          {/* Connexion en 1 clic via Google */}
          <Button 
            type="default" 
            block 
            icon={<GoogleOutlined />} 
            size="large"
            loading={loading}
            onClick={handleGoogleLogin}
            style={{ 
              background: '#1f1f1f', 
              color: '#fff', 
              border: '1px solid #434343', 
              height: '48px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            Continuer avec Google
          </Button>

          <Divider style={{ borderColor: '#303030', color: '#666' }}>ou</Divider>

          {/* Formulaire Courriel sans mot de passe */}
          <Form name="login_form" layout="vertical" onFinish={handleEmailLogin} requiredMark={false}>
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Indique ton adresse courriel !' },
                { type: 'email', message: 'Ce courriel n\'est pas valide.' }
              ]}
            >
              <Input 
                prefix={<MailOutlined style={{ color: '#666' }} />} 
                placeholder="Ton adresse courriel" 
                size="large"
                style={{ background: '#1f1f1f', border: '1px solid #434343', color: '#fff', height: '45px', borderRadius: '8px' }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 12 }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                size="large"
                loading={loading}
                style={{ 
                  background: 'linear-gradient(135deg, #00b96b 0%, #00ffcc 100%)', 
                  border: 'none', 
                  color: '#000',
                  fontWeight: 'bold',
                  height: '45px',
                  borderRadius: '8px'
                }}
              >
                Recevoir mon code de connexion
              </Button>
            </Form.Item>
          </Form>

          {/* Mode invité pour tester sans contrainte */}
          <Button
            type="link"
            icon={<UserOutlined />}
            onClick={handleGuestLogin}
            style={{ color: '#777', fontSize: '12px' }}
          >
            Tester en mode invité (Accès direct)
          </Button>
        </Card>
      </motion.div>
    </div>
  );
};

