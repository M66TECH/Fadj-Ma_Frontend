import React from 'react';
import PageConnexion from './pages/LoginPage';
import PageInscription from './pages/SignupPage';
import TableauDeBord from './pages/Dashboard';
import PageMedicaments from './pages/MedicamentsPage';
import DetailsMedicament from './pages/MedicamentDetails';
import Layout from './components/Layout';
import ReportsPage from './pages/ReportsPage';
import ConfigurationPage from './pages/ConfigurationPage';
import UsersPage from './pages/UsersPage';
import ClientsPage from './pages/ClientsPage';
import type { PageName } from './types';

function App() {
  const [estConnecte, setIsConnecte] = React.useState(false);

  // Navigation simple sans React Router pour l'instant
  const [pageActuelle, setPageActuelle] = React.useState<PageName>('login');

  const gererConnexion = () => {
    setIsConnecte(true);
    setPageActuelle('dashboard');
  };

  const naviguerVers = (page: PageName) => {
    setPageActuelle(page);
  };

  if (!estConnecte) {
    if (pageActuelle === 'signup') {
      return <PageInscription onAllerConnexion={() => setPageActuelle('login')} />;
    }
    return (
      <PageConnexion
        onConnexion={gererConnexion}
        onAllerInscription={() => setPageActuelle('signup')}
      />
    );
  }

  const rendrePage = () => {
    switch (pageActuelle) {
      case 'dashboard':
        return <TableauDeBord onNaviguer={naviguerVers} />;
      case 'medicaments':
        return <PageMedicaments onNaviguer={naviguerVers} />;
      case 'details-medicament':
        return <DetailsMedicament onNaviguer={naviguerVers} />;
      case 'rapports':
        return <ReportsPage onNaviguer={naviguerVers} />;
      case 'configuration':
        return <ConfigurationPage onNaviguer={naviguerVers} />;
      case 'utilisateurs':
        return <UsersPage onNaviguer={naviguerVers} />;
      case 'clients':
        return <ClientsPage onNaviguer={naviguerVers} />;
      default:
        return <TableauDeBord onNaviguer={naviguerVers} />;
    }
  };

  return (
    <div className="App">
      <Layout 
        pageActuelle={pageActuelle} 
        onNaviguer={naviguerVers}
        enfants={rendrePage()}
      />
    </div>
  );
}

export default App;
