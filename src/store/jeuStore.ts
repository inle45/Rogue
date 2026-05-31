// Store Zustand principal — gestion de l'état global du jeu

import { create } from 'zustand';
import type { EtatJeu, PhaseJeu } from '../types/jeu';
import type { PokemonCache, PokemonEquipe, PokemonBoutique } from '../types/pokemon';
import { calculerSynergies } from '../data/synergies';
import { genererItemsAleatoires } from '../data/items';
import type { ItemJeu } from '../data/items';
import { tirerMeteoAleatoire } from '../data/meteo';
import type { TypeMeteo } from '../data/meteo';
import { tirerReliquesAleatoires } from '../data/reliques';
import type { DefinitionRelique } from '../data/reliques';
import { tirerNatureAleatoire, appliquerNature } from '../data/natures';
import { TABLE_EVOLUTIONS } from '../data/evolutions';

// Prix selon rareté : ★1=₽2, ★2=₽3, ★3=₽5, ★4=₽9
const PRIX_PAR_RARETE: Record<1 | 2 | 3 | 4, number> = { 1: 2, 2: 3, 3: 5, 4: 9 };
const COUT_REFRESH_BASE = 2;
const PV_JOUEUR_MAX = 100;
const CLE_MEILLEUR_ETAGE = 'pokedraft_meilleur_etage';
const NB_ETAGES_TOTAL = 15;
const NB_ITEMS_BOUTIQUE = 3;

export type TypeEtage = 'combat' | 'repos' | 'boutique_bonus' | 'boss' | 'evenement';

/** Génère la carte des 15 étages : 5/10/15 = boss, étages 1-2 = combat, autres = 55% combat / 15% repos / 15% boutique_bonus / 15% evenement */
function genererCarteEtages(): TypeEtage[] {
  return Array.from({ length: NB_ETAGES_TOTAL }, (_, i) => {
    const num = i + 1;
    if (num === 5 || num === 10 || num === 15) return 'boss';
    if (num <= 2) return 'combat'; // Premiers étages toujours combat
    const r = Math.random();
    if (r < 0.55) return 'combat';
    if (r < 0.70) return 'repos';
    if (r < 0.85) return 'boutique_bonus';
    return 'evenement';
  });
}

function chargerMeilleurEtage(): number {
  return parseInt(localStorage.getItem(CLE_MEILLEUR_ETAGE) ?? '0', 10) || 0;
}
function sauvegarderMeilleurEtage(etage: number) {
  const actuel = chargerMeilleurEtage();
  if (etage > actuel) localStorage.setItem(CLE_MEILLEUR_ETAGE, String(etage));
}

function genererInstanceId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function creerPokemonEquipe(cache: PokemonCache): PokemonEquipe {
  return {
    ...cache,
    instanceId: genererInstanceId(),
    pvActuels: cache.stats.pv,
    bonusAttaque: 0,
    bonusDefense: 0,
    bonusPv: 0,
  };
}

function tirerBoutique(cache: PokemonCache[], exclude: string[] = [], etage?: number): PokemonBoutique[] {
  // Filtre par rareté selon l'étage
  let filtres = cache;
  if (etage !== undefined) {
    let raretesAutorisees: (1 | 2 | 3 | 4)[];
    if (etage <= 4) {
      raretesAutorisees = [1];
    } else if (etage <= 8) {
      raretesAutorisees = [1, 2];
    } else if (etage <= 12) {
      raretesAutorisees = [1, 2, 3];
    } else {
      raretesAutorisees = [1, 2, 3, 4];
    }
    const parRarete = cache.filter(p => (raretesAutorisees as number[]).includes(p.rarete) && !exclude.includes(p.nom));
    // Fallback si moins de 3 disponibles
    filtres = parRarete.length >= 3 ? parRarete : cache.filter(p => !exclude.includes(p.nom));
  } else {
    filtres = cache.filter(p => !exclude.includes(p.nom));
  }

  const disponibles = filtres;
  const selection: PokemonBoutique[] = [];
  const indices = new Set<number>();

  while (selection.length < 3 && indices.size < disponibles.length) {
    const idx = Math.floor(Math.random() * disponibles.length);
    if (!indices.has(idx)) {
      indices.add(idx);
      const base = disponibles[idx];
      // Shiny : 5% de chance
      const shiny = Math.random() < 0.05;
      // Nature aléatoire
      const nature = tirerNatureAleatoire();
      const statsAvecNature = appliquerNature(base.stats, nature);
      const pokemon = { ...base, shiny, nature, stats: statsAvecNature };
      if (shiny) pokemon.sprite = pokemon.sprite.replace('/pokemon/', '/pokemon/shiny/');
      selection.push({ ...pokemon, prix: PRIX_PAR_RARETE[pokemon.rarete], achete: false });
    }
  }
  return selection;
}

