import React from 'react';
import api from '../services/api';
import type { PageName, UserProfile } from '../types';

interface PropsProfilPage {
  onNaviguer: (page: PageName) => void;
}

const ProfilePage: React.FC<PropsProfilPage> = ({ onNaviguer }) => {
  const [profil, setProfil] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');

  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = React.useState('');

  React.useEffect(() => {
    const charger = async () => {
      try {
        setLoading(true); setError(null);
        const data = await api.obtenirProfil();
        const p = (data?.user ?? data) as UserProfile;
        setProfil(p || null);
        setName(p?.name || [p?.prenom, p?.nom].filter(Boolean).join(' ') || '');
        setEmail(p?.email || '');
      } catch (e: any) {
        setError(e?.message || 'Impossible de charger le profil');
      } finally {
        setLoading(false);
      }
    };
    void charger();
  }, []);

  const handleSaveIdentity = async () => {
    if (!name.trim() || !email.trim()) {
      setError('Nom et email sont requis.');
      return;
    }
    try {
      setError(null); setLoading(true);
      // Si le backend ne supporte pas encore cette route, ceci affichera un message approprié
      await api.modifierUtilisateur?.('me', { name, email } as any);
      alert('Profil mis à jour');
    } catch (e: any) {
      setError(e?.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      setError('Tous les champs de mot de passe sont requis.');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setError('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }
    try {
      setError(null); setLoading(true);
      await api.changerMotDePasse(currentPassword, newPassword, newPasswordConfirm);
      alert('Mot de passe changé avec succès');
      setCurrentPassword(''); setNewPassword(''); setNewPasswordConfirm('');
    } catch (e: any) {
      setError(e?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const displayName = profil?.name || [profil?.prenom, profil?.nom].filter(Boolean).join(' ') || 'Mon profil';

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#2c3e50]">Profil</h2>
          <p className="text-gray-600">Consultez et modifiez vos informations de profil</p>
        </div>
        <button className="px-4 py-2 rounded border" onClick={() => onNaviguer('dashboard')}>← Retour</button>
      </div>

      {error && <div className="mb-4 p-3 border border-red-300 text-red-700 rounded bg-red-50">{error}</div>}

      <div className="bg-white border rounded-md shadow-sm p-5 mb-6">
        <h3 className="text-lg font-semibold mb-4">Informations</h3>
        {loading ? (
          <div className="text-gray-500">Chargement…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nom complet</label>
              <input className="w-full border rounded px-3 py-2" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input type="email" className="w-full border rounded px-3 py-2" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button className="px-4 py-2 rounded bg-teal-600 text-white" disabled={loading} onClick={handleSaveIdentity}>Enregistrer</button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border rounded-md shadow-sm p-5">
        <h3 className="text-lg font-semibold mb-4">Changer le mot de passe</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Mot de passe actuel</label>
            <input type="password" className="w-full border rounded px-3 py-2" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nouveau mot de passe</label>
            <input type="password" className="w-full border rounded px-3 py-2" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Confirmer le nouveau mot de passe</label>
            <input type="password" className="w-full border rounded px-3 py-2" value={newPasswordConfirm} onChange={e => setNewPasswordConfirm(e.target.value)} />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <button className="px-4 py-2 rounded bg-teal-600 text-white" disabled={loading} onClick={handleChangePassword}>Mettre à jour</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;