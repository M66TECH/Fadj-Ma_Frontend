import React, { useState, useEffect } from 'react';
import type { Medicament } from '../types';
import ModalMedicament from '../components/ModalMedicament';
import apiService from '../services/api';

import type { PageName } from '../types';

interface PropsPageMedicaments {
  onNaviguer: (page: PageName) => void;
}

const PageMedicaments: React.FC<PropsPageMedicaments> = ({ onNaviguer }) => {
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [termeRecherche, setTermeRecherche] = useState('');
  const [groupeSelectionne, setGroupeSelectionne] = useState('');
  const [groupes, setGroupes] = useState<{ id: string; nom: string }[]>([]);
  const [afficherModal, setAfficherModal] = useState(false);
  const [pageActuelle, setPageActuelle] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Données de test basées sur les captures (supprimées pour API)
  /* const medicamentsTest: Medicament[] = [
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
  ]; */

  useEffect(() => {
    const charger = async () => {
      try {
        const [resMed, resGrp] = await Promise.all([
          apiService.obtenirMedicaments(),
          apiService.obtenirGroupes(),
        ]);
        const items = (resMed as any)?.data ?? [];
        const mapped = (Array.isArray(items) ? items : []).map((m: any) => ({
          id: String(m.id ?? m._id ?? m.code ?? Math.random()),
          nom: m.nom ?? m.name ?? 'Inconnu',
          description: m.description ?? '',
          dosage: m.dosage ?? '',
          prix: Number(m.prix ?? m.price ?? 0),
          stock: Number(m.stock ?? 0),
          groupe_id: m.groupe_id != null ? String(m.groupe_id) : (m.groupe?.id != null ? String(m.groupe.id) : null),
          groupe: m.groupe ? { id: String(m.groupe.id), nom: m.groupe.nom ?? 'Groupe' } : undefined,
        })) as any;
        setMedicaments(mapped);
        setTotalPages(Math.max(1, Math.ceil(mapped.length / 8)));

        const gs = (resGrp as any)?.data ?? [];
        const mappedGroupes = (Array.isArray(gs) ? gs : []).map((g: any) => ({ id: String(g.id), nom: g.nom ?? g.name ?? 'Groupe' }));
        setGroupes(mappedGroupes);
      } catch {
        setMedicaments([]);
        setTotalPages(1);
        setGroupes([]);
      }
    };
    charger();
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
    // Validation côté client pour éviter 422 (ex: dosage trop long)
    const dosageStr = String(donneesMedicament?.dosage ?? '').trim();
    if (dosageStr.length > 255) {
      alert('Le champ "Dosage" est trop long (max 255 caractères).');
      return;
    }

    try {
      // Création via API (sans images)
      const payload: any = {
        nom: donneesMedicament?.nom,
        description: donneesMedicament?.description,
        dosage: donneesMedicament?.dosage,
        prix: Number(donneesMedicament?.prix ?? 0),
        stock: Number(donneesMedicament?.stock ?? 0),
      };
      if (donneesMedicament?.groupe_id) {
        payload.groupe_id = String(donneesMedicament.groupe_id);
      }
      const resCreate = await apiService.creerMedicament(payload);

      // Récupérer l'ID créé pour upload d'images
      const createdData: any = (resCreate as any)?.data ?? resCreate;
      const createdId = String(
        (createdData && (createdData.id ?? createdData._id ?? createdData.code ?? createdData.medicament?.id ?? createdData.item?.id)) || ''
      );

      // Upload image principale et galerie si présentes
      try {
        if (createdId && donneesMedicament?.image instanceof File) {
          await apiService.uploadImageMedicament(createdId, donneesMedicament.image);
        }
        if (createdId && Array.isArray(donneesMedicament?.gallery) && donneesMedicament.gallery.length > 1) {
          const others = donneesMedicament.gallery.slice(1);
          if (others.length) {
            await apiService.uploadGalerieMedicament(createdId, others);
          }
        }
      } catch (imgErr) {
        // ignore upload errors, we still refresh list
      }

      // Recharger la liste
      const res = await apiService.obtenirMedicaments();
      const items = (res as any)?.data ?? [];
      const mapped = (Array.isArray(items) ? items : []).map((m: any) => ({
        id: String(m.id ?? m._id ?? m.code ?? Math.random()),
        nom: m.nom ?? m.name ?? 'Inconnu',
        description: m.description ?? '',
        dosage: m.dosage ?? '',
        prix: Number(m.prix ?? m.price ?? 0),
        stock: Number(m.stock ?? 0),
        groupe_id: String(m.groupe_id ?? m.groupe?.id ?? ''),
        groupe: m.groupe ? { id: String(m.groupe.id), nom: m.groupe.nom ?? 'Groupe' } : undefined,
      })) as any;
      setMedicaments(mapped);
      setTotalPages(Math.max(1, Math.ceil(mapped.length / 8)));
      setAfficherModal(false);
    } catch (error: any) {
      alert(`Erreur lors de la création: ${error?.message || 'Inconnue'}`);
    }
  };

  const gererVoirDetails = (idMedicament: string) => {
    try {
      localStorage.setItem('medicament_id_selectionne', String(idMedicament));
    } catch {}
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
                {(groupes || []).map(g => (
                  <option key={g.id} value={g.id}>{g.nom}</option>
                ))}
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
