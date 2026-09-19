import React, { useState, useEffect } from 'react';
import { PLAYERS, SALARY_CAP_MAX } from './data/players';
import { HockeyPlayerCard } from './components/HockeyPlayerCard';
import { LineupBuilder, calculatePlayerPoints } from './components/LineupBuilder';
import { MatchSimulator } from './components/MatchSimulator';
import { PackOpening } from './components/PackOpening';
import { TradeCenter } from './components/TradeCenter';
import { PoolerProfile } from './components/PoolerProfile';
import { MidSeasonWelcome } from './components/MidSeasonWelcome';
import { WeeklyLeaderboard } from './components/WeeklyLeaderboard';
import { CustomLeaderboard } from './components/CustomLeaderboard';
import { DailyQuests } from './components/DailyQuests';
import { GamingLandingPage } from './components/GamingLandingPage';
import { QuebecHockeyNews } from './components/QuebecHockeyNews';
import { AuthScreen } from './components/AuthScreen';
import { FriendsPools } from './components/FriendsPools';
import { FreeRewardsModal } from './components/FreeRewardsModal';
import { CommunityStatsModal } from './components/CommunityStatsModal';
import { Modal, message } from 'antd';
import { Trophy, Search, Sparkles, Filter, Users, Package, Play, ArrowRightLeft, UserCheck, Zap, HelpCircle, Award, Gamepad2, Flame, Newspaper, LogIn, Coins, Gift, Share2, Activity } from 'lucide-react';
import { getManagerLevelInfo, calculateXpGain, getCatchupDetails } from './utils/progression';
import { STARTING_USER_COINS, POINTS_TO_COINS_RATIO } from './utils/market';
import './styles/cards.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // home, gallery, lineup, simulate, packs, trade, profile, leaderboard, quests, news, friends, auth
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('ALL');
  const [selectedRarity, setSelectedRarity] = useState('ALL');
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRewardsModalOpen, setIsRewardsModalOpen] = useState(false);
  const [isCommunityStatsOpen, setIsCommunityStatsOpen] = useState(false);


  // Portefeuille de Rondelles d'Or 🪙 (Budget initial de 1 500 offert à l'enregistrement)
  const [userCoins, setUserCoins] = useState(() => {
    try {
      const saved = localStorage.getItem('nhl_user_coins');
      return saved !== null ? Number(saved) : STARTING_USER_COINS;
    } catch {
      return STARTING_USER_COINS;
    }
  });

  // Quotas de paquets ouverts aujourd'hui
  const [openedPackCounts, setOpenedPackCounts] = useState(() => {
    try {
      const saved = localStorage.getItem('nhl_opened_packs');
      const savedDate = localStorage.getItem('nhl_opened_packs_date');
      const today = new Date().toISOString().split('T')[0];
      if (savedDate === today && saved) return JSON.parse(saved);
      return {};
    } catch {
      return {};
    }
  });

  // Paliers de points réclamés
  const [claimedMilestones, setClaimedMilestones] = useState(() => {
    try {
      const saved = localStorage.getItem('nhl_claimed_milestones');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Date du dernier lot quotidien réclamé
  const [lastDailyClaim, setLastDailyClaim] = useState(() => {
    try {
      return localStorage.getItem('nhl_last_daily_claim') || null;
    } catch {
      return null;
    }
  });

  // Sauvegarde automatique du portefeuille et des récompenses
  useEffect(() => {
    try {
      localStorage.setItem('nhl_user_coins', String(userCoins));
    } catch (e) {}
  }, [userCoins]);

  useEffect(() => {
    try {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('nhl_opened_packs', JSON.stringify(openedPackCounts));
      localStorage.setItem('nhl_opened_packs_date', today);
    } catch (e) {}
  }, [openedPackCounts]);

  useEffect(() => {
    try {
      localStorage.setItem('nhl_claimed_milestones', JSON.stringify(claimedMilestones));
    } catch (e) {}
  }, [claimedMilestones]);

  useEffect(() => {
    try {
      if (lastDailyClaim) localStorage.setItem('nhl_last_daily_claim', lastDailyClaim);
    } catch (e) {}
  }, [lastDailyClaim]);

  // État utilisateur authentifié (Supabase / Google / Invité)
  const [currentUser, setCurrentUser] = useState({
    name: 'Jonathan Gagné',
    username: '@Notorious_Hockey',
    email: 'jonathan.gagne@dtd2009.ca',
    avatar: '🦁',
    isGuest: false
  });

  // Données de progression XP & Rattrapage Saisonnier
  const [managerXp, setManagerXp] = useState(480); // Niv. 2 Adjoint par défaut
  const [currentMonth, setCurrentMonth] = useState(1); // Janvier (Rattrapage x2.0 actif)

  const levelInfo = getManagerLevelInfo(managerXp);
  const catchup = getCatchupDetails(currentMonth);

  const handleAddXp = (amount, reason = 'Action Réussie') => {
    setManagerXp(prev => prev + amount);
  };

  const handleDirectLevelChange = (lvl) => {
    if (lvl === 1) setManagerXp(120);
    else if (lvl === 2) setManagerXp(450);
    else if (lvl === 3) setManagerXp(850);
  };

  // Données de performance du Pooler (pour la Cote DG sur 1000)
  const [poolerPoints, setPoolerPoints] = useState(1280);
  const [tradesCount, setTradesCount] = useState(7);
  const [ratingHistory, setRatingHistory] = useState([450, 480, 460, 520, 590, 610, 750, 882]);


  // Suivi des éditions sélectionnées par joueur { [nhl_id]: edition_id }
  const [playerEditions, setPlayerEditions] = useState({
    8478402: '8478402_prime', // McDavid
    8480018: '8480018_base',  // Suzuki
    8481540: '8481540_allstar', // Caufield
    8483421: '8483421_base',  // Slafkovsky
    8480069: '8480069_allstar', // Makar
    8483460: '8483460_base',  // Hutson
    8478499: '8478499_base'   // Montembeault
  });

  // Alignement officiel complet LNH du pooler (20 postes : 12 Avants, 6 Défenseurs, 2 Gardiens)
  const defaultPlayerIds = [
    8478402, // Connor McDavid (C)
    8480018, // Nick Suzuki (C)
    8481540, // Cole Caufield (RW)
    8483421, // Juraj Slafkovsky (LW)
    8484144, // Connor Bedard (C)
    8482093, // Alexis Lafrenière (RW)
    8473419, // Brad Marchand (LW)
    8479337, // Patrik Laine (RW)
    8480069, // Cale Makar (D)
    8483460, // Lane Hutson (D)
    8480803, // Evan Bouchard (D)
    8476875, // Mike Matheson (D)
    8478499, // Samuel Montembeault (G)
    8480382  // Jeremy Swayman (G)
  ];

  const [lineup, setLineup] = useState(() => {
    return defaultPlayerIds.map(id => {
      const p = PLAYERS.find(pl => pl.nhl_id === id);
      if (!p) return null;
      return {
        player: p,
        edition: p.cards[0]
      };
    }).filter(Boolean);
  });

  const currentCapHit = lineup.reduce((sum, item) => sum + (item.edition?.cap_hit || item.player.base_cap_hit), 0);

  const handleSelectEdition = (nhl_id, edition_id) => {
    setPlayerEditions(prev => ({ ...prev, [nhl_id]: edition_id }));

    // Si le joueur est déjà dans l'alignement, on met à jour son édition
    setLineup(prev => prev.map(item => {
      if (item.player.nhl_id === nhl_id) {
        const newEdition = item.player.cards.find(c => c.edition_id === edition_id);
        return { ...item, edition: newEdition || item.edition };
      }
      return item;
    }));
  };

  const handleToggleLineup = (player, edition) => {
    const exists = lineup.some(item => item.player.nhl_id === player.nhl_id);
    if (exists) {
      setLineup(prev => prev.filter(item => item.player.nhl_id !== player.nhl_id));
    } else {
      if (lineup.length >= 20) {
        alert("Votre équipe officielle est déjà complète (20 joueurs max : 12 Attaquants, 6 Défenseurs, 2 Gardiens) !");
        return;
      }
      setLineup(prev => [...prev, { player, edition: edition || player.cards[0] }]);
    }
  };

  const handleRemoveFromLineup = (nhl_id) => {
    setLineup(prev => prev.filter(item => item.player.nhl_id !== nhl_id));
  };

  // Vente Rapide d'une carte (Quick Sell contre des Rondelles d'Or 🪙)
  const handleQuickSellCard = (coinsGained, card) => {
    setUserCoins(prev => prev + coinsGained);
    if (card && card.player) {
      setLineup(prev => prev.filter(item => item.player.nhl_id !== card.player.nhl_id));
    }
  };

  // Calcul en direct des points cumulés de l'alignement (20 joueurs)
  const totalTeamPoints = lineup.reduce((sum, item) => {
    return sum + calculatePlayerPoints(item.player, item.edition);
  }, 0);

  // Déduction de pièces lors de l'achat d'un paquet
  const handleDeductCoins = (amount) => {
    setUserCoins(prev => Math.max(0, prev - amount));
  };

  // Enregistrement d'un paquet ouvert aujourd'hui
  const handleRecordPackOpen = (packId) => {
    setOpenedPackCounts(prev => ({
      ...prev,
      [packId]: (prev[packId] || 0) + 1
    }));
  };

  // Réclamation d'un palier de points
  const handleClaimMilestone = (milestoneId, rewardCoins) => {
    setClaimedMilestones(prev => [...prev, milestoneId]);
    setUserCoins(prev => prev + rewardCoins);
  };

  // Réclamation du bonus quotidien gratuit
  const handleClaimDailyBonus = (rewardCoins) => {
    const today = new Date().toISOString().split('T')[0];
    setLastDailyClaim(today);
    setUserCoins(prev => prev + rewardCoins);
  };

  // Traitement d'un échange validé
  const handleTradeSuccess = (userGivenCards, targetReceivedCards) => {

    setTradesCount(prev => prev + 1);

    // Gain d'expérience pour le trade avec multiplicateur de saison
    const xpBonus = calculateXpGain(75, currentMonth);
    handleAddXp(xpBonus, 'Échange Négocié');

    setLineup(prev => {
      // 1. Retirer les cartes données
      const givenIds = userGivenCards.map(c => c.player.nhl_id);
      let newLineup = prev.filter(item => !givenIds.includes(item.player.nhl_id));

      // 2. Ajouter les cartes reçues (jusqu'à 20 max)
      targetReceivedCards.forEach(item => {
        if (newLineup.length < 20 && !newLineup.some(l => l.player.nhl_id === item.player.nhl_id)) {
          newLineup.push({ player: item.player, edition: item.edition });
        }
      });

      return newLineup;
    });
  };

  // Filtrage des joueurs
  const filteredPlayers = PLAYERS.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          player.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          player.team_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPos = selectedPosition === 'ALL' || player.position === selectedPosition;

    const currentEd = player.cards.find(c => c.edition_id === (playerEditions[player.nhl_id] || player.cards[0].edition_id)) || player.cards[0];
    const matchesRarity = selectedRarity === 'ALL' || currentEd.rarity === selectedRarity;

    return matchesSearch && matchesPos && matchesRarity;
  });

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px' }}>
      {/* En-tête / Header de l'application */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '28px',
        paddingBottom: '20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
            padding: '10px',
            borderRadius: '14px',
            boxShadow: '0 4px 20px rgba(0, 210, 255, 0.4)'
          }}>
            <Trophy size={28} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-0.5px' }}>
                NHL POOL MASTER
              </h1>
              <span style={{
                background: 'rgba(245, 175, 25, 0.2)',
                color: '#f5af19',
                fontSize: '11px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '12px',
                border: '1px solid rgba(245, 175, 25, 0.3)'
              }}>
                ÉDITION PRO 2024-2025
              </span>

              {/* Pastille interactive Niveau Gérant & Rattrapage Saison */}
              <div
                onClick={() => setActiveTab('profile')}
                title="Cliquez pour voir votre Profil DG et progression XP"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  padding: '3px 10px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 700
                }}
              >
                <span>{levelInfo.badge}</span>
                <span style={{ color: '#fff' }}>{levelInfo.title}</span>
                <span style={{ color: '#00d2ff', fontWeight: 800 }}>{managerXp} XP</span>
                <span style={{
                  background: catchup.tagColor,
                  color: '#000',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontSize: '10px',
                  fontWeight: 800
                }}>
                  XP x{catchup.multiplier}
                </span>
              </div>

              {/* Portefeuille de Rondelles d'Or 🪙 & Accès aux Lots Gratuits */}
              <div
                onClick={() => setIsRewardsModalOpen(true)}
                title="Cliquez pour ouvrir votre Coffre de Récompenses et réclamer vos lots de rondelles gratuits !"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(245, 175, 25, 0.15)',
                  border: '1px solid rgba(245, 175, 25, 0.5)',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#f5af19',
                  cursor: 'pointer',
                  boxShadow: '0 0 15px rgba(245, 175, 25, 0.25)',
                  transition: 'all 0.2s'
                }}
              >
                <Coins size={13} color="#f5af19" />
                <span>{userCoins.toLocaleString()} 🪙</span>
                <span style={{
                  background: 'linear-gradient(135deg, #f5af19 0%, #e65c00 100%)',
                  color: '#fff',
                  padding: '1px 6px',
                  borderRadius: '8px',
                  fontSize: '10px',
                  fontWeight: 900
                }}>
                  +Lots 🎁
                </span>
              </div>


              {/* Compteur Live Poolers / Gérants Actifs */}
              <div
                onClick={() => setIsCommunityStatsOpen(true)}
                title="Cliquez pour voir les statistiques détaillées des gérants en direct !"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(56, 239, 125, 0.12)',
                  border: '1px solid rgba(56, 239, 125, 0.4)',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#38ef7d',
                  cursor: 'pointer',
                  boxShadow: '0 0 12px rgba(56, 239, 125, 0.2)',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#38ef7d',
                  boxShadow: '0 0 8px #38ef7d',
                  display: 'inline-block'
                }} />
                <span>1 284 DG Actifs</span>
                <Users size={12} color="#38ef7d" />
              </div>

              {/* Bouton Guide Nouveau Pooler / Équité Mid-Saison */}

              <button
                onClick={() => setIsWelcomeOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'linear-gradient(135deg, rgba(0,210,255,0.15) 0%, rgba(58,123,213,0.2) 100%)',
                  border: '1px solid #00d2ff',
                  color: '#00d2ff',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 800,
                  transition: 'all 0.2s'
                }}
              >
                <HelpCircle size={14} />
                Guide Équité Mid-Saison
              </button>

              {/* Bouton Connexion / Profil AuthScreen */}
              <button
                onClick={() => setIsAuthModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: currentUser ? 'rgba(0, 255, 204, 0.12)' : 'rgba(255, 255, 255, 0.08)',
                  border: currentUser ? '1px solid #00ffcc' : '1px solid rgba(255, 255, 255, 0.2)',
                  color: currentUser ? '#00ffcc' : '#fff',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 800,
                  transition: 'all 0.2s',
                  boxShadow: currentUser ? '0 0 10px rgba(0, 255, 204, 0.25)' : 'none'
                }}
              >
                {currentUser ? (
                  <>
                    <span>{currentUser.avatar}</span>
                    <span>{currentUser.name}</span>
                  </>
                ) : (
                  <>
                    <LogIn size={13} />
                    <span>Se connecter</span>
                  </>
                )}
              </button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Cartes Holographiques 3D • Probabilités selon le Niveau • Rattrapage Saisonnier XP & Marché Équitable
            </p>
          </div>
        </div>

        {/* Onglets de navigation */}
        <nav style={{
          display: 'flex',
          gap: '6px',
          background: 'rgba(18, 22, 32, 0.9)',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setActiveTab('home')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: activeTab === 'home' ? '1px solid #00f0ff' : '1px solid transparent',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeTab === 'home' ? 'linear-gradient(135deg, rgba(255,0,127,0.2) 0%, rgba(0,240,255,0.2) 100%)' : 'transparent',
              color: activeTab === 'home' ? '#00f0ff' : 'var(--text-secondary)',
              boxShadow: activeTab === 'home' ? '0 0 15px rgba(0,240,255,0.35)' : 'none'
            }}
          >
            <Gamepad2 size={15} color={activeTab === 'home' ? '#ff007f' : 'currentColor'} />
            Arène & Showcase 3D
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeTab === 'gallery' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              color: activeTab === 'gallery' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            <Sparkles size={15} color={activeTab === 'gallery' ? '#00d2ff' : 'currentColor'} />
            Galerie & Draft ({PLAYERS.length})
          </button>

          <button
            onClick={() => setActiveTab('lineup')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeTab === 'lineup' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              color: activeTab === 'lineup' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            <Users size={15} color={activeTab === 'lineup' ? '#38ef7d' : 'currentColor'} />
            Mon Alignement ({lineup.length}/20)
          </button>

          <button
            onClick={() => setActiveTab('packs')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeTab === 'packs' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              color: activeTab === 'packs' ? '#a0d911' : 'var(--text-secondary)'
            }}
          >
            <Package size={15} color={activeTab === 'packs' ? '#a0d911' : 'currentColor'} />
            Ouvrir Paquets
          </button>

          <button
            onClick={() => setActiveTab('trade')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeTab === 'trade' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              color: activeTab === 'trade' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            <ArrowRightLeft size={15} color={activeTab === 'trade' ? '#52c41a' : 'currentColor'} />
            Salle des Échanges
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeTab === 'profile' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              color: activeTab === 'profile' ? '#ff0055' : 'var(--text-secondary)'
            }}
          >
            <UserCheck size={15} color={activeTab === 'profile' ? '#ff0055' : 'currentColor'} />
            Profil DG
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeTab === 'leaderboard' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              color: activeTab === 'leaderboard' ? '#ffd700' : 'var(--text-secondary)'
            }}
          >
            <Trophy size={15} color={activeTab === 'leaderboard' ? '#ffd700' : 'currentColor'} />
            Classement
          </button>

          <button
            onClick={() => setActiveTab('friends')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeTab === 'friends' ? 'linear-gradient(135deg, rgba(0,210,255,0.2) 0%, rgba(58,123,213,0.2) 100%)' : 'transparent',
              color: activeTab === 'friends' ? '#00d2ff' : 'var(--text-secondary)',
              boxShadow: activeTab === 'friends' ? '0 0 12px rgba(0,210,255,0.3)' : 'none'
            }}
          >
            <Users size={15} color={activeTab === 'friends' ? '#00d2ff' : 'currentColor'} />
            Pools d'Amis
          </button>

          <button
            onClick={() => setActiveTab('quests')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeTab === 'quests' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              color: activeTab === 'quests' ? '#ff4d4f' : 'var(--text-secondary)'
            }}
          >
            <Flame size={15} color={activeTab === 'quests' ? '#ff4d4f' : 'currentColor'} />
            Missions & Quêtes
          </button>

          <button
            onClick={() => setActiveTab('news')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeTab === 'news' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              color: activeTab === 'news' ? '#00d2ff' : 'var(--text-secondary)'
            }}
          >
            <Newspaper size={15} color={activeTab === 'news' ? '#00d2ff' : 'currentColor'} />
            Actualités QC (RDS & TVA)
          </button>

          <button
            onClick={() => setActiveTab('simulate')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeTab === 'simulate' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              color: activeTab === 'simulate' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            <Play size={15} color={activeTab === 'simulate' ? '#f5af19' : 'currentColor'} />
            Soirée LNH
          </button>
        </nav>
      </header>

      {/* Barre de plafond salarial persistante pour les modes de gestion */}
      {activeTab !== 'home' && (
        <LineupBuilder
          lineup={lineup}
          onRemovePlayer={handleRemoveFromLineup}
          managerLevel={levelInfo.level}
          onOpenRewardsModal={() => setIsRewardsModalOpen(true)}
        />
      )}

      {/* Vues selon l'onglet actif */}
      {activeTab === 'home' && (
        <GamingLandingPage
          onNavigate={(tab) => setActiveTab(tab)}
          onOpenWelcomeGuide={() => setIsWelcomeOpen(true)}
          lineup={lineup}
          onAddToLineup={(p, e) => handleToggleLineup(p, e)}
          managerLevel={levelInfo.level}
          managerXp={managerXp}
        />
      )}

      {activeTab === 'profile' && (
        <div>
          <PoolerProfile
            poolerData={{
              name: "Jonathan Gagné",
              username: "Notorious_Hockey",
              points: poolerPoints,
              currentCapHit: currentCapHit,
              tradesCount: tradesCount,
              lineup: lineup,
              history: ratingHistory,
              managerXp: managerXp,
              currentMonth: currentMonth
            }}
            onMonthChange={(m) => setCurrentMonth(m)}
            onAddXp={(amount, reason) => handleAddXp(amount, reason)}
          />
          <DailyQuests onXpGain={(xp, reason) => handleAddXp(xp, reason)} />
        </div>
      )}

      {activeTab === 'packs' && (
        <PackOpening
          currentLineup={lineup}
          onAddToLineup={(p, e) => handleToggleLineup(p, e)}
          managerLevel={levelInfo.level}
          onLevelChange={handleDirectLevelChange}
          onAddXp={handleAddXp}
          userCoins={userCoins}
          onDeductCoins={handleDeductCoins}
          openedPackCounts={openedPackCounts}
          onOpenPackRecord={handleRecordPackOpen}
          onQuickSellCard={handleQuickSellCard}
          onOpenRewardsModal={() => setIsRewardsModalOpen(true)}
          currentMonth={currentMonth}
        />
      )}

      {activeTab === 'trade' && (
        <TradeCenter
          userLineup={lineup}
          onTradeSuccess={handleTradeSuccess}
          userCoins={userCoins}
          onQuickSellCard={handleQuickSellCard}
        />
      )}

      {activeTab === 'quests' && (
        <DailyQuests onXpGain={(xp, reason) => handleAddXp(xp, reason)} />
      )}

      {activeTab === 'friends' && (
        <FriendsPools
          userPoints={totalTeamPoints || poolerPoints}
          currentUser={currentUser}
        />
      )}

      {activeTab === 'simulate' && (
        <MatchSimulator
          lineup={lineup}
          onMatchFinished={(pts) => {
            setPoolerPoints(prev => prev + pts);
            setRatingHistory(prev => [...prev, Math.min(1000, prev[prev.length - 1] + Math.round(pts * 1.5))]);
            // Gain d'expérience après le match simulé (avec catch-up saisonnier)
            const matchXp = calculateXpGain(50, currentMonth);
            handleAddXp(matchXp, 'Soirée LNH');

            // Conversion des points de pool en rondelles d'or pour acheter des paquets !
            const coinsEarned = pts * POINTS_TO_COINS_RATIO;
            setUserCoins(prev => prev + coinsEarned);
            message.success(`Match disputé ! +${pts} pts LNH et +${coinsEarned.toLocaleString()} 🪙 Rondelles d'Or créditées !`);
          }}
        />
      )}

      {activeTab === 'leaderboard' && (
        <div>
          <CustomLeaderboard userScore={poolerPoints} userLevel={levelInfo.level} />
          <WeeklyLeaderboard
            currentPoolerPoints={poolerPoints}
            currentRating={ratingHistory[ratingHistory.length - 1]}
          />
        </div>
      )}

      {activeTab === 'news' && (
        <QuebecHockeyNews />
      )}

      {activeTab === 'auth' && (
        <AuthScreen
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setActiveTab('home');
          }}
          onCancel={() => setActiveTab('home')}
        />
      )}

      {/* Modal Coffre de Récompenses Gratuites */}
      <FreeRewardsModal
        isOpen={isRewardsModalOpen}
        onClose={() => setIsRewardsModalOpen(false)}
        userCoins={userCoins}
        onAddCoins={(amount) => setUserCoins(prev => prev + amount)}
        teamPoints={totalTeamPoints || poolerPoints}
        claimedMilestones={claimedMilestones}
        onClaimMilestone={handleClaimMilestone}
        lastDailyClaim={lastDailyClaim}
        onClaimDailyBonus={handleClaimDailyBonus}
      />

      {/* Modal Statistiques de la Communauté en Direct */}
      <CommunityStatsModal
        isOpen={isCommunityStatsOpen}
        onClose={() => setIsCommunityStatsOpen(false)}
      />



      {/* Modal Connexion Supabase / Google / Email Magic Link */}
      <Modal
        open={isAuthModalOpen}
        footer={null}
        onCancel={() => setIsAuthModalOpen(false)}
        destroyOnClose
        width={460}
        styles={{
          content: {
            background: 'transparent',
            boxShadow: 'none',
            padding: 0
          }
        }}
        centered
      >
        <AuthScreen
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setIsAuthModalOpen(false);
          }}
          onCancel={() => setIsAuthModalOpen(false)}
        />
      </Modal>

      {/* Modal d'accueil et d'équité Mid-Saison */}
      <MidSeasonWelcome
        isOpen={isWelcomeOpen}
        onClose={() => setIsWelcomeOpen(false)}
        currentMonth={currentMonth}
        managerLevel={levelInfo.level}
      />

      {/* Galerie & Draft des cartes de hockey */}
      {(activeTab === 'gallery' || activeTab === 'lineup') && (
        <div>
          {/* Barre d'outils, Recherche et Filtres */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '24px'
          }}>
            {/* Champ de recherche */}
            <div style={{
              position: 'relative',
              width: '320px'
            }}>
              <Search size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Rechercher McDavid, Suzuki, EDM, MTL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  background: 'rgba(18, 22, 32, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Filtres par Position et Rareté */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {/* Positions */}
              <div style={{ display: 'flex', gap: '4px', background: 'rgba(18, 22, 32, 0.8)', padding: '3px', borderRadius: '8px' }}>
                {['ALL', 'C', 'LW', 'RW', 'D', 'G'].map(pos => (
                  <button
                    key={pos}
                    onClick={() => setSelectedPosition(pos)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: selectedPosition === pos ? 'rgba(0, 210, 255, 0.2)' : 'transparent',
                      color: selectedPosition === pos ? '#00d2ff' : 'var(--text-secondary)'
                    }}
                  >
                    {pos === 'ALL' ? 'Tous' : pos}
                  </button>
                ))}
              </div>

              {/* Rareté */}
              <div style={{ display: 'flex', gap: '4px', background: 'rgba(18, 22, 32, 0.8)', padding: '3px', borderRadius: '8px' }}>
                {[
                  { id: 'ALL', label: 'Toutes' },
                  { id: 'Common', label: 'Base' },
                  { id: 'Rare', label: '⭐ Étoile' },
                  { id: 'Epic', label: '🔥 Épique' },
                  { id: 'Ultra-Rare', label: '💎 1%' }
                ].map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRarity(r.id)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: selectedRarity === r.id ? 'rgba(245, 175, 25, 0.2)' : 'transparent',
                      color: selectedRarity === r.id ? '#f5af19' : 'var(--text-secondary)'
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grille des Cartes */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
            gap: '24px',
            justifyItems: 'center'
          }}>
            {filteredPlayers.map(player => (
              <HockeyPlayerCard
                key={player.nhl_id}
                player={player}
                selectedEditionId={playerEditions[player.nhl_id] || player.cards[0].edition_id}
                onSelectEdition={handleSelectEdition}
                isInLineup={lineup.some(item => item.player.nhl_id === player.nhl_id)}
                onToggleLineup={handleToggleLineup}
              />
            ))}
          </div>

          {filteredPlayers.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: '16px' }}>Aucun joueur trouvé pour ces critères de recherche.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
