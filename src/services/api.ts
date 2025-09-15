const RAW_BASE_API = import.meta.env.VITE_API_BASE_URL || 'https://fadj-ma-backend-u749.onrender.com/api';
const URL_BASE_API = RAW_BASE_API.replace(/\/+$/, '');

const TOKEN_STORAGE_KEY = 'auth_token';

class ServiceAPI {
  private token: string | null = null;

  definirToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }

  initDepuisStorage() {
    const t = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (t) this.token = t;
  }

  private async faireRequete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const endpointPath = endpoint.replace(/^\/+/, '');
    const url = `${URL_BASE_API}/${endpointPath}`;

    const isFormData = (options as any)?.body instanceof FormData;

    const headers: Record<string, string> = {
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    };

    if (!isFormData) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    // Log non-sensible de la requête
    try {
      const safeBody = isFormData
        ? '[FormData]'
        : (() => {
            try {
              const b = (options as any)?.body ? JSON.parse((options as any).body as string) : undefined;
              if (b && b.password) b.password = '[masked]';
              if (b && b.password_confirmation) b.password_confirmation = '[masked]';
              return JSON.stringify(b);
            } catch {
              return '[non-JSON body]';
            }
          })();
      console.log('[API REQUEST]', { url, method: (options as any)?.method || 'GET', headers, body: safeBody });
    } catch {}

    const reponse = await fetch(url, config);

    let payload: any = null;
    try {
      payload = await reponse.json();
    } catch {}

    if (!reponse.ok) {
      const message = payload?.message || `Erreur API: ${reponse.status}`;
      const err: any = new Error(message);
      err.status = reponse.status;
      err.errors = payload?.errors || payload?.data?.errors || null;
      err.payload = payload;
      err.url = url;
      err.method = (options as any)?.method || 'GET';
      // Log de l'erreur
      console.error('[API ERROR]', { url, status: reponse.status, payload: err.payload, errors: err.errors });
      throw err;
    }

    // Log succès (limité)
    console.log('[API SUCCESS]', { url });

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
      // Compat: le backend semble attendre "nom"; on envoie les deux
      name: donnees?.name ?? donnees?.nom ?? '',
      nom: donnees?.nom ?? donnees?.name ?? '',
      email: donnees?.email,
      password: donnees?.password,
      // Compat: certains backends attendent confirm_password
      password_confirmation:
        donnees?.password_confirmation ?? donnees?.confirm_password ?? donnees?.passwordConfirm ?? '',
      confirm_password:
        donnees?.confirm_password ?? donnees?.password_confirmation ?? donnees?.passwordConfirm ?? '',
      role: donnees?.role ?? 'employe',
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
    return this.faireRequete('me');
  }

  async obtenirStatistiques() {
    return this.faireRequete('stats');
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
}

export default new ServiceAPI();