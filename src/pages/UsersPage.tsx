import React from 'react';
import apiService from '../services/api';
import type { PageName } from '../types';

interface Props {
  onNaviguer: (page: PageName) => void;
}

// Type utilisateur souple (le backend peut varier)
interface Utilisateur {
  id: string;
  nom?: string;
  name?: string;
  email?: string;
  role?: string; // 'admin' | 'employe' | ...
}

const normaliserUsers = (payload: any): Utilisateur[] => {
  const data = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : payload?.items ?? [];
  return Array.isArray(data) ? data : [];
};

const UsersPage: React.FC<Props> = ({ onNaviguer }) => {
  const [chargement, setChargement] = React.useState<boolean>(false);
  const [utilisateurs, setUtilisateurs] = React.useState<Utilisateur[]>([]);
  const [recherche, setRecherche] = React.useState<string>('');

  const [erreur, setErreur] = React.useState<string | null>(null);
  const [succes, setSucces] = React.useState<string | null>(null);

  // Modals/form
  const [ouvertNouveau, setOuvertNouveau] = React.useState<boolean>(false);
  const [ouvertEdition, setOuvertEdition] = React.useState<{ open: boolean; user?: Utilisateur | null }>({ open: false, user: null });

  const [form, setForm] = React.useState<{ nom: string; email: string; role: string; password?: string }>({ nom: '', email: '', role: 'employe', password: '' });

  const charger = React.useCallback(async (q?: string) => {
    try {
      setErreur(null);
      setChargement(true);
      const res = await apiService.obtenirUtilisateurs(q ? { search: q } : undefined) as any;
      const list = normaliserUsers(res);
      setUtilisateurs(list);
    } catch (e: any) {
      setErreur(e?.message || 'Erreur lors du chargement des utilisateurs');
    } finally {
      setChargement(false);
    }
  }, []);

  React.useEffect(() => { void charger(); }, [charger]);

  // Debounce recherche simple
  React.useEffect(() => {
    const t = setTimeout(() => { void charger(recherche.trim() || undefined); }, 350);
    return () => clearTimeout(t);
  }, [recherche, charger]);

  const ouvrirCreation = () => {
    setForm({ nom: '', email: '', role: 'employe', password: '' });
    setOuvertNouveau(true);
  };

  const ouvrirEdition = (u: Utilisateur) => {
    setForm({ nom: u.nom || u.name || '', email: u.email || '', role: u.role || 'employe', password: '' });
    setOuvertEdition({ open: true, user: u });
  };

  const submitCreation = async () => {
    try {
      setErreur(null); setSucces(null);
      const payload: any = { nom: form.nom, email: form.email, role: form.role };
      if (form.password) payload.password = form.password;
      await apiService.creerUtilisateur(payload);
      setSucces('Utilisateur créé avec succès');
      setOuvertNouveau(false);
      await charger(recherche.trim() || undefined);
    } catch (e: any) {
      setErreur(e?.message || 'Erreur lors de la création');
    }
  };

  const submitEdition = async () => {
    if (!ouvertEdition.user?.id) return;
    try {
      setErreur(null); setSucces(null);
      const payload: any = { nom: form.nom, email: form.email, role: form.role };
      if (form.password) payload.password = form.password; // optionnel
      await apiService.modifierUtilisateur(ouvertEdition.user.id, payload);
      setSucces('Utilisateur modifié avec succès');
      setOuvertEdition({ open: false, user: null });
      await charger(recherche.trim() || undefined);
    } catch (e: any) {
      setErreur(e?.message || 'Erreur lors de la modification');
    }
  };

  const supprimer = async (u: Utilisateur) => {
    if (!u.id) return;
    if (!confirm(`Supprimer l'utilisateur ${u.nom || u.name || u.email}?`)) return;
    try {
      setErreur(null); setSucces(null);
      await apiService.supprimerUtilisateur(u.id);
      setSucces('Utilisateur supprimé');
      await charger(recherche.trim() || undefined);
    } catch (e: any) {
      setErreur(e?.message || "Erreur lors de la suppression");
    }
  };

  const rendreModal = (type: 'creation' | 'edition') => {
    const isOpen = type === 'creation' ? ouvertNouveau : ouvertEdition.open;
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-md shadow-lg p-6 w-[95%] max-w-md">
          <h3 className="text-lg font-semibold mb-4 text-[#2c3e50]">
            {type === 'creation' ? 'Nouvel utilisateur' : `Modifier l'utilisateur`}
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nom</label>
              <input className="w-full border rounded px-3 py-2" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input type="email" className="w-full border rounded px-3 py-2" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Rôle</label>
              <select className="w-full border rounded px-3 py-2" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="admin">Admin</option>
                <option value="employe">Employé</option>
                <option value="user">Utilisateur</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Mot de passe {type === 'edition' ? '(laisser vide pour ne pas changer)' : ''}</label>
              <input type="password" className="w-full border rounded px-3 py-2" value={form.password || ''} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-6">
            <button className="px-4 py-2 rounded border" onClick={() => type === 'creation' ? setOuvertNouveau(false) : setOuvertEdition({ open: false, user: null })}>Annuler</button>
            <button className="px-4 py-2 rounded bg-teal-600 text-white" onClick={() => type === 'creation' ? submitCreation() : submitEdition()}>
              {type === 'creation' ? 'Créer' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#2c3e50]">Gestion des utilisateurs</h2>
          <p className="text-gray-600">Créez, modifiez et supprimez les utilisateurs de votre pharmacie</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded border" onClick={() => onNaviguer('dashboard')}>Retour au tableau de bord</button>
          <button className="px-4 py-2 rounded bg-teal-600 text-white" onClick={ouvrirCreation}>Nouvel utilisateur</button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <input
          placeholder="Rechercher par nom ou email"
          className="border rounded px-3 py-2 w-full max-w-md"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />
        <button className="px-3 py-2 border rounded" onClick={() => charger(recherche.trim() || undefined)}>Rechercher</button>
      </div>

      {erreur && <div className="mb-4 p-3 border border-red-300 text-red-700 rounded bg-red-50">{erreur}</div>}
      {succes && <div className="mb-4 p-3 border border-green-300 text-green-700 rounded bg-green-50">{succes}</div>}

      <div className="bg-white border rounded-md shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr className="text-sm text-gray-600">
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {chargement ? (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={4}>Chargement...</td>
              </tr>
            ) : utilisateurs.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={4}>Aucun utilisateur</td>
              </tr>
            ) : (
              utilisateurs.map((u) => (
                <tr key={u.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3 font-medium text-[#2c3e50]">{u.nom || u.name || '—'}</td>
                  <td className="px-4 py-3">{u.email || '—'}</td>
                  <td className="px-4 py-3 capitalize">{u.role || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button className="px-3 py-1 text-sm border rounded" onClick={() => ouvrirEdition(u)}>Modifier</button>
                      <button className="px-3 py-1 text-sm border rounded text-red-600 border-red-300" onClick={() => supprimer(u)}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {rendreModal('creation')}
      {rendreModal('edition')}
    </div>
  );
};

export default UsersPage;