import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import type { PageName } from '../types';

interface PropsDetailsMedicament {
  onNaviguer: (page: PageName) => void;
}

// Type local étendu pour refléter la doc backend (champs détaillés + gallery)
interface MedicamentDetail {
  id: string;
  nom: string;
  description?: string | null;
  description_detaillee?: string | null;
  dosage_posologie?: string | null;
  ingredients_actifs?: string | null;
  effets_secondaires?: string | null;
  forme_pharmaceutique?: string | null;
  composition?: string | null;
  fabricant?: string | null;
  type_consommation?: string | null;
  date_expiration?: string | null;
  image_url?: string | null;
  gallery?: string[];
}

const DetailsMedicament: React.FC<PropsDetailsMedicament> = ({ onNaviguer: _onNaviguer }) => {
  const [medicament, setMedicament] = useState<MedicamentDetail | null>(null);
  const [chargement, setChargement] = useState(true);

  // NOTE: Dans cette app sans routeur, on ne reçoit pas l'id via l'URL.
  // On pourrait stocker temporairement l'id sélectionné dans localStorage.
  const idSelectionne = localStorage.getItem('medicament_id_selectionne') || '';

  useEffect(() => {
    const chargerMedicament = async () => {
      try {
        setChargement(true);
        if (!idSelectionne) {
          setMedicament(null);
          return;
        }
        const res = (await apiService.obtenirMedicament(idSelectionne)) as any;
        const d = res?.data || null;
        setMedicament(d);
      } catch (error) {
        console.error('Erreur lors du chargement du médicament:', error);
        setMedicament(null);
      } finally {
        setChargement(false);
      }
    };
    chargerMedicament();
  }, [idSelectionne]);

  if (chargement) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 text-lg">Chargement...</div>
      </div>
    );
  }

  if (!medicament) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600 text-lg">Médicament non trouvé</div>
      </div>
    );
  }

  // format date simple (ex: 2025-01-25 -> 25 janvier 2025)
  const formaterDate = (iso?: string | null) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch {
      return iso;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="text-[#2c3e50] mb-6 text-lg font-medium">
        <span className="opacity-70">Médicaments</span>
        <span className="mx-2">›</span>
        <span className="font-semibold">Tous les détails</span>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Image + galerie simple */}
        <div className="bg-white rounded-lg border p-4">
          <div className="aspect-[4/3] w-full bg-gray-100 rounded flex items-center justify-center overflow-hidden">
            {medicament.image_url ? (
              <img src={medicament.image_url} alt={medicament.nom} className="object-contain w-full h-full" />
            ) : (
              <div className="text-gray-400">Aucune image</div>
            )}
          </div>
          {Array.isArray(medicament.gallery) && medicament.gallery.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {medicament.gallery.map((url, i) => (
                <img key={i} src={url} alt={`Image ${i + 1}`} className="w-20 h-16 object-cover rounded border" />
              ))}
            </div>
          )}
        </div>

        {/* Informations */}
        <div>
          <h1 className="text-3xl font-bold text-[#2c3e50] mb-4">{medicament.nom}</h1>
          <div className="space-y-4 text-[#2c3e50]">
            <div>
              <div className="font-semibold">Composition</div>
              <div className="text-gray-700">{medicament.composition || '—'}</div>
            </div>
            <div>
              <div className="font-semibold">Fabriquant/commerçant</div>
              <div className="text-gray-700">{medicament.fabricant || '—'}</div>
            </div>
            <div>
              <div className="font-semibold">Type de consommation</div>
              <div className="text-gray-700">{medicament.type_consommation || '—'}</div>
            </div>
            <div>
              <div className="font-semibold">Date d'expiration</div>
              <div className="text-gray-700">{formaterDate(medicament.date_expiration) || '—'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Description principale */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-[#2c3e50] mb-3">Description :</h2>
        <div className="prose max-w-none text-gray-800 leading-relaxed">
          {(medicament.description_detaillee || medicament.description || '')
            .split('\n')
            .filter(Boolean)
            .map((p, i) => (
              <p key={i} className="mb-4">{p}</p>
            ))}
        </div>
      </div>

      {/* Sections détaillées */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <h3 className="text-lg font-bold text-[#2c3e50] mb-2">Dosage et posologie :</h3>
          <div className="text-gray-800 whitespace-pre-line">{medicament.dosage_posologie || '—'}</div>
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#2c3e50] mb-2">Ingrédients actifs :</h3>
          <div className="text-gray-800 whitespace-pre-line">{medicament.ingredients_actifs || '—'}</div>
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#2c3e50] mb-2">Effets secondaire</h3>
          <div className="text-gray-800 whitespace-pre-line">{medicament.effets_secondaires || '—'}</div>
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#2c3e50] mb-2">Forme pharmaceutique</h3>
          <div className="text-gray-800 whitespace-pre-line">{medicament.forme_pharmaceutique || '—'}</div>
        </div>
      </div>

      <p className="mt-12 text-xs text-gray-500">Propulsé par Red Team © 2024 &nbsp;&nbsp; version 1.12</p>
    </div>
  );
};

export default DetailsMedicament;
