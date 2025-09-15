export type PageName =
  | 'login'
  | 'signup'
  | 'dashboard'
  | 'medicaments'
  | 'details-medicament'
  | 'rapports'
  | 'configuration'
  | 'utilisateurs'
  | 'clients';

export interface User {
  id: string;
  nom: string;
  email: string;
  role: 'admin' | 'user';
}

export interface Medicament {
  id: string;
  nom: string;
  description: string;
  dosage: string;
  prix: number;
  stock: number;
  groupe_id: string;
  image_path?: string;
  groupe?: GroupeMedicament;
}

export interface GroupeMedicament {
  id: string;
  nom: string;
  description?: string;
}

export interface DashboardStats {
  total_medicaments: number;
  total_clients: number;
  total_fournisseurs: number;
  total_factures: number;
  total_commandes: number;
  medicaments_stock_faible: number;
  chiffre_affaires_mois: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nom: string;
  email: string;
  password: string;
  password_confirmation: string;
}
