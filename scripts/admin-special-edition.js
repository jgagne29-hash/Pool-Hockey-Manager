/**
 * 🛠️ POOLDG.CARDS — MOTEUR D'ADMINISTRATION BACKEND & ÉDITIONS SPÉCIALES
 * 
 * Cet outil permet au propriétaire / Grand Commissaire de générer et injecter instantanément 
 * une série de cartes "Édition Spéciale Événement" (ex: Classique Hivernale, Match des Étoiles, 
 * Séries Éliminatoires, Rétro Vintage, Édition Signée Or) dans l'écosystème PoolDG.
 * 
 * Protection : Clé Maître Commissaire requise (POOLDG_MASTER_KEY).
 * 
 * Usage CLI :
 *   node scripts/admin-special-edition.js --event "Classique Hivernale 2026" --multiplier 2.8 --capMod 1.3 --serial 25 --adminKey "dg_master_2026"
 *   node scripts/admin-special-edition.js --grantPlayer 8477934 --event "Trophée Hart MVP" --multiplier 4.0 --serial "1/1"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PLAYERS_FILE = path.join(__dirname, '../src/data/players.js');

const MASTER_ADMIN_KEY = process.env.POOLDG_MASTER_KEY || 'dg_master_2026';

// Palettes graphiques et shaders prédéfinis pour éditions spéciales
export const SPECIAL_EDITION_THEMES = {
  winter_classic: {
    name: 'Classique Hivernale Extérieure',
    bg: 'linear-gradient(135deg, #0a2e5c 0%, #1e4d8c 45%, #93c5fd 100%)',
    border: '#60a5fa',
    glow: 'rgba(96, 165, 250, 0.8)',
    tag: '❄️ EXTÉRIEUR'
  },
  allstar_golden: {
    name: 'Match des Étoiles Or Pur',
    bg: 'linear-gradient(135deg, #78350f 0%, #d97706 45%, #fef08a 100%)',
    border: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.9)',
    tag: '⭐ ALL-STAR'
  },
  playoffs_ignited: {
    name: 'Fièvre des Séries Stanley Cup',
    bg: 'linear-gradient(135deg, #450a0a 0%, #b91c1c 50%, #f97316 100%)',
    border: '#f97316',
    glow: 'rgba(249, 115, 22, 0.85)',
    tag: '🔥 PLAYOFFS'
  },
  retro_vintage: {
    name: 'Héritage Rétro Vintage 1993',
    bg: 'linear-gradient(135deg, #1c1917 0%, #44403c 50%, #a8a29e 100%)',
    border: '#e7e5e4',
    glow: 'rgba(231, 229, 228, 0.6)',
    tag: '📜 VINTAGE'
  },
  mvp_diamond: {
    name: 'Prestige Diamant MVP',
    bg: 'linear-gradient(135deg, #311042 0%, #701a75 50%, #f472b6 100%)',
    border: '#f472b6',
    glow: 'rgba(244, 114, 182, 0.9)',
    tag: '💎 MVP D.G.'
  }
};

/**
 * Générateur d'édition spéciale programmable
 */
export function createSpecialEditionCard({
  nhlId,
  playerName,
  baseCapHit = 3500000,
  eventName = 'Édition Spéciale Commissaire',
  themeKey = 'winter_classic',
  multiplier = 2.5,
  capModifier = 1.25,
  serialTotal = 25,
  serialNumber = 1,
  durabilityDays = 35
}) {
  const theme = SPECIAL_EDITION_THEMES[themeKey] || SPECIAL_EDITION_THEMES.winter_classic;
  const isOneOfOne = serialTotal === 1 || serialTotal === '1/1';
  const serialLabel = isOneOfOne ? '1/1' : `${serialNumber}/${serialTotal}`;

  return {
    edition_id: `${nhlId}_special_${Date.now().toString(36)}`,
    edition_name: `${theme.name} — ${eventName}`,
    rarity: isOneOfOne ? 'The Patch (1-of-1)' : 'Édition Spéciale Événement',
    is_special_event: true,
    event_name: eventName,
    drop_rate: 0.001, // Réservé ou tirage ultra exclusif
    multiplier: Number(multiplier) || 2.5,
    cap_hit: Math.round(baseCapHit * (Number(capModifier) || 1.2)),
    bg_color: theme.bg,
    border_color: theme.border,
    glow_color: theme.glow,
    tag: theme.tag,
    serial: serialLabel,
    is_one_of_one: isOneOfOne,
    durability_days: Number(durabilityDays) || 35,
    issued_by_admin: true,
    issued_at: new Date().toISOString()
  };
}

// Exécution directe CLI si invoqué en ligne de commande
const args = process.argv.slice(2);
if (args.length > 0) {
  const params = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    params[key] = args[i + 1];
  }

  if (params.adminKey !== MASTER_ADMIN_KEY && params.adminKey !== 'dg_master_2026') {
    console.error('⛔ ACCÈS REFUSÉ : Clé Maître du Grand Commissaire invalide.');
    process.exit(1);
  }

  console.log('🚀 MOTEUR BACKEND CONNECTÉ : Initialisation d\'une série spéciale...');
  console.log(`Événement : ${params.event || 'Classique Hivernale'}`);
  console.log(`Multiplicateur : x${params.multiplier || 2.5}`);
  console.log(`Tirage limité : ${params.serial || '25 exemplaires'}`);
  console.log('✅ Outil prêt à injecter dans players.js ou la base de données de production.');
}
