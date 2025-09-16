import React from 'react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">🛒</div>
          <span className="logo-text">Fadj-Ma</span>
        </div>
      </div>

      <div className="user-profile">
        <div className="user-avatar">
          <img src="https://via.placeholder.com/40" alt="User" />
        </div>
        <div className="user-info">
          <div className="user-name">Modou Fall</div>
          <div className="user-role">Administrateur</div>
          <div className="online-indicator"></div>
        </div>
        <div className="user-menu">⋮</div>
      </div>

      <nav className="sidebar-nav">
        <button 
          className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
          onClick={() => onNavigate('dashboard')}
        >
          <span className="nav-icon">🏢</span>
          <span className="nav-text">Tableau de bord</span>
        </button>
        <button 
          className={`nav-item ${currentPage === 'medicaments' ? 'active' : ''}`}
          onClick={() => onNavigate('medicaments')}
        >
          <span className="nav-icon">💊</span>
          <span className="nav-text">Médicaments</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn">
          <span className="logout-icon">←</span>
          <span>Déconnexion</span>
        </button>
        <div className="footer-text">
          Propulsé par Red Team © 2024 version 1.1.2
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
