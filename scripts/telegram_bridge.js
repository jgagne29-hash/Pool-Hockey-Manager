import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_FILE = path.join(__dirname, 'telegram_config.json');

const DEFAULT_CONFIG = {
  bot_token: '8664226059:AAEyGjNYBakZDWTkFMSjroGR6i-IU6v8zZY',
  bot_username: 'configuration101_bot',
  chat_id: null,
  last_update_id: 0
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
        cfg.chat_user = latestMessage.from?.username || latestMessage.from?.first_name || 'Jonathan';
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
  if (!cfg.chat_id) {
    // Essaye d'abord de récupérer le chat_id via getUpdates
    await getUpdates();
  }
  
  const updatedCfg = getConfig();
  if (!updatedCfg.chat_id) {
    throw new Error("Chat ID introuvable. Veuillez envoyer un message à @configuration101_bot sur Telegram d'abord (ex: /start) !");
  }

  const url = `https://api.telegram.org/bot${updatedCfg.bot_token}/sendMessage`;
  const body = {
    chat_id: updatedCfg.chat_id,
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
 * Envoie une question avec des boutons de réponse rapide (Inline Keyboard)
 */
export async function askQuestion(questionText, options = []) {
  const keyboard = options.map(opt => [{
    text: opt.label,
    callback_data: opt.value || opt.label
  }]);

  return await sendMessage(`❓ *QUESTION DE L'ASSISTANT :*\n\n${questionText}`, {
    reply_markup: {
      inline_keyboard: keyboard
    }
  });
}

// Mode CLI autonome si exécuté directement
if (process.argv[1] && process.argv[1].endsWith('telegram_bridge.js')) {
  const cmd = process.argv[2] || 'check';
  if (cmd === 'check') {
    getUpdates().then(updates => {
      const cfg = getConfig();
      console.log('--- ÉTAT DU BOT TELEGRAM ---');
      console.log(`Bot: @${cfg.bot_username}`);
      console.log(`Chat ID: ${cfg.chat_id ? cfg.chat_id : 'En attente du premier message de l\'utilisateur'}`);
      console.log(`Utilisateur lié: ${cfg.chat_user || 'Aucun'}`);
      console.log(`Nouveaux messages: ${updates.length}`);
    });
  } else if (cmd === 'send') {
    const msg = process.argv.slice(3).join(' ') || 'Bonjour Jonathan ! Le pont Telegram Antigravity est opérationnel 🚀';
    sendMessage(msg).then(console.log).catch(err => console.error(err.message));
  }
}
