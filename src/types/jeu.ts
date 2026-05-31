// Types de l'état global du jeu

// 'victoire' supprimée : après un combat gagné on revient directement en 'draft'
export type PhaseJeu = 'chargement' | 'draft' | 'combat' | 'defaite';

export interface EtatJeu {
  phase: PhaseJeu;
  pokedollars: number;
  pvJoueur: number;
  pvJoueurMax: number;
  etage: number;
  terrain: (import('./pokemon').PokemonEquipe | null)[];  // 3 slots
  banc: (import('./pokemon').PokemonEquipe | null)[];     // 3 slots
  boutique: import('./pokemon').PokemonBoutique[];
  coutRefresh: number;
}

export interface SynergieActive {
  type: string;
  niveau: number;
  description: string;
  bonusAttaque: number;
  bonusPv: number;
  bonusDefense: number;
}

export interface ResultatCombat {
  victoire: boolean;
  tours: TourCombat[];
  equipeFinalJoueur: import('./pokemon').PokemonEquipe[];
  equipeFinalEnnemi: import('./pokemon').PokemonEquipe[];
}

export interface TourCombat {
  attaquant: string;
  defenseur: string;
  instanceIdDefenseur: string;
  degats: number;
  multiplicateur: number;
  pvRestantsDefenseur: number;
  message: string;
  // présent si une capacité spéciale s'est déclenchée ce tour
  capacite?: { nom: string; description: string; cibleAoe?: boolean };
}
