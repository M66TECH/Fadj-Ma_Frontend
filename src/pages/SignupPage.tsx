import React, { useState } from 'react';
import api from '../services/api';

interface PropsPageInscription {
  onAllerConnexion: () => void;
}

const PageInscription: React.FC<PropsPageInscription> = ({ onAllerConnexion }) => {
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapValidationKey = (key: string) => {
    if (!key) return '';
    const k = key.toLowerCase();
    if (k.includes('validation.required')) return 'Ce champ est requis.';
    if (k.includes('validation.email')) return "L'e-mail est invalide.";
    if (k.includes('validation.confirmed')) return 'La confirmation ne correspond pas.';
    if (k.includes('validation.min')) return 'La valeur est trop courte.';
    if (k.includes('validation.unique')) return 'Cette valeur est déjà utilisée.';
    return key; // fallback brut
  };

  const handleSignup = async () => {
    setError(null);
    // Validation côté client basique
    const fullName = `${prenom} ${nom}`.trim();
    if (!fullName) return setError('Le nom est requis.');
    if (!email) return setError("L'email est requis.");
    if (!password) return setError('Le mot de passe est requis.');
    if (password.length < 8) return setError('Le mot de passe doit contenir au moins 8 caractères.');
    if (password !== confirm) return setError('Les mots de passe ne correspondent pas.');

    const payload = {
      name: fullName,
      email,
      password,
      password_confirmation: confirm,
    };



    setLoading(true);
    try {
      await api.sInscrire(payload as any);
      onAllerConnexion();
    } catch (e: any) {
      if (e?.status === 0 && /Délai/.test(String(e?.message))) {
        setError("Le serveur met trop de temps à répondre. Réessayez plus tard.");
        return;
      }
      // Afficher les erreurs de validation Laravel si présentes
      const errs = e?.errors;
      if (errs && typeof errs === 'object') {
        const firstKey = Object.keys(errs)[0];
        const raw = Array.isArray(errs[firstKey]) ? errs[firstKey][0] : String(errs[firstKey]);
        const msg = mapValidationKey(raw);
        setError(msg || e?.message || 'Données invalides');
      } else {
        // Si message type clé de validation
        const msg = mapValidationKey(e?.message);
        setError(msg || "Erreur d'inscription");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-200 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-2xl bg-gray-200 border border-black rounded">
        {/* Header */}
        <div className="bg-gray-800 text-white text-center py-6">
          <h1 className="text-xl font-bold">Bienvenue chez votre pharmacie</h1>
          <div className="flex justify-center items-center space-x-2 mt-2">
            <img src="/assets/app-icon.png" alt="Fadj-Ma" className="w-8 h-8 rounded-md ring-1 ring-black/15" />
            <span className="font-semibold text-lg">Fadj-Ma</span>
          </div>
        </div>

        {/* Form */}
        <div className="px-8 py-6">
          {/* Tabs */}
          <div className="flex justify-center mb-6 space-x-4">
            <button
              onClick={onAllerConnexion}
              className="bg-white border border-gray-400 text-black font-medium py-2 px-6 rounded"
            >
              Connectez-vous
            </button>
            <button className="bg-blue-300 border border-gray-400 text-black font-medium py-2 px-6 rounded">
              Inscrivez-vous
            </button>
          </div>

          {/* Radio (non utilisé pour backend pour l'instant) */}
          <div className="mb-4">
            <label className="block text-gray-800 font-medium mb-2">Vos coordonnées</label>
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2">
                <input type="radio" name="genre" className="form-radio text-blue-400" defaultChecked />
                <span>Homme</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="radio" name="genre" className="form-radio text-blue-400" />
                <span>Femme</span>
              </label>
            </div>
          </div>

          {/* Nom et prénom */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-800 mb-1">Prénom</label>
              <input value={prenom} onChange={(e)=>setPrenom(e.target.value)} type="text" className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none" />
            </div>
            <div>
              <label className="block text-gray-800 mb-1">Nom</label>
              <input value={nom} onChange={(e)=>setNom(e.target.value)} type="text" className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none" />
            </div>
          </div>

          {/* Email et mot de passe */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-800 mb-1">E-mail</label>
              <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none" />
            </div>
            <div>
              <label className="block text-gray-800 mb-1">Mot de passe</label>
              <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none" />
            </div>
          </div>

          {/* Confirmer */}
          <div className="mb-2">
            <label className="block text-gray-800 mb-1">Confirmer</label>
            <input value={confirm} onChange={(e)=>setConfirm(e.target.value)} type="password" className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none" />
          </div>

          {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

          {/* Button */}
          <button onClick={handleSignup} disabled={loading} className="w-full bg-blue-300 hover:bg-blue-400 disabled:opacity-60 text-black font-semibold py-2 rounded">
            {loading ? "Inscription…" : "S’inscrire"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageInscription;