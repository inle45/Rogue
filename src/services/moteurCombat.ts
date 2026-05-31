// Moteur de résolution automatique des combats au tour par tour

import type { PokemonEquipe, PokemonCache } from '../types/pokemon';
import type { TourCombat, ResultatCombat } from '../types/jeu';
import { getMultiplicateur } from '../data/typeEfficacite';
import { calculerSynergies } from '../data/synergies';

function appliquerBonusSynergies(equipe: PokemonEquipe[]): PokemonEquipe[] {
  const synergies = calculerSynergies(equipe);
  return equipe.map(pokemon => {
    let bonusAttaque = 0;
    let bonusPv = 0;
    let bonusDefense = 0;
    for (const s of synergies) {
      if (pokemon.types.includes(s.type)) {
        bonusAttaque += s.bonusAttaque;
        bonusPv += s.bonusPv;
        bonusDefense += s.bonusDefense;
      }
    }
    const pvMax = Math.floor(pokemon.stats.pv * (1 + bonusPv / 100));
    return { ...pokemon, bonusAttaque, bonusPv, bonusDefense, pvActuels: Math.min(pokemon.pvActuels, pvMax) };
  });
}

function calculerDegats(
  attaquant: PokemonEquipe,
  defenseur: PokemonEquipe
): { degats: number; multiplicateur: number } {
  const bonusAtk = 1 + attaquant.bonusAttaque / 100;
  // Correction bug division par zéro : défense minimale de 1
  const defenseEffective = Math.max(1, defenseur.stats.defense * (1 + defenseur.bonusDefense / 100));
  const base = Math.max(1, Math.floor((attaquant.stats.attaque * bonusAtk) / defenseEffective * 15));
  const multiplicateur = getMultiplicateur(attaquant.types[0], defenseur.types);
  return { degats: Math.max(1, Math.floor(base * multiplicateur)), multiplicateur };
}

export function resoudreCombat(
  equipeJoueur: PokemonEquipe[],
  equipeEnnemi: PokemonEquipe[]
): ResultatCombat {
  // Correction : les deux équipes bénéficient de leurs synergies de types
  const joueurs = appliquerBonusSynergies(equipeJoueur.map(p => ({ ...p })));
  const ennemis = appliquerBonusSynergies(equipeEnnemi.map(p => ({ ...p })));
  const tours: TourCombat[] = [];
  let tourMax = 60;

  while (tourMax-- > 0) {
    const joueurVivants = joueurs.filter(p => p.pvActuels > 0);
    const ennemiVivants = ennemis.filter(p => p.pvActuels > 0);
    if (joueurVivants.length === 0 || ennemiVivants.length === 0) break;

    const combattants = [
      ...joueurVivants.map(p => ({ pokemon: p, equipe: 'joueur' as const })),
      ...ennemiVivants.map(p => ({ pokemon: p, equipe: 'ennemi' as const })),
    ].sort((a, b) => b.pokemon.stats.vitesse - a.pokemon.stats.vitesse);

    for (const { pokemon, equipe } of combattants) {
      if (pokemon.pvActuels <= 0) continue;
      const cibles = equipe === 'joueur'
        ? ennemis.filter(p => p.pvActuels > 0)
        : joueurs.filter(p => p.pvActuels > 0);
      if (cibles.length === 0) break;

      const cible = cibles.reduce((min, p) => p.pvActuels < min.pvActuels ? p : min);
      const { degats, multiplicateur } = calculerDegats(pokemon, cible);
      cible.pvActuels = Math.max(0, cible.pvActuels - degats);

      let msg = `${pokemon.nomFr} attaque ${cible.nomFr} pour ${degats} dégâts`;
      if (multiplicateur === 2) msg += ' — C\'est super efficace !';
      else if (multiplicateur === 0.5) msg += ' — Ce n\'est pas très efficace…';
      else if (multiplicateur === 0) msg += ' — Ça n\'affecte pas !';

      tours.push({
        attaquant: pokemon.nomFr,
        defenseur: cible.nomFr,
        instanceIdDefenseur: cible.instanceId,
        degats,
        multiplicateur,
        pvRestantsDefenseur: cible.pvActuels,
        message: msg,
      });
    }
  }

  return {
    victoire: ennemis.every(p => p.pvActuels <= 0),
    tours,
    equipeFinalJoueur: joueurs,
    equipeFinalEnnemi: ennemis,
  };
}

export function genererEquipeEnnemi(cache: PokemonCache[], etage: number): PokemonEquipe[] {
  const disponibles = [...cache];
  const taille = Math.min(3, 1 + Math.floor(etage / 2));
  const equipe: PokemonEquipe[] = [];

  for (let i = 0; i < taille; i++) {
    const idx = Math.floor(Math.random() * disponibles.length);
    const p = disponibles.splice(idx, 1)[0];
    const facteur = 1 + (etage - 1) * 0.15;
    equipe.push({
      ...p,
      instanceId: `ennemi_${Math.random().toString(36).slice(2)}`,
      pvActuels: Math.floor(p.stats.pv * facteur),
      bonusAttaque: 0,
      bonusDefense: 0,
      bonusPv: 0,
      stats: {
        pv: Math.floor(p.stats.pv * facteur),
        attaque: Math.floor(p.stats.attaque * facteur),
        defense: Math.floor(p.stats.defense * facteur),
        vitesse: p.stats.vitesse,
      },
    });
  }
  return equipe;
}
