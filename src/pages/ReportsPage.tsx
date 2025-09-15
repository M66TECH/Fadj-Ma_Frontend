import React from 'react';

import type { PageName } from '../types';

interface Props {
  onNaviguer: (page: PageName) => void;
}

const ReportsPage: React.FC<Props> = ({ onNaviguer }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-[#2c3e50]">Rapport détaillé</h2>
      <p className="text-gray-600 mb-6">Page placeholder pour les rapports détaillés.</p>
      <button className="px-4 py-2 bg-[#bfe3f7] border border-[#b7c8d3] rounded" onClick={() => onNaviguer('dashboard')}>Retour au tableau de bord</button>
    </div>
  );
};

export default ReportsPage;