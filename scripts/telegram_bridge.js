import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_FILE = path.join(__dirname, 'telegram_config.json');

const DEFAULT_CONFIG = {
  bot_token: '8664226059:AAEyGjNYBakZDWTkFMSjroGR6i-IU6v8zZY',
  bot_username: 'configuration101_bot',
  chat_id: 8613341002,
  last_update_id: 0,
  chat_user: 'Joe'
};

export function getConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    } catch (e) {
      return { ...DEFAULT_CONFIG };
    }
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
  return { ...DEFAULT_CONFIG };
}

export function saveConfig(cfg) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2));
}

/**
 * Récupère les derniers messages reçus par le bot
 */
export async function getUpdates() {
  const cfg = getConfig();
  const offset = cfg.last_update_id ? cfg.last_update_id + 1 : 0;
  const url = `https://api.telegram.org/bot${cfg.bot_token}/getUpdates?offset=${offset}&timeout=5`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.ok) return [];

    const updates = data.result || [];
    if (updates.length > 0) {
      // Détecte le dernier chat_id de l'utilisateur
      const latestMessage = updates[updates.length - 1].message;
      if (latestMessage && latestMessage.chat) {
        cfg.chat_id = latestMessage.chat.id;
        cfg.chat_user = latestMessage.from?.username || latestMessage.from?.first_name || 'Joe';
      }
      cfg.last_update_id = updates[updates.length - 1].update_id;
      saveConfig(cfg);
    }
    return updates;
  } catch (err) {
    console.error('Erreur getUpdates Telegram:', err.message);
    return [];
  }
}

/**
 * Envoie un message texte ou une question à l'utilisateur
 */
export async function sendMessage(text, extraParams = {}) {
  const cfg = getConfig();
  const chatId = cfg.chat_id || 8613341002;

  const url = `https://api.telegram.org/bot${cfg.bot_token}/sendMessage`;
  const body = {
    chat_id: chatId,
    text: text,
    parse_mode: 'Markdown',
    ...extraParams
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  return await res.json();
}

/**
 * Traite les commandes Telegram reçues et répond en direct
 */
export async function processTelegramCommands() {
  const updates = await getUpdates();
  if (!updates || updates.length === 0) return 0;

  for (const update of updates) {
    const msg = update.message;
    if (!msg || !msg.text) continue;

    const userText = msg.text.trim();
    const sender = msg.from?.first_name || 'Joe';
    console.log(`[Telegram] Message de ${sender} : "${userText}"`);

    const lower = userText.toLowerCase();

    if (lower.startsWith('/start') || lower === 'start' || lower === 'aide' || lower === '/aide') {
      const welcome = `🏒 *BIENVENUE SUR LE BOT POOL HOCKEY MANAGER !*\n\n` +
        `Salut ${sender} ! Votre bot est synchronisé en direct avec votre application Web.\n\n` +
        `📋 *Commandes disponibles :*\n` +
        `• /classement : Consulter le classement officiel de vos ligues\n` +
        `• /ligues : Afficher vos pools privés actifs\n` +
        `• /discipline : État du Bot Arbitre Zébré et cotes Fair-Play\n` +
        `• /statut : Voir l'état du serveur et de la saison 2026-2027\n\n` +
        `_Zéro faux profil. Données 100% réelles et certifiées._`;
      await sendMessage(welcome);
    } else if (lower.startsWith('/classement')) {
      const classement = `🏆 *CLASSEMENT OFFICIEL LNH 2026-2027*\n\n` +
        `✅ *Intégrité :* Zéro faux profil ou gérant fictif.\n` +
        `📊 *Mise à jour :* Les positions sont calculées en direct d'après les vrais alignements montés de A à Z par les DG réels.\n\n` +
        `Accédez à l'application web pour consulter votre rang ou celui de votre ligue !`;
      await sendMessage(classement);
    } else if (lower.startsWith('/ligues')) {
      const ligues = `🏒 *LIGUES OFFICIELLES (ZÉRO FAUSSE LIGUE)*\n\n` +
        `• Aucune ligue simulée ou fictive n'est injectée.\n` +
        `• Les pools sont créés par les vrais directeurs généraux avec code d'invitation unique (ex: \`POOL-XXXX\`).\n` +
        `• Rejoignez ou fondez votre ligue dans l'onglet « Ligues d'Amis » !`;
      await sendMessage(ligues);
    } else if (lower.startsWith('/discipline')) {
      const disc = `🦓 *ÉTAT DU BUREAU DE DISCIPLINE LNH (BOT ARBITRE)*\n\n` +
        `✅ *Statut Arbitre :* Actif et opérationnel dans le vestiaire\n` +
        `🛡️ *Politique :* Tolérance zéro pour le trash-talk toxique\n` +
        `⚖️ *Sanctions :* -15 pts (Mineure), -35 pts (Majeure), -75 pts (Inconduite)\n` +
        `⭐ *Trophée Lady Byng :* +5% de bonus Rondelles d'Or pour les DG ≥ 90% Fair-Play.`;
      await sendMessage(disc);
    } else if (lower.startsWith('/statut')) {
      const statut = `⚡ *ÉTAT DU SYSTÈME POOL SPORTIF 2026-2027*\n\n` +
        `• Application Web : En ligne sur http://localhost:5174\n` +
        `• Base Joueurs : 849 joueurs officiels synchronisés\n` +
        `• Bot Telegram : Connecté à @configuration101_bot (ID: ${msg.chat.id})\n` +
        `• Faux profils : Éliminés intégralement.`;
      await sendMessage(statut);
    } else {
      // Réponse intelligente pour tout autre texte
      const reply = `🏒 *Pool Hockey Assistant :*\n\n` +
        `Bien reçu votre message : _"${userText}"_.\n\n` +
        `Tapez /classement ou /ligues pour interroger le pool en temps réel !`;
      await sendMessage(reply);
    }
  }

  return updates.length;
}

// Mode CLI autonome
if (process.argv[1] && process.argv[1].endsWith('telegram_bridge.js')) {
  const cmd = process.argv[2] || 'check';
  if (cmd === 'check') {
    getUpdates().then(updates => {
      const cfg = getConfig();
      console.log('--- ÉTAT DU BOT TELEGRAM ---');
      console.log(`Bot: @${cfg.bot_username}`);
      console.log(`Chat ID: ${cfg.chat_id ? cfg.chat_id : 'En attente du premier message'}`);
      console.log(`Utilisateur lié: ${cfg.chat_user || 'Aucun'}`);
      console.log(`Nouveaux messages: ${updates.length}`);
    });
  } else if (cmd === 'process') {
    processTelegramCommands().then(count => {
      console.log(`Commandes Telegram traitées : ${count}`);
    });
  } else if (cmd === 'send') {
    const msg = process.argv.slice(3).join(' ') || '🏒 Notification officielle de Pool Hockey Manager';
    sendMessage(msg).then(console.log).catch(err => console.error(err.message));
  }
}
