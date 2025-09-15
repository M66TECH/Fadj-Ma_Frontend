import React, { useState, useEffect } from 'react';
import type { Medicament } from '../types';

import type { PageName } from '../types';

interface PropsDetailsMedicament {
  onNaviguer: (page: PageName) => void;
}

const DetailsMedicament: React.FC<PropsDetailsMedicament> = ({ onNaviguer: _onNaviguer }) => {
  const [medicament, setMedicament] = useState<Medicament | null>(null);
  const [chargement, setChargement] = useState(true);

  // Données de test basées sur la capture
  const medicamentTest: Medicament = {
    id: 'D06ID232435454',
    nom: 'Augmentin 625 Duo comprimé',
    description: `Augmentin 625 DuoComprimé est utilisé pour traiter les infections bactériennes du corps qui affectent la peau, les tissus mous, les poumons, les oreilles, les voies urinaires et les sinus nasaux. Il convient de mentionner que les infections virales comme la grippe et le rhume ne sont pas traitées par ce médicament.

Augmentin 625 Duo Tablet se compose de deux médicaments: l'amoxicilline et l'acide clavulanique. L'amoxicilline agit en détruisant la couche protéique externe, tuant ainsi les bactéries (action bactéricide). L'acide clavulanique inhibe l'enzyme bêta-lactamase, qui empêche les bactéries de détruire l'efficacité de l'amoxicilline. En conséquence, l'action de l'acide clavulanique permet à l'amoxicilline de mieux agir et de tuer les bactéries. Augmentin 625 Duo Tablet n'agit pas contre les infections causées par des virus, notamment le rhume et la grippe.

La dose d'Augmentin 625 Duo Tablet peut varier en fonction de votre état et de la gravité de l'infection. En outre, il est recommandé de terminer le traitement même si vous vous sentez mieux, car il s'agit d'un antibiotique, et le laisser entre les deux peut entraîner une infection même grave qui, en fait, cessera également de répondre à l'antibiotique (résistance aux antibiotiques).. Les effets secondaires courants du comprimé Augmentin 625 Duo comprennent des vomissements, des nausées et de la diarrhée. Il se peut que tout le monde ne ressente pas les effets secondaires ci-dessus. En cas d'inconfort, parlez-en à un médecin.

Avant de commencer Augmentin 625 Duo Tablet, veuillez informer votre médecin si vous avez une allergie (à tout antibiotique) ou des problèmes rénaux ou hépatiques. Ne prenez pas Augmentin 625 Duo Tablet seul en automédication, car cela pourrait entraîner une résistance aux antibiotiques dans laquelle les antibiotiques n'agissent pas contre des infections bactériennes spécifiques. Augmentin 625 Duo Tablet est sans danger pour les enfants s'il est prescrit par un médecin; la dose et la durée peuvent varier en fonction du poids de l'enfant et de la gravité de l'infection. Informez votre médecin de tous les médicaments que vous prenez et de votre état de santé afin d'exclure tout effet secondaire dés...`,
    dosage: '625mg',
    prix: 2500,
    stock: 350,
    groupe_id: '1',
    groupe: { id: '1', nom: 'Médecine générique' }
  };

  useEffect(() => {
    const chargerMedicament = async () => {
      try {
        setChargement(true);
        setMedicament(medicamentTest);
      } catch (error) {
        console.error('Erreur lors du chargement du médicament:', error);
      } finally {
        setChargement(false);
      }
    };
    chargerMedicament();
  }, []);

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

  return (
    <div className="medicament-details-fadj">
      {/* Breadcrumb */}
      <div className="breadcrumb-fadj">
        <span className="breadcrumb-item-fadj">Médicaments</span>
        <span className="breadcrumb-separator-fadj">{'>'}</span>
        <span className="breadcrumb-current-fadj">Tous les détails</span>
      </div>

      {/* Contenu principal */}
      <div className="details-content-fadj">
        {/* Image du produit */}
        <div className="product-image-fadj">
          <div className="image-container-fadj">
            <img 
              src="https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=Augmentin+625" 
              alt={medicament.nom}
              className="product-img-fadj"
            />
            <button className="nav-arrow-fadj nav-arrow-left-fadj">‹</button>
            <button className="nav-arrow-fadj nav-arrow-right-fadj">›</button>
          </div>
        </div>

        {/* Informations du produit */}
        <div className="product-info-fadj">
          <h1 className="product-title-fadj">{medicament.nom}</h1>
          
          <div className="product-details-fadj">
            <div className="detail-item-fadj">
              <span className="detail-label-fadj">Composition:</span>
              <span className="detail-value-fadj">Amoycillin-500MG + Clavulanic Acid-122MG</span>
            </div>
            <div className="detail-item-fadj">
              <span className="detail-label-fadj">Fabriquant/comerçant:</span>
              <span className="detail-value-fadj">GlaxoSmithKlin Pharmaceutical Idt</span>
            </div>
            <div className="detail-item-fadj">
              <span className="detail-label-fadj">Type de consommation:</span>
              <span className="detail-value-fadj">Oral</span>
            </div>
            <div className="detail-item-fadj">
              <span className="detail-label-fadj">Date d'expiration:</span>
              <span className="detail-value-fadj">25 Janvier</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section description */}
      <div className="description-section-fadj">
        <h2 className="description-title-fadj">Description:</h2>
        <div className="description-text-fadj">
          {medicament.description.split('\n').map((paragraphe, index) => (
            <p key={index}>{paragraphe}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DetailsMedicament;
