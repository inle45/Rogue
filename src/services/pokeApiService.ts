// Service de fetch et mise en cache des données PokeAPI

import type { PokemonCache, StatsPokemon } from '../types/pokemon';

// Traductions françaises des noms de types
const TYPES_FR: Record<string, string> = {
  normal: 'Normal', fire: 'Feu', water: 'Eau', electric: 'Électrik',
  grass: 'Plante', ice: 'Glace', fighting: 'Combat', poison: 'Poison',
  ground: 'Sol', flying: 'Vol', psychic: 'Psy', bug: 'Insecte',
  rock: 'Roche', ghost: 'Spectre', dragon: 'Dragon', dark: 'Ténèbres',
  steel: 'Acier', fairy: 'Fée',
};

// Traductions françaises des noms Pokémon (151 premiers)
const NOMS_FR: Record<number, string> = {
  1: 'Bulbizarre', 2: 'Herbizarre', 3: 'Florizarre', 4: 'Salamèche', 5: 'Reptincel',
  6: 'Dracaufeu', 7: 'Carapuce', 8: 'Carabaffe', 9: 'Tortank', 10: 'Chenipan',
  11: 'Chrysacier', 12: 'Papilusion', 13: 'Aspicot', 14: 'Coconfort', 15: 'Dardargnan',
  16: 'Roucool', 17: 'Roucoups', 18: 'Roucarnage', 19: 'Rattata', 20: 'Rattatac',
  21: 'Piafabec', 22: 'Rapasdepic', 23: 'Abo', 24: 'Arbok', 25: 'Pikachu',
  26: 'Raichu', 27: 'Sabelette', 28: 'Sablaireau', 29: 'Nidoran♀', 30: 'Nidorina',
  31: 'Nidoqueen', 32: 'Nidoran♂', 33: 'Nidorino', 34: 'Nidoking', 35: 'Mélofée',
  36: 'Méloféli', 37: 'Goupix', 38: 'Feunard', 39: 'Rondoudou', 40: 'Grodoudou',
  41: 'Nosferapti', 42: 'Nosferalto', 43: 'Mystherbe', 44: 'Ortide', 45: 'Rafflesia',
  46: 'Paras', 47: 'Parasect', 48: 'Mimitoss', 49: 'Aéromite', 50: 'Taupiqueur',
  51: 'Triopikeur', 52: 'Miaouss', 53: 'Persian', 54: 'Psykokwak', 55: 'Akwakwak',
  56: 'Férosinge', 57: 'Colossinge', 58: 'Caninos', 59: 'Arcanin', 60: 'Têtarte',
  61: 'Tarpaud', 62: 'Tartard', 63: 'Abra', 64: 'Kadabra', 65: 'Alakazam',
  66: 'Machoc', 67: 'Machopeur', 68: 'Mackogneur', 69: 'Chétiflor', 70: 'Boustiflor',
  71: 'Empiflor', 72: 'Tentacool', 73: 'Tentacruel', 74: 'Racaillou', 75: 'Gravalanch',
  76: 'Grolem', 77: 'Ponyta', 78: 'Galopa', 79: 'Ramoloss', 80: 'Flagadoss',
  81: 'Magnéti', 82: 'Magneton', 83: 'Canarticho', 84: 'Doduo', 85: 'Dodrio',
  86: 'Otaria', 87: 'Lamantine', 88: 'Tadmorv', 89: 'Grotadmorv', 90: 'Kokiyas',
  91: 'Crustabri', 92: 'Fantominus', 93: 'Spectrum', 94: 'Ectoplasma', 95: 'Onix',
  96: 'Soporifik', 97: 'Hypnomade', 98: 'Krabby', 99: 'Krabboss', 100: 'Voltorbe',
  101: 'Électrode', 102: 'Nœunœuf', 103: 'Noadkoko', 104: 'Osselait', 105: 'Ossatueur',
  106: 'Kicklee', 107: 'Tygnon', 108: 'Excelangue', 109: 'Smogo', 110: 'Smogogo',
  111: 'Rhinocorne', 112: 'Rhinoféros', 113: 'Leveinard', 114: 'Saquedeneu', 115: 'Kangourex',
  116: 'Hypotrempe', 117: 'Hypocéan', 118: 'Poissirène', 119: 'Poissoroy', 120: 'Stari',
  121: 'Staross', 122: 'M. Mime', 123: 'Insécateur', 124: 'Lippoutou', 125: 'Élektek',
  126: 'Magmar', 127: 'Scarabrute', 128: 'Tauros', 129: 'Magicarpe', 130: 'Léviator',
  131: 'Lokhlass', 132: 'Métamorph', 133: 'Évoli', 134: 'Aquali', 135: 'Voltali',
  136: 'Pyroli', 137: 'Porygon', 138: 'Amonita', 139: 'Amonistar', 140: 'Kabuto',
  141: 'Kabutops', 142: 'Ptéra', 143: 'Ronflex', 144: 'Artikodin', 145: 'Électhor',
  146: 'Sulfura', 147: 'Minidraco', 148: 'Draco', 149: 'Dracolosse', 150: 'Mewtwo',
  151: 'Mew',
};

