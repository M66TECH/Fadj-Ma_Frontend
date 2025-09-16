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

  const [pageActuelle, setPageActuelle] = React.useState<PageName>('login');

  React.useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const ok = !!token;
    setIsConnecte(ok);
    setPageActuelle(ok ? 'dashboard' : 'login');

    const onUnauthorized = () => {
      setIsConnecte(false);
      setPageActuelle('login');
    };
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, []);

  const gererConnexion = () => {
    setIsConnecte(true);
    setPageActuelle('dashboard');
  };

  const naviguerVers = (page: PageName) => {
    setPageActuelle(page);
  };

  const [idleModal, setIdleModal] = React.useState<{ open: boolean; secondsLeft: number; keepAlive?: () => void }>({ open: false, secondsLeft: 0 });
  React.useEffect(() => {
    const handler = (e: any) => {
      const { secondsLeft, keepAlive } = e?.detail || {};
      setIdleModal({ open: true, secondsLeft, keepAlive });
    };
    window.addEventListener('session:idle-warning', handler as any);
    return () => window.removeEventListener('session:idle-warning', handler as any);
  }, []);

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

      {idleModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-lg p-6 w-[95%] max-w-md">
            <h2 className="text-lg font-semibold mb-2">Votre session va expirer</h2>
            <p className="text-gray-700 mb-4">Inactivité détectée. Vous serez déconnecté dans {idleModal.secondsLeft}s.</p>
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 rounded border"
                onClick={() => setIdleModal({ open: false, secondsLeft: 0 })}
              >Fermer</button>
              <button
                className="px-4 py-2 rounded bg-teal-600 text-white"
                onClick={() => { idleModal.keepAlive?.(); setIdleModal({ open: false, secondsLeft: 0 }); }}
              >Rester connecté</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