interface ActionsJeu {
  initialiserCache: (cache: PokemonCache[]) => void;
  acheterPokemon: (boutiquePokemon: PokemonBoutique) => void;
  vendrePokemon: (instanceId: string) => void;
  refreshBoutique: () => void;
  deplacerVersTerrain: (instanceId: string, slotTerrain: number) => void;
  deplacerVersBanc: (instanceId: string, slotBanc: number) => void;
  echangerSlots: (sourceId: string, sourceType: 'terrain' | 'banc', cibleIdx: number, cibleType: 'terrain' | 'banc') => void;
  lancerCombat: () => void;
  appliquerResultatCombat: (degatsJoueur: number, victoire: boolean) => void;
  passerEtage: () => void;
  fuir: () => void;
  acheterItem: (item: ItemJeu) => void;
  equiperItemSurPokemon: (instanceId: string) => void;
  choisirRelique: (id: string) => void;
  utiliserCentreRepas: () => void;
  choisirEvenement: (type: 'difficile' | 'normal') => void;
  evoluerPokemon: (instanceId: string) => void;
}

interface StoreJeu extends EtatJeu, ActionsJeu {
  cachePokemons: PokemonCache[];
  synergiesActives: ReturnType<typeof calculerSynergies>;
  meilleurEtage: number;
  boutiqueItems: ItemJeu[];
  itemEnAttente: ItemJeu | null;
  carteEtages: TypeEtage[];
  meteoActuelle: TypeMeteo;
  reliques: DefinitionRelique[];
  reliquesProposees: DefinitionRelique[];
  combatDifficile: boolean;
}

