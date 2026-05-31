// Moteur de résolution automatique des combats au tour par tour

import type { PokemonEquipe, PokemonCache } from '../types/pokemon';
import type { TourCombat, ResultatCombat } from '../types/jeu';
import { getMultiplicateur } from '../data/typeEfficacite';
import { calculerSynergies } from '../data/synergies';
import { CAPACITES_PAR_TYPE } from '../data/capacites';

function appliquerBonusSynergies(equipe: PokemonEquipe[]): PokemonEquipe[] {
  const synergies = calculerSynergies(equipe);
  return equipe.map(pokemon => {
    let bonusAttaque = 0, bonusPv = 0, bonusDefense = 0;
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
  defenseur: PokemonEquipe,
  ignorerDefense = false,
  multiplicateurCapacite = 1,
): { degats: number; multiplicateur: number } {
  const bonusAtk = 1 + attaquant.bonusAttaque / 100;
  const defenseEffective = ignorerDefense ? 1 : Math.max(1, defenseur.stats.defense * (1 + defenseur.bonusDefense / 100));
  const base = Math.max(1, Math.floor((attaquant.stats.attaque * bonusAtk) / defenseEffective * 15));
  const multiplicateur = getMultiplicateur(attaquant.types[0], defenseur.types);
  return {
    degats: Math.max(1, Math.floor(base * multiplicateur * multiplicateurCapacite)),
    multiplicateur,
  };
}

export function resoudreCombat(
  equipeJoueur: PokemonEquipe[],
  equipeEnnemi: PokemonEquipe[]
): ResultatCombat {
  const joueurs = appliquerBonusSynergies(equipeJoueur.map(p => ({ ...p })));
  const ennemis = appliquerBonusSynergies(equipeEnnemi.map(p => ({ ...p })));
  const tours: TourCombat[] = [];

  // Compteur d'attaques par Pokémon (instanceId → nombre de coups portés)
  const compteurAttaques: Record<string, number> = {};
  // Pokémon paralysés sautent leur prochain tour
  const paralysieIds = new Set<string>();

  let tourMax = 60;

  while (tourMax-- > 0) {
    const joueurVivants = joueurs.filter(p => p.pvActuels > 0);
    const ennemiVivants = ennemis.filter(p => p.pvActuels > 0);
    if (!joueurVivants.length || !ennemiVivants.length) break;

    const combattants = [
      ...joueurVivants.map(p => ({ pokemon: p, equipe: 'joueur' as const })),
      ...ennemiVivants.map(p => ({ pokemon: p, equipe: 'ennemi' as const })),
    ].sort((a, b) => b.pokemon.stats.vitesse - a.pokemon.stats.vitesse);

    for (const { pokemon, equipe } of combattants) {
      if (pokemon.pvActuels <= 0) continue;

      // Paralysé : saute ce tour
      if (paralysieIds.has(pokemon.instanceId)) {
        paralysieIds.delete(pokemon.instanceId);
        tours.push({
          attaquant: pokemon.nomFr,
          defenseur: pokemon.nomFr,
          instanceIdDefenseur: pokemon.instanceId,
          degats: 0,
          multiplicateur: 1,
          pvRestantsDefenseur: pokemon.pvActuels,
          message: `${pokemon.nomFr} est paralysé et ne peut pas attaquer !`,
        });
        continue;
      }

      const cibles = equipe === 'joueur'
        ? ennemis.filter(p => p.pvActuels > 0)
        : joueurs.filter(p => p.pvActuels > 0);
      const allies = equipe === 'joueur' ? joueurs : ennemis;
      if (!cibles.length) break;

      const cible = cibles.reduce((min, p) => p.pvActuels < min.pvActuels ? p : min);

      // Incrémente le compteur d'attaques
      compteurAttaques[pokemon.instanceId] = (compteurAttaques[pokemon.instanceId] ?? 0) + 1;
      const declencheCapacite = compteurAttaques[pokemon.instanceId] % 3 === 0;

      const typeCapacite = pokemon.types[0];
      const capDef = declencheCapacite ? CAPACITES_PAR_TYPE[typeCapacite] : undefined;

      let msg = '';
      let tourCapacite: TourCombat['capacite'] | undefined;

      if (capDef && declencheCapacite) {
        // ── Traitement de la capacité ──
        switch (capDef.effet) {
          case 'frappe_puissante': {
            const ignoreDef = capDef.nom === 'Coup Bas';
            const { degats, multiplicateur } = calculerDegats(pokemon, cible, ignoreDef, capDef.valeur);
            cible.pvActuels = Math.max(0, cible.pvActuels - degats);
            msg = `✨ ${pokemon.nomFr} utilise ${capDef.nom} ! ${degats} dégâts sur ${cible.nomFr}`;
            tourCapacite = { nom: capDef.nom, description: capDef.description };
            tours.push({
              attaquant: pokemon.nomFr, defenseur: cible.nomFr,
              instanceIdDefenseur: cible.instanceId,
              degats, multiplicateur, pvRestantsDefenseur: cible.pvActuels,
              message: msg, capacite: tourCapacite,
            });
            break;
          }
          case 'degats_aoe': {
            const degatsParCible = Math.max(1, Math.floor(pokemon.stats.attaque * (1 + pokemon.bonusAttaque / 100) * capDef.valeur));
            let msgAoe = `💥 ${pokemon.nomFr} utilise ${capDef.nom} ! `;
            cibles.forEach(c => {
              c.pvActuels = Math.max(0, c.pvActuels - degatsParCible);
              msgAoe += `${c.nomFr} (−${degatsParCible}) `;
            });
            tourCapacite = { nom: capDef.nom, description: capDef.description, cibleAoe: true };
            tours.push({
              attaquant: pokemon.nomFr, defenseur: 'tous les ennemis',
              instanceIdDefenseur: cible.instanceId,
              degats: degatsParCible, multiplicateur: 1,
              pvRestantsDefenseur: cible.pvActuels,
              message: msgAoe.trim(), capacite: tourCapacite,
            });
            break;
          }
          case 'soin_equipe': {
            let msgSoin = `💚 ${pokemon.nomFr} utilise ${capDef.nom} ! `;
            allies.filter(a => a.pvActuels > 0).forEach(a => {
              const pvMax = a.stats.pv + a.bonusPv;
              const soin = Math.floor(pvMax * capDef.valeur);
              a.pvActuels = Math.min(pvMax, a.pvActuels + soin);
              msgSoin += `${a.nomFr} (+${soin}) `;
            });
            tourCapacite = { nom: capDef.nom, description: capDef.description };
            // Après soin, attaque normalement
            const { degats, multiplicateur } = calculerDegats(pokemon, cible);
            cible.pvActuels = Math.max(0, cible.pvActuels - degats);
            tours.push({
              attaquant: pokemon.nomFr, defenseur: cible.nomFr,
              instanceIdDefenseur: cible.instanceId,
              degats, multiplicateur, pvRestantsDefenseur: cible.pvActuels,
              message: msgSoin.trim(), capacite: tourCapacite,
            });
            break;
          }
          case 'paralysie': {
            paralysieIds.add(cible.instanceId);
            const { degats, multiplicateur } = calculerDegats(pokemon, cible);
            cible.pvActuels = Math.max(0, cible.pvActuels - degats);
            tourCapacite = { nom: capDef.nom, description: capDef.description };
            tours.push({
              attaquant: pokemon.nomFr, defenseur: cible.nomFr,
              instanceIdDefenseur: cible.instanceId,
              degats, multiplicateur, pvRestantsDefenseur: cible.pvActuels,
              message: `⚡ ${pokemon.nomFr} utilise ${capDef.nom} ! ${cible.nomFr} est paralysé ! (${degats} dégâts)`,
              capacite: tourCapacite,
            });
            break;
          }
        }
      } else {
        // Attaque normale
        const { degats, multiplicateur } = calculerDegats(pokemon, cible);
        cible.pvActuels = Math.max(0, cible.pvActuels - degats);
        msg = `${pokemon.nomFr} attaque ${cible.nomFr} pour ${degats} dégâts`;
        if (multiplicateur === 2) msg += ' — C\'est super efficace !';
        else if (multiplicateur === 0.5) msg += ' — Ce n\'est pas très efficace…';
        else if (multiplicateur === 0) msg += ' — Ça n\'affecte pas !';
        tours.push({
          attaquant: pokemon.nomFr, defenseur: cible.nomFr,
          instanceIdDefenseur: cible.instanceId,
          degats, multiplicateur, pvRestantsDefenseur: cible.pvActuels,
          message: msg,
        });
      }
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
      bonusAttaque: 0, bonusDefense: 0, bonusPv: 0,
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
