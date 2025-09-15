import React, { useState, useEffect } from 'react';
import type { Medicament } from '../types';
import ModalMedicament from '../components/ModalMedicament';

import type { PageName } from '../types';

interface PropsPageMedicaments {
  onNaviguer: (page: PageName) => void;
}

const PageMedicaments: React.FC<PropsPageMedicaments> = ({ onNaviguer }) => {
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [termeRecherche, setTermeRecherche] = useState('');
  const [groupeSelectionne, setGroupeSelectionne] = useState('');
  const [afficherModal, setAfficherModal] = useState(false);
  const [pageActuelle, setPageActuelle] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Données de test basées sur les captures
  const medicamentsTest: Medicament[] = [
    {
      id: 'D06ID232435454',
      nom: 'Augmentin 625 Duo Comprimé',
      description: 'Antibiotique',
      dosage: '625mg',
      prix: 2500,
      stock: 350,
      groupe_id: '1',
      groupe: { id: '1', nom: 'Médecine générique' }
    },
    {
      id: 'D06ID232435451',
      nom: 'Azithral-500 Comprimé',
      description: 'Antibiotique',
      dosage: '500mg',
      prix: 1800,
      stock: 20,
      groupe_id: '1',
      groupe: { id: '1', nom: 'Médecine générique' }
    },
    {
      id: 'D06ID232435452',
      nom: 'Sirop Ascoril LS',
      description: 'Sirop antitussif',
      dosage: '100ml',
      prix: 3200,
      stock: 85,
      groupe_id: '2',
      groupe: { id: '2', nom: 'Diabète' }
    },
    {
      id: 'D06ID232435450',
      nom: 'Azée 500 Comprimé',
      description: 'Antibiotique',
      dosage: '500mg',
      prix: 2200,
      stock: 75,
      groupe_id: '1',
      groupe: { id: '1', nom: 'Médecine générique' }
    },
    {
      id: 'D06ID232435455',
      nom: 'Allegra 120mg Comprimé',
      description: 'Antihistaminique',
      dosage: '120mg',
      prix: 1500,
      stock: 44,
      groupe_id: '2',
      groupe: { id: '2', nom: 'Diabète' }
    },
    {
      id: 'D06ID232435456',
      nom: 'Sirop d\'Alex',
      description: 'Sirop antitussif',
      dosage: '100ml',
      prix: 2800,
      stock: 65,
      groupe_id: '1',
      groupe: { id: '1', nom: 'Médecine générique' }
    },
    {
      id: 'D06ID232435457',
      nom: 'Amoxyclav-625 Comprimé',
      description: 'Antibiotique',
      dosage: '625mg',
      prix: 2400,
      stock: 150,
      groupe_id: '1',
      groupe: { id: '1', nom: 'Médecine générique' }
    },
    {
      id: 'D06ID232435458',
      nom: 'Avil-25 Tablette',
      description: 'Antihistaminique',
      dosage: '25mg',
      prix: 800,
      stock: 270,
      groupe_id: '1',
      groupe: { id: '1', nom: 'Médecine générique' }
    }
  ];

  useEffect(() => {
    const chargerMedicaments = async () => {
      try {
        // TODO: remplacer par api.obtenirMedicaments() une fois auth en place
        // const res = await apiService.obtenirMedicaments();
        // const items = (res as any).data ?? [];
        // setMedicaments(items);
        setMedicaments(medicamentsTest);
        setTotalPages(Math.ceil(medicamentsTest.length / 8));
      } catch (error) {
        console.error('Erreur lors du chargement des médicaments:', error);
      }
    };
    chargerMedicaments();
  }, []);

  const medicamentsFiltres = medicaments.filter(med => {
    const correspondRecherche = med.nom.toLowerCase().includes(termeRecherche.toLowerCase());
    const correspondGroupe = !groupeSelectionne || med.groupe_id === groupeSelectionne;
    return correspondRecherche && correspondGroupe;
  });

  const medicamentsPagination = medicamentsFiltres.slice(
    (pageActuelle - 1) * 8,
    pageActuelle * 8
  );

  const gererCreationMedicament = async (donneesMedicament: any) => {
    try {
      console.log('Création du médicament:', donneesMedicament);
      setAfficherModal(false);
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  const gererVoirDetails = (_idMedicament: string) => {
    onNaviguer('details-medicament');
  };

  return (
    <div className="medicaments-page-fadj">
      {/* Header */}
      <div className="page-header-fadj">
        <h1 className="page-title-fadj">médicaments ({medicaments.length})</h1>
        <p className="page-subtitle-fadj">Liste des médicaments disponibles à la vente.</p>
      </div>

      {/* Actions */}
      <div className="page-actions-fadj">
        <div className="search-container-fadj">
          <input
            type="text"
            placeholder="Rechercher dans l'inventaire des médicaments."
            value={termeRecherche}
            onChange={(e) => setTermeRecherche(e.target.value)}
            className="search-input-fadj pr-10 placeholder:text-gray-400"
          />
          <span className="search-icon-fadj material-icons text-gray-500">search</span>
        </div>
        
        <div className="actions-right-fadj">
          <button 
            className="new-medicament-btn-fadj"
            onClick={() => setAfficherModal(true)}
          >
            <span className="material-icons text-base">add</span>
            Nouveau médicament
          </button>
          
          <div className="filter-container-fadj">
            <span className="filter-icon-fadj material-icons">filter_alt</span>
            <div className="group-filter-wrapper-fadj">
              <select 
                value={groupeSelectionne} 
                onChange={(e) => setGroupeSelectionne(e.target.value)}
                className="group-filter-fadj"
              >
                <option value="">Sélectionnez un groupe</option>
                <option value="1">Médecine générique</option>
                <option value="2">Diabète</option>
              </select>
              <span className="group-filter-arrow-fadj material-icons">expand_more</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="medicaments-table-fadj">
        <table className="table-fadj">
          <thead className="table-header-fadj">
            <tr>
              <th className="table-th-fadj">Nom du médicament</th>
              <th className="table-th-fadj">ID du médicament</th>
              <th className="table-th-fadj">Nom de groupe</th>
              <th className="table-th-fadj">Stock en quantité</th>
              <th className="table-th-fadj">Action</th>
            </tr>
          </thead>
          <tbody>
            {medicamentsPagination.map((medicament) => (
              <tr key={medicament.id} className="table-tr-fadj">
                <td className="table-td-fadj">{medicament.nom}</td>
                <td className="table-td-fadj">{medicament.id}</td>
                <td className="table-td-fadj">{medicament.groupe?.nom}</td>
                <td className="table-td-fadj">{medicament.stock}</td>
                <td className="table-td-fadj">
                  <button 
                    className="details-link-fadj"
                    onClick={() => gererVoirDetails(medicament.id)}
                  >
                    Voir tous les détails <span className="material-icons text-sm align-middle">chevron_right</span> »
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination-fadj">
        <div className="pagination-info-fadj">
          Affichage de {(pageActuelle - 1) * 8 + 1} à {Math.min(pageActuelle * 8, medicamentsFiltres.length)} résultats sur {medicamentsFiltres.length}
        </div>
        <div className="pagination-controls-fadj">
          <button 
            onClick={() => setPageActuelle(prev => Math.max(1, prev - 1))}
            disabled={pageActuelle === 1}
            className="pagination-btn-fadj material-icons"
            aria-label="Page précédente"
            title="Page précédente"
          >
            chevron_left
          </button>
          <select 
            value={pageActuelle} 
            onChange={(e) => setPageActuelle(Number(e.target.value))}
            className="page-select-fadj"
          >
            {Array.from({ length: totalPages }, (_, i) => (
              <option key={i + 1} value={i + 1}>Page {String(i + 1).padStart(2, '0')}</option>
            ))}
          </select>
          <button 
            onClick={() => setPageActuelle(prev => Math.min(totalPages, prev + 1))}
            disabled={pageActuelle === totalPages}
            className="pagination-btn-fadj material-icons"
            aria-label="Page suivante"
            title="Page suivante"
          >
            chevron_right
          </button>
        </div>
      </div>

      {/* Modal */}
      {afficherModal && (
        <ModalMedicament
          onFermer={() => setAfficherModal(false)}
          onSauvegarder={gererCreationMedicament}
        />
      )}
    </div>
  );
};

export default PageMedicaments;
