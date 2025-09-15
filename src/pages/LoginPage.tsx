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
            <img
              src="https://cdn-icons-png.flaticon.com/512/3081/3081559.png"
              alt="logo"
              className="w-6 h-6"
            />
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