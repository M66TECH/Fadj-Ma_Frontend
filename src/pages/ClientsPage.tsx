import React from 'react';
import apiService from '../services/api';
import type { PageName } from '../types';

interface Props {
  onNaviguer: (page: PageName) => void;
}

interface ClientItem {
  id?: string | number;
  nom?: string;
  name?: string;
  email?: string;
  telephone?: string;
  phone?: string;
}

const ClientsPage: React.FC<Props> = ({ onNaviguer }) => {
  const [items, setItems] = React.useState<ClientItem[]>([]);
  const [search, setSearch] = React.useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formNom, setFormNom] = React.useState('');
  const [formEmail, setFormEmail] = React.useState('');
  const [formTelephone, setFormTelephone] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const chargerClients = React.useCallback(async (q: string) => {
    try {
      const res = await apiService.obtenirClients(q ? { search: q } : undefined);
      const data = (res as any)?.data ?? [];
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    }
  }, []);

  React.useEffect(() => {
    let actif = true;
    const timer = setTimeout(() => {
      if (actif) chargerClients(search);
    }, 300);
    return () => { actif = false; clearTimeout(timer); };
  }, [search, chargerClients]);

  const ouvrirModalCreation = () => {
    setEditingId(null);
    setFormNom('');
    setFormEmail('');
    setFormTelephone('');
    setIsModalOpen(true);
  };

  const ouvrirModalEdition = (client: ClientItem) => {
    setEditingId(String(client.id ?? ''));
    setFormNom(client.nom ?? client.name ?? '');
    setFormEmail(client.email ?? '');
    setFormTelephone(client.telephone ?? client.phone ?? '');
    setIsModalOpen(true);
  };

  const fermerModal = () => {
    setIsModalOpen(false);
  };

  const sauvegarderClient = async () => {
    setSaving(true);
    try {
      const payload = { nom: formNom, email: formEmail, telephone: formTelephone };
      if (editingId) {
        await apiService.modifierClient(editingId, payload);
      } else {
        await apiService.creerClient(payload);
      }
      await chargerClients(search);
      setIsModalOpen(false);
    } catch (e) {
      alert("Erreur lors de l'enregistrement du client");
    } finally {
      setSaving(false);
    }
  };

  const supprimerClient = async (id: string | number | undefined) => {
    if (!id) return;
    if (!confirm('Supprimer ce client ?')) return;
    try {
      await apiService.supprimerClient(String(id));
      await chargerClients(search);
    } catch {
      alert('Suppression impossible');
    }
  };

  const filtres = items.filter((c) =>
    !search || String(c.nom ?? c.name ?? c.email ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-[#2c3e50]">Clients</h2>
      <div className="flex items-center gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un client"
          className="border rounded px-3 py-2 flex-1"
        />
        <button
          className="px-4 py-2 bg-[#bfe3f7] border border-[#b7c8d3] rounded"
          onClick={ouvrirModalCreation}
        >
          + Nouveau client
        </button>
        <button className="px-4 py-2 bg-gray-100 border rounded" onClick={() => onNaviguer('dashboard')}>Retour</button>
      </div>
      <div className="bg-white border rounded overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="p-3">Nom</th>
              <th className="p-3">Email</th>
              <th className="p-3">Téléphone</th>
              <th className="p-3 w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtres.map((c, i) => (
              <tr key={i} className="border-b">
                <td className="p-3">{c.nom ?? c.name ?? '—'}</td>
                <td className="p-3">{c.email ?? '—'}</td>
                <td className="p-3">{c.telephone ?? c.phone ?? '—'}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
                      onClick={() => ouvrirModalEdition(c)}
                    >
                      Éditer
                    </button>
                    <button
                      className="px-3 py-1 border rounded text-sm text-red-600 hover:bg-red-50"
                      onClick={() => supprimerClient(c.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtres.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">Aucun client</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded shadow-lg">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-[#2c3e50]">{editingId ? 'Modifier le client' : 'Nouveau client'}</h3>
              <button className="material-icons text-gray-500" onClick={fermerModal}>close</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nom</label>
                <input
                  value={formNom}
                  onChange={(e) => setFormNom(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Nom complet"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Téléphone</label>
                <input
                  value={formTelephone}
                  onChange={(e) => setFormTelephone(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="77 000 00 00"
                />
              </div>
            </div>
            <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
              <button className="px-4 py-2 border rounded" onClick={fermerModal} disabled={saving}>Annuler</button>
              <button
                className="px-4 py-2 rounded bg-[#bfe3f7] border border-[#b7c8d3]"
                onClick={sauvegarderClient}
                disabled={saving}
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;