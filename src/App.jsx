import React, { useState, useEffect } from 'react';
import { PLAYERS, SALARY_CAP_MAX } from './data/players_generated';
import { HockeyPlayerCard } from './components/HockeyPlayerCard';
import { LineupBuilder, calculatePlayerPoints } from './components/LineupBuilder';
import { MatchSimulator } from './components/MatchSimulator';
import { LiveScoreboard } from './components/LiveScoreboard';
import { PackOpening } from './components/PackOpening';
import { TradeCenter } from './components/TradeCenter';
import { PoolerProfile } from './components/PoolerProfile';
import { MidSeasonWelcome } from './components/MidSeasonWelcome';
import { WeeklyLeaderboard } from './components/WeeklyLeaderboard';
import { CustomLeaderboard } from './components/CustomLeaderboard';
import { DailyQuests } from './components/DailyQuests';
import { GamingLandingPage } from './components/GamingLandingPage';
import { QuebecHockeyNews } from './components/QuebecHockeyNews';
import { HallOfFame } from './components/HallOfFame';
import { DraftRoom } from './components/DraftRoom';
import { AuthScreen } from './components/AuthScreen';
import { FriendsPools } from './components/FriendsPools';
import { FreeRewardsModal } from './components/FreeRewardsModal';
import { CommunityStatsModal } from './components/CommunityStatsModal';
import { BinderView } from './components/BinderView';
import { LeagueSwitcher } from './components/LeagueSwitcher';
import { PwaNotificationManager } from './components/PwaNotificationManager';
import ChampionshipRings from './components/ChampionshipRings';
import RingBadges from './components/RingBadges';
import { AuctionHouse } from './components/AuctionHouse';
import { SocialNetwork } from './components/SocialNetwork';
import pooldgLogo from './assets/images/pooldg_logo.jpg';
import { Modal, message } from 'antd';
import { Trophy, Search, Sparkles, Filter, Users, Package, Play, ArrowRightLeft, UserCheck, Zap, HelpCircle, Award, Gamepad2, Flame, Newspaper, LogIn, LogOut, Coins, Gift, Share2, Activity, BookOpen, Crown, Gavel } from 'lucide-react';
import { getManagerGradeInfo, getManagerLevelInfo, calculateXpGain, getCatchupDetails } from './utils/progression';
import { STARTING_USER_COINS, POINTS_TO_COINS_RATIO, getQuickSellCoinValue } from './utils/market';
import './styles/cards.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // home, gallery, lineup, binder, simulate, packs, trade, profile, leaderboard, quests, news, friends, auth
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('ALL');
  const [selectedRarity, setSelectedRarity] = useState('ALL');
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRewardsModalOpen, setIsRewardsModalOpen] = useState(false);
  const [isCommunityStatsOpen, setIsCommunityStatsOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [tradeMode, setTradeMode] = useState('auction'); // 'auction' or 'cpu'

  // Remonter en haut de la page lorsqu'on change d'onglet
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // Modèle de Ligue : 'recrue' (100% gratuit / zéro pay-to-win) vs 'pro' (compétitif / économique)
  const [currentLeague, setCurrentLeague] = useState(() => {
    try {
      return localStorage.getItem('pooldg_current_league') || 'recrue';
    } catch {
      return 'recrue';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('pooldg_current_league', currentLeague);
    } catch (e) {}
  }, [currentLeague]);

  // Cartable du D.G. (Binder TCG) : inventaire de cartes possédées
  const [binderCards, setBinderCards] = useState(() => {
    try {
      const saved = localStorage.getItem('pooldg_binder_inventory');
      let parsed = saved ? JSON.parse(saved) : null;
      
      if (!parsed) {
        parsed = PLAYERS.slice(0, 10).map((p, idx) => ({
          instance_id: `welcome_${p.nhl_id}_${idx}`,
          nhl_id: p.nhl_id,
          name: p.name,
          team: p.team,
          team_name: p.team_name,
          position: p.position,
          number: p.number,
          stats: p.stats,
          rarity: 'Base',
          edition_id: p.cards?.[0]?.edition_id || `${p.nhl_id}_base`,
          edition_name: p.cards?.[0]?.edition_name || 'Édition Base',
          multiplier: 1.0,
          bg_color: '#161922',
          cap_hit: p.base_cap_hit,
          durability_days: 35,
          serial: null,
          is_one_of_one: false,
          playerData: p
        }));
      }

      // Inject 6 variants of Lane Hutson for demo
      const hutson = PLAYERS.find(p => p.nhl_id === 8483457);
      if (hutson && !parsed.some(c => c.nhl_id === 8483457 && c.rarity === 'The Patch (1-of-1)')) {
          const hutsonCards = hutson.cards.map((card, idx) => ({
             instance_id: `demo_hutson_${idx}_${Date.now()}`,
             nhl_id: hutson.nhl_id,
             name: hutson.name,
             team: hutson.team,
             team_name: hutson.team_name,
             position: hutson.position,
             number: hutson.number,
             stats: hutson.stats,
             rarity: card.rarity,
             edition_id: card.edition_id,
             edition_name: card.edition_name,
             multiplier: card.multiplier,
             bg_color: card.bg_color,
             cap_hit: card.cap_hit,
             durability_days: card.default_durability_days,
             serial: card.serial,
             is_one_of_one: card.is_one_of_one,
             playerData: hutson
          }));
          parsed = [...hutsonCards, ...parsed];
      }

      return parsed;
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('pooldg_binder_inventory', JSON.stringify(binderCards));
    } catch (e) {}
  }, [binderCards]);

  const handleCardsCollected = (newCards) => {
    setBinderCards(prev => [...newCards, ...prev]);
    message.success(`${newCards.length} nouvelle(s) carte(s) ajoutée(s) à votre Cartable !`);
  };

  const handleBinderQuickSell = (card) => {
    const val = getQuickSellCoinValue(card.rarity);
    setUserCoins(prev => prev + val);
    setBinderCards(prev => prev.filter(c => c.instance_id !== card.instance_id));
    message.success(`Carte ${card.name} (${card.rarity}) vendue pour +${val} 🪙 !`);
  };

  // Portefeuille de Rondelles d'Or 🪙 (Budget initial de 5 000 offert à l'enregistrement)
  const [userCoins, setUserCoins] = useState(() => {
    try {
      const saved = localStorage.getItem('nhl_user_coins');
      return saved !== null ? Number(saved) : STARTING_USER_COINS;
    } catch {
      return STARTING_USER_COINS;
    }
  });

  // Limite quotidienne de paquets ouverts
  const [openedPackCounts, setOpenedPackCounts] = useState(() => {
    try {
      const savedDate = localStorage.getItem('nhl_opened_packs_date');
      const today = new Date().toISOString().split('T')[0];
      if (savedDate === today) {
        const savedCounts = localStorage.getItem('nhl_opened_packs');
        return savedCounts ? JSON.parse(savedCounts) : { standard: 0, premium: 0, elite: 0 };
      }
      return { standard: 0, premium: 0, elite: 0 };
    } catch {
      return { standard: 0, premium: 0, elite: 0 };
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

  // Date de dernière réclamation quotidienne
  const [lastDailyClaim, setLastDailyClaim] = useState(() => {
    try {
      return localStorage.getItem('nhl_last_daily_claim') || null;
    } catch {
      return null;
    }
  });

  // Sauvegardes persistantes
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

  // État utilisateur authentifié (Chargé depuis le localStorage propre à cet appareil)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('nhl_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('nhl_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('nhl_current_user');
      }
    } catch (e) {}
  }, [currentUser]);

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
  const [playerEditions, setPlayerEditions] = useState(() => {
    try {
      const saved = localStorage.getItem('nhl_player_editions');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('nhl_player_editions', JSON.stringify(playerEditions));
    } catch (e) {}
  }, [playerEditions]);

  // Alignement officiel complet LNH du pooler (20 postes : 12 Avants, 6 Défenseurs, 2 Gardiens)
  // RÈGLE MÉTIER OBLIGATOIRE : Au premier enregistrement / création d'équipe, le DG monte tout de A à Z !
  // Il commence avec un budget conséquent de 5 000 🪙 et AUCUN joueur dans l'alignement (0/20).
  const [lineup, setLineup] = useState(() => {
    try {
      const saved = localStorage.getItem('nhl_user_lineup');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('nhl_user_lineup', JSON.stringify(lineup));
    } catch (e) {}
  }, [lineup]);

  // Cartes exposées au Temple de la Renommée (Hall of Fame)
  const [exhibitedCards, setExhibitedCards] = useState(() => {
    try {
      const saved = localStorage.getItem('nhl_exhibited_cards');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('nhl_exhibited_cards', JSON.stringify(exhibitedCards));
    } catch (e) {}
  }, [exhibitedCards]);

  const handleToggleExhibitCard = (cardInstanceId) => {
    setExhibitedCards(prev => {
      if (prev.includes(cardInstanceId)) {
        message.info("Carte retirée du Temple de la Renommée.");
        return prev.filter(id => id !== cardInstanceId);
      } else {
        if (prev.length >= 10) {
          message.error("Le Temple est plein (10/10) ! Retirez une carte d'abord.");
          return prev;
        }
        message.success("🏆 Carte fièrement exposée au Temple de la Renommée !");
        return [...prev, cardInstanceId];
      }
    });
  };

  // Réinitialisation de l'alignement pour recommencer de A à Z
  const handleResetLineup = () => {
    setLineup([]);
    try {
      localStorage.removeItem('nhl_user_lineup');
    } catch (e) {}
    message.success("Alignement vidé ! Vous pouvez rebâtir votre équipe de A à Z.");
  };

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
      message.info(`${player.name} a été retiré de votre alignement.`);
    } else {
      if (lineup.length >= 20) {
        message.error("Votre équipe officielle est déjà complète (20 joueurs max : 12 Attaquants, 6 Défenseurs, 2 Gardiens) !");
        return;
      }

      // Vérification stricte des positions officielles LNH
      const pos = player.position;
      const countGoalies = lineup.filter(item => item.player.position === 'G').length;
      const countDefense = lineup.filter(item => item.player.position === 'D').length;
      const countCenters = lineup.filter(item => item.player.position === 'C').length;
      const countLW = lineup.filter(item => item.player.position === 'LW').length;
      const countRW = lineup.filter(item => item.player.position === 'RW').length;

      if (pos === 'G') {
        if (countGoalies >= 2) {
          message.warning("🥅 Vos 2 postes de Gardien de but sont déjà occupés ! Retirez un gardien avant d'en ajouter un nouveau.");
          return;
        }
      } else if (pos === 'D') {
        if (countDefense >= 6) {
          message.warning("🛡️ Vos 6 postes de Défenseur (3 paires) sont déjà complets ! Retirez un défenseur pour libérer une place.");
          return;
        }
      } else if (pos === 'C') {
        if (countCenters >= 4) {
          message.warning("🏒 Vos 4 postes de Joueur de Centre sont déjà occupés ! Retirez un joueur de centre pour libérer une place.");
          return;
        }
      } else if (pos === 'LW') {
        if (countLW >= 4 && (countLW + countRW) >= 8) {
          message.warning("🏒 Vos 8 postes d'Ailier (4 AG + 4 AD) sont déjà complets ! Retirez un ailier pour libérer une place.");
          return;
        }
      } else if (pos === 'RW') {
        if (countRW >= 4 && (countLW + countRW) >= 8) {
          message.warning("🏒 Vos 8 postes d'Ailier (4 AG + 4 AD) sont déjà complets ! Retirez un ailier pour libérer une place.");
          return;
        }
      }

      setLineup(prev => [...prev, { player, edition: edition || player.cards[0] }]);
      message.success(`✅ ${player.name} (${player.position}) ajouté à votre alignement.`);
    }
  };

  const handleRemoveFromLineup = (nhl_id) => {
    setLineup(prev => prev.filter(item => item.player.nhl_id !== nhl_id));
  };

  const handleReplacePlayer = (oldNhlId, newPlayer) => {
    setLineup(prev => {
      const filtered = prev.filter(item => item.player.nhl_id !== oldNhlId);
      return [...filtered, { player: newPlayer, edition: { ...newPlayer, rarity: 'Base', multiplier: 1 } }];
    });
  };

  const handleAhlCallup = (injuredPlayerNhlId, ahlPlayer) => {
    setLineup(prev => prev.map(item => {
      if (item.player.nhl_id === injuredPlayerNhlId) {
        return { ...item, ahlReplacement: ahlPlayer };
      }
      return item;
    }));
    message.success(`${ahlPlayer.name} a été rappelé d'urgence depuis l'AHL !`);
  };

  const handleAhlSendDown = (nhlPlayerId) => {
    setLineup(prev => prev.map(item => {
      if (item.player.nhl_id === nhlPlayerId) {
        const { ahlReplacement, ...rest } = item;
        return rest;
      }
      return item;
    }));
    message.info(`Le joueur a été renvoyé dans l'AHL.`);
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

  // Filtrage des joueurs avec normalisation sans accent pour une recherche infaillible
  const normalizeText = (str) => (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const filteredPlayers = PLAYERS.filter(player => {
    const q = normalizeText(searchQuery);
    const matchesSearch = !q ||
                          normalizeText(player.name).includes(q) ||
                          normalizeText(player.team).includes(q) ||
                          normalizeText(player.team_name).includes(q);

    const matchesPos = selectedPosition === 'ALL' || player.position === selectedPosition;

    const currentEd = player.cards.find(c => c.edition_id === (playerEditions[player.nhl_id] || player.cards[0].edition_id)) || player.cards[0];
    const matchesRarity = selectedRarity === 'ALL' || currentEd.rarity === selectedRarity;

    return matchesSearch && matchesPos && matchesRarity;
  });

  // Calcul véridique des ligues et gérants réels (zéro fausse donnée, zéro mock)
  const realPools = (() => {
    try {
      const data = localStorage.getItem('nhl_friends_pools');
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(p => 
        p.id !== 'chums' && 
        p.id !== 'dtd' && 
        p.id !== 'pool_chums_2026' && 
        p.id !== 'pool_dtd_ligue' && 
        !p.id.includes('simulated') &&
        !p.id.includes('pool_joined_')
      );
    } catch {
      return [];
    }
  })();

  const totalPoolsCount = realPools.length;

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* BANDEAU DÉROULANT ANCRÉ EN HAUT DE L'ÉCRAN (STICKY TOP MARQUEE) */}
      <div className="community-ticker">
        <div className="ticker-content">
          <span>🏆 <strong>DÉFI SUPRÊME :</strong> Deviendras-tu le Directeur Général de l'année ? Bâtis ton alignement de A à Z !</span>
          <span>🏒 <strong>SAISON LNH 2026-2027</strong> // Alignement officiel 20 joueurs (12 Attaquants • 6 Défenseurs • 2 Gardiens)</span>
          {currentUser ? (
            <span>🟢 <strong>DG CONNECTÉ :</strong> {currentUser.name} ({currentUser.username || '@MonDG'}) // {totalPoolsCount > 0 ? `${totalPoolsCount} ligue(s) active(s)` : '0 ligue d\'amis (créez la vôtre)'}</span>
          ) : (
            <span>⚪ <strong>STATUT DU DG :</strong> Mode Invité (Non connecté) // Connectez-vous pour enregistrer votre franchise</span>
          )}
          <span>🦓 <strong>ARBITRE ZÉBRÉ IA :</strong> Surveillance active du vestiaire // Sanctions de points et réputation anti-trash-talk</span>
          <span>⭐ <strong>{PLAYERS.length} JOUEURS RÉELS LNH</strong> // 32 franchises officielles synchronisées</span>
          <span>⚖️ <strong>PLAFOND SALARIAL :</strong> 104.0 M$ officiel // Masse salariale active sous contrôle</span>
          <span>🪙 <strong>ÉCONOMIE ÉQUITABLE :</strong> 1 pt de pool = 2 🪙 Rondelles d'Or pour vos paquets</span>
          <span>🔄 <strong>SALLE DES ÉCHANGES :</strong> Algorithme d'équité certifié (marge max 15%)</span>
          <span>🎁 <strong>LOTS GRATUITS :</strong> Bonus quotidien de +250 🪙 réclamable sans frais</span>
        </div>
      </div>

      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '20px' }}>
        {/* En-tête / Header de l'application */}
        <header style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          marginBottom: '28px',
          paddingBottom: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {/* Ligne 1 : Identité et Portefeuille/Auth */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            {/* Logo */}
            <img 
              src={pooldgLogo} 
              alt="PoolDG.cards Logo" 
              style={{ 
                height: '70px', 
                borderRadius: '16px', 
                boxShadow: '0 4px 20px rgba(0, 210, 255, 0.4)',
                border: '1px solid rgba(0, 210, 255, 0.3)',
                cursor: 'pointer'
              }} 
              onClick={() => setActiveTab('home')}
            />

            {/* Portefeuille & Auth */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {/* Portefeuille de Rondelles d'Or */}
              <div
                onClick={() => setIsRewardsModalOpen(true)}
                title="Cliquez pour ouvrir votre Coffre de Récompenses et réclamer vos lots de rondelles gratuits !"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(245, 175, 25, 0.15)',
                  border: '1px solid rgba(245, 175, 25, 0.5)',
                  padding: '6px 14px',
                  borderRadius: '16px',
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#f5af19',
                  cursor: 'pointer',
                  boxShadow: '0 0 15px rgba(245, 175, 25, 0.25)',
                  transition: 'all 0.2s'
                }}
              >
                <Coins size={15} color="#f5af19" />
                <span>{userCoins.toLocaleString()} 🪙</span>
                <span style={{
                  background: 'linear-gradient(135deg, #f5af19 0%, #e65c00 100%)',
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 900
                }}>
                  +Lots 🎁
                </span>
              </div>

              {/* Bouton Connexion / Profil */}
              {currentUser ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    title="Gérer mon profil DG"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(0, 255, 204, 0.15)',
                      border: '1px solid #00ffcc',
                      color: '#00ffcc',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 800,
                      transition: 'all 0.2s',
                      boxShadow: '0 0 15px rgba(0, 255, 204, 0.3)'
                    }}
                  >
                    <span>{currentUser.avatar}</span>
                    <span>{currentUser.name}</span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentUser(null);
                      try { localStorage.removeItem('nhl_current_user'); } catch {}
                      message.warning('Déconnecté de cet appareil.');
                    }}
                    title="Déconnexion"
                    style={{
                      background: 'rgba(255, 75, 75, 0.15)',
                      border: '1px solid rgba(255, 75, 75, 0.35)',
                      color: '#ff4b4b',
                      padding: '8px 12px',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      fontWeight: 800
                    }}
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, rgba(0,210,255,0.2) 0%, rgba(58,123,213,0.3) 100%)',
                    border: '1px solid #00d2ff',
                    color: '#00d2ff',
                    padding: '8px 18px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 900,
                    transition: 'all 0.2s',
                    boxShadow: '0 0 15px rgba(0, 210, 255, 0.35)'
                  }}
                >
                  <LogIn size={16} />
                  <span>Connexion / Créer mon DG</span>
                </button>
              )}
            </div>
          </div>

          {/* Ligne 2 : Statut de Ligue & Progression */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <LeagueSwitcher
                currentLeague={currentLeague}
                onSwitchLeague={(league) => {
                  if (league === 'pro') {
                    message.info("La Ligue Pro sera bientôt disponible !");
                  } else {
                    setCurrentLeague(league);
                    message.info(`Passage en Ligue Recrue (100% Gratuit)`);
                  }
                }}
              />
              <span style={{
                background: 'rgba(245, 175, 25, 0.2)',
                color: '#f5af19',
                fontSize: '11px',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '12px',
                border: '1px solid rgba(245, 175, 25, 0.3)'
              }}>
                ÉDITION PRO 2026-2027
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {currentUser && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <RingBadges onOpenVault={() => setActiveTab('leaderboard')} />
                </div>
              )}
              {/* Pastille Niveau Gérant */}
              <div
                onClick={() => setActiveTab('profile')}
                title="Cliquez pour voir votre Profil DG et progression XP"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  padding: '5px 14px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 700
                }}
              >
                <span>{levelInfo.badge}</span>
                <span style={{ color: '#fff' }}>{levelInfo.title}</span>
                <span style={{ color: '#00d2ff', fontWeight: 800 }}>{managerXp} XP</span>
                <span style={{
                  background: catchup.tagColor,
                  color: '#000',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontSize: '10px',
                  fontWeight: 900
                }}>
                  XP x{catchup.multiplier}
                </span>
              </div>
            </div>
          </div>

          {/* Rappels PWA Locaux (18h00) */}
          <div style={{ marginTop: !currentUser ? '14px' : '0' }}>
            <PwaNotificationManager />
          </div>

          {/* Onglets de navigation - Simplifié à 5 onglets principaux + Menu Déroulant */}
          <nav style={{
            display: 'flex',
            gap: '6px',
            background: 'rgba(18, 22, 32, 0.9)',
            padding: '6px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            flexWrap: 'wrap'
          }}>
            {/* 1. Mon Alignement */}
            <button
              onClick={() => setActiveTab('lineup')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: activeTab === 'lineup' ? '1px solid #38ef7d' : '1px solid transparent',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: activeTab === 'lineup' ? 'rgba(56, 239, 125, 0.15)' : 'transparent',
                color: activeTab === 'lineup' ? '#38ef7d' : 'var(--text-secondary)',
                boxShadow: activeTab === 'lineup' ? '0 0 15px rgba(56, 239, 125, 0.3)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <Users size={16} color={activeTab === 'lineup' ? '#38ef7d' : 'currentColor'} />
              Mon Alignement ({lineup.length}/20)
            </button>

            {/* 2. Le Cartable / Galerie */}
            <button
              onClick={() => setActiveTab('binder')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: activeTab === 'binder' ? '1px solid #00d2ff' : '1px solid transparent',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: activeTab === 'binder' ? 'linear-gradient(135deg, rgba(0,210,255,0.2) 0%, rgba(58,123,213,0.3) 100%)' : 'transparent',
                color: activeTab === 'binder' ? '#00d2ff' : 'var(--text-secondary)',
                boxShadow: activeTab === 'binder' ? '0 0 15px rgba(0,210,255,0.35)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <BookOpen size={16} color={activeTab === 'binder' ? '#00d2ff' : 'currentColor'} />
              Le Cartable / Galerie
            </button>

            {/* 3. Ouvrir Paquets */}
            <button
              onClick={() => setActiveTab('packs')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: activeTab === 'packs' ? '1px solid #a0d911' : '1px solid transparent',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: activeTab === 'packs' ? 'rgba(160, 217, 17, 0.15)' : 'transparent',
                color: activeTab === 'packs' ? '#a0d911' : 'var(--text-secondary)',
                boxShadow: activeTab === 'packs' ? '0 0 15px rgba(160, 217, 17, 0.3)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <Package size={16} color={activeTab === 'packs' ? '#a0d911' : 'currentColor'} />
              Ouvrir Paquets
            </button>

            {/* 4. Échanges */}
            <button
              onClick={() => setActiveTab('trade')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: activeTab === 'trade' ? '1px solid #f5af19' : '1px solid transparent',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: activeTab === 'trade' ? 'rgba(245, 175, 25, 0.15)' : 'transparent',
                color: activeTab === 'trade' ? '#f5af19' : 'var(--text-secondary)',
                boxShadow: activeTab === 'trade' ? '0 0 15px rgba(245, 175, 25, 0.3)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <ArrowRightLeft size={16} color={activeTab === 'trade' ? '#f5af19' : 'currentColor'} />
              Salle des Échanges
            </button>

            {/* 5. Classement & Trophées */}
            <button
              onClick={() => setActiveTab('leaderboard')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: activeTab === 'leaderboard' ? '1px solid #ffd700' : '1px solid transparent',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: activeTab === 'leaderboard' ? 'rgba(255, 215, 0, 0.15)' : 'transparent',
                color: activeTab === 'leaderboard' ? '#ffd700' : 'var(--text-secondary)',
                boxShadow: activeTab === 'leaderboard' ? '0 0 15px rgba(255, 215, 0, 0.3)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <Trophy size={16} color={activeTab === 'leaderboard' ? '#ffd700' : 'currentColor'} />
              Classement & Trophées
            </button>

            {/* Bouton Plus... (Menu Déroulant) */}
            <div 
              style={{ position: 'relative', marginLeft: 'auto' }}
              onMouseEnter={() => setIsMoreMenuOpen(true)}
              onMouseLeave={() => setIsMoreMenuOpen(false)}
            >
              <button
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: isMoreMenuOpen ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  color: '#fff',
                  transition: 'all 0.2s'
                }}
              >
                Plus...
              </button>
              
              {/* Menu Déroulant */}
              {isMoreMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  marginTop: '8px',
                  background: 'rgba(18, 22, 32, 0.98)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  minWidth: '220px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
                  zIndex: 100,
                  backdropFilter: 'blur(10px)'
                }}>
                  <button
                    onClick={() => { setActiveTab('home'); setIsMoreMenuOpen(false); }}
                    style={{
                      padding: '10px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px',
                      display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left',
                      background: activeTab === 'home' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                      color: activeTab === 'home' ? '#ff007f' : '#fff',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = activeTab === 'home' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'}
                  ><Gamepad2 size={16} color="#ff007f" /> Arène & Showcase 3D</button>

                  <button
                    onClick={() => { setActiveTab('gallery'); setIsMoreMenuOpen(false); }}
                    style={{
                      padding: '10px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px',
                      display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left',
                      background: activeTab === 'gallery' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                      color: activeTab === 'gallery' ? '#00d2ff' : '#fff',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = activeTab === 'gallery' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'}
                  ><Sparkles size={16} color="#00d2ff" /> Recherche Draft (849)</button>

                  <button
                    onClick={() => { setActiveTab('profile'); setIsMoreMenuOpen(false); }}
                    style={{
                      padding: '10px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px',
                      display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left',
                      background: activeTab === 'profile' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                      color: activeTab === 'profile' ? '#ff0055' : '#fff',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = activeTab === 'profile' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'}
                  ><UserCheck size={16} color="#ff0055" /> Profil DG</button>

                  <button
                    onClick={() => { setActiveTab('friends'); setIsMoreMenuOpen(false); }}
                    style={{
                      padding: '10px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px',
                      display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left',
                      background: activeTab === 'friends' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                      color: activeTab === 'friends' ? '#00d2ff' : '#fff',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = activeTab === 'friends' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'}
                  ><Users size={16} color="#00d2ff" /> Pools d'Amis</button>

                  <button
                    onClick={() => { setActiveTab('social'); setIsMoreMenuOpen(false); }}
                    style={{
                      padding: '10px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px',
                      display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left',
                      background: activeTab === 'social' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                      color: activeTab === 'social' ? '#ff007f' : '#fff',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = activeTab === 'social' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'}
                  ><MessageSquare size={16} color="#ff007f" /> Réseau D.G.</button>

                  <button
                    onClick={() => { setActiveTab('quests'); setIsMoreMenuOpen(false); }}
                    style={{
                      padding: '10px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px',
                      display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left',
                      background: activeTab === 'quests' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                      color: activeTab === 'quests' ? '#ff4d4f' : '#fff',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = activeTab === 'quests' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'}
                  ><Flame size={16} color="#ff4d4f" /> Missions & Quêtes</button>

                  <button
                    onClick={() => { setActiveTab('news'); setIsMoreMenuOpen(false); }}
                    style={{
                      padding: '10px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px',
                      display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left',
                      background: activeTab === 'news' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                      color: activeTab === 'news' ? '#00d2ff' : '#fff',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = activeTab === 'news' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'}
                  ><Newspaper size={16} color="#00d2ff" /> Actualités QC</button>
                  <button
                    onClick={() => { setActiveTab('hof'); setIsMoreMenuOpen(false); }}
                    style={{
                      padding: '10px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px',
                      display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left',
                      background: activeTab === 'hof' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                      color: activeTab === 'hof' ? '#f5af19' : '#fff',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = activeTab === 'hof' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'}
                  ><Crown size={16} color="#f5af19" /> Temple (HOF)</button>

                  <button
                    onClick={() => { setActiveTab('simulate'); setIsMoreMenuOpen(false); }}
                    style={{
                      padding: '10px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px',
                      display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left',
                      background: activeTab === 'simulate' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                      color: activeTab === 'simulate' ? '#f5af19' : '#fff',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = activeTab === 'simulate' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'}
                  ><Play size={16} color="#f5af19" /> Soirée LNH</button>

                  <button
                    onClick={() => { setIsWelcomeOpen(true); setIsMoreMenuOpen(false); }}
                    style={{
                      padding: '10px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px',
                      display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left',
                      background: 'linear-gradient(135deg, rgba(0,210,255,0.15) 0%, rgba(58,123,213,0.2) 100%)',
                      color: '#00d2ff',
                      transition: 'all 0.2s',
                      marginTop: '4px',
                      borderTop: '1px solid rgba(255,255,255,0.1)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                  ><HelpCircle size={16} /> Guide Équité Mid-Saison</button>
                </div>
              )}
            </div>
          </nav>
        </header>

      {/* Barre de plafond salarial persistante pour les modes de gestion */}
      {activeTab !== 'home' && (
        <LineupBuilder
          lineup={lineup}
          onRemovePlayer={handleRemoveFromLineup}
          onReplacePlayer={handleReplacePlayer}
          onResetLineup={handleResetLineup}
          onAhlCallup={handleAhlCallup}
          onAhlSendDown={handleAhlSendDown}
          managerLevel={levelInfo.level}
          onOpenRewardsModal={() => setIsRewardsModalOpen(true)}
          onNavigateToPacks={() => setActiveTab('packs')}
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
              name: currentUser?.name || "Directeur Général",
              username: currentUser?.username || "@MonDG",
              points: totalTeamPoints,
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

      {activeTab === 'draft' && (
        <DraftRoom 
          onDraftComplete={(draftedPlayers) => {
            // For now, we just redirect home after draft.
            setActiveTab('home');
          }}
        />
      )}

      {activeTab === 'binder' && (
        <BinderView
          inventory={binderCards}
          onQuickSell={handleBinderQuickSell}
          lineup={lineup}
          exhibitedCards={exhibitedCards}
          onToggleExhibit={handleToggleExhibitCard}
        />
      )}

      {activeTab === 'hof' && (
        <HallOfFame
          inventory={binderCards}
          exhibitedCards={exhibitedCards}
          onToggleExhibit={handleToggleExhibitCard}
        />
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
          onCardsCollected={handleCardsCollected}
          onOpenRewardsModal={() => setIsRewardsModalOpen(true)}
          currentMonth={currentMonth}
        />
      )}

      {activeTab === 'trade' && (
        <div>
          {/* Sub-navigation for Trade Tab */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
            <button
              onClick={() => setTradeMode('auction')}
              style={{
                padding: '10px 24px',
                borderRadius: '12px',
                border: tradeMode === 'auction' ? '1px solid #00d2ff' : '1px solid rgba(255,255,255,0.1)',
                background: tradeMode === 'auction' ? 'rgba(0, 210, 255, 0.15)' : 'rgba(0,0,0,0.5)',
                color: tradeMode === 'auction' ? '#00d2ff' : '#aaa',
                fontWeight: 800,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <Gavel size={18} /> Marché des Enchères
            </button>
            <button
              onClick={() => setTradeMode('cpu')}
              style={{
                padding: '10px 24px',
                borderRadius: '12px',
                border: tradeMode === 'cpu' ? '1px solid #f5af19' : '1px solid rgba(255,255,255,0.1)',
                background: tradeMode === 'cpu' ? 'rgba(245, 175, 25, 0.15)' : 'rgba(0,0,0,0.5)',
                color: tradeMode === 'cpu' ? '#f5af19' : '#aaa',
                fontWeight: 800,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <ArrowRightLeft size={18} /> Échanges CPU
            </button>
          </div>

          {tradeMode === 'auction' && (
            <AuctionHouse 
              userCoins={userCoins}
              onDeductCoins={handleDeductCoins}
              onAddCoins={(amount) => setUserCoins(prev => prev + amount)}
              binderCards={binderCards}
              onRemoveCardFromBinder={(id) => setBinderCards(prev => prev.filter(c => c.instance_id !== id))}
              onAddCardToBinder={handleCardsCollected}
            />
          )}

          {tradeMode === 'cpu' && (
            <TradeCenter
              userLineup={lineup}
              onTradeSuccess={handleTradeSuccess}
              userCoins={userCoins}
              onQuickSellCard={handleQuickSellCard}
            />
          )}
        </div>
      )}

      {activeTab === 'quests' && (
        <DailyQuests onXpGain={(xp, reason) => handleAddXp(xp, reason)} />
      )}

      {activeTab === 'vault' && (
        <ChampionshipRings 
          onClose={() => setActiveTab('home')} 
          currentUser={currentUser}
          totalTeamPoints={totalTeamPoints || poolerPoints}
        />
      )}

      {activeTab === 'friends' && (
        <FriendsPools
          userPoints={totalTeamPoints || poolerPoints}
          currentUser={currentUser}
          onPointsDeducted={(pts, reason) => {
            setPoolerPoints(prev => Math.max(0, prev - pts));
          }}
        />
      )}

      {activeTab === 'simulate' && (
        <LiveScoreboard
          lineup={lineup}
        />
      )}

      {activeTab === 'leaderboard' && (
        <div>
          <CustomLeaderboard
            userScore={totalTeamPoints}
            userLevel={levelInfo.level}
            currentUser={currentUser}
          />
          <WeeklyLeaderboard
            currentPoolerPoints={totalTeamPoints}
            currentRating={ratingHistory[ratingHistory.length - 1]}
            currentUser={currentUser}
          />
        </div>
      )}

      {activeTab === 'social' && (
        <SocialNetwork />
      )}

      {activeTab === 'news' && (
        <QuebecHockeyNews />
      )}

      {activeTab === 'auth' && (
        <AuthScreen
          currentUser={currentUser}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setActiveTab('home');
          }}
          onLogout={() => {
            setCurrentUser(null);
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

      {/* Modal Statistiques Réelles des Gérants & Ligues */}
      <CommunityStatsModal
        isOpen={isCommunityStatsOpen}
        onClose={() => setIsCommunityStatsOpen(false)}
        currentUser={currentUser}
        realPools={realPools}
        tradesCount={tradesCount}
        teamPoints={totalTeamPoints || poolerPoints}
        onOpenAuth={() => {
          setIsCommunityStatsOpen(false);
          setIsAuthModalOpen(true);
        }}
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
          currentUser={currentUser}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setIsAuthModalOpen(false);
          }}
          onLogout={() => {
            setCurrentUser(null);
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
    </div>
  );
}
