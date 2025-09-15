import React from 'react';

const EnTete: React.FC = () => {
  const dateActuelle = new Date();
  const dateFormatee = dateActuelle.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const heureFormatee = dateActuelle.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className="header-fadj">
      {/* Barre de recherche */}
      <div className="search-bar-fadj">
        <input
          type="text"
          placeholder="Recherchez n'importe quoi ici."
          className="search-input-fadj"
        />
      </div>

      {/* Sélecteur de langue */}
      <div className="language-selector-fadj">
        <span className="material-icons text-gray-500 text-base">language</span>
        <span className="language-text-fadj">Français (France)</span>
        <span className="dropdown-arrow-fadj">▼</span>
      </div>

      {/* Salutation et informations */}
      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="greeting-fadj">
            <span className="status-dot-fadj" aria-hidden="true" />
            <span className="greeting-text-fadj">Bonjour</span>
          </div>
          <div className="date-time-inline-fadj">{dateFormatee} · {heureFormatee}</div>
        </div>
      </div>
    </div>
  );
};

export default EnTete;
