import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Search, Filter, CheckCircle2, Lock, ChevronLeft, ChevronRight, 
  Sparkles, Coins, ShieldCheck, Flame, Award, SlidersHorizontal, Eye, RefreshCw
} from 'lucide-react';
import { HockeyPlayerCard } from './HockeyPlayerCard';
import { PLAYERS } from '../data/players';
import { getCardCondition } from '../utils/boosts';
import { calculateMarketValue, getQuickSellCoinValue } from '../utils/market';

// 32 Équipes officielles LNH
const NHL_TEAMS = [
  { code: 'MTL', name: 'Canadiens de Montréal', color: '#AF1E2D' },
  { code: 'TOR', name: 'Maple Leafs de Toronto', color: '#00205B' },
  { code: 'BOS', name: 'Bruins de Boston', color: '#FFB81C' },
  { code: 'EDM', name: 'Oilers d\'Edmonton', color: '#FF4C00' },
  { code: 'COL', name: 'Avalanche du Colorado', color: '#6F263D' },
  { code: 'NYR', name: 'Rangers de New York', color: '#0038A8' },
  { code: 'FLA', name: 'Panthers de la Floride', color: '#C8102E' },
  { code: 'VGK', name: 'Golden Knights de Vegas', color: '#B4975A' },
  { code: 'TBL', name: 'Lightning de Tampa Bay', color: '#002868' },
  { code: 'VAN', name: 'Canucks de Vancouver', color: '#00205B' },
  { code: 'WPG', name: 'Jets de Winnipeg', color: '#041E42' },
  { code: 'CAR', name: 'Hurricanes de la Caroline', color: '#CC0000' },
  { code: 'DAL', name: 'Stars de Dallas', color: '#006847' },
  { code: 'NJD', name: 'Devils du New Jersey', color: '#CE1126' },
  { code: 'LAK', name: 'Kings de Los Angeles', color: '#111111' },
  { code: 'NSH', name: 'Predators de Nashville', color: '#FFB81C' },
  { code: 'DET', name: 'Red Wings de Détroit', color: '#CE1126' },
  { code: 'PIT', name: 'Penguins de Pittsburgh', color: '#FCB514' },
  { code: 'WSH', name: 'Capitals de Washington', color: '#041E42' },
  { code: 'MIN', name: 'Wild du Minnesota', color: '#154734' },
  { code: 'STL', name: 'Blues de St. Louis', color: '#002F87' },
  { code: 'NYI', name: 'Islanders de New York', color: '#F47D30' },
  { code: 'PHI', name: 'Flyers de Philadelphie', color: '#F74902' },
  { code: 'BUF', name: 'Sabres de Buffalo', color: '#002654' },
  { code: 'OTT', name: 'Sénateurs d\'Ottawa', color: '#DA1A32' },
  { code: 'CGY', name: 'Flames de Calgary', color: '#C8102E' },
  { code: 'SEA', name: 'Kraken de Seattle', color: '#99D9D9' },
  { code: 'UTA', name: 'Utah Hockey Club', color: '#69B3E7' },
  { code: 'ANA', name: 'Ducks d\'Anaheim', color: '#F47920' },
  { code: 'CHI', name: 'Blackhawks de Chicago', color: '#CF0A2C' },
  { code: 'SJS', name: 'Sharks de San Jose', color: '#006D75' },
  { code: 'CBJ', name: 'Blue Jackets de Columbus', color: '#002654' }
];

const RARITY_OPTIONS = [
  { key: 'ALL', label: 'Toutes les Variantes' },
  { key: 'Base', label: 'Base (70%)' },
  { key: 'Régulière', label: 'Régulière (20%)' },
  { key: 'Super', label: 'Super (6%)' },
  { key: 'Ultra', label: 'Ultra (2%)' },
  { key: 'Mystique', label: 'Mystique (1.5%)' },
  { key: 'The Patch (1-of-1)', label: 'The Patch 1/1 (0.5%)' }
];

