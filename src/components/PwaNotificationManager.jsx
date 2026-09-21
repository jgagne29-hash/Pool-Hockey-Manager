import React, { useState, useEffect } from 'react';
import { Bell, BellRing, Check, Clock, ShieldAlert } from 'lucide-react';

export const PwaNotificationManager = () => {
  const [permission, setPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [isScheduled, setIsScheduled] = useState(false);
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    setPermission(Notification.permission);

    // Vérifier si le rappel de 18h00 est déjà activé dans le localStorage
    const savedSetting = localStorage.getItem('pooldg_lineup_reminder_18h');
    if (savedSetting === 'true' && Notification.permission === 'granted') {
      setIsScheduled(true);
      scheduleDaily18hReminder();
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert("Les notifications ne sont pas prises en charge par ce navigateur.");
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === 'granted') {
        setIsScheduled(true);
        localStorage.setItem('pooldg_lineup_reminder_18h', 'true');
        scheduleDaily18hReminder();

        // Envoi d'une notification de confirmation immédiate
        new Notification("🏒 PoolDG.cards — Rappel Activé !", {
          body: "Votre alerte quotidienne de 18h00 pour verrouiller votre alignement est désormais active sur cet appareil.",
          icon: "/favicon.ico",
          badge: "/favicon.ico"
        });
      }
    } catch (err) {
      console.error("Erreur lors de la demande de permission:", err);
    }
  };

  const scheduleDaily18hReminder = () => {
    // Calculer le nombre de millisecondes jusqu'à 18h00 (heure de l'Est / local)
    const now = new Date();
    const target18h = new Date();
    target18h.setHours(18, 0, 0, 0);

    if (now.getTime() >= target18h.getTime()) {
      // Si 18h est déjà passé aujourd'hui, programmer pour demain 18h
      target18h.setDate(target18h.getDate() + 1);
    }

    const msUntil18h = target18h.getTime() - now.getTime();

    // Timer local pour le rappel de 18h00
    setTimeout(() => {
      if (Notification.permission === 'granted') {
        new Notification("🏒 PoolDG.cards — Verrouillage de l'Alignement (18h00)", {
          body: "Les premiers matchs débutent à 19h00 ! Vérifiez vos cartes de boost et vos joueurs actifs avant la mise au jeu.",
          icon: "/favicon.ico"
        });
        // Relancer pour le jour suivant
        scheduleDaily18hReminder();
      }
    }, msUntil18h);
  };

  const sendTestNotification = () => {
    if (Notification.permission !== 'granted') {
      requestNotificationPermission();
      return;
    }

    new Notification("🏒 PoolDG.cards — Test d'Alerte Réussi", {
      body: "Vos notifications locales PWA fonctionnent parfaitement ! Vous recevrez l'alerte à 18h00 tous les jours de match.",
      icon: "/favicon.ico"
    });
    setTestSent(true);
    setTimeout(() => setTestSent(false), 4000);
  };

  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.85)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      flexWrap: 'wrap'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          background: isScheduled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0, 210, 255, 0.2)',
          padding: '8px',
          borderRadius: '8px',
          color: isScheduled ? '#10b981' : '#00d2ff'
        }}>
          {isScheduled ? <BellRing size={18} /> : <Bell size={18} />}
        </div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc' }}>
            Rappel Local PWA (18h00)
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>
            Alerte automatique sur votre téléphone/appareil avant les matchs du soir
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        {permission !== 'granted' ? (
          <button
            onClick={requestNotificationPermission}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Clock size={14} /> Activer le Rappel à 18h
          </button>
        ) : (
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              color: '#10b981',
              fontWeight: 700,
              padding: '4px 10px',
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '6px',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <Check size={14} /> Rappel Quotidien 18h00 Actif
            </div>

            <button
              onClick={sendTestNotification}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#cbd5e1',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {testSent ? '✓ Envoyé !' : 'Tester'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