interface PokeApiResponse {
  id: number;
  name: string;
  types: { type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  sprites: { front_default: string; other?: { 'official-artwork'?: { front_default: string } } };
}

function extraireStats(data: PokeApiResponse): { stats: StatsPokemon; bst: number } {
  const get = (nom: string) => data.stats.find(s => s.stat.name === nom)?.base_stat ?? 50;
  // Formule officielle Pokémon niveau 50
  const basePv = get('hp');
  const baseAtk = get('attack');
  const baseDef = get('defense');
  const baseSpa = get('special-attack');
  const baseSpd = get('special-defense');
  const baseVit = get('speed');
  const bst = basePv + baseAtk + baseDef + baseSpa + baseSpd + baseVit;
  return {
    stats: {
      pv: basePv + 60,
      attaque: baseAtk + 5,
      defense: baseDef + 5,
      vitesse: baseVit + 5,
    },
    bst,
  };
}

// Variable utilisée pour la traduction des types (référencée mais pas encore utilisée dynamiquement)
void TYPES_FR;

function calculerRarete(bst: number): 1 | 2 | 3 | 4 {
  if (bst < 400) return 1;
  if (bst < 500) return 2;
  if (bst < 580) return 3;
  return 4;
}

async function fetchPokemon(id: number): Promise<PokemonCache> {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const data: PokeApiResponse = await response.json();
  const { stats, bst } = extraireStats(data);
  const rarete = calculerRarete(bst);

  return {
    id: data.id,
    nom: data.name,
    nomFr: NOMS_FR[data.id] || data.name,
    types: data.types.map(t => t.type.name),
    stats,
    bst,
    rarete,
    sprite: data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default,
  };
}

const CLE_CACHE_LOCAL = 'pokedraft_cache_v2';

export async function chargerCachePokemons(
  onProgression?: (loaded: number, total: number) => void
): Promise<PokemonCache[]> {
  // Vérifie le cache localStorage
  try {
    const cached = localStorage.getItem(CLE_CACHE_LOCAL);
    if (cached) {
      const data = JSON.parse(cached) as PokemonCache[];
      // Vérifie que le cache est valide et contient les champs rarete/bst
      if (data.length === 151 && data[0]?.rarete !== undefined) {
        onProgression?.(151, 151);
        return data;
      }
    }
  } catch {
    // Ignore les erreurs de parsing du cache
  }

  // Fetch par lots de 10 pour ne pas surcharger l'API
  const pokemons: PokemonCache[] = [];
  const TAILLE_LOT = 10;

  for (let i = 1; i <= 151; i += TAILLE_LOT) {
    const ids = Array.from({ length: Math.min(TAILLE_LOT, 152 - i) }, (_, j) => i + j);
    const resultats = await Promise.all(ids.map(fetchPokemon));
    pokemons.push(...resultats);
    onProgression?.(pokemons.length, 151);
    // Petite pause pour respecter le rate limit
    if (i + TAILLE_LOT <= 151) await new Promise(r => setTimeout(r, 100));
  }

  // Sauvegarde dans localStorage
  try {
    localStorage.setItem(CLE_CACHE_LOCAL, JSON.stringify(pokemons));
  } catch {
    // Ignore les erreurs de stockage
  }

  return pokemons;
}
