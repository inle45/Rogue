// Définition des synergies par type

import type { SynergieActive } from '../types/jeu';
import type { PokemonEquipe } from '../types/pokemon';

interface DefinitionSynergie {
  paliers: { nombre: number; description: string; bonusAttaque: number; bonusPv: number; bonusDefense: number }[];
}

export const SYNERGIES: Record<string, DefinitionSynergie> = {
  water: {
    paliers: [
      { nombre: 2, description: '+20% PV pour tous les Pokémon Eau', bonusAttaque: 0, bonusPv: 20, bonusDefense: 0 },
      { nombre: 3, description: '+40% PV et +15% Défense pour tous les Pokémon Eau', bonusAttaque: 0, bonusPv: 40, bonusDefense: 15 },
    ],
  },
  fire: {
    paliers: [
      { nombre: 2, description: '+25% Attaque pour tous les Pokémon Feu', bonusAttaque: 25, bonusPv: 0, bonusDefense: 0 },
      { nombre: 3, description: '+50% Attaque pour tous les Pokémon Feu', bonusAttaque: 50, bonusPv: 0, bonusDefense: 0 },
    ],
  },
  grass: {
    paliers: [
      { nombre: 2, description: '+15% PV et régénération en combat', bonusAttaque: 0, bonusPv: 15, bonusDefense: 0 },
      { nombre: 3, description: '+30% PV et +20% Défense', bonusAttaque: 0, bonusPv: 30, bonusDefense: 20 },
    ],
  },
  electric: {
    paliers: [
      { nombre: 2, description: '+30% Vitesse (attaque en premier)', bonusAttaque: 15, bonusPv: 0, bonusDefense: 0 },
    ],
  },
  psychic: {
    paliers: [
      { nombre: 2, description: '+20% Attaque et +10% PV', bonusAttaque: 20, bonusPv: 10, bonusDefense: 0 },
    ],
  },
  rock: {
    paliers: [
      { nombre: 2, description: '+30% Défense', bonusAttaque: 0, bonusPv: 0, bonusDefense: 30 },
    ],
  },
  fighting: {
    paliers: [
      { nombre: 2, description: '+35% Attaque', bonusAttaque: 35, bonusPv: 0, bonusDefense: 0 },
    ],
  },
  normal: {
    paliers: [
      { nombre: 3, description: '+10% à toutes les stats', bonusAttaque: 10, bonusPv: 10, bonusDefense: 10 },
    ],
  },
};

export function calculerSynergies(terrain: (PokemonEquipe | null)[]): SynergieActive[] {
  const compteurTypes: Record<string, number> = {};

  for (const pokemon of terrain) {
    if (!pokemon) continue;
    for (const type of pokemon.types) {
      compteurTypes[type] = (compteurTypes[type] || 0) + 1;
    }
  }

  const synergiesActives: SynergieActive[] = [];

  for (const [type, count] of Object.entries(compteurTypes)) {
    const def = SYNERGIES[type];
    if (!def) continue;

    // Trouve le palier maximal atteint
    let meilleurPalier = null;
    for (const palier of def.paliers) {
      if (count >= palier.nombre) {
        meilleurPalier = palier;
      }
    }

    if (meilleurPalier) {
      synergiesActives.push({
        type,
        niveau: meilleurPalier.nombre,
        description: meilleurPalier.description,
        bonusAttaque: meilleurPalier.bonusAttaque,
        bonusPv: meilleurPalier.bonusPv,
        bonusDefense: meilleurPalier.bonusDefense,
      });
    }
  }

  return synergiesActives;
}
