/**
 * refereeBot.js - Bot Arbitre Officiel LNH & Système Disciplinaire
 * Analyse sémantique du trash-talk, attribution des pénalités et gestion de la réputation DG.
 */

// Mots-clés et expressions indicatrices de trash-talk et d'antisportivité
const TRASH_TALK_PATTERNS = [
  // Insultes directes ou mépris marqué (Pénalité Majeure ou Inconduite)
  { regex: /\b(idiot|imbécile|imbecile|connard|trou de cul|estie d'épais|crétin|cretin|dégage|degage|ta gueule|ferme ta gueule|t'es une merde|loser fini|gros nul|pourri jusqu'à l'os)\b/i, severity: 'MISCONDUCT', reason: "Insultes graves et atteinte à l'intégrité d'un DG" },
  { regex: /\b(triche|tricheur|fraudeur|t'es pourri|t'es nul|pourri|vous êtes nuls|bande de nazes|vous puez|t'as aucune classe|tu vaux rien)\b/i, severity: 'MAJOR', reason: "Dénigrement abusif et accusations antisportives répétées" },
  // Provocations agressives et vantardise toxique (Pénalité Mineure)
  { regex: /\b(écrase|ecrase|pleure pas|va pleurer|t'es trop faible|t'es mauvais|je vais t'écraser|tu fais pitié|aucun talent|abandonne|lâche l'affaire|t'as aucune chance|prends des notes le noob)\b/i, severity: 'MINOR', reason: "Conduite antisportive et provocation agressive dans le vestiaire" },
  // Taquineries limites / Avertissement verbal
  { regex: /\b(chanceux|gros coup de chance|la moule|chokeur|tu vas chocker|t'es cuit|tu vas te faire laver|je vous domine tous|je suis le boss)\b/i, severity: 'WARNING', reason: "Vantardise excessive et taquinerie à la limite du règlement" }
];

// Phrases officielles immersives de l'arbitre québécois LNH
const REFEREE_RESPONSES = {
  WARNING: [
    "⚠️ COUP DE SIFFLET ! L'Arbitre Zébré intervient : On garde ça propre dans le vestiaire ! Premier avertissement verbal. Le chambrage amical est permis, mais attention à la ligne blanche.",
    "⚠️ RAPPEL AU RÈGLEMENT : L'Arbitre lève le bras ! Un peu de retenue dans vos propos. Votre dossier disciplinaire est désormais ouvert."
  ],
  MINOR: [
    "🟨 PÉNALITÉ MINEURE (2 MINUTES) ! L'Arbitre Zébré signale une conduite antisportive. -15 points retirés au classement du pool et -10% de réputation DG. Au banc des punitions !",
    "🟨 COUP DE SIFFLET STRIDENT ! 2 minutes pour obstruction verbale et manque de respect caractérisé. Déduction immédiate de 15 points. Reprenez vos esprits !"
  ],
  MAJOR: [
    "🟧 PÉNALITÉ MAJEURE (5 MINUTES) ! L'Arbitre Zébré n'hésite pas une seconde : le trash-talk excessif dépasse les bornes admissibles. -35 points au pool, -25% de réputation et gel temporaire des négociations d'échange !",
    "🟧 SANCTION EXEMPLAIRE ! 5 minutes de pénalité majeure pour acharnement toxique. -35 points appliqués à votre fiche. Les arbitres protègent l'intégrité de la ligue."
  ],
  MISCONDUCT: [
    "🟥 INCONDUITE DE PARTIE & EXPULSION IMMÉDIATE DU VESTIAIRE ! -75 points de pénalité et -50% de réputation. L'Arbitre Zébré vous ordonne de regagner le vestiaire sans délai !",
    "🟥 EXPULSION OFFICIELLE ! Carton rouge de la LNH. Le respect mutuel est une condition non négociable du pool. -75 points et inscription au registre des suspensions."
  ]
};

/**
 * Analyse un message et retourne le verdict de l'arbitre
 */
export function evaluateMessageDiscipline(text, currentReputation = 100) {
  if (!text || typeof text !== 'string') {
    return { isInfraction: false };
  }

  const cleanText = text.trim();

  // Si le message est un encouragement ou un message fair-play explicite
  if (/\b(bravo|bon match|bien joué|félicitations|merci|gg|respect|bien mérité|bonne chance)\b/i.test(cleanText)) {
    return {
      isInfraction: false,
      isFairPlay: true,
      message: "Comportement exemplaire et esprit sportif salué par la ligue."
    };
  }

  // Parcourir les patterns de détection
  for (const pattern of TRASH_TALK_PATTERNS) {
    if (pattern.regex.test(cleanText)) {
      let severity = pattern.severity;

      // Si le DG a déjà une réputation sous surveillance (< 70%), la sanction s'aggrave
      if (currentReputation < 70 && severity === 'WARNING') {
        severity = 'MINOR';
      } else if (currentReputation < 50 && severity === 'MINOR') {
        severity = 'MAJOR';
      }

      const pointsPenalty = {
        WARNING: 0,
        MINOR: 15,
        MAJOR: 35,
        MISCONDUCT: 75
      }[severity];

      const repLoss = {
        WARNING: 2,
        MINOR: 10,
        MAJOR: 25,
        MISCONDUCT: 50
      }[severity];

      const responses = REFEREE_RESPONSES[severity];
      const botText = responses[Math.floor(Math.random() * responses.length)];

      return {
        isInfraction: true,
        severity,
        reason: pattern.reason,
        pointsPenalty,
        reputationLoss: repLoss,
        botCommentary: botText,
        ruleViolated: `Article LNH 75.2 - Fair-Play et Respect entre Gérants (${severity})`
      };
    }
  }

  return { isInfraction: false };
}

/**
 * Joue un coup de sifflet d'arbitre synthétisé via l'API Web Audio
 * Fonctionne instantanément dans tous les navigateurs modernes
 */
export function playRefereeWhistle() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // Deux coups d'oscillateurs superposés pour simuler le son perçant de la bille d'un sifflet Fox 40
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(2800, now);
    osc1.frequency.exponentialRampToValueAtTime(3200, now + 0.08);
    osc1.frequency.exponentialRampToValueAtTime(2900, now + 0.22);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(2950, now);
    osc2.frequency.exponentialRampToValueAtTime(3350, now + 0.08);
    osc2.frequency.exponentialRampToValueAtTime(3000, now + 0.22);

    gainNode.gain.setValueAtTime(0.01, now);
    gainNode.gain.linearRampToValueAtTime(0.25, now + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.28);
    osc2.stop(now + 0.28);
  } catch (err) {
    console.warn("Audio non supporté ou bloqué :", err);
  }
}

/**
 * Sauvegarde une sanction dans l'historique disciplinaire officiel
 */
export function logDisciplinarySanction(sanction) {
  try {
    const existing = JSON.parse(localStorage.getItem('nhl_disciplinary_record') || '[]');
    const newEntry = {
      id: `sanction_${Date.now()}`,
      timestamp: new Date().toISOString(),
      dateFormatted: new Date().toLocaleDateString('fr-CA', { hour: '2-digit', minute: '2-digit' }),
      ...sanction
    };
    const updated = [newEntry, ...existing].slice(0, 50); // Limite aux 50 derniers incidents
    localStorage.setItem('nhl_disciplinary_record', JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Erreur enregistrement sanction :", e);
    return [];
  }
}

/**
 * Récupère l'historique complet des sanctions
 */
export function getDisciplinaryRecord() {
  try {
    const data = localStorage.getItem('nhl_disciplinary_record');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Calcule le statut de réputation
 */
export function getReputationStatus(repScore = 100) {
  const score = Math.max(0, Math.min(100, repScore));
  if (score >= 90) {
    return {
      label: 'DG Exemplaire (Fair-Play Élite)',
      tagColor: 'green',
      icon: '🛡️',
      bonusText: '+5% Rondelles d\'Or aux victoires',
      penaltyMultiplier: 1.0
    };
  }
  if (score >= 70) {
    return {
      label: 'DG Compétiteur Équilibré',
      tagColor: 'blue',
      icon: '⚖️',
      bonusText: 'Réputation stable',
      penaltyMultiplier: 1.0
    };
  }
  if (score >= 50) {
    return {
      label: 'Sous Surveillance Arbitrale',
      tagColor: 'orange',
      icon: '⚠️',
      bonusText: 'Avertissement : Prochaine faute aggravée',
      penaltyMultiplier: 1.5
    };
  }
  return {
    label: 'Banc des Punitions (Bad Boy)',
    tagColor: 'red',
    icon: '🚨',
    bonusText: 'Sanctions doublées & restrictions d\'échange',
    penaltyMultiplier: 2.0
  };
}
