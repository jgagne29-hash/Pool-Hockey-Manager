import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2,
  Sparkles,
  Download,
  Users,
  Trophy,
  ArrowRight,
  Shield,
  Zap,
  Flame,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  CheckCircle2,
  Send,
  HelpCircle,
  Package,
  Layers
} from 'lucide-react';
import { HockeyPlayerCard } from './HockeyPlayerCard';
import { PLAYERS } from '../data/players';
import { calculateMarketValue } from '../utils/market';
import { sendTelegramNotification } from '../utils/telegramAlerts';
import { Modal, Tag, Button, message } from 'antd';

// Joueurs vedettes pour le Showcase 3D
const SHOWCASE_CARDS = [
  {
    player: PLAYERS.find(p => p.nhl_id === 8478402), // McDavid
    editionId: 'mcdavid_prime',
    rarity: 'Ultra-Rare',
    quote: 'Le joyau ultime : Multiplicateur x2.0 et vitesse cosmique.',
    color: '#ff0055'
  },
  {
    player: PLAYERS.find(p => p.nhl_id === 8484144), // Bedard
    editionId: 'bedard_prime',
    rarity: 'Epic',
    quote: 'Tir des poignets foudroyant avec bonus de points x1.5.',
    color: '#8a2387'
  },
  {
    player: PLAYERS.find(p => p.nhl_id === 8477492), // MacKinnon
    editionId: 'mackinnon_allstar',
    rarity: 'Rare',
    quote: 'La locomotive offensive de l’Avalanche pour vos séries.',
    color: '#b9935a'
  },
  {
    player: PLAYERS.find(p => p.nhl_id === 8480069), // Makar
    editionId: 'makar_allstar',
    rarity: 'Rare',
    quote: 'Le quart-arrière défensif d’élite le plus rentable du pool.',
    color: '#00d2ff'
  },
  {
    player: PLAYERS.find(p => p.nhl_id === 8480018), // Suzuki
    editionId: 'suzuki_base',
    rarity: 'Common',
    quote: 'Le capitaine du Canadien : un salaire sous contrôle pour équilibrer la masse.',
    color: '#38ef7d'
  }
];

