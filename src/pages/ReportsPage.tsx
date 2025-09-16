import React from 'react';
import api from '../services/api';
import type { PageName } from '../types';

interface Props {
  onNaviguer: (page: PageName) => void;
}

type Tab = 'inventaire' | 'ventes' | 'financier' | 'commandes';

const ReportsPage: React.FC<Props> = ({ onNaviguer }) => {
  const [tab, setTab] = React.useState<Tab>('inventaire');

  // Ventes
  const [dateDebut, setDateDebut] = React.useState<string>('');
  const [dateFin, setDateFin] = React.useState<string>('');
  const [clientId, setClientId] = React.useState<string>('');

  // Financier
  const [mois, setMois] = React.useState<number>(new Date().getMonth() + 1);
  const [annee, setAnnee] = React.useState<number>(new Date().getFullYear());

  // Commandes
  const [cmdDateDebut, setCmdDateDebut] = React.useState<string>('');
  const [cmdDateFin, setCmdDateFin] = React.useState<string>('');
  const [fournisseurId, setFournisseurId] = React.useState<string>('');

  const [chargement, setChargement] = React.useState(false);
  const [erreur, setErreur] = React.useState<string | null>(null);
  const [apercu, setApercu] = React.useState<any | null>(null);

  const telecharger = async () => {
    setErreur(null);
    setChargement(true);
    try {
      if (tab === 'inventaire') {
        const { blob, filename } = await api.telechargerRapportInventaire();
        triggerDownload(blob, filename || 'rapport-inventaire.pdf');
      } else if (tab === 'ventes') {
        const { blob, filename } = await api.telechargerRapportVentes({ date_debut: dateDebut || undefined, date_fin: dateFin || undefined, client_id: clientId || undefined });
        triggerDownload(blob, filename || 'rapport-ventes.pdf');
      } else if (tab === 'financier') {
        const { blob, filename } = await api.telechargerRapportFinancier({ mois, annee });
        triggerDownload(blob, filename || `rapport-financier-${annee}-${String(mois).padStart(2, '0')}.pdf`);
      } else if (tab === 'commandes') {
        // En développement — JSON
        const res = await api.getRapportCommandes({ date_debut: cmdDateDebut || undefined, date_fin: cmdDateFin || undefined, fournisseur_id: fournisseurId || undefined });
        setApercu(res);
      }
    } catch (e: any) {
      // Si le backend a renvoyé JSON (422/500), afficher le message
      const msg = e?.payload?.message || e?.message || 'Erreur lors du téléchargement';
      setErreur(msg);
    } finally {
      setChargement(false);
    }
  };

  const triggerDownload = (blob: Blob, fallbackName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fallbackName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const chargerApercuAuto = async () => {
    setErreur(null);
    setApercu(null);
    if (tab === 'commandes') {
      setChargement(true);
      try {
        const res = await api.getRapportCommandes({ date_debut: cmdDateDebut || undefined, date_fin: cmdDateFin || undefined, fournisseur_id: fournisseurId || undefined });
        setApercu(res);
      } catch (e: any) {
        setErreur(e?.payload?.message || e?.message || 'Erreur lors du chargement');
      } finally {
        setChargement(false);
      }
    }
  };

  React.useEffect(() => {
    chargerApercuAuto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, cmdDateDebut, cmdDateFin, fournisseurId]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#2c3e50]">Rapports</h2>
        <button className="px-3 py-2 border rounded" onClick={() => onNaviguer('dashboard')}>Retour</button>
      </div>

      {/* Tabs */}
      <div className="border-b mb-4 flex gap-2">
        {(['inventaire','ventes','financier','commandes'] as Tab[]).map(t => (
          <button
            key={t}
            className={`px-3 py-2 rounded-t ${tab===t?'bg-white border border-b-0':'bg-gray-100 border-transparent'}`}
            onClick={() => setTab(t)}
          >{t}</button>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-white border rounded p-4 mb-6 flex flex-wrap items-end gap-3">
        {tab === 'inventaire' && (
          <p className="text-gray-600">Rapport d'inventaire — aucun paramètre requis.</p>
        )}
        {tab === 'ventes' && (
          <>
            <div>
              <label className="block text-sm mb-1">Date début</label>
              <input type="date" className="border rounded px-2 py-1" value={dateDebut} onChange={e=>setDateDebut(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1">Date fin</label>
              <input type="date" className="border rounded px-2 py-1" value={dateFin} onChange={e=>setDateFin(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1">Client ID</label>
              <input type="text" className="border rounded px-2 py-1" value={clientId} onChange={e=>setClientId(e.target.value)} placeholder="(optionnel)" />
            </div>
          </>
        )}
        {tab === 'financier' && (
          <>
            <div>
              <label className="block text-sm mb-1">Mois</label>
              <select className="border rounded px-2 py-1" value={mois} onChange={(e)=>setMois(Number(e.target.value))}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Année</label>
              <select className="border rounded px-2 py-1" value={annee} onChange={(e)=>setAnnee(Number(e.target.value))}>
                {Array.from({ length: 11 }, (_, i) => 2020 + i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </>
        )}
        {tab === 'commandes' && (
          <>
            <div>
              <label className="block text-sm mb-1">Date début</label>
              <input type="date" className="border rounded px-2 py-1" value={cmdDateDebut} onChange={e=>setCmdDateDebut(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1">Date fin</label>
              <input type="date" className="border rounded px-2 py-1" value={cmdDateFin} onChange={e=>setCmdDateFin(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1">Fournisseur ID</label>
              <input type="text" className="border rounded px-2 py-1" value={fournisseurId} onChange={e=>setFournisseurId(e.target.value)} placeholder="(optionnel)" />
            </div>
            <div className="text-sm text-gray-600">Rapport en cours de développement — JSON uniquement.</div>
          </>
        )}

        <button
          className="ml-auto px-4 py-2 bg-teal-600 text-white rounded disabled:opacity-60"
          onClick={telecharger}
          disabled={chargement}
        >
          {chargement ? 'Préparation...' : (tab==='commandes' ? 'Charger JSON' : 'Télécharger le PDF')}
        </button>
      </div>

      {erreur && (
        <div className="mb-4 text-red-600 text-sm">{erreur}</div>
      )}

      <div className="bg-white border rounded p-4">
        <h3 className="font-semibold text-[#2c3e50] mb-3">Aperçu</h3>
        {!apercu && !chargement && <p className="text-gray-500">Aucun contenu à afficher.</p>}
        {chargement && <p className="text-gray-500">Chargement...</p>}
        {!!apercu && (
          <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-96">{JSON.stringify(apercu, null, 2)}</pre>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;