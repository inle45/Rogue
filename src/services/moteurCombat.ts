// Moteur de résolution automatique des combats au tour par tour

import type { PokemonEquipe, PokemonCache } from '../types/pokemon';
import type { TourCombat, ResultatCombat } from '../types/jeu';
import { getMultiplicateur } from '../data/typeEfficacite';
import { calculerSynergies } from '../data/synergies';
import { CAPACITES_PAR_TYPE } from '../data/capacites';
import { METEOS } from '../data/meteo';
import type { TypeMeteo } from '../data/meteo';
import { CHAMPIONS } from '../data/champions';
import type { DefinitionRelique } from '../data/reliques';

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
    // L'Épi de Choix ajoute +50% en attaque
    if (pokemon.item?.id === 'choice-band') bonusAttaque += 50;
    const pvMax = Math.floor(pokemon.stats.pv * (1 + bonusPv / 100));
    return { ...pokemon, bonusAttaque, bonusPv, bonusDefense, pvActuels: Math.min(pokemon.pvActuels, pvMax) };
  });
}

/** Calcule la vitesse effective d'un Pokémon (Serre Griffe ×1,5) */
function vitesseEffective(pokemon: PokemonEquipe): number {
  const mult = pokemon.item?.id === 'quick-claw' ? 1.5 : 1;
  return pokemon.stats.vitesse * mult;
}

/** PV max tenant compte des bonus de synergies */
function pvMax(pokemon: PokemonEquipe): number {
  return Math.floor(pokemon.stats.pv * (1 + pokemon.bonusPv / 100));
}

function calculerDegats(
  attaquant: PokemonEquipe,
  defenseur: PokemonEquipe,
  ignorerDefense = false,
  multiplicateurCapacite = 1,
  meteo: TypeMeteo = 'neutre',
  critique = false,
): { degats: number; multiplicateur: number } {
  const bonusAtk = 1 + attaquant.bonusAttaque / 100;
  const defenseEffective = ignorerDefense ? 1 : Math.max(1, defenseur.stats.defense * (1 + defenseur.bonusDefense / 100));
  let base = Math.max(1, Math.floor((attaquant.stats.attaque * bonusAtk) / defenseEffective * 20));

  // Pierre de Vie : +30% dégâts
  if (attaquant.item?.id === 'life-orb') base = Math.floor(base * 1.3);

  // Critique : double les dégâts
  if (critique) base = Math.floor(base * 2);

  const multiplicateur = getMultiplicateur(attaquant.types[0], defenseur.types);

  // Météo : boost ou pénalité selon le type de l'attaquant
  const meteoData = METEOS[meteo];
  let meteoMult = 1;
  if (meteoData.typesBoostes.includes(attaquant.types[0])) meteoMult *= 1.3;
  if (meteoData.typesPenalises.includes(attaquant.types[0])) meteoMult *= 0.7;

  let degats = Math.max(1, Math.floor(base * multiplicateur * multiplicateurCapacite * meteoMult));

  // Ceinture Expert : +20% dégâts si super efficace (×2)
  if (attaquant.item?.id === 'expert-belt' && multiplicateur >= 2) {
    degats = Math.floor(degats * 1.2);
  }

  return { degats, multiplicateur };
}

function appliquerReliquesEquipe(equipe: PokemonEquipe[], reliques: DefinitionRelique[]): PokemonEquipe[] {
  return equipe.map(pokemon => {
    let { attaque, defense, pv, vitesse } = pokemon.stats;
    let bonusAttaque = pokemon.bonusAttaque;
    let bonusDefense = pokemon.bonusDefense;
    let bonusPv = pokemon.bonusPv;
    let pvActuels = pokemon.pvActuels;

    for (const r of reliques) {
      if (r.effet === 'bonus_atk_global') {
        attaque = Math.floor(attaque * (1 + r.valeur));
      } else if (r.effet === 'bonus_def_global') {
        defense = Math.floor(defense * (1 + r.valeur));
      } else if (r.effet === 'bonus_pv_global') {
        const ancienMax = Math.floor(pv * (1 + bonusPv / 100));
        pv = Math.floor(pv * (1 + r.valeur));
        const nouveauMax = Math.floor(pv * (1 + bonusPv / 100));
        // Ajuste pvActuels proportionnellement
        if (ancienMax > 0) pvActuels = Math.floor(pvActuels * (nouveauMax / ancienMax));
      } else if (r.effet === 'vitesse_globale') {
        vitesse = Math.floor(vitesse * (1 + r.valeur));
      }
    }

    return {
      ...pokemon,
      stats: { attaque, defense, pv, vitesse },
      bonusAttaque,
      bonusDefense,
      bonusPv,
      pvActuels,
    };
  });
}

export function resoudreCombat(
  equipeJoueur: PokemonEquipe[],
  equipeEnnemi: PokemonEquipe[],
  meteo: TypeMeteo = 'neutre',
  reliques: DefinitionRelique[] = [],
  estBoss = false,
): ResultatCombat {
  let joueurs = appliquerBonusSynergies(equipeJoueur.map(p => ({ ...p })));
  const ennemis = appliquerBonusSynergies(equipeEnnemi.map(p => ({ ...p })));

  // Applique les reliques à l'équipe joueur
  if (reliques.length > 0) {
    joueurs = appliquerReliquesEquipe(joueurs, reliques);
  }

  const tours: TourCombat[] = [];
  const meteoData = METEOS[meteo];

  // Récupère la chance de coup critique depuis les reliques
  const reliqueCritique = reliques.find(r => r.effet === 'coup_critique_chance');
  const chanceCritique = reliqueCritique ? reliqueCritique.valeur : 0;

  // Résistance boss : réduit les dégâts reçus par le joueur de 20%
  const resistanceBoss = estBoss ? reliques.filter(r => r.effet === 'resistance_boss').reduce((acc, r) => acc * (1 - r.valeur), 1) : 1;

  // Compteur d'attaques par Pokémon (instanceId → nombre de coups portés)
  const compteurAttaques: Record<string, number> = {};
  // Pokémon paralysés sautent leur prochain tour
  const paralysieIds = new Set<string>();
  // Baies Sitrus consommées (usage unique)
  const sitrusConso = new Set<string>();
  // Focus Sash utilisés (usage unique)
  const sashUtilise = new Set<string>();

  let tourMax = 60;

  while (tourMax-- > 0) {
    const joueurVivants = joueurs.filter(p => p.pvActuels > 0);
    const ennemiVivants = ennemis.filter(p => p.pvActuels > 0);
    if (!joueurVivants.length || !ennemiVivants.length) break;

    // ── Dégâts de météo au début du tour ──
    if (meteoData.degatsParTour > 0) {
      for (const pokemon of [...joueurVivants, ...ennemiVivants]) {
        if (!meteoData.typesImmunsMeteo.includes(pokemon.types[0])) {
          const dmgMeteo = Math.max(1, Math.floor(pvMax(pokemon) * meteoData.degatsParTour));
          pokemon.pvActuels = Math.max(0, pokemon.pvActuels - dmgMeteo);
          tours.push({
            attaquant: meteoData.nom,
            defenseur: pokemon.nomFr,
            instanceIdDefenseur: pokemon.instanceId,
            degats: dmgMeteo,
            multiplicateur: 1,
            pvRestantsDefenseur: pokemon.pvActuels,
            message: `${meteoData.icone} ${pokemon.nomFr} subit les dégâts de ${meteoData.nom.toLowerCase()} ! (−${dmgMeteo} PV)`,
            meteo,
          });
        }
      }
      // Refiltre après dégâts météo
      const jV2 = joueurs.filter(p => p.pvActuels > 0);
      const eV2 = ennemis.filter(p => p.pvActuels > 0);
      if (!jV2.length || !eV2.length) break;
    }

    // ── Début de tour : effets passifs ──
    for (const pokemon of [...joueurs.filter(p => p.pvActuels > 0), ...ennemis.filter(p => p.pvActuels > 0)]) {
      const max = pvMax(pokemon);

      // Restes : régénère 6% PV max
      if (pokemon.item?.id === 'leftovers') {
        const soin = Math.max(1, Math.floor(max * 0.06));
        pokemon.pvActuels = Math.min(max, pokemon.pvActuels + soin);
        tours.push({
          attaquant: pokemon.nomFr,
          defenseur: pokemon.nomFr,
          instanceIdDefenseur: pokemon.instanceId,
          degats: 0,
          multiplicateur: 1,
          pvRestantsDefenseur: pokemon.pvActuels,
          message: `💚 ${pokemon.nomFr} récupère ${soin} PV grâce aux Restes.`,
        });
      }

      // Baie Sitrus : soin unique si PV < 50%
      if (
        pokemon.item?.id === 'sitrus-berry' &&
        !sitrusConso.has(pokemon.instanceId) &&
        pokemon.pvActuels < max / 2
      ) {
        sitrusConso.add(pokemon.instanceId);
        const soin = Math.max(1, Math.floor(max * 0.3));
        pokemon.pvActuels = Math.min(max, pokemon.pvActuels + soin);
        tours.push({
          attaquant: pokemon.nomFr,
          defenseur: pokemon.nomFr,
          instanceIdDefenseur: pokemon.instanceId,
          degats: 0,
          multiplicateur: 1,
          pvRestantsDefenseur: pokemon.pvActuels,
          message: `🍋 ${pokemon.nomFr} mange sa Baie Sitrus et récupère ${soin} PV !`,
        });
      }
    }

    const combattants = [
      ...joueurs.filter(p => p.pvActuels > 0).map(p => ({ pokemon: p, equipe: 'joueur' as const })),
      ...ennemis.filter(p => p.pvActuels > 0).map(p => ({ pokemon: p, equipe: 'ennemi' as const })),
    ].sort((a, b) => vitesseEffective(b.pokemon) - vitesseEffective(a.pokemon));

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

      // Coup critique pour relique
      const estCritique = chanceCritique > 0 && equipe === 'joueur' && Math.random() < chanceCritique;

      let msg = '';
      let tourCapacite: TourCombat['capacite'] | undefined;

      if (capDef && declencheCapacite) {
        // ── Traitement de la capacité ──
        switch (capDef.effet) {
          case 'frappe_puissante': {
            const ignoreDef = capDef.nom === 'Coup Bas';
            const { degats: degatsBase, multiplicateur } = calculerDegats(pokemon, cible, ignoreDef, capDef.valeur, meteo, estCritique);
            let degats = degatsBase;
            // Résistance boss si l'ennemi attaque le joueur
            if (equipe === 'ennemi' && resistanceBoss < 1) degats = Math.max(1, Math.floor(degats * resistanceBoss));
            const pvAvant = cible.pvActuels;
            cible.pvActuels = Math.max(0, cible.pvActuels - degats);
            // Focus Sash : survie à 1PV si KO depuis PV max
            if (
              cible.pvActuels <= 0 &&
              pvAvant >= pvMax(cible) &&
              cible.item?.id === 'focus-sash' &&
              !sashUtilise.has(cible.instanceId)
            ) {
              sashUtilise.add(cible.instanceId);
              cible.pvActuels = 1;
            }
            msg = `✨ ${pokemon.nomFr} utilise ${capDef.nom} ! ${degats} dégâts sur ${cible.nomFr}`;
            if (estCritique) msg += ' 💥 CRITIQUE !';
            tourCapacite = { nom: capDef.nom, description: capDef.description };
            tours.push({
              attaquant: pokemon.nomFr, defenseur: cible.nomFr,
              instanceIdDefenseur: cible.instanceId,
              degats, multiplicateur, pvRestantsDefenseur: cible.pvActuels,
              message: msg, capacite: tourCapacite,
            });
            // Pierre de Vie : retire 8% PV max après attaque
            if (pokemon.item?.id === 'life-orb') {
              const cout = Math.max(1, Math.floor(pvMax(pokemon) * 0.08));
              pokemon.pvActuels = Math.max(1, pokemon.pvActuels - cout);
            }
            // Rocky Helmet : l'attaquant prend 12% pvMax du défenseur en retour
            if (cible.item?.id === 'rocky-helmet') {
              const retour = Math.max(1, Math.floor(pvMax(cible) * 0.12));
              pokemon.pvActuels = Math.max(0, pokemon.pvActuels - retour);
              tours.push({
                attaquant: cible.nomFr, defenseur: pokemon.nomFr,
                instanceIdDefenseur: pokemon.instanceId,
                degats: retour, multiplicateur: 1,
                pvRestantsDefenseur: pokemon.pvActuels,
                message: `🪨 Les Restes de Rocher de ${cible.nomFr} blessent ${pokemon.nomFr} de ${retour} PV !`,
              });
            }
            break;
          }
          case 'degats_aoe': {
            const degatsParCible = Math.max(1, Math.floor(pokemon.stats.attaque * (1 + pokemon.bonusAttaque / 100) * capDef.valeur));
            let msgAoe = `💥 ${pokemon.nomFr} utilise ${capDef.nom} ! `;
            cibles.forEach(c => {
              const pvAvantAoe = c.pvActuels;
              c.pvActuels = Math.max(0, c.pvActuels - degatsParCible);
              // Focus Sash
              if (
                c.pvActuels <= 0 &&
                pvAvantAoe >= pvMax(c) &&
                c.item?.id === 'focus-sash' &&
                !sashUtilise.has(c.instanceId)
              ) {
                sashUtilise.add(c.instanceId);
                c.pvActuels = 1;
              }
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
            // Pierre de Vie après AoE
            if (pokemon.item?.id === 'life-orb') {
              const cout = Math.max(1, Math.floor(pvMax(pokemon) * 0.08));
              pokemon.pvActuels = Math.max(1, pokemon.pvActuels - cout);
            }
            break;
          }
          case 'soin_equipe': {
            let msgSoin = `💚 ${pokemon.nomFr} utilise ${capDef.nom} ! `;
            allies.filter(a => a.pvActuels > 0).forEach(a => {
              const max = pvMax(a);
              const soin = Math.floor(max * capDef.valeur);
              a.pvActuels = Math.min(max, a.pvActuels + soin);
              msgSoin += `${a.nomFr} (+${soin}) `;
            });
            tourCapacite = { nom: capDef.nom, description: capDef.description };
            // Après soin, attaque normalement
            const { degats: degAtk, multiplicateur: multAtk } = calculerDegats(pokemon, cible, false, 1, meteo, estCritique);
            let degats = degAtk;
            if (equipe === 'ennemi' && resistanceBoss < 1) degats = Math.max(1, Math.floor(degats * resistanceBoss));
            const pvAvantSoin = cible.pvActuels;
            cible.pvActuels = Math.max(0, cible.pvActuels - degats);
            if (
              cible.pvActuels <= 0 &&
              pvAvantSoin >= pvMax(cible) &&
              cible.item?.id === 'focus-sash' &&
              !sashUtilise.has(cible.instanceId)
            ) {
              sashUtilise.add(cible.instanceId);
              cible.pvActuels = 1;
            }
            tours.push({
              attaquant: pokemon.nomFr, defenseur: cible.nomFr,
              instanceIdDefenseur: cible.instanceId,
              degats, multiplicateur: multAtk, pvRestantsDefenseur: cible.pvActuels,
              message: msgSoin.trim(), capacite: tourCapacite,
            });
            // Pierre de Vie
            if (pokemon.item?.id === 'life-orb') {
              const cout = Math.max(1, Math.floor(pvMax(pokemon) * 0.08));
              pokemon.pvActuels = Math.max(1, pokemon.pvActuels - cout);
            }
            // Rocky Helmet
            if (cible.item?.id === 'rocky-helmet') {
              const retour = Math.max(1, Math.floor(pvMax(cible) * 0.12));
              pokemon.pvActuels = Math.max(0, pokemon.pvActuels - retour);
            }
            break;
          }
          case 'paralysie': {
            paralysieIds.add(cible.instanceId);
            const { degats: degParal, multiplicateur: multParal } = calculerDegats(pokemon, cible, false, 1, meteo, estCritique);
            let degats = degParal;
            if (equipe === 'ennemi' && resistanceBoss < 1) degats = Math.max(1, Math.floor(degats * resistanceBoss));
            const pvAvantParalysie = cible.pvActuels;
            cible.pvActuels = Math.max(0, cible.pvActuels - degats);
            if (
              cible.pvActuels <= 0 &&
              pvAvantParalysie >= pvMax(cible) &&
              cible.item?.id === 'focus-sash' &&
              !sashUtilise.has(cible.instanceId)
            ) {
              sashUtilise.add(cible.instanceId);
              cible.pvActuels = 1;
            }
            tourCapacite = { nom: capDef.nom, description: capDef.description };
            tours.push({
              attaquant: pokemon.nomFr, defenseur: cible.nomFr,
              instanceIdDefenseur: cible.instanceId,
              degats, multiplicateur: multParal, pvRestantsDefenseur: cible.pvActuels,
              message: `⚡ ${pokemon.nomFr} utilise ${capDef.nom} ! ${cible.nomFr} est paralysé ! (${degats} dégâts)`,
              capacite: tourCapacite,
            });
            // Pierre de Vie
            if (pokemon.item?.id === 'life-orb') {
              const cout = Math.max(1, Math.floor(pvMax(pokemon) * 0.08));
              pokemon.pvActuels = Math.max(1, pokemon.pvActuels - cout);
            }
            // Rocky Helmet
            if (cible.item?.id === 'rocky-helmet') {
              const retour = Math.max(1, Math.floor(pvMax(cible) * 0.12));
              pokemon.pvActuels = Math.max(0, pokemon.pvActuels - retour);
            }
            break;
          }
        }
      } else {
        // Attaque normale — utilise un vrai mouvement si disponible
        const nomAttaque = pokemon.mouvements && pokemon.mouvements.length > 0
          ? pokemon.mouvements[Math.floor(Math.random() * pokemon.mouvements.length)]
          : 'Attaque';
        const { degats: degNormal, multiplicateur } = calculerDegats(pokemon, cible, false, 1, meteo, estCritique);
        let degats = degNormal;
        // Résistance boss si l'ennemi attaque le joueur
        if (equipe === 'ennemi' && resistanceBoss < 1) degats = Math.max(1, Math.floor(degats * resistanceBoss));
        const pvAvantNormal = cible.pvActuels;
        cible.pvActuels = Math.max(0, cible.pvActuels - degats);
        // Focus Sash : survie à 1PV si KO depuis PV max
        if (
          cible.pvActuels <= 0 &&
          pvAvantNormal >= pvMax(cible) &&
          cible.item?.id === 'focus-sash' &&
          !sashUtilise.has(cible.instanceId)
        ) {
          sashUtilise.add(cible.instanceId);
          cible.pvActuels = 1;
        }
        msg = `${pokemon.nomFr} utilise ${nomAttaque} → ${cible.nomFr} perd ${degats} PV`;
        if (estCritique) msg += ' 💥 CRITIQUE !';
        else if (multiplicateur === 2) msg += ' — C\'est super efficace !';
        else if (multiplicateur === 0.5) msg += ' — Ce n\'est pas très efficace…';
        else if (multiplicateur === 0) msg += ' — Ça n\'affecte pas !';
        tours.push({
          attaquant: pokemon.nomFr, defenseur: cible.nomFr,
          instanceIdDefenseur: cible.instanceId,
          degats, multiplicateur, pvRestantsDefenseur: cible.pvActuels,
          message: msg,
        });
        // Pierre de Vie : retire 8% pvMax après attaque
        if (pokemon.item?.id === 'life-orb') {
          const cout = Math.max(1, Math.floor(pvMax(pokemon) * 0.08));
          pokemon.pvActuels = Math.max(1, pokemon.pvActuels - cout);
        }
        // Rocky Helmet : l'attaquant prend 12% pvMax du défenseur en retour
        if (cible.item?.id === 'rocky-helmet') {
          const retour = Math.max(1, Math.floor(pvMax(cible) * 0.12));
          pokemon.pvActuels = Math.max(0, pokemon.pvActuels - retour);
          tours.push({
            attaquant: cible.nomFr, defenseur: pokemon.nomFr,
            instanceIdDefenseur: pokemon.instanceId,
            degats: retour, multiplicateur: 1,
            pvRestantsDefenseur: pokemon.pvActuels,
            message: `🪨 Les Restes de Rocher de ${cible.nomFr} blessent ${pokemon.nomFr} de ${retour} PV !`,
          });
        }
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
  const champion = CHAMPIONS[etage];
  let disponibles = [...cache];

  if (champion) {
    // Filtre par type spécialité du champion
    const parType = cache.filter(p => p.types.includes(champion.typeSpecialite));
    // Prend les 3 plus forts (BST) si assez, sinon fallback
    const tries = parType.sort((a, b) => b.bst - a.bst);
    disponibles = tries.length >= 3 ? tries : [...cache].sort((a, b) => b.bst - a.bst);
  }

  const taille = Math.min(3, 1 + Math.floor(etage / 2));
  const equipe: PokemonEquipe[] = [];
  const indices = new Set<number>();

  for (let i = 0; i < taille; i++) {
    if (indices.size >= disponibles.length) break;
    let idx: number;
    do { idx = Math.floor(Math.random() * disponibles.length); } while (indices.has(idx));
    indices.add(idx);
    const p = disponibles[idx];
    const facteur = champion ? 1.3 : (1 + (etage - 1) * 0.15);
    equipe.push({
      ...p,
      instanceId: `ennemi_${Math.random().toString(36).slice(2)}`,
      pvActuels: Math.floor(p.stats.pv * facteur),
      bonusAttaque: 0, bonusDefense: 0, bonusPv: 0,
      stats: {
        pv: Math.floor(p.stats.pv * facteur),
        attaque: Math.floor(p.stats.attaque * facteur),
        defense: Math.floor(p.stats.defense * facteur),
        vitesse: champion ? Math.floor(p.stats.vitesse * facteur) : p.stats.vitesse,
      },
    });
  }
  return equipe;
}
