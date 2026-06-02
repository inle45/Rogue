// Types fondamentaux du jeu PokéDraft

export interface StatsPokemon {
  pv: number;
  attaque: number;
  defense: number;
  vitesse: number;
}

export interface PokemonCache {
  id: number;
  nom: string;
  nomFr: string;
  types: string[];
  stats: StatsPokemon;
  sprite: string;
  bst: number;
  rarete: 1 | 2 | 3 | 4;
  shiny?: boolean;
  mouvements?: string[];
  nature?: import('../data/natures').Nature;
}

export interface PokemonEquipe extends PokemonCache {
  instanceId: string;
  pvActuels: number;
  bonusAttaque: number;
  bonusDefense: number;
  bonusPv: number;
  item?: import('../data/items').ItemJeu;
  itemConsomme?: boolean;
  statut?: 'poison' | 'brulure' | 'paralysie' | 'sommeil' | 'gel';
  etoiles?: 1 | 2 | 3;
}

export interface PokemonBoutique extends PokemonCache {
  prix: number;
  achete: boolean;
  pokemonSemaine?: boolean;
}

export type TypePokemon =
  | 'fire' | 'water' | 'grass' | 'electric' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic'
  | 'bug' | 'rock' | 'ghost' | 'dragon' | 'dark'
  | 'steel' | 'fairy' | 'normal';