export const GamingLandingPage = ({
  onNavigate,
  onOpenWelcomeGuide,
  lineup = [],
  onAddToLineup,
  managerLevel = 2,
  managerXp = 480
}) => {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [autoplay, setAutoplay] = useState(true);

  // Défilement automatique du carrousel
  useEffect(() => {
    if (!autoplay) return;
    const interval = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % SHOWCASE_CARDS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [autoplay]);

  const activeCard = SHOWCASE_CARDS[carouselIndex];
  const activePlayer = activeCard.player;
  const activeEdition = activePlayer.cards.find(c => c.edition_id === activeCard.editionId) || activePlayer.cards[0];
  const activeMarketVal = calculateMarketValue(activePlayer, { multiplier: activeEdition.multiplier });
  const isInLineup = lineup.some(l => l.player.nhl_id === activePlayer.nhl_id);

  return (
    <div style={{ position: 'relative', width: '100%', marginBottom: '40px' }}>
      {/* ===================================================
          1. CONTENEUR RÉTRO-FUTURISTE CYBERPUNK (HERO ARENA)
          =================================================== */}
      <div className="retro-futuristic-container" style={{ padding: '40px 32px 36px', minHeight: '640px' }}>


        {/* --- EN-TÊTE DU HERO --- */}
        <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
          {/* Badges Néon Rétro-Futuristes */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <span style={{
              background: 'rgba(0, 240, 255, 0.12)',
              border: '1px solid #00f0ff',
              color: '#00f0ff',
              fontSize: '11px',
              fontWeight: 900,
              padding: '4px 14px',
              borderRadius: '20px',
              letterSpacing: '1.5px',
              boxShadow: '0 0 14px rgba(0, 240, 255, 0.4)'
            }}>
              🏒 CYBER LNH // SAISON 2026-2027
            </span>

            <span style={{
              background: 'rgba(255, 0, 127, 0.15)',
              border: '1px solid #ff007f',
              color: '#ff007f',
              fontSize: '11px',
              fontWeight: 900,
              padding: '4px 14px',
              borderRadius: '20px',
              letterSpacing: '1.5px',
              boxShadow: '0 0 14px rgba(255, 0, 127, 0.4)'
            }}>
              ⚡ 100% GRATUIT // SAISON MID-SEASON FAIR
            </span>

            <span style={{
              background: 'rgba(245, 175, 25, 0.15)',
              border: '1px solid #f5af19',
              color: '#f5af19',
              fontSize: '11px',
              fontWeight: 900,
              padding: '4px 14px',
              borderRadius: '20px',
              letterSpacing: '1.5px',
              boxShadow: '0 0 14px rgba(245, 175, 25, 0.4)'
            }}>
              💎 CARTES HOLOGRAPHIQUES 3D
            </span>
          </div>

          {/* Titre Néon Cyberpunk */}
          <h1 style={{
            fontSize: 'clamp(32px, 5.2vw, 54px)',
            fontWeight: 900,
            letterSpacing: '-1px',
            lineHeight: 1.15,
            color: '#fff',
            textTransform: 'uppercase',
            margin: '0 0 16px',
            textShadow: '0 0 20px rgba(0, 240, 255, 0.5), 0 0 40px rgba(255, 0, 127, 0.3)'
          }}>
            Deviendras-tu le <br />
            <span className="neon-text-cyan">Directeur Général</span> <span className="neon-text-magenta">de l'Année ?</span>
          </h1>

          <p style={{
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.9)',
            lineHeight: 1.6,
            maxWidth: '720px',
            margin: '0 auto 28px',
            textShadow: '0 2px 8px rgba(0,0,0,0.7)'
          }}>
            Bâtissez votre franchise de <strong>A à Z</strong> : démarrez avec <strong>5 000 🪙 de budget officiel</strong>, repêchez vos 20 joueurs en <strong>Cartes Holographiques 3D</strong>, gérez votre plafond salarial et hissez votre équipe au sommet !
          </p>

          {/* Boutons d'Action Principaux (CTA) */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
            <button
              onClick={() => onNavigate('gallery')}
              className="cyber-btn-primary"
            >
              <Gamepad2 size={18} />
              Lancer le Draft dans l'Arène
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="cyber-btn-secondary"
            >
              <Download size={18} />
              Installer la PWA Mobile
            </button>

            <button
              onClick={() => onNavigate('packs')}
              style={{
                background: 'rgba(245, 175, 25, 0.15)',
                border: '1.5px solid #f5af19',
                color: '#f5af19',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                padding: '14px 22px',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0 0 15px rgba(245, 175, 25, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px'
              }}
            >
              <Package size={17} />
              Ouvrir un Booster
            </button>
          </div>
        </div>

        {/* ===================================================
            2. GAME SHOWCASE CAROUSEL (3D COVERFLOW INTERACTIF)
            =================================================== */}
        <div style={{ position: 'relative', zIndex: 6, maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#00f0ff" />
              <span style={{ fontSize: '13px', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Showcase des Cartes Légendaires ({carouselIndex + 1} / {SHOWCASE_CARDS.length})
              </span>
            </div>

            {/* Contrôles carrousel */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => {
                  setAutoplay(false);
                  setCarouselIndex(prev => (prev === 0 ? SHOWCASE_CARDS.length - 1 : prev - 1));
                }}
                style={{
                  background: 'rgba(0, 240, 255, 0.1)',
                  border: '1px solid #00f0ff',
                  color: '#00f0ff',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontWeight: 800
                }}
              >
                <ChevronLeft size={16} />
              </button>

              <button
                onClick={() => {
                  setAutoplay(false);
                  setCarouselIndex(prev => (prev + 1) % SHOWCASE_CARDS.length);
                }}
                style={{
                  background: 'rgba(0, 240, 255, 0.1)',
                  border: '1px solid #00f0ff',
                  color: '#00f0ff',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontWeight: 800
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Carrousel 3D Staging */}
          <div className="showcase-carousel-wrapper">
            {SHOWCASE_CARDS.map((item, idx) => {
              const diff = (idx - carouselIndex + SHOWCASE_CARDS.length) % SHOWCASE_CARDS.length;
              let stateClass = 'hidden';
              if (diff === 0) stateClass = 'active';
              else if (diff === 1 || diff === -4) stateClass = 'next';
              else if (diff === SHOWCASE_CARDS.length - 1 || diff === -1) stateClass = 'prev';

              const cardEdition = item.player.cards.find(c => c.edition_id === item.editionId) || item.player.cards[0];
              const cardInLineup = lineup.some(l => l.player.nhl_id === item.player.nhl_id);

              return (
                <div
                  key={item.player.nhl_id}
                  className={`carousel-card-item ${stateClass}`}
                  onClick={() => {
                    if (stateClass !== 'active') {
                      setAutoplay(false);
                      setCarouselIndex(idx);
                    }
                  }}
                >
                  <HockeyPlayerCard
                    player={item.player}
                    selectedEditionId={item.editionId}
                    onSelectEdition={() => {}}
                    isInLineup={cardInLineup}
                    onToggleLineup={(p, e) => onAddToLineup && onAddToLineup(p, e)}
                  />
                </div>
              );
            })}
          </div>

          {/* Panneau d'Information de la Carte Active */}
          <motion.div
            key={activePlayer.nhl_id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: 'rgba(10, 14, 24, 0.85)',
              border: `1px solid ${activeCard.color}66`,
              borderRadius: '16px',
              padding: '16px 24px',
              marginTop: '12px',
              backdropFilter: 'blur(12px)',
              boxShadow: `0 8px 30px ${activeCard.color}22`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>
                  {activePlayer.name}
                </span>
                <Tag color={activeCard.color} style={{ fontWeight: 800, textTransform: 'uppercase' }}>
                  {activeEdition.edition_name}
                </Tag>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                {activeCard.quote}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>Cap Hit</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>
                  {(activeEdition.cap_hit / 1000000).toFixed(1)}M $
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>Multiplicateur</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#f5af19' }}>
                  x{activeEdition.multiplier}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>Valeur Marchande</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#00ff9d' }}>
                  {activeMarketVal} pts
                </div>
              </div>

              <button
                onClick={() => onAddToLineup && onAddToLineup(activePlayer, activeEdition)}
                style={{
                  background: isInLineup ? '#ef4444' : 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '8px 18px',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0, 210, 255, 0.4)'
                }}
              >
                {isInLineup ? 'Retirer du Roster' : '⚡ Bâtir dans l’Alignement'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>



      {/* ===================================================
          4. PANNEAU DE FONCTIONNALITÉS COMMUNAUTAIRES & TELEGRAM
          =================================================== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        marginTop: '28px'
      }}>
        {/* Module Communauté Telegram & Bot IA */}
        <div style={{
          background: 'radial-gradient(circle at 80% 20%, rgba(0, 210, 255, 0.15) 0%, rgba(14, 18, 28, 0.95) 75%)',
          border: '1px solid rgba(0, 210, 255, 0.3)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #0088cc 0%, #00b4d8 100%)',
              padding: '8px',
              borderRadius: '10px'
            }}>
              <Send size={20} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#fff', margin: 0 }}>
                Canal Communautaire & Bot Telegram
              </h3>
              <span style={{ fontSize: '11px', color: '#00d2ff', fontWeight: 700 }}>
                @configuration101_bot • Antigravity_IDE
              </span>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
            Recevez les alertes de pool, validez les transactions avec vos amis et votez sur les échanges contestés directement depuis Telegram !
          </p>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <a
              href="https://t.me/configuration101_bot"
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: 'none',
                background: 'linear-gradient(135deg, #0088cc 0%, #00b4d8 100%)',
                color: '#fff',
                padding: '8px 18px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(0, 136, 204, 0.4)'
              }}
            >
              <Send size={14} />
              Rejoindre le Bot (@configuration101_bot)
            </a>

            <button
              onClick={async () => {
                message.loading({ content: 'Envoi d\'une alerte Telegram au bot...', key: 'tg_alert' });
                const res = await sendTelegramNotification("🏒 *ALERTE EN DIRECT DEPUIS LE DASHBOARD WEB !*\n\nJoe, votre bot Telegram @configuration101_bot est 100% synchronisé et actif ! Les faux profils ont été complètement retirés de l'application.");
                if (res && res.ok) {
                  message.success({ content: 'Alerte transmise avec succès à @configuration101_bot !', key: 'tg_alert', duration: 4 });
                } else {
                  message.info({ content: 'Bot actif (@configuration101_bot). Vérifiez votre application Telegram.', key: 'tg_alert' });
                }
              }}
              style={{
                background: 'rgba(0, 136, 204, 0.15)',
                border: '1px solid #0088cc',
                color: '#00d2ff',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Send size={13} />
              Tester l'Alerte Telegram en Direct
            </button>

            <button
              onClick={onOpenWelcomeGuide}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <HelpCircle size={14} />
              Guide d'Équité Mid-Saison
            </button>
          </div>
        </div>

        {/* Module PWA Mobile & Performance */}
        <div style={{
          background: 'radial-gradient(circle at 20% 80%, rgba(255, 0, 127, 0.15) 0%, rgba(14, 18, 28, 0.95) 75%)',
          border: '1px solid rgba(255, 0, 127, 0.3)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #ff007f 0%, #7928ca 100%)',
              padding: '8px',
              borderRadius: '10px'
            }}>
              <Smartphone size={20} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#fff', margin: 0 }}>
                Progressive Web App (PWA) Installable
              </h3>
              <span style={{ fontSize: '11px', color: '#ff007f', fontWeight: 700 }}>
                Vite + Service Worker • Zéro Téléchargement Store
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px', fontSize: '12px' }}>
            <div style={{ color: '#aaa', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={13} color="#38ef7d" /> Mode Hors-Ligne
            </div>
            <div style={{ color: '#aaa', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={13} color="#38ef7d" /> Plein Écran Mobile
            </div>
            <div style={{ color: '#aaa', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={13} color="#38ef7d" /> Démarrage 0.1s
            </div>
            <div style={{ color: '#aaa', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={13} color="#38ef7d" /> Synchronisation LNH
            </div>
          </div>

          <button
            onClick={() => setIsInstallModalOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #ff007f 0%, #7928ca 100%)',
              border: 'none',
              color: '#fff',
              padding: '8px 20px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(255, 0, 127, 0.4)'
            }}
          >
            <Download size={14} />
            Obtenir la PWA sur Mobile
          </button>
        </div>
      </div>

      {/* ===================================================
          5. MODAL D'INSTALLATION PWA (DOWNLOAD CTA)
          =================================================== */}
      <Modal
        open={isInstallModalOpen}
        onCancel={() => setIsInstallModalOpen(false)}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setIsInstallModalOpen(false)}
            style={{
              background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
              border: 'none',
              fontWeight: 800
            }}
          >
            Fermer le Guide
          </Button>
        ]}
        width={560}
        centered
      >
        <div style={{ padding: '8px 0', color: '#fff' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{
              display: 'inline-flex',
              background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
              padding: '16px',
              borderRadius: '20px',
              boxShadow: '0 4px 20px rgba(0,210,255,0.4)',
              marginBottom: '12px'
            }}>
              <Smartphone size={36} color="#fff" />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#fff', margin: 0 }}>
              Installer NHL Pool Master sur votre Appareil
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Profitez d'une expérience native sans passer par Google Play ou l'App Store !
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* iOS */}
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ fontWeight: 800, fontSize: '13px', color: '#00d2ff', marginBottom: '6px' }}>
                📱 Sur iPhone / iPad (Safari) :
              </div>
              <ol style={{ paddingLeft: '20px', fontSize: '12px', color: '#ddd', margin: 0, lineHeight: 1.6 }}>
                <li>Appuyez sur le bouton <strong>Partager</strong> (carré avec flèche vers le haut).</li>
                <li>Faites défiler vers le bas et sélectionnez <strong>Sur l'écran d'accueil</strong>.</li>
                <li>Appuyez sur <strong>Ajouter</strong> en haut à droite. L'icône apparaît comme une vraie appli !</li>
              </ol>
            </div>

            {/* Android */}
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ fontWeight: 800, fontSize: '13px', color: '#38ef7d', marginBottom: '6px' }}>
                🤖 Sur Android (Chrome) :
              </div>
              <ol style={{ paddingLeft: '20px', fontSize: '12px', color: '#ddd', margin: 0, lineHeight: 1.6 }}>
                <li>Appuyez sur les <strong>3 petits points</strong> en haut à droite.</li>
                <li>Appuyez sur <strong>Installer l'application</strong> ou <strong>Ajouter à l'écran d'accueil</strong>.</li>
                <li>Confirmez l'installation. L'application est prête à fonctionner hors-ligne !</li>
              </ol>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
