import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

import type { PageName } from '../types';

interface TableauDeBordProps {
  onNaviguer: (page: PageName) => void;
}

const TableauDeBord: React.FC<TableauDeBordProps> = ({ onNaviguer }) => {
  const [statistiques, setStatistiques] = useState({
    total_medicaments: 0,
    total_clients: 0,
    total_fournisseurs: 0,
    total_factures: 0,
    medicaments_stock_faible: 0,
    chiffre_affaires_mois: 0,
  });

  const [periodeSelectionnee, setPeriodeSelectionnee] = useState('mois');
  const [mois, setMois] = useState<number>(new Date().getMonth() + 1);
  const [annee, setAnnee] = useState<number>(new Date().getFullYear());
  const [groupesCount, setGroupesCount] = useState<number | null>(null);
  const [rapportRapide, setRapportRapide] = useState({
    quantiteVendu: 0,
    facturesGenerees: 0,
    articleFrequent: ''
  });

  useEffect(() => {
    const charger = async () => {
      // Parallélise stats et groupes pour réduire le temps d'attente initial
      const [statsRes, groupesRes] = await Promise.allSettled([
        apiService.obtenirStatistiques() as Promise<{ data: any }>,
        apiService.obtenirGroupes() as Promise<{ data: any[] }>,
      ]);

      if (statsRes.status === 'fulfilled') {
        const s = statsRes.value?.data || {};
        setStatistiques({
          total_medicaments: Number(s.total_medicaments ?? 0),
          total_clients: Number(s.total_clients ?? 0),
          total_fournisseurs: Number(s.total_fournisseurs ?? 0),
          total_factures: Number(s.total_factures ?? 0),
          medicaments_stock_faible: Number(s.medicaments_stock_faible ?? 0),
          chiffre_affaires_mois: Number(s.chiffre_affaires_mois ?? 0),
        });
      }

      if (groupesRes.status === 'fulfilled') {
        const gs = groupesRes.value;
        const count = Array.isArray(gs?.data) ? gs.data.length : Number((gs as any)?.data?.count ?? 0);
        setGroupesCount(count);
      } else {
        setGroupesCount(null);
      }
    };
    // Lance sans bloquer l'UI
    void charger();
  }, []);

  useEffect(() => {
    const chargerRapportRapide = async () => {
      // Parallélise les deux appels du rapport rapide
      const [statsPeriodeRes, revenusRes] = await Promise.allSettled([
        apiService.obtenirStatsParPeriode({ periode: 'mois', mois, annee }) as Promise<{ data: any }>,
        apiService.obtenirRapportRevenus({ mois, annee }) as Promise<{ data: any }>,
      ]);

      if (statsPeriodeRes.status === 'fulfilled') {
        const d = statsPeriodeRes.value?.data || {};
        setRapportRapide(prev => ({
          ...prev,
          quantiteVendu: Number(d.quantite_medicaments_vendus ?? 0),
          facturesGenerees: Number(d.nombre_factures ?? 0),
        }));
      }

      if (revenusRes.status === 'fulfilled') {
        const top = revenusRes.value?.data?.top_medicaments?.[0];
        setRapportRapide(prev => ({
          ...prev,
          articleFrequent: top?.medicament?.nom ?? top?.medicament_nom ?? ''
        }));
      }
    };
    void chargerRapportRapide();
  }, [mois, annee]);

  const formaterMonnaie = (montant: number) => {
    return new Intl.NumberFormat('fr-FR').format(montant) + ' FCFA';
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#2c3e50] mb-2">Tableau de bord</h2>
          <p className="text-gray-600 text-lg">Un aperçu rapide des données de votre pharmacie</p>
        </div>
        <button
          className="flex items-center gap-2 border px-4 py-2 rounded-md hover:bg-gray-50"
          onClick={() => onNaviguer('rapports')}
        >
          <span className="material-icons">download</span>
          Télécharger le rapport
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Bien */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-green-300">
          <div className="flex flex-col items-center text-center">
            <span className="material-icons text-[#2ECC71] text-4xl">shield</span>
            <h3 className="text-lg font-semibold text-[#2c3e50] mt-2">Bien</h3>
            <p className="text-gray-600 text-sm">Statut de l'inventaire</p>
            <button onClick={() => onNaviguer('rapports')} className="mt-4 w-full bg-[#bfe3f7] text-[#2c3e50] border border-[#b7c8d3] px-4 py-2 rounded-md text-sm font-semibold">
              Afficher le rapport détaillé »
            </button>
          </div>
        </div>

        {/* Revenu */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-yellow-300">
          <div className="flex flex-col items-center text-center">
            <span className="material-icons text-[#F1C40F] text-4xl">account_balance_wallet</span>
            <h3 className="text-lg font-bold text-[#2c3e50] mt-2">{formaterMonnaie(statistiques.chiffre_affaires_mois)}</h3>
            <p className="text-gray-600 text-sm">
              Revenu : {" "}
              <span className="align-middle">
                <select
                  value={periodeSelectionnee}
                  onChange={(e) => setPeriodeSelectionnee(e.target.value)}
                  className="bg-transparent border-none text-[#2c3e50] font-medium cursor-pointer"
                >
                  <option value="janvier 2022">janvier 2022</option>
                  <option value="février 2022">février 2022</option>
                </select>
              </span>
            </p>
            <button onClick={() => onNaviguer('rapports')} className="mt-4 w-full bg-yellow-200 text-[#2c3e50] px-4 py-2 rounded-md text-sm font-semibold">
              Afficher le rapport détaillé »
            </button>
          </div>
        </div>

        {/* Médicaments disponibles */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-blue-300">
          <div className="flex flex-col items-center text-center">
            <span className="material-icons text-[#3498DB] text-4xl">medical_services</span>
            <h3 className="text-lg font-bold text-[#2c3e50] mt-2">{statistiques.total_medicaments}</h3>
            <p className="text-gray-600 text-sm">Médicaments disponibles</p>
            <button onClick={() => onNaviguer('medicaments')} className="mt-4 w-full bg-[#bfe3f7] text-[#2c3e50] border border-[#b7c8d3] px-4 py-2 rounded-md text-sm font-semibold">
              Visiter l'inventaire »
            </button>
          </div>
        </div>

        {/* Pénurie */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-red-300">
          <div className="flex flex-col items-center text-center">
            <span className="material-icons text-[#E74C3C] text-4xl">warning</span>
            <h3 className="text-lg font-bold text-[#2c3e50] mt-2">{String(statistiques.medicaments_stock_faible).padStart(2, '0')}</h3>
            <p className="text-gray-600 text-sm">Pénurie de médicaments</p>
            <button onClick={() => onNaviguer('medicaments')} className="mt-4 w-full bg-red-100 text-[#2c3e50] px-4 py-2 rounded-md text-sm font-semibold">
              Résoudre maintenant »
            </button>
          </div>
        </div>
      </div>

      {/* Bottom sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inventaire */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 className="font-semibold text-[#2c3e50]">Inventaire</h3>
            <button onClick={() => onNaviguer('medicaments')} className="text-sm text-[#2c3e50] flex items-center gap-2">
              Aller à l'inventaire <span className="material-icons text-sm">chevron_right</span>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-6 px-6 py-6">
            <div>
              <p className="text-3xl font-bold text-[#2c3e50]">{statistiques.total_medicaments}</p>
              <p className="text-gray-500 text-sm">Nombre total de médicaments</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#2c3e50]">{groupesCount !== null ? String(groupesCount).padStart(2, '0') : '—'}</p>
              <p className="text-gray-500 text-sm">Groupes de médecine</p>
            </div>
          </div>
        </div>

        {/* Rapport rapide */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 className="font-semibold text-[#2c3e50]">Rapport rapide</h3>
            <div className="text-sm text-[#2c3e50] flex items-center gap-2">
              <select
                value={mois}
                onChange={(e) => setMois(Number(e.target.value))}
                className="bg-transparent border rounded px-2 py-1 cursor-pointer"
                title="Mois"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                ))}
              </select>
              <select
                value={annee}
                onChange={(e) => setAnnee(Number(e.target.value))}
                className="bg-transparent border rounded px-2 py-1 cursor-pointer"
                title="Année"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <span className="material-icons text-sm">expand_more</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 px-6 py-6">
            <div>
              <p className="text-3xl font-bold text-[#2c3e50]">{new Intl.NumberFormat('fr-FR').format(rapportRapide.quantiteVendu)}</p>
              <p className="text-gray-500 text-sm">Quantité de médicaments vendus</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#2c3e50]">{new Intl.NumberFormat('fr-FR').format(rapportRapide.facturesGenerees)}</p>
              <p className="text-gray-500 text-sm">Factures générées</p>
            </div>
          </div>
        </div>

        {/* Ma pharmacie */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 className="font-semibold text-[#2c3e50]">Ma pharmacie</h3>
            <button onClick={() => onNaviguer('utilisateurs')} className="text-sm text-[#2c3e50] flex items-center gap-2">
              Accédez à la gestion des utilisateurs <span className="material-icons text-sm">chevron_right</span>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-6 px-6 py-6">
            <div>
              <p className="text-3xl font-bold text-[#2c3e50]">{String(statistiques.total_fournisseurs).padStart(2, '0')}</p>
              <p className="text-gray-500 text-sm">Nombre total de fournisseurs</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#2c3e50]">05</p>
              <p className="text-gray-500 text-sm">Nombre total d'utilisateurs</p>
            </div>
          </div>
        </div>

        {/* Clients */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 className="font-semibold text-[#2c3e50]">Clients</h3>
            <button onClick={() => onNaviguer('clients')} className="text-sm text-[#2c3e50] flex items-center gap-2">
              Aller à la page clients <span className="material-icons text-sm">chevron_right</span>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-6 px-6 py-6">
            <div>
              <p className="text-3xl font-bold text-[#2c3e50]">{statistiques.total_clients}</p>
              <p className="text-gray-500 text-sm">Nombre total de clients</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#2c3e50]">{rapportRapide.articleFrequent || '—'}</p>
              <p className="text-gray-500 text-sm">Article fréquemment vendu</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableauDeBord;
