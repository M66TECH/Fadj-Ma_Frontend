import React from 'react';

import type { PageName } from '../types';

import type { UserProfile } from '../types';

interface PropsBarreLaterale {
  pageActuelle: PageName;
  onNaviguer: (page: PageName) => void;
  profil?: UserProfile; // informations du profil connecté
}

const BarreLaterale: React.FC<PropsBarreLaterale> = ({ pageActuelle, onNaviguer, profil }) => {
  const handleLogout = () => {
    try {
      localStorage.removeItem('auth_token');
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    } catch {}
  };
  return (
    <aside className="w-64 bg-[#1E1E2D] text-white flex flex-col justify-between">
      <div>
        {/* Logo top: yellow square with custom cart + medical box icon + brand */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-[#2C2C3A]">
          <img src="/assets/app-icon.png" alt="Fadj-Ma" className="w-8 h-8 rounded-md ring-1 ring-black/15" />
          <h1 className="font-bold text-lg">Fadj-Ma</h1>
        </div>

        {/* User profile: avatar at left, name/role at right, more menu at far right */}
        <div className="px-4 py-4 border-b border-[#2C2C3A]">
          <button onClick={() => onNaviguer('profil')} className="w-full text-left" title="Voir mon profil">
            <div className="flex items-center gap-3">
              {/* Avatar dynamique avec fallback */}
              {(() => {
                const photo = profil?.photo_url || profil?.avatar_url || profil?.image_url;
                const altName = profil?.name || [profil?.prenom, profil?.nom].filter(Boolean).join(' ') || 'Utilisateur';
                if (photo) {
                  return (
                    <img
                      src={photo}
                      alt={altName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#2C2C3A]"
                    />
                  );
                }
                // Avatar par défaut (initiales)
                const initials = (altName || '')
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map(s => s[0]?.toUpperCase())
                  .join('') || 'U';
                return (
                  <div className="w-12 h-12 rounded-full bg-[#2C2C3A] border-2 border-[#2C2C3A] flex items-center justify-center text-white font-semibold">
                    {initials}
                  </div>
                );
              })()}

              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold truncate">
                  {profil?.name || [profil?.prenom, profil?.nom].filter(Boolean).join(' ') || 'Utilisateur'}
                </div>
                <div className="text-[#2ECC71] text-sm">{profil?.role || 'Utilisateur'}</div>
              </div>
              <span className="material-icons text-gray-400">chevron_right</span>
            </div>
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-4 space-y-2">
          <button
            className={`flex w-full items-center gap-2 px-3 py-2 rounded-md cursor-pointer ${
              pageActuelle === 'dashboard' ? 'bg-teal-600' : 'hover:bg-gray-800'
            }`}
            onClick={() => onNaviguer('dashboard')}
          >
            <span className="material-icons">dashboard</span>
            <span>Tableau de bord</span>
          </button>

          <button
            className={`flex w-full items-center gap-2 px-3 py-2 rounded-md cursor-pointer ${
              pageActuelle === 'medicaments' ? 'bg-teal-600' : 'hover:bg-gray-800'
            }`}
            onClick={() => onNaviguer('medicaments')}
          >
            <span className="material-icons">medication</span>
            <span>Médicaments</span>
          </button>
        </nav>
      </div>

      {/* Footer */}
      <div className="px-4 py-4 text-sm text-gray-400 border-t border-[#2C2C3A]">
        <button onClick={handleLogout} className="flex items-center gap-2 hover:text-white cursor-pointer">
          <span className="material-icons">logout</span>
          Déconnexion
        </button>
        <p className="mt-6 text-xs leading-tight">
          Propulsé par Red Team © 2024<br />version 1.12
        </p>
      </div>
    </aside>
  );
};

export default BarreLaterale;