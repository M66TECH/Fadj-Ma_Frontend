const RAW_BASE_API = import.meta.env.VITE_API_BASE_URL || 'https://fadj-ma-backend-u749.onrender.com/api';
const URL_BASE_API = RAW_BASE_API.replace(/\/+$/, '');

const TOKEN_STORAGE_KEY = 'auth_token';
const TOKEN_SET_AT_KEY = 'auth_set_at';
const LAST_ACTIVE_AT_KEY = 'auth_last_active';

class ServiceAPI {
  private token: string | null = null;
  private storageListenerInit = false;

  definirToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.setItem(TOKEN_SET_AT_KEY, String(Date.now()));
      localStorage.setItem(LAST_ACTIVE_AT_KEY, String(Date.now()));
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(TOKEN_SET_AT_KEY);
      localStorage.removeItem(LAST_ACTIVE_AT_KEY);
    }
  }

  initDepuisStorage() {
    const t = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (t) this.token = t;

    if (!this.storageListenerInit) {
      this.storageListenerInit = true;
      window.addEventListener('storage', (e) => {
        if (e.key === TOKEN_STORAGE_KEY) {
          const nv = localStorage.getItem(TOKEN_STORAGE_KEY);
          this.token = nv;
          if (!nv) {
            try { window.dispatchEvent(new CustomEvent('auth:unauthorized')); } catch {}
          }
        }
      });
    }
  }

  estAuthentifie() {
    return !!this.token;
  }

  private async faireRequete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const endpointPath = endpoint.replace(/^\/+/, '');
    const url = `${URL_BASE_API}/${endpointPath}`;

    try { localStorage.setItem(LAST_ACTIVE_AT_KEY, String(Date.now())); } catch {}

    const isFormData = (options as any)?.body instanceof FormData;

    const headers: Record<string, string> = {
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    };

    if (!isFormData) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    // Timeout via AbortController
    const timeoutMs = (options as any)?.timeoutMs ?? 15000; // 15s par défaut
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort('timeout'), timeoutMs);

    const config: RequestInit = {
      ...options,
      headers,
      signal: controller.signal,
    };

    const method = (options as any)?.method || 'GET';
    const safeHeaders = {
      ...headers,
      ...(headers.Authorization ? { Authorization: 'Bearer <redacted>' } : {}),
    } as Record<string, string>;
    const bodyPreview = isFormData
      ? '[form-data]'
      : (typeof (options as any)?.body === 'string'
          ? (options as any).body
          : (options as any)?.body
            ? (() => { try { return JSON.stringify((options as any).body).slice(0, 500); } catch { return '[unserializable-body]'; } })()
            : undefined);

    // Réduire le bruit de logs en prod
    if (import.meta.env.DEV) {
      console.debug('[API REQUEST]', { url, method, headers: safeHeaders, bodyPreview });
    }

    let reponse: Response;
    try {
      reponse = await fetch(url, config);
    } catch (e: any) {
      clearTimeout(timeoutId);
      if (e?.name === 'AbortError' || e === 'timeout') {
        const err: any = new Error('Délai de la requête dépassé');
        err.status = 0;
        err.url = url;
        err.method = method;
        throw err;
      }
      throw e;
    }

    clearTimeout(timeoutId);

    let payload: any = null;
    try {
      payload = await reponse.json();
    } catch {}

    if (import.meta.env.DEV) {
      try {
        const preview = typeof payload === 'object' ? JSON.stringify(payload).slice(0, 1000) : String(payload);
        console.debug('[API RESPONSE]', { url, status: reponse.status, ok: reponse.ok, payloadPreview: preview });
      } catch {}
    }

    if (!reponse.ok) {
      const message = payload?.message || `Erreur API: ${reponse.status}`;
      const err: any = new Error(message);
      err.status = reponse.status;
      err.errors = payload?.errors || payload?.data?.errors || null;
      err.payload = payload;
      err.url = url;
      err.method = (options as any)?.method || 'GET';

      if ([401, 403, 419].includes(reponse.status)) {
        this.definirToken(null);
        try { window.dispatchEvent(new CustomEvent('auth:unauthorized')); } catch {}
      }

      throw err;
    }

    return payload as T;
  }

  // ===== Authentification =====
  async seConnecter(email: string, motDePasse: string) {
    const res = await this.faireRequete<{ success: boolean; data?: { token: string } }>('login', {
      method: 'POST',
      body: JSON.stringify({ email, password: motDePasse }),
    });
    const token = res?.data?.token;
    if (token) this.definirToken(token);
    return res;
  }

  async sInscrire(donnees: any) {
    const payload = {
      name: donnees?.name ?? donnees?.nom ?? '',
      nom: donnees?.nom ?? donnees?.name ?? '',
      email: donnees?.email,
      password: donnees?.password,
      password_confirmation:
        donnees?.password_confirmation ?? donnees?.confirm_password ?? donnees?.passwordConfirm ?? '',
      confirm_password:
        donnees?.confirm_password ?? donnees?.password_confirmation ?? donnees?.passwordConfirm ?? '',
      role: donnees?.role ?? 'admin',
    };

    const res = await this.faireRequete<{ success: boolean; data?: { token: string } }>('register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const token = res?.data?.token;
    if (token) this.definirToken(token);
    return res;
  }

  async deconnecter() {
    return this.faireRequete('logout', { method: 'POST' });
  }

  async changerMotDePasse(current_password: string, new_password: string, new_password_confirmation: string) {
    return this.faireRequete('change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password, new_password_confirmation }),
    });
  }

  async obtenirProfil() {
    const res = await this.faireRequete<any>('me');
    // Essaye de normaliser la forme
    const data = res?.data ?? res;
    return data;
  }

  async obtenirStatistiques() {
    return this.faireRequete('stats');
  }

  // ===== Dashboard =====
  async obtenirDashboard() {
    return this.faireRequete('dashboard');
  }

  async obtenirStatsParPeriode(params: { periode: 'jour' | 'semaine' | 'mois' | 'annee'; mois?: number; annee?: number; }) {
    const q = new URLSearchParams();
    q.set('periode', params.periode);
    if (params.mois) q.set('mois', String(params.mois));
    if (params.annee) q.set('annee', String(params.annee));
    return this.faireRequete(`dashboard/stats-by-period?${q.toString()}`);
  }

  async obtenirRapportRevenus(params: { mois: number; annee: number }) {
    const q = new URLSearchParams({ mois: String(params.mois), annee: String(params.annee) });
    return this.faireRequete(`dashboard/rapport-revenus?${q.toString()}`);
  }

  async telechargerRapportDashboard(): Promise<Blob> {
    // Récupère un rapport binaire (PDF/ZIP)
    const url = `${URL_BASE_API}/dashboard/telecharger-rapport`;
    const res = await fetch(url, {
      method: 'GET',
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : undefined,
    });
    if (!res.ok) throw new Error(`Erreur téléchargement: ${res.status}`);
    return await res.blob();
  }

  // ===== Rapports (PDF) =====
  private async telechargerBinaire(pathWithQs: string): Promise<{ blob: Blob; filename?: string; contentType?: string }> {
    const endpointPath = pathWithQs.replace(/^\/+/, '');
    const url = `${URL_BASE_API}/${endpointPath}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : undefined,
    });
    const contentType = res.headers.get('content-type') || undefined;

    if (!res.ok) {
      let payload: any = null;
      if (contentType?.includes('application/json')) {
        try { payload = await res.json(); } catch {}
      }
      const err: any = new Error(payload?.message || `Erreur API: ${res.status}`);
      err.status = res.status;
      err.payload = payload;
      err.url = url;
      err.method = 'GET';
      if ([401, 403, 419].includes(res.status)) {
        this.definirToken(null);
        try { window.dispatchEvent(new CustomEvent('auth:unauthorized')); } catch {}
      }
      throw err;
    }

    const cd = res.headers.get('content-disposition') || '';
    const match = cd.match(/filename=\"?([^\";]+)\"?/i);
    const filename = match?.[1];
    const blob = await res.blob();
    return { blob, filename, contentType };
  }

  async telechargerRapportInventaire(): Promise<{ blob: Blob; filename?: string }> {
    return this.telechargerBinaire('rapports/inventaire');
  }

  async telechargerRapportVentes(params?: { date_debut?: string; date_fin?: string; client_id?: string }): Promise<{ blob: Blob; filename?: string }> {
    const q = new URLSearchParams();
    if (params?.date_debut) q.set('date_debut', params.date_debut);
    if (params?.date_fin) q.set('date_fin', params.date_fin);
    if (params?.client_id) q.set('client_id', params.client_id);
    const qs = q.toString();
    return this.telechargerBinaire(`rapports/ventes${qs ? `?${qs}` : ''}`);
  }

  async telechargerRapportFinancier(params?: { mois?: number; annee?: number }): Promise<{ blob: Blob; filename?: string }> {
    const q = new URLSearchParams();
    if (typeof params?.mois === 'number') q.set('mois', String(params.mois));
    if (typeof params?.annee === 'number') q.set('annee', String(params.annee));
    const qs = q.toString();
    return this.telechargerBinaire(`rapports/financier${qs ? `?${qs}` : ''}`);
  }

  async getRapportCommandes(params?: { date_debut?: string; date_fin?: string; fournisseur_id?: string }) {
    const q = new URLSearchParams();
    if (params?.date_debut) q.set('date_debut', params.date_debut);
    if (params?.date_fin) q.set('date_fin', params.date_fin);
    if (params?.fournisseur_id) q.set('fournisseur_id', params.fournisseur_id);
    const qs = q.toString();
    return this.faireRequete(`rapports/commandes${qs ? `?${qs}` : ''}`);
  }

  // ===== Recherche =====
  async rechercher(terme: string) {
    return this.faireRequete(`search?q=${encodeURIComponent(terme)}`);
  }

  async rechercheRapide(terme: string) {
    return this.faireRequete(`search/quick?q=${encodeURIComponent(terme)}`);
  }

  async rechercherMedicaments(terme: string) {
    return this.faireRequete(`medicaments/search?q=${encodeURIComponent(terme)}`);
  }

  // ===== Médicaments =====
  async obtenirMedicaments() {
    return this.faireRequete('medicaments');
  }

  async obtenirMedicament(id: string) {
    return this.faireRequete(`medicaments/${id}`);
  }

  async creerMedicament(donnees: any) {
    return this.faireRequete('medicaments', {
      method: 'POST',
      body: JSON.stringify(donnees),
    });
  }

  async modifierMedicament(id: string, donnees: any) {
    return this.faireRequete(`medicaments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(donnees),
    });
  }

  async supprimerMedicament(id: string) {
    return this.faireRequete(`medicaments/${id}`, {
      method: 'DELETE',
    });
  }

  async mettreAJourStockMedicament(id: string, action: 'increment' | 'decrement' | 'set', quantite: number) {
    return this.faireRequete(`medicaments/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ action, quantite }),
    });
  }

  // ===== Images Médicaments =====
  async uploadImageMedicament(id: string, file: File) {
    const form = new FormData();
    form.append('image', file);
    return this.faireRequete(`medicaments/${id}/image`, {
      method: 'POST',
      body: form,
    });
  }

  async supprimerImageMedicament(id: string) {
    return this.faireRequete(`medicaments/${id}/image`, { method: 'DELETE' });
  }

  urlImageMedicament(id: string) {
    return `${URL_BASE_API}/medicaments/${id}/image`;
  }

  async uploadGalerieMedicament(id: string, files: File[]) {
    const form = new FormData();
    for (const f of files) form.append('images[]', f);
    return this.faireRequete(`medicaments/${id}/gallery`, {
      method: 'POST',
      body: form,
    });
  }

  // ===== Groupes =====
  async obtenirGroupes() {
    return this.faireRequete('groupes-medicaments');
  }

  // ===== Clients =====
  async obtenirClients(params?: { search?: string }) {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    const qs = q.toString();
    return this.faireRequete(`clients${qs ? `?${qs}` : ''}`);
  }

  async creerClient(donnees: { nom?: string; email?: string; telephone?: string }) {
    return this.faireRequete('clients', {
      method: 'POST',
      body: JSON.stringify(donnees),
    });
  }

  async modifierClient(id: string, donnees: { nom?: string; email?: string; telephone?: string }) {
    return this.faireRequete(`clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(donnees),
    });
  }

  async supprimerClient(id: string) {
    return this.faireRequete(`clients/${id}`, { method: 'DELETE' });
  }

  // ===== Utilisateurs =====
  async obtenirUtilisateurs(params?: { search?: string }) {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    const qs = q.toString();
    return this.faireRequete(`users${qs ? `?${qs}` : ''}`);
  }

  async creerUtilisateur(donnees: any) {
    return this.faireRequete('users', {
      method: 'POST',
      body: JSON.stringify(donnees),
    });
  }

  async modifierUtilisateur(id: string, donnees: any) {
    return this.faireRequete(`users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(donnees),
    });
  }

  async supprimerUtilisateur(id: string) {
    return this.faireRequete(`users/${id}`, { method: 'DELETE' });
  }
}

export default new ServiceAPI();