import React, { useState } from 'react';
import api from '../services/api';

interface PropsPageConnexion {
  onConnexion: () => void;
  onAllerInscription: () => void;
}

const PageConnexion: React.FC<PropsPageConnexion> = ({ onConnexion, onAllerInscription }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await api.seConnecter(email, password);
      onConnexion();
    } catch (e: any) {
      setError(e?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-gray-100 shadow-md border border-gray-300 rounded">
        {/* Header */}
        <div className="bg-gray-800 text-white text-center py-4 rounded-t">
          <h1 className="text-lg font-bold">Bienvenue chez votre pharmacie</h1>
          <div className="flex justify-center items-center space-x-2 mt-1">
            <div className="w-8 h-8 bg-[#F1C40F] rounded-md flex items-center justify-center ring-1 ring-black/15" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6h2l1.1 6.6c.1.6.6 1 1.2 1h8.6c.6 0 1.1-.4 1.3-1l1.8-5.6H7.4" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="18.5" r="1.7" fill="#000"/>
                <circle cx="16.8" cy="18.5" r="1.7" fill="#000"/>
                <rect x="9.4" y="5.4" width="6.4" height="4.6" rx="0.8" fill="#2ECC71" stroke="#000" strokeWidth="1.2"/>
                <rect x="10.8" y="4.4" width="3.6" height="1.2" rx="0.4" fill="#2ECC71" stroke="#000" strokeWidth="1"/>
                <rect x="12.4" y="6.3" width="0.9" height="2.8" fill="#FFFFFF"/>
                <rect x="11.3" y="7.4" width="3.1" height="0.9" fill="#FFFFFF"/>
              </svg>
            </div>
            <span className="font-semibold">Fadj-Ma</span>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 py-6">
          {/* Tabs */}
          <div className="flex justify-center mb-6 space-x-3">
            <button className="bg-blue-200 text-black font-semibold py-2 px-6 rounded border border-gray-300">
              Connectez-vous
            </button>
            <button
              onClick={onAllerInscription}
              className="bg-white text-black font-semibold py-2 px-6 rounded border border-gray-300"
            >
              Inscrivez-vous
            </button>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Adresse e-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>

          {/* Password */}
          <div className="mb-2">
            <label className="block text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>

          {error && <div className="text-red-600 text-sm mb-3">{error}</div>}

          {/* Forgot password */}
          <div className="flex justify-end mb-4">
            <a href="#" className="text-sm text-gray-600 hover:underline">
              Mot de passe oublié
            </a>
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-200 hover:bg-blue-300 disabled:opacity-60 text-black font-semibold py-2 rounded shadow"
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageConnexion;