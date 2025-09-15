import React, { useState } from 'react';

interface PropsModalMedicament {
  onFermer: () => void;
  onSauvegarder: (donnees: any) => void;
}

const ModalMedicament: React.FC<PropsModalMedicament> = ({ onFermer, onSauvegarder }) => {
  const [donneesFormulaire, setDonneesFormulaire] = useState({
    nom: '',
    dosage: '',
    description: '',
    prix: '',
    groupe_id: '',
    image: null as File | null
  });

  const gererChangementInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDonneesFormulaire(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const gererChangementImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDonneesFormulaire(prev => ({
        ...prev,
        image: e.target.files![0]
      }));
    }
  };

  const gererSoumission = (e: React.FormEvent) => {
    e.preventDefault();
    onSauvegarder(donneesFormulaire);
  };

  return (
    <div className="modal-overlay-fadj">
      <div className="medicament-modal-fadj">
        {/* Header avec upload d'image */}
        <div className="modal-header-fadj">
          <div className="image-upload-fadj">
            <div className="image-placeholder-fadj">
              <span className="upload-icon-fadj">+</span>
            </div>
            <span className="upload-text-fadj">Ajouter une image</span>
            <input
              type="file"
              accept="image/*"
              onChange={gererChangementImage}
              className="image-input-fadj"
            />
          </div>
        </div>

        {/* Contenu du formulaire */}
        <div className="modal-content-fadj">
          <div className="required-note-fadj">
            <span className="required-text-fadj">Obligatoire</span>
            <p>Donnez plus de détails possible</p>
          </div>

          <form onSubmit={gererSoumission}>
            <div className="form-row-fadj">
              <div className="form-group-fadj">
                <label className="form-label-fadj">Nom du médicament</label>
                <input
                  type="text"
                  name="nom"
                  value={donneesFormulaire.nom}
                  onChange={gererChangementInput}
                  placeholder="Nom du médicament"
                  className="form-input-fadj"
                  required
                />
              </div>
              <div className="form-group-fadj">
                <label className="form-label-fadj">Description</label>
                <input
                  type="text"
                  name="description"
                  value={donneesFormulaire.description}
                  onChange={gererChangementInput}
                  placeholder="Description"
                  className="form-input-fadj"
                />
              </div>
            </div>

            <div className="form-row-fadj">
              <div className="form-group-fadj">
                <label className="form-label-fadj">Dosage</label>
                <input
                  type="text"
                  name="dosage"
                  value={donneesFormulaire.dosage}
                  onChange={gererChangementInput}
                  placeholder="Dosage"
                  className="form-input-fadj"
                />
              </div>
              <div className="form-group-fadj">
                <label className="form-label-fadj">Prix</label>
                <input
                  type="number"
                  name="prix"
                  value={donneesFormulaire.prix}
                  onChange={gererChangementInput}
                  placeholder="Prix"
                  step="0.01"
                  className="form-input-fadj"
                />
              </div>
            </div>

            <div className="form-group-fadj">
              <label className="form-label-fadj">Groupe de médicament</label>
              <select
                name="groupe_id"
                value={donneesFormulaire.groupe_id}
                onChange={gererChangementInput}
                className="form-select-fadj"
                required
              >
                <option value="">Sélectionnez un groupe</option>
                <option value="1">Médecine générique</option>
                <option value="2">Diabète</option>
              </select>
            </div>

            <div className="modal-actions-fadj">
              <button type="button" onClick={onFermer} className="cancel-btn-fadj">
                Annuler
              </button>
              <button type="submit" className="save-btn-fadj">
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalMedicament;
