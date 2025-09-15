import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

import type { PageName } from '../types';

interface TableauDeBordProps {
  onNaviguer: (page: PageName) => void;
}

const TableauDeBord: React.FC<TableauDeBordProps> = ({ onNaviguer }) => {
  const [statistiques, setStatistiques] = useState({
    total_medicaments: 298,
    total_clients: 845,
    total_fournisseurs: 4,
    total_factures: 5288,
    medicaments_stock_faible: 1,
    chiffre_affaires_mois: 4800432,
  });

  const [periodeSelectionnee, setPeriodeSelectionnee] = useState('janvier 2022');

  useEffect(() => {
    const chargerStatistiques = async () => {
      try {
        const donnees = (await apiService.obtenirStatistiques()) as { data: any };
        setStatistiques(donnees.data);
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      }
    };
    chargerStatistiques();
  }, []);

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
        <button className="flex items-center gap-2 border px-4 py-2 rounded-md hover:bg-gray-50">
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
            <button onClick={() => onNaviguer('configuration')} className="text-sm text-[#2c3e50] flex items-center gap-2">
              Allez dans Configuration <span className="material-icons text-sm">chevron_right</span>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-6 px-6 py-6">
            <div>
              <p className="text-3xl font-bold text-[#2c3e50]">{statistiques.total_medicaments}</p>
              <p className="text-gray-500 text-sm">Nombre total de médicaments</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#2c3e50]">24</p>
              <p className="text-gray-500 text-sm">Groupes de médecine</p>
            </div>
          </div>
        </div>

        {/* Rapport rapide */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 className="font-semibold text-[#2c3e50]">Rapport rapide</h3>
            <div className="text-sm text-[#2c3e50] flex items-center gap-2">
              <select className="bg-transparent border-none cursor-pointer">
                <option value="janvier 2022">janvier 2022</option>
                <option value="février 2022">février 2022</option>
              </select>
              <span className="material-icons text-sm">expand_more</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 px-6 py-6">
            <div>
              <p className="text-3xl font-bold text-[#2c3e50]">70 856</p>
              <p className="text-gray-500 text-sm">Quantité de médicaments vendus</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#2c3e50]">5 288</p>
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
              <p className="text-3xl font-bold text-[#2c3e50]">Adalimumab</p>
              <p className="text-gray-500 text-sm">Article fréquemment vendu</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableauDeBord;