export const useJeuStore = create<StoreJeu>((set, get) => ({
  // État initial
  phase: 'chargement' as PhaseJeu,
  pokedollars: 10,
  pvJoueur: PV_JOUEUR_MAX,
  pvJoueurMax: PV_JOUEUR_MAX,
  etage: 1,
  terrain: [null, null, null],
  banc: [null, null, null],
  boutique: [],
  coutRefresh: COUT_REFRESH_BASE,
  cachePokemons: [],
  synergiesActives: [],
  meilleurEtage: chargerMeilleurEtage(),
  boutiqueItems: [],
  itemEnAttente: null,
  carteEtages: genererCarteEtages(),
  meteoActuelle: 'neutre' as TypeMeteo,
  reliques: [],
  reliquesProposees: [],
  combatDifficile: false,

  initialiserCache: (cache) => {
    const etage = 1;
    const boutique = tirerBoutique(cache, [], etage);
    const carteEtages = genererCarteEtages();
    const boutiqueItems = genererItemsAleatoires(NB_ITEMS_BOUTIQUE);
    set({ cachePokemons: cache, boutique, phase: 'draft', carteEtages, boutiqueItems });
  },

  acheterPokemon: (boutiquePokemon) => {
    const { pokedollars, banc, terrain, boutique, cachePokemons: _cachePokemons } = get();
    if (pokedollars < boutiquePokemon.prix || boutiquePokemon.achete) return;

    // Cherche un slot libre : d'abord terrain, puis banc
    const slotTerrain = terrain.findIndex(s => s === null);
    const slotBanc = banc.findIndex(s => s === null);

    if (slotTerrain === -1 && slotBanc === -1) return; // Équipe pleine

    const nouveau = creerPokemonEquipe(boutiquePokemon);
    const nouveauTerrain = [...terrain];
    const nouveauBanc = [...banc];

    if (slotTerrain !== -1) {
      nouveauTerrain[slotTerrain] = nouveau;
    } else {
      nouveauBanc[slotBanc] = nouveau;
    }

    // Recalcule les synergies
    const nouvelleBoutique = boutique.map(p =>
      p.id === boutiquePokemon.id && p.prix === boutiquePokemon.prix ? { ...p, achete: true } : p
    );

    const synergiesActives = calculerSynergies(nouveauTerrain);

    set({
      pokedollars: pokedollars - boutiquePokemon.prix,
      terrain: nouveauTerrain,
      banc: nouveauBanc,
      boutique: nouvelleBoutique,
      synergiesActives,
    });
  },

  vendrePokemon: (instanceId) => {
    const { terrain, banc, pokedollars } = get();
    const supprimer = (slots: (PokemonEquipe | null)[]) =>
      slots.map(p => (p?.instanceId === instanceId ? null : p));
    const nouveauTerrain = supprimer(terrain) as typeof terrain;
    const nouveauBanc = supprimer(banc) as typeof banc;
    const synergiesActives = calculerSynergies(nouveauTerrain);
    set({ terrain: nouveauTerrain, banc: nouveauBanc, pokedollars: pokedollars + 1, synergiesActives });
  },

  refreshBoutique: () => {
    const { pokedollars, coutRefresh, cachePokemons, etage } = get();
    if (pokedollars < coutRefresh) return;
    const boutique = tirerBoutique(cachePokemons, [], etage);
    // Le coût augmente de 1 à chaque refresh
    set({ boutique, pokedollars: pokedollars - coutRefresh, coutRefresh: coutRefresh + 1 });
  },

  deplacerVersTerrain: (instanceId, slotTerrain) => {
    const { terrain, banc } = get();
    const indexBanc = banc.findIndex(p => p?.instanceId === instanceId);
    if (indexBanc === -1) return;

    const pokemon = banc[indexBanc];
    const nouveauTerrain = [...terrain];
    const nouveauBanc = [...banc];

    // Échange si le slot terrain est occupé
    nouveauBanc[indexBanc] = nouveauTerrain[slotTerrain];
    nouveauTerrain[slotTerrain] = pokemon;

    const synergiesActives = calculerSynergies(nouveauTerrain);
    set({ terrain: nouveauTerrain, banc: nouveauBanc, synergiesActives });
  },

  deplacerVersBanc: (instanceId, slotBanc) => {
    const { terrain, banc } = get();
    const indexTerrain = terrain.findIndex(p => p?.instanceId === instanceId);
    if (indexTerrain === -1) return;

    const pokemon = terrain[indexTerrain];
    const nouveauTerrain = [...terrain];
    const nouveauBanc = [...banc];

    nouveauTerrain[indexTerrain] = nouveauBanc[slotBanc];
    nouveauBanc[slotBanc] = pokemon;

    const synergiesActives = calculerSynergies(nouveauTerrain);
    set({ terrain: nouveauTerrain, banc: nouveauBanc, synergiesActives });
  },

  echangerSlots: (sourceId, sourceType, cibleIdx, cibleType) => {
    const { terrain, banc } = get();
    const nouveauTerrain = [...terrain];
    const nouveauBanc = [...banc];

    const sourceListe = sourceType === 'terrain' ? nouveauTerrain : nouveauBanc;
    const cibleListe = cibleType === 'terrain' ? nouveauTerrain : nouveauBanc;

    const sourceIdx = sourceListe.findIndex(p => p?.instanceId === sourceId);
    if (sourceIdx === -1) return;

    const temp = sourceListe[sourceIdx];
    sourceListe[sourceIdx] = cibleListe[cibleIdx];
    cibleListe[cibleIdx] = temp;

    const synergiesActives = calculerSynergies(nouveauTerrain);
    set({ terrain: nouveauTerrain, banc: nouveauBanc, synergiesActives });
  },

  lancerCombat: () => {
    set({ phase: 'combat', meteoActuelle: tirerMeteoAleatoire() });
  },

  appliquerResultatCombat: (degatsJoueur, victoire) => {
    const { pvJoueur, pvJoueurMax, terrain, banc, etage, pokedollars, cachePokemons, reliques, combatDifficile } = get();
    let nouveauxPv = Math.max(0, pvJoueur - degatsJoueur);

    if (nouveauxPv <= 0) {
      set({ pvJoueur: 0, phase: 'defaite', combatDifficile: false });
      return;
    }

    if (!victoire) {
      set({ pvJoueur: nouveauxPv, phase: 'defaite', combatDifficile: false });
      return;
    }

    // Victoire : soin de 30% des PV max + passage à l'étage suivant
    const soigner = (p: PokemonEquipe | null): PokemonEquipe | null => {
      if (!p) return null;
      const pvMaxP = p.stats.pv + p.bonusPv;
      return { ...p, pvActuels: Math.min(pvMaxP, p.pvActuels + Math.floor(pvMaxP * 0.3)) };
    };

    // Relique soin_apres_victoire
    const reliqueSoin = reliques.find(r => r.effet === 'soin_apres_victoire');
    if (reliqueSoin) {
      nouveauxPv = Math.min(pvJoueurMax, nouveauxPv + Math.floor(pvJoueurMax * reliqueSoin.valeur));
    }

    let recompense = 5 + etage;

    // Récompense doublée si combat difficile
    if (combatDifficile) recompense *= 2;

    // Relique pokedollars_bonus
    const reliqueDollars = reliques.find(r => r.effet === 'pokedollars_bonus');
    if (reliqueDollars) {
      recompense += reliqueDollars.valeur;
    }

    const nouvelEtage = etage + 1;
    sauvegarderMeilleurEtage(nouvelEtage);
    const { carteEtages } = get();
    const typeProchainEtage = carteEtages[nouvelEtage - 1] as TypeEtage | undefined;
    const nbItems = typeProchainEtage === 'boutique_bonus' ? 4 : NB_ITEMS_BOUTIQUE;

    // Boss : propose des reliques (étages 5, 10, 15)
    const etaitBoss = etage === 5 || etage === 10 || etage === 15;
    const reliquesProposees = etaitBoss
      ? tirerReliquesAleatoires(3, reliques.map(r => r.id))
      : [];

    set({
      pvJoueur: nouveauxPv,
      phase: 'draft',
      terrain: terrain.map(soigner) as typeof terrain,
      banc: banc.map(soigner) as typeof banc,
      etage: nouvelEtage,
      meilleurEtage: Math.max(chargerMeilleurEtage(), nouvelEtage),
      pokedollars: pokedollars + recompense,
      boutique: tirerBoutique(cachePokemons, [], nouvelEtage),
      boutiqueItems: genererItemsAleatoires(nbItems),
      coutRefresh: COUT_REFRESH_BASE,
      reliquesProposees,
      combatDifficile: false,
    });
  },

  passerEtage: () => {
    const { etage, pokedollars, cachePokemons, carteEtages } = get();
    const nouvelEtage = etage + 1;
    const typeEtage = carteEtages[nouvelEtage - 1] as TypeEtage | undefined;
    const nbItems = typeEtage === 'boutique_bonus' ? 4 : NB_ITEMS_BOUTIQUE;
    const boutique = tirerBoutique(cachePokemons, [], nouvelEtage);
    const boutiqueItems = genererItemsAleatoires(nbItems);
    const recompense = 5 + etage;
    set({
      etage: nouvelEtage,
      pokedollars: pokedollars + recompense,
      boutique,
      boutiqueItems,
      coutRefresh: COUT_REFRESH_BASE,
      phase: 'draft',
    });
  },

  fuir: () => {
    const { pvJoueur, etage, pokedollars, cachePokemons } = get();
    const coutFuite = 20;
    const nouveauxPv = Math.max(0, pvJoueur - coutFuite);
    if (nouveauxPv <= 0) {
      set({ pvJoueur: 0, phase: 'defaite' });
      return;
    }
    const nouvelEtage = etage + 1;
    const boutique = tirerBoutique(cachePokemons, [], nouvelEtage);
    const boutiqueItems = genererItemsAleatoires(NB_ITEMS_BOUTIQUE);
    set({
      pvJoueur: nouveauxPv,
      etage: nouvelEtage,
      pokedollars: pokedollars + 2, // Petite récompense symbolique
      boutique,
      boutiqueItems,
      coutRefresh: COUT_REFRESH_BASE,
      phase: 'draft',
    });
  },

  acheterItem: (item: ItemJeu) => {
    const { pokedollars, boutiqueItems } = get();
    if (pokedollars < item.prix) return;
    // Marque l'item comme en attente d'équipement, retire-le de la boutique
    const nouveauxItems = boutiqueItems.filter(i => i.instanceId !== item.instanceId);
    set({
      pokedollars: pokedollars - item.prix,
      itemEnAttente: item,
      boutiqueItems: nouveauxItems,
    });
  },

  equiperItemSurPokemon: (instanceId: string) => {
    const { itemEnAttente, terrain, banc } = get();
    if (!itemEnAttente) return;

    // Pierre d'Évolution : déclenche l'évolution
    if (itemEnAttente.id === 'pierre-evolution') {
      set({ itemEnAttente: null });
      get().evoluerPokemon(instanceId);
      return;
    }

    const equiperSurSlots = (slots: (PokemonEquipe | null)[]) =>
      slots.map(p => {
        if (p?.instanceId !== instanceId) return p;
        // Un Pokémon ne peut porter qu'un seul item
        return { ...p, item: itemEnAttente, itemConsomme: false };
      });

    const nouveauTerrain = equiperSurSlots(terrain) as typeof terrain;
    const nouveauBanc = equiperSurSlots(banc) as typeof banc;

    set({ terrain: nouveauTerrain, banc: nouveauBanc, itemEnAttente: null });
  },

  choisirRelique: (id: string) => {
    const { reliques, reliquesProposees } = get();
    const relique = reliquesProposees.find(r => r.id === id);
    if (!relique) return;
    set({
      reliques: [...reliques, relique],
      reliquesProposees: [],
    });
  },

  utiliserCentreRepas: () => {
    const { pvJoueur, pvJoueurMax, terrain, banc } = get();
    const soigner = (p: PokemonEquipe | null): PokemonEquipe | null => {
      if (!p) return null;
      const pvMaxP = p.stats.pv + p.bonusPv;
      return { ...p, pvActuels: pvMaxP, statut: undefined };
    };
    set({
      pvJoueur: Math.min(pvJoueurMax, pvJoueur + Math.floor(pvJoueurMax * 0.3)),
      terrain: terrain.map(soigner) as typeof terrain,
      banc: banc.map(soigner) as typeof banc,
    });
  },

  choisirEvenement: (type: 'difficile' | 'normal') => {
    set({ combatDifficile: type === 'difficile' });
  },

  evoluerPokemon: (instanceId: string) => {
    const { terrain, banc, cachePokemons } = get();
    const trouver = (slots: (PokemonEquipe | null)[]) => slots.find(p => p?.instanceId === instanceId);
    const pokemon = trouver(terrain) ?? trouver(banc);
    if (!pokemon) return;

    const evolutionId = TABLE_EVOLUTIONS[pokemon.id];
    if (!evolutionId) return;

    const formeEvoluee = cachePokemons.find(p => p.id === evolutionId);
    if (!formeEvoluee) return; // Pas en cache

    const nouvelleForme: PokemonEquipe = {
      ...formeEvoluee,
      instanceId: pokemon.instanceId, // Garde le même ID
      pvActuels: Math.min(
        formeEvoluee.stats.pv,
        pokemon.pvActuels + (formeEvoluee.stats.pv - pokemon.stats.pv)
      ),
      bonusAttaque: pokemon.bonusAttaque,
      bonusDefense: pokemon.bonusDefense,
      bonusPv: pokemon.bonusPv,
      item: pokemon.item,
      itemConsomme: pokemon.itemConsomme,
      nature: pokemon.nature,
      shiny: pokemon.shiny,
    };

    const remplacer = (slots: (PokemonEquipe | null)[]) =>
      slots.map(p => p?.instanceId === instanceId ? nouvelleForme : p);

    const nouveauTerrain = remplacer(terrain) as typeof terrain;
    const nouveauBanc = remplacer(banc) as typeof banc;
    const synergiesActives = calculerSynergies(nouveauTerrain);
    set({ terrain: nouveauTerrain, banc: nouveauBanc, synergiesActives });
  },
}));
