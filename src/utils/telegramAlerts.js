/**
 * telegramAlerts.js - Service d'alerte et de notification Telegram en direct
 * Connecté au bot @configuration101_bot pour Joe (Chat ID: 8613341002)
 */

const TELEGRAM_BOT_TOKEN = '8664226059:AAEyGjNYBakZDWTkFMSjroGR6i-IU6v8zZY';
const DEFAULT_CHAT_ID = '8613341002'; // Joe

/**
 * Envoie une notification officielle sur Telegram
 */
export async function sendTelegramNotification(messageText) {
  if (!messageText) return { ok: false };

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: DEFAULT_CHAT_ID,
        text: messageText,
        parse_mode: 'Markdown'
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Erreur envoi Telegram :', error);
    return { ok: false, error: error.message };
  }
}

/**
 * Envoie une alerte de transaction de cartes
 */
export async function notifyTelegramTrade(senderName, targetName, cardsOffered, cardsRequested) {
  const text = `🔄 *NOUVELLE TRANSACTION DE POOL DÉPOSÉE !*\n\n` +
    `👤 *Gérant initiateur :* ${senderName}\n` +
    `🎯 *Gérant ciblé :* ${targetName}\n\n` +
    `📥 *Cartes offertes :* ${cardsOffered}\n` +
    `📤 *Cartes demandées :* ${cardsRequested}\n\n` +
    `⚖️ *Statut :* En attente d'approbation (Règle d'équité 15% validée).`;

  return await sendTelegramNotification(text);
}

/**
 * Envoie une alerte d'intervention arbitrale
 */
export async function notifyTelegramDiscipline(managerName, severity, reason, pointsPenalty) {
  const text = `🦓 *INTERVENTION DE L'ARBITRE ZÉBRÉ LNH !*\n\n` +
    `⚠️ *DG Sanctionné :* ${managerName}\n` +
    `🟨 *Sanction :* ${severity}\n` +
    `📉 *Points retirés :* -${pointsPenalty} pts\n` +
    `📝 *Motif :* ${reason}\n\n` +
    `_L'intégrité du pool est sous surveillance active._`;

  return await sendTelegramNotification(text);
}
