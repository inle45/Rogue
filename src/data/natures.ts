import type { StatsPokemon } from '../types/pokemon';

export interface Nature {
  nom: string;
  statBonus: keyof StatsPokemon | null;
  statMalus: keyof StatsPokemon | null;
}

export const NATURES: Nature[] = [
  { nom: 'Rigide',    statBonus: 'attaque',  statMalus: 'vitesse' },
  { nom: 'Solitaire', statBonus: 'attaque',  statMalus: 'defense' },
  { nom: 'Brave',     statBonus: 'attaque',  statMalus: 'vitesse' },
  { nom: 'Adamant',   statBonus: 'attaque',  statMalus: 'vitesse' },
  { nom: 'Naughty',   statBonus: 'attaque',  statMalus: 'defense' },
  { nom: 'Timide',    statBonus: 'vitesse',  statMalus: 'attaque' },
  { nom: 'Jovial',    statBonus: 'vitesse',  statMalus: 'defense' },
  { nom: 'Hasty',     statBonus: 'vitesse',  statMalus: 'defense' },
  { nom: 'Naïf',      statBonus: 'vitesse',  statMalus: 'attaque' },
  { nom: 'Calme',     statBonus: 'defense',  statMalus: 'attaque' },
  { nom: 'Discret',   statBonus: 'defense',  statMalus: 'vitesse' },
  { nom: 'Poli',      statBonus: 'defense',  statMalus: 'attaque' },
  { nom: 'Prudent',   statBonus: 'defense',  statMalus: 'attaque' },
  { nom: 'Assidu',    statBonus: null,        statMalus: null },
];

export function tirerNatureAleatoire(): Nature {
  return NATURES[Math.floor(Math.random() * NATURES.length)];
}

export function appliquerNature(stats: StatsPokemon, nature: Nature): StatsPokemon {
  const s = { ...stats };
  if (nature.statBonus) s[nature.statBonus] = Math.floor(s[nature.statBonus] * 1.1);
  if (nature.statMalus) s[nature.statMalus] = Math.floor(s[nature.statMalus] * 0.9);
  return s;
}
