import React, { useState } from 'react';

interface MedicamentModalProps {
  onClose: () => void;
  onSave: (data: any) => void;
}

const MedicamentModal: React.FC<MedicamentModalProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nom: '',
    dosage: '',
    description: '',
    prix: '',
    groupe_id: '',
    image: null as File | null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        image: e.target.files![0]
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="medicament-modal">
        <div className="modal-header">
          <div className="image-upload">
            <div className="image-placeholder">
              <span className="upload-icon">+</span>
              <span className="upload-text">Ajouter une image</span>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="image-input"
            />
          </div>
        </div>

        <div className="modal-content">
          <div className="required-note">
            <span className="required-text">Obligatoire</span>
            <p>Donnez plus de détails possible</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Nom du médicament</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  placeholder="Nom du médicament"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Description"
                  rows={3}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Dosage</label>
                <input
                  type="text"
                  name="dosage"
                  value={formData.dosage}
                  onChange={handleInputChange}
                  placeholder="Dosage"
                />
              </div>
              <div className="form-group">
                <label>Prix</label>
                <input
                  type="number"
                  name="prix"
                  value={formData.prix}
                  onChange={handleInputChange}
                  placeholder="Prix"
                  step="0.01"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Groupe de médicament</label>
              <select
                name="groupe_id"
                value={formData.groupe_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Sélectionnez un groupe</option>
                <option value="1">Médecine générique</option>
                <option value="2">Diabète</option>
              </select>
            </div>

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="cancel-btn">
                Annuler
              </button>
              <button type="submit" className="save-btn">
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MedicamentModal;
