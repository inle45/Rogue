// Types de l'état global du jeu

export type PhaseJeu = 'chargement' | 'draft' | 'combat' | 'victoire' | 'defaite';

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
  degats: number;
  multiplicateur: number;
  pvRestantsDefenseur: number;
  message: string;
}
