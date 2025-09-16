// Utilitaire de session (inactivité + synchronisation + durée absolue)
// - Déconnecte après X minutes d'inactivité (idle)
// - Durée de vie absolue configurable (absolute)
// - Avertissement avant expiration d'inactivité avec option "rester connecté"
// - Synchronise la déconnexion entre onglets

const TOKEN_KEY = 'auth_token';
const LAST_ACTIVE_AT_KEY = 'auth_last_active';
const TOKEN_SET_AT_KEY = 'auth_set_at';

export interface SessionOptions {
  idleMinutes?: number; // défaut 30 min
  absoluteMinutes?: number; // ex: 8h d'absolue durée de vie
  warnBeforeIdleSec?: number; // ex: prévenir 60s avant l'expiration d'inactivité
  onLogout?: () => void; // callback quand on force le logout
  onWarnIdle?: (secondsLeft: number, keepAlive: () => void) => void; // avertissement avant auto-logout
}

let idleTimer: number | null = null;
let initialized = false;
let warnedThisCycle = false;

export function initSessionSecurity(options: SessionOptions = {}) {
  if (initialized) return;
  initialized = true;

  const idleMinutes = options.idleMinutes ?? 30;
  const absoluteMinutes = options.absoluteMinutes; // undefined => pas d'absolute timeout
  const warnBeforeIdleSec = Math.max(0, options.warnBeforeIdleSec ?? 60);

  const idleMs = idleMinutes * 60 * 1000;
  const absoluteMs = absoluteMinutes ? absoluteMinutes * 60 * 1000 : undefined;

  const keepAlive = () => {
    // Utilisé par le modal d'avertissement pour prolonger la session (activité)
    markActivity();
  };

  const markActivity = () => {
    try {
      localStorage.setItem(LAST_ACTIVE_AT_KEY, String(Date.now()));
      warnedThisCycle = false; // reset l'avertissement si l'utilisateur est actif
    } catch {}
  };

  const checkIdle = () => {
    try {
      const last = Number(localStorage.getItem(LAST_ACTIVE_AT_KEY) || '0');
      if (!last) return; // pas encore initialisé
      const now = Date.now();
      const delta = now - last;

      // Avertissement en approche d'expiration d'inactivité
      const secondsLeft = Math.ceil((idleMs - delta) / 1000);
      if (secondsLeft > 0 && secondsLeft <= warnBeforeIdleSec && !warnedThisCycle) {
        warnedThisCycle = true;
        options.onWarnIdle?.(secondsLeft, keepAlive);
      }

      // Déconnexion si dépassement d'inactivité
      if (delta > idleMs) {
        localStorage.removeItem(TOKEN_KEY);
        options.onLogout?.();
      }
    } catch {}
  };

  const checkAbsolute = () => {
    if (!absoluteMs) return;
    try {
      const setAt = Number(localStorage.getItem(TOKEN_SET_AT_KEY) || '0');
      if (!setAt) return; // pas d'info
      const now = Date.now();
      if (now - setAt > absoluteMs) {
        // Durée absolue dépassée: on force la déconnexion
        localStorage.removeItem(TOKEN_KEY);
        options.onLogout?.();
      }
    } catch {}
  };

  // Marque l'activité sur interactions utilisateur
  ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'].forEach((evt) => {
    window.addEventListener(evt, markActivity, { passive: true });
  });
  markActivity();

  // Vérifie périodiquement l'inactivité et la durée absolue
  const loop = () => {
    checkIdle();
    checkAbsolute();
    idleTimer = window.setTimeout(loop, 30 * 1000); // check toutes les 30s
  };
  loop();

  // Synchronisation multi-onglet: si un autre onglet supprime le token
  window.addEventListener('storage', (e) => {
    if (e.key === TOKEN_KEY && !localStorage.getItem(TOKEN_KEY)) {
      options.onLogout?.();
    }
  });
}

export function stopSessionSecurity() {
  if (idleTimer) {
    clearTimeout(idleTimer);
    idleTimer = null;
  }
  initialized = false;
  warnedThisCycle = false;
}