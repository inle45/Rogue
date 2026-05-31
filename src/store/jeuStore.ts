// Store Zustand principal — gestion de l'état global du jeu

import { create } from 'zustand';
import type { EtatJeu, PhaseJeu } from '../types/jeu';
import type { PokemonCache, PokemonEquipe, PokemonBoutique } from '../types/pokemon';
import { calculerSynergies } from '../data/synergies';

const PRIX_POKEMON = 3;
const COUT_REFRESH_BASE = 2;
const PV_JOUEUR_MAX = 100;
const CLE_MEILLEUR_ETAGE = 'pokedraft_meilleur_etage';

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

function tirerBoutique(cache: PokemonCache[], exclude: string[] = []): PokemonBoutique[] {
  const disponibles = cache.filter(p => !exclude.includes(p.nom));
  const selection: PokemonBoutique[] = [];
  const indices = new Set<number>();

  while (selection.length < 3 && indices.size < disponibles.length) {
    const idx = Math.floor(Math.random() * disponibles.length);
    if (!indices.has(idx)) {
      indices.add(idx);
      selection.push({ ...disponibles[idx], prix: PRIX_POKEMON, achete: false });
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
}

interface StoreJeu extends EtatJeu, ActionsJeu {
  cachePokemons: PokemonCache[];
  synergiesActives: ReturnType<typeof calculerSynergies>;
  meilleurEtage: number;
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

  initialiserCache: (cache) => {
    const boutique = tirerBoutique(cache);
    set({ cachePokemons: cache, boutique, phase: 'draft' });
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
    const { pokedollars, coutRefresh, cachePokemons } = get();
    if (pokedollars < coutRefresh) return;
    const boutique = tirerBoutique(cachePokemons);
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
    set({ phase: 'combat' });
  },

  appliquerResultatCombat: (degatsJoueur, victoire) => {
    const { pvJoueur, terrain, banc, etage, pokedollars, cachePokemons } = get();
    const nouveauxPv = Math.max(0, pvJoueur - degatsJoueur);

    if (nouveauxPv <= 0) {
      set({ pvJoueur: 0, phase: 'defaite' });
      return;
    }

    if (!victoire) {
      set({ pvJoueur: nouveauxPv, phase: 'defaite' });
      return;
    }

    // Victoire : soin de 30% des PV max + passage à l'étage suivant
    const soigner = (p: PokemonEquipe | null): PokemonEquipe | null => {
      if (!p) return null;
      const pvMax = p.stats.pv + p.bonusPv;
      return { ...p, pvActuels: Math.min(pvMax, p.pvActuels + Math.floor(pvMax * 0.3)) };
    };

    const recompense = 5 + etage;
    const nouvelEtage = etage + 1;
    sauvegarderMeilleurEtage(nouvelEtage);
    set({
      pvJoueur: nouveauxPv,
      phase: 'draft',
      terrain: terrain.map(soigner) as typeof terrain,
      banc: banc.map(soigner) as typeof banc,
      etage: nouvelEtage,
      meilleurEtage: Math.max(chargerMeilleurEtage(), nouvelEtage),
      pokedollars: pokedollars + recompense,
      boutique: tirerBoutique(cachePokemons),
      coutRefresh: COUT_REFRESH_BASE,
    });
  },

  passerEtage: () => {
    const { etage, pokedollars, cachePokemons } = get();
    const boutique = tirerBoutique(cachePokemons);
    const recompense = 5 + etage;
    set({
      etage: etage + 1,
      pokedollars: pokedollars + recompense,
      boutique,
      coutRefresh: COUT_REFRESH_BASE, // Réinitialise le coût de refresh à chaque étage
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
    const boutique = tirerBoutique(cachePokemons);
    set({
      pvJoueur: nouveauxPv,
      etage: etage + 1,
      pokedollars: pokedollars + 2, // Petite récompense symbolique
      boutique,
      coutRefresh: COUT_REFRESH_BASE,
      phase: 'draft',
    });
  },
}));
