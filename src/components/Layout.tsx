import React from 'react';
import BarreLaterale from './BarreLaterale';
import EnTete from './EnTete';
import type { PageName } from '../types';

interface PropsLayout {
  enfants: React.ReactNode;
  pageActuelle: PageName;
  onNaviguer: (page: PageName) => void;
}

const Layout: React.FC<PropsLayout> = ({ enfants, pageActuelle, onNaviguer }) => {
  return (
    <div className="h-screen bg-gray-100 flex">
      <BarreLaterale pageActuelle={pageActuelle} onNaviguer={onNaviguer} />
      <main className="flex-1 flex flex-col">
        <EnTete />
        <div className="flex-1 p-6 overflow-y-auto">
          {enfants}
        </div>
      </main>
    </div>
  );
};

export default Layout;
