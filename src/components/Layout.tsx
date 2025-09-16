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
    // Charger profil après connexion
    (async () => {
      try {
        const data = await (await import('../services/api')).default.obtenirProfil();
        if (mounted) setProfil(data?.user ?? data); // support { user } ou direct
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