export const BinderView = ({
  inventory = [],
  onQuickSell,
  lineup = [],
  exhibitedCards = [],
  onToggleExhibit
}) => {
  // Filtres
  const [searchPlayer, setSearchPlayer] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('ALL');
  const [selectedRarity, setSelectedRarity] = useState('ALL');
  const [selectedPosition, setSelectedPosition] = useState('ALL');
  const [ownershipFilter, setOwnershipFilter] = useState('owned'); // 'owned', 'all', 'missing'
  
  // Pagination (Feuilletage 9 pochettes par page)
  const [page, setPage] = useState(1);
  const [pageDirection, setPageDirection] = useState(1); // 1 = avant, -1 = arrière pour animation
  const CARDS_PER_PAGE = 9;

  // Set des IDs de cartes possédées pour détection rapide
  const ownedEditionIds = useMemo(() => {
    return new Set(inventory.map(c => c.edition_id || `${c.nhl_id}_${c.rarity?.toLowerCase()}`));
  }, [inventory]);

  // Calcul des accomplissements d'équipes
  const teamCompletions = useMemo(() => {
    const counts = {};
    inventory.forEach(card => {
      if (card.team) counts[card.team] = (counts[card.team] || 0) + 1;
    });
    return counts;
  }, [inventory]);

  const completedTeams = NHL_TEAMS.filter(t => (teamCompletions[t.code] || 0) >= 4);
  const permanentCapDiscount = completedTeams.length * 2000000;
  const permanentXpBonus = Math.min(100, completedTeams.length * 15);

  // Bassin complet d'éléments à afficher selon les filtres
  const allDisplayItems = useMemo(() => {
    // Si l'utilisateur choisit 'owned', on filtre strictement son inventaire
    if (ownershipFilter === 'owned') {
      return inventory.filter(card => {
        const player = card.playerData || card;
        const matchSearch = !searchPlayer || 
          player.name.toLowerCase().includes(searchPlayer.toLowerCase()) || 
          String(player.number).includes(searchPlayer);
        const matchTeam = selectedTeam === 'ALL' || card.team === selectedTeam;
        const matchRarity = selectedRarity === 'ALL' || card.rarity === selectedRarity;
        const matchPos = selectedPosition === 'ALL' || player.position === selectedPosition;

        return matchSearch && matchTeam && matchRarity && matchPos;
      }).map(card => ({
        ...card,
        isOwned: true
      }));
    }

    // Si l'utilisateur choisit 'all' ou 'missing', on parcourt le catalogue de la ligue
    const catalogCards = [];
    PLAYERS.forEach(p => {
      p.cards.forEach(edition => {
        const isOwned = ownedEditionIds.has(edition.edition_id);
        
        if (ownershipFilter === 'missing' && isOwned) return;

        const matchSearch = !searchPlayer || 
          p.name.toLowerCase().includes(searchPlayer.toLowerCase()) || 
          String(p.number).includes(searchPlayer);
        const matchTeam = selectedTeam === 'ALL' || p.team === selectedTeam;
        const matchRarity = selectedRarity === 'ALL' || edition.rarity === selectedRarity;
        const matchPos = selectedPosition === 'ALL' || p.position === selectedPosition;

        if (matchSearch && matchTeam && matchRarity && matchPos) {
          // Si possédée, retrouver l'instance réelle avec sa durabilité
          const ownedInstance = inventory.find(c => c.edition_id === edition.edition_id);
          catalogCards.push({
            instance_id: ownedInstance ? ownedInstance.instance_id : `catalog_${p.nhl_id}_${edition.edition_id}`,
            nhl_id: p.nhl_id,
            name: p.name,
            team: p.team,
            team_name: p.team_name,
            position: p.position,
            number: p.number,
            stats: p.stats,
            rarity: edition.rarity,
            edition_id: edition.edition_id,
            edition_name: edition.edition_name,
            multiplier: edition.multiplier,
            bg_color: edition.bg_color,
            cap_hit: edition.cap_hit,
            serial: edition.serial,
            is_one_of_one: edition.is_one_of_one,
            durability_days: ownedInstance ? (ownedInstance.durability_days || 35) : 35,
            isOwned: !!ownedInstance,
            playerData: p
          });
        }
      });
    });

    return catalogCards;
  }, [inventory, ownershipFilter, searchPlayer, selectedTeam, selectedRarity, selectedPosition, ownedEditionIds]);

  const totalPages = Math.max(1, Math.ceil(allDisplayItems.length / CARDS_PER_PAGE));
  const currentCards = allDisplayItems.slice((page - 1) * CARDS_PER_PAGE, page * CARDS_PER_PAGE);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPageDirection(1);
      setPage(p => p + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPageDirection(-1);
      setPage(p => p - 1);
    }
  };

  return (
    <div className="binder-grand-container" style={{ maxWidth: '1380px', margin: '0 auto', padding: '16px' }}>
      {/* ===================================================
          1. EN-TÊTE DU CARTABLE & PRIVILÈGES DU COMMISSAIRE
          =================================================== */}
      <div style={{
        background: 'linear-gradient(135deg, #090e17 0%, #131b2a 50%, #0f172a 100%)',
        border: '2px solid rgba(0, 210, 255, 0.25)',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '20px',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 25px rgba(56, 189, 248, 0.5)',
              color: '#fff'
            }}>
              <BookOpen size={30} />
            </div>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#f8fafc', margin: 0, letterSpacing: '-0.5px' }}>
                Le Cartable Officiel du D.G. (Album TCG 9 Pochettes)
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0 0' }}>
                Feuilletez votre classeur de cartes LNH. Complétez chaque franchise pour débloquer des rabais permanents de masse salariale.
              </p>
            </div>
          </div>

          {/* Badges de Privilèges Actifs */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.5)',
              padding: '8px 16px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <ShieldCheck size={20} color="#10b981" />
              <div>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>RABAIS MASSE ACTIVE</div>
                <div style={{ fontSize: '17px', fontWeight: 900, color: '#10b981' }}>
                  -{(permanentCapDiscount / 1000000).toFixed(1)} M $
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.5)',
              padding: '8px 16px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Flame size={20} color="#f59e0b" />
              <div>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>BONUS EXPÉRIENCE</div>
                <div style={{ fontSize: '17px', fontWeight: 900, color: '#f59e0b' }}>
                  +{permanentXpBonus}% XP
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.5)',
              padding: '8px 16px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Award size={20} color="#38bdf8" />
              <div>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>SÉRIES COMPLÉTÉES</div>
                <div style={{ fontSize: '17px', fontWeight: 900, color: '#38bdf8' }}>
                  {completedTeams.length} / 32
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Complétion par Franchises LNH (Sélecteur Rapide) */}
        <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '12px', fontWeight: 700 }}>
            <span style={{ color: '#cbd5e1' }}>Complétion des 32 Franchises (Objectif : 4 cartes du club pour valider l'écusson)</span>
            <span style={{ color: '#38bdf8' }}>{inventory.length} cartes au cartable</span>
          </div>

          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px' }}>
            <button
              onClick={() => { setSelectedTeam('ALL'); setPage(1); }}
              style={{
                flexShrink: 0,
                padding: '6px 12px',
                borderRadius: '8px',
                border: selectedTeam === 'ALL' ? '2px solid #00d2ff' : '1px solid rgba(255, 255, 255, 0.1)',
                background: selectedTeam === 'ALL' ? 'rgba(0, 210, 255, 0.25)' : 'rgba(0, 0, 0, 0.4)',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              TOUTES LES ÉQUIPES
            </button>

            {NHL_TEAMS.map(team => {
              const count = teamCompletions[team.code] || 0;
              const isComplete = count >= 4;
              const isSelected = selectedTeam === team.code;

              return (
                <button
                  key={team.code}
                  onClick={() => {
                    setSelectedTeam(selectedTeam === team.code ? 'ALL' : team.code);
                    setPage(1);
                  }}
                  style={{
                    flexShrink: 0,
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: isSelected
                      ? '2px solid #00d2ff'
                      : isComplete
                      ? '1px solid rgba(16, 185, 129, 0.6)'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    background: isSelected
                      ? 'rgba(0, 210, 255, 0.25)'
                      : isComplete
                      ? 'rgba(16, 185, 129, 0.15)'
                      : 'rgba(0, 0, 0, 0.4)',
                    color: isComplete ? '#10b981' : '#cbd5e1',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{team.code}</span>
                  <span style={{
                    fontSize: '10px',
                    padding: '1px 5px',
                    borderRadius: '10px',
                    background: isComplete ? '#10b981' : 'rgba(255, 255, 255, 0.15)',
                    color: isComplete ? '#000' : '#fff'
                  }}>
                    {count}/4
                  </span>
                  {isComplete && <CheckCircle2 size={12} color="#10b981" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===================================================
          2. PANNEAU DE RECHERCHE & FILTRES AVANCÉS
          =================================================== */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        {/* Ligne 1 : Recherche texte & Filtre de Possession */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          {/* Barre de recherche réactive */}
          <div style={{
            position: 'relative',
            flex: '1 1 280px',
            maxWidth: '450px'
          }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Rechercher un joueur (ex: McDavid, Caufield, #97)..."
              value={searchPlayer}
              onChange={(e) => {
                setSearchPlayer(e.target.value);
                setPage(1);
              }}
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>

          {/* Sélecteur de Possession (Possédées / Tout l'Album / Manquantes) */}
          <div style={{
            display: 'flex',
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '4px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <button
              onClick={() => { setOwnershipFilter('owned'); setPage(1); }}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: ownershipFilter === 'owned' ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'transparent',
                color: ownershipFilter === 'owned' ? '#fff' : '#94a3b8',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ✅ Cartes Possédées ({inventory.length})
            </button>

            <button
              onClick={() => { setOwnershipFilter('all'); setPage(1); }}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: ownershipFilter === 'all' ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'transparent',
                color: ownershipFilter === 'all' ? '#fff' : '#94a3b8',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              📖 Tout l'Album Panini (Complet)
            </button>

            <button
              onClick={() => { setOwnershipFilter('missing'); setPage(1); }}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: ownershipFilter === 'missing' ? 'rgba(239, 68, 68, 0.25)' : 'transparent',
                color: ownershipFilter === 'missing' ? '#ef4444' : '#94a3b8',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🔒 Manquantes à Débloquer
            </button>
          </div>
        </div>

        {/* Ligne 2 : Filtres de Variantes & Positions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginRight: '4px' }}>
              Variante :
            </span>
            {RARITY_OPTIONS.map(r => (
              <button
                key={r.key}
                onClick={() => { setSelectedRarity(r.key); setPage(1); }}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: selectedRarity === r.key ? '1px solid #00d2ff' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: selectedRarity === r.key ? 'rgba(0, 210, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                  color: selectedRarity === r.key ? '#00d2ff' : '#94a3b8'
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              Position :
            </span>
            {[
              { key: 'ALL', label: 'Toutes' },
              { key: 'C', label: 'Centre' },
              { key: 'LW', label: 'AG' },
              { key: 'RW', label: 'AD' },
              { key: 'D', label: 'Déf.' },
              { key: 'G', label: 'Gardien' }
            ].map(pos => (
              <button
                key={pos.key}
                onClick={() => { setSelectedPosition(pos.key); setPage(1); }}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: selectedPosition === pos.key ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: selectedPosition === pos.key ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                  color: selectedPosition === pos.key ? '#10b981' : '#94a3b8'
                }}
              >
                {pos.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===================================================
          3. BARRE DE FEUILLETAGE DU CARTABLE (3x3 = 9 Pochettes)
          =================================================== */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(10, 14, 23, 0.85)',
        padding: '12px 20px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc' }}>
            Feuillet {page} / {totalPages}
          </span>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            ({allDisplayItems.length} carte(s) répertoriée(s))
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            disabled={page <= 1}
            onClick={handlePrevPage}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: 'rgba(15, 23, 42, 0.9)',
              color: page <= 1 ? '#475569' : '#fff',
              cursor: page <= 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 700,
              fontSize: '12px'
            }}
          >
            <ChevronLeft size={16} /> Tourner la Page (Précédente)
          </button>

          <button
            disabled={page >= totalPages}
            onClick={handleNextPage}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: 'linear-gradient(135deg, #0284c7, #0369a1)',
              color: page >= totalPages ? '#475569' : '#fff',
              cursor: page >= totalPages ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 700,
              fontSize: '12px'
            }}
          >
            Tourner la Page (Suivante) <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ===================================================
          4. CLASSEUR 3D : FEUILLET 9 POCHETTES (3 x 3)
          =================================================== */}
      <AnimatePresence mode="wait">
        <motion.div
          key={page + ownershipFilter + selectedTeam + selectedRarity}
          initial={{ opacity: 0, rotateY: pageDirection * 20, scale: 0.98 }}
          animate={{ opacity: 1, rotateY: 0, scale: 1 }}
          exit={{ opacity: 0, rotateY: pageDirection * -20, scale: 0.98 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          style={{
            background: 'radial-gradient(circle at 50% 50%, #172033 0%, #0c121e 100%)',
            border: '3px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '24px',
            padding: '30px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), inset 0 0 80px rgba(0, 0, 0, 0.6)',
            position: 'relative',
            minHeight: '600px'
          }}
        >
          {/* Anneaux métalliques du Cartable (Effet classeur physique au centre gauche) */}
          <div style={{
            position: 'absolute',
            left: '12px',
            top: '40px',
            bottom: '40px',
            width: '10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            zIndex: 10,
            pointerEvents: 'none'
          }}>
            {[1, 2, 3, 4, 5].map(ring => (
              <div
                key={ring}
                style={{
                  width: '22px',
                  height: '14px',
                  borderRadius: '10px',
                  background: 'linear-gradient(180deg, #e2e8f0 0%, #64748b 50%, #1e293b 100%)',
                  boxShadow: '2px 3px 6px rgba(0, 0, 0, 0.8)',
                  marginLeft: '-6px'
                }}
              />
            ))}
          </div>

          {currentCards.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              color: '#94a3b8'
            }}>
              <BookOpen size={54} color="#475569" style={{ margin: '0 auto 16px', display: 'block' }} />
              <h3 style={{ color: '#cbd5e1', fontSize: '18px', fontWeight: 800 }}>
                Aucune carte ne correspond à ces critères sur cette page
              </h3>
              <p style={{ fontSize: '13px', marginTop: '6px' }}>
                Essayez d'élargir vos filtres ou d'ouvrir des paquets dans la Boutique pour débloquer ces cartes.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '26px',
              paddingLeft: '20px'
            }}>
              {currentCards.map((card) => {
                const player = card.playerData || card;
                const daysLeft = card.durability_days !== undefined ? card.durability_days : 35;
                const quickSellCoins = getQuickSellCoinValue(card.rarity);
                const marketVal = calculateMarketValue(player, card, daysLeft);

                if (!card.isOwned) {
                  // Pochette pour carte NON possédée (Silhouette Panini)
                  return (
                    <div
                      key={card.instance_id}
                      style={{
                        height: '420px',
                        borderRadius: '20px',
                        border: '2px dashed rgba(255, 255, 255, 0.15)',
                        background: 'rgba(0, 0, 0, 0.35)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px',
                        textAlign: 'center',
                        backdropFilter: 'blur(4px)'
                      }}
                    >
                      <div style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px'
                      }}>
                        <Lock size={28} color="#64748b" />
                      </div>

                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
                        {card.team} • {card.position}
                      </span>

                      <h4 style={{ fontSize: '17px', fontWeight: 900, color: '#cbd5e1', margin: '4px 0' }}>
                        #{card.number} {card.name}
                      </h4>

                      <span style={{
                        fontSize: '11px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: '#94a3b8',
                        marginTop: '8px'
                      }}>
                        {card.rarity} (x{card.multiplier})
                      </span>

                      <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '16px' }}>
                        À débloquer dans les paquets
                      </span>
                    </div>
                  );
                }

                // Pochette pour carte POSSÉDÉE
                return (
                  <div
                    key={card.instance_id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      background: 'rgba(8, 12, 20, 0.85)',
                      padding: '16px',
                      borderRadius: '18px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
                    }}
                  >
                    <HockeyPlayerCard
                      player={{
                        ...player,
                        cards: [card]
                      }}
                      selectedEditionId={card.edition_id}
                      customDurabilityDays={daysLeft}
                      showBoostAction={false}
                    />

                    {/* Actions de pochette */}
                    <div style={{
                      width: '100%',
                      marginTop: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '8px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                      paddingTop: '10px'
                    }}>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        Valeur : <strong style={{ color: '#00d2ff' }}>{marketVal} pts</strong>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {onToggleExhibit && (
                          <button
                            onClick={() => onToggleExhibit(card.instance_id)}
                            style={{
                              padding: '4px 10px',
                              background: exhibitedCards?.includes(card.instance_id) ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                              border: exhibitedCards?.includes(card.instance_id) ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
                              color: exhibitedCards?.includes(card.instance_id) ? '#f87171' : '#f5af19',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Exposer ou retirer du temple de la renommée"
                          >
                            {exhibitedCards?.includes(card.instance_id) ? '🏆 Retirer' : '🏆 Exposer'}
                          </button>
                        )}

                        {onQuickSell && (
                          <button
                            onClick={() => onQuickSell(card)}
                            style={{
                              padding: '4px 10px',
                              background: 'rgba(245, 158, 11, 0.15)',
                              border: '1px solid rgba(245, 158, 11, 0.4)',
                              color: '#f5af19',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Vendre rapidement contre des Rondelles d'Or"
                          >
                            <Coins size={12} /> +{quickSellCoins} 🪙
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
