import React from 'react';

const Header: React.FC = () => {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const formattedTime = currentDate.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className="header">
      <div className="header-left">
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Recherchez n'importe quoi ici." 
            className="search-input"
          />
        </div>
      </div>
      
      <div className="header-center">
        <div className="language-selector">
          <span className="language-icon">XA</span>
          <span className="language-text">Français (France)</span>
          <span className="dropdown-arrow">▼</span>
        </div>
      </div>
      
      <div className="header-right">
        <div className="greeting">
          <span className="sun-icon">☀️</span>
          <span className="greeting-text">Bonjour</span>
        </div>
        <div className="datetime">
          <div className="date">{formattedDate}</div>
          <div className="time">{formattedTime}</div>
        </div>
        <button className="download-report-btn">
          Télécharger le rapport
        </button>
      </div>
    </div>
  );
};

export default Header;
