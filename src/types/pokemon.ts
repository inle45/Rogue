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
}

export interface PokemonEquipe extends PokemonCache {
  instanceId: string;
  pvActuels: number;
  bonusAttaque: number;
  bonusDefense: number;
  bonusPv: number;
}

export interface PokemonBoutique extends PokemonCache {
  prix: number;
  achete: boolean;
}

export type TypePokemon =
  | 'fire' | 'water' | 'grass' | 'electric' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic'
  | 'bug' | 'rock' | 'ghost' | 'dragon' | 'dark'
  | 'steel' | 'fairy' | 'normal';
