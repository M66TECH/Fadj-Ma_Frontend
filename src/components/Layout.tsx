import React from 'react';
import BarreLaterale from './BarreLaterale';
import EnTete from './EnTete';
import type { PageName } from '../types';

import type { UserProfile } from '../types';

interface PropsLayout {
  enfants: React.ReactNode;
  pageActuelle: PageName;
  onNaviguer: (page: PageName) => void;
}

const Layout: React.FC<PropsLayout> = ({ enfants, pageActuelle, onNaviguer }) => {
  // État local du profil (peut venir du parent dans une itération future)
  const [profil, setProfil] = React.useState<UserProfile | null>(null);

  React.useEffect(() => {
    let mounted = true;
    // Charger profil après connexion — sans forcer la déconnexion si 401
    (async () => {
      try {
        const RAW = (import.meta as any).env?.VITE_API_BASE_URL || 'https://fadj-ma-backend-u749.onrender.com/api';
        const BASE = String(RAW).replace(/\/+$/, '');
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`${BASE}/me`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) return; // ne pas propager => évite déconnexion immédiate
        const payload: any = await res.json().catch(() => null);
        const data = payload?.data ?? payload;
        if (mounted) setProfil(data?.user ?? data);
      } catch {
        // ignorer les erreurs silencieusement, profil restera null
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="h-screen bg-gray-100 flex">
      <BarreLaterale pageActuelle={pageActuelle} onNaviguer={onNaviguer} profil={profil || undefined} />
      <main className="flex-1 flex flex-col">
        <EnTete />
        <div className="flex-1 p-6 overflow-y-auto">
          {enfants}
        </div>
      </main>
    </div>
  );
};

export default Layout;
