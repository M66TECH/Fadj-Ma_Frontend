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

  // Carousel state (chevrons navigation)
  const [indexImage, setIndexImage] = useState(0);

  // NOTE: Dans cette app sans routeur, on ne reçoit pas l'id via l'URL.
  // On stocke l'id sélectionné dans localStorage.
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
        setIndexImage(0); // reset carousel on new data
      } catch (error) {
        setMedicament(null);
      } finally {
        setChargement(false);
      }
    };
    chargerMedicament();
  }, [idSelectionne]);

  // IMPORTANT: Tous les hooks doivent être appelés avant tout "return" conditionnel.
  // Images pour le carousel (image principale + galerie)
  const images: string[] = React.useMemo(() => {
    if (!medicament) return [];
    const toAbs = (u?: string | null) => {
      if (!u) return '';
      if (/^https?:\/\//i.test(u)) return u;
      const API = (import.meta.env.VITE_API_BASE_URL || 'https://fadj-ma-backend-u749.onrender.com/api').replace(/\/+$/, '');
      const ORIGIN = API.replace(/\/api$/, '');
      if (u.startsWith('/')) return `${ORIGIN}${u}`;
      return `${ORIGIN}/${u}`;
    };
    const arr: string[] = [];
    if (medicament.image_url) arr.push(toAbs(medicament.image_url));
    if (Array.isArray(medicament.gallery)) arr.push(...medicament.gallery.filter(Boolean).map(toAbs));
    return Array.from(new Set(arr)); // dédupliquer
  }, [medicament]);

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

  // format date "25 Janvier" (jour + mois capitalisé, sans année)
  const formaterDate = (iso?: string | null) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      const str = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' }); // ex: "25 janvier"
      if (!str) return '';
      const [jour, mois] = str.split(' ');
      const moisCap = mois ? mois.charAt(0).toUpperCase() + mois.slice(1) : '';
      return `${jour} ${moisCap}`;
    } catch {
      return iso ?? '';
    }
  };

  const peutPrecedent = images.length > 1 && indexImage > 0;
  const peutSuivant = images.length > 1 && indexImage < images.length - 1;

  const allerPrecedent = () => {
    if (!images.length) return;
    setIndexImage((i) => (i > 0 ? i - 1 : i));
  };
  const allerSuivant = () => {
    if (!images.length) return;
    setIndexImage((i) => (i < images.length - 1 ? i + 1 : i));
  };

  return (
    <div className="w-full max-w-[1100px] mx-auto">
      {/* Breadcrumb */}
      <div className="text-[#2c3e50] mb-6 text-[20px] font-medium">
        <span className="opacity-70">Médicaments</span>
        <span className="mx-2">›</span>
        <span className="font-semibold">Tous les détails</span>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Image + carousel (chevrons) */}
        <div className="bg-white rounded-[10px] border border-gray-200 p-4 shadow-sm">
          <div className="relative h-[340px] w-full bg-gray-100 rounded-[8px] overflow-hidden flex items-center justify-center">
            {images.length > 0 ? (
              <img src={images[indexImage]} alt={medicament.nom} className="object-contain w-full h-full" />
            ) : (
              <div className="text-gray-400">Aucune image</div>
            )}

            {/* Chevrons gauche/droite (transparents pour coller à la maquette) */}
            <button
              type="button"
              onClick={allerPrecedent}
              disabled={!peutPrecedent}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-[#2c3e50] text-3xl font-light opacity-70 hover:opacity-100 disabled:opacity-30"
              aria-label="Image précédente"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={allerSuivant}
              disabled={!peutSuivant}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-[#2c3e50] text-3xl font-light opacity-70 hover:opacity-100 disabled:opacity-30"
              aria-label="Image suivante"
            >
              ›
            </button>
          </div>
        </div>

        {/* Informations */}
        <div>
          <h1 className="text-[32px] leading-tight font-extrabold text-[#2c3e50] mb-3">{medicament.nom}</h1>
          <div className="space-y-3 text-[#2c3e50]">
            <div>
              <div className="text-[15px] font-semibold">Composition</div>
              <div className="text-[15px] text-gray-700">{medicament.composition || '—'}</div>
            </div>
            <div>
              <div className="text-[15px] font-semibold">Fabriquant/commerçant</div>
              <div className="text-[15px] text-gray-700">{medicament.fabricant || '—'}</div>
            </div>
            <div>
              <div className="text-[15px] font-semibold">Type de consommation</div>
              <div className="text-[15px] text-gray-700">{medicament.type_consommation || '—'}</div>
            </div>
            <div>
              <div className="text-[15px] font-semibold">Date d'expiration</div>
              <div className="text-[15px] text-gray-700">{formaterDate(medicament.date_expiration) || '—'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Description principale */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-[#2c3e50] mb-3">Description :</h2>
        <div className="max-w-none text-[15px] leading-7 text-gray-800">
          {(medicament.description_detaillee || medicament.description || '')
            .split('\n')
            .filter(Boolean)
            .map((p, i) => (
              <p key={i} className="mb-4">{p}</p>
            ))}
        </div>
      </div>

      {/* Sections détaillées (verticales) */}
      <div className="mt-10 space-y-8">
        <div>
          <h3 className="text-[18px] font-extrabold text-[#2c3e50] mb-2">Dosage et posologie :</h3>
          <div className="text-[15px] leading-7 text-gray-800 whitespace-pre-line">{medicament.dosage_posologie || '—'}</div>
        </div>
        <div>
          <h3 className="text-[18px] font-extrabold text-[#2c3e50] mb-2">Ingrédients actifs :</h3>
          <div className="text-[15px] leading-7 text-gray-800 whitespace-pre-line">{medicament.ingredients_actifs || '—'}</div>
        </div>
        <div>
          <h3 className="text-[18px] font-extrabold text-[#2c3e50] mb-2">Effets secondaire</h3>
          <div className="text-[15px] leading-7 text-gray-800 whitespace-pre-line">{medicament.effets_secondaires || '—'}</div>
        </div>
        <div>
          <h3 className="text-[18px] font-extrabold text-[#2c3e50] mb-2">Forme pharmaceutique</h3>
          <div className="text-[15px] leading-7 text-gray-800 whitespace-pre-line">{medicament.forme_pharmaceutique || '—'}</div>
        </div>
      </div>

      <p className="mt-12 text-xs text-gray-500">Propulsé par Red Team © 2024 &nbsp;&nbsp; version 1.12</p>
    </div>
  );
};

export default DetailsMedicament;