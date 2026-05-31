// Service de fetch et mise en cache des données PokeAPI

import type { PokemonCache, StatsPokemon } from '../types/pokemon';
import { nomAttaqueFr } from '../data/nomsAttaques';

// Traductions françaises des noms de types
const TYPES_FR: Record<string, string> = {
  normal: 'Normal', fire: 'Feu', water: 'Eau', electric: 'Électrik',
  grass: 'Plante', ice: 'Glace', fighting: 'Combat', poison: 'Poison',
  ground: 'Sol', flying: 'Vol', psychic: 'Psy', bug: 'Insecte',
  rock: 'Roche', ghost: 'Spectre', dragon: 'Dragon', dark: 'Ténèbres',
  steel: 'Acier', fairy: 'Fée',
};

// Traductions françaises des noms Pokémon (Gen 1-3)
const NOMS_FR: Record<number, string> = {
  // Gen 1
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
  // Gen 2
  152: 'Germignon', 153: 'Macronium', 154: 'Méganium',
  155: 'Héricendre', 156: 'Feurisson', 157: 'Typhlosion',
  158: 'Kaiminus', 159: 'Crocrodil', 160: 'Aligatueur',
  161: 'Fouinette', 162: 'Fouinar', 163: 'Hoothoot', 164: 'Noarfang',
  165: 'Ledyba', 166: 'Ledian', 167: 'Arakdo', 168: 'Migalos',
  169: 'Nostenfer', 170: 'Loupio', 171: 'Lanturn', 172: 'Pichu',
  173: 'Mélo', 174: 'Toudoudou', 175: 'Togepi', 176: 'Togetic',
  177: 'Natu', 178: 'Xatu', 179: 'Wattouat', 180: 'Lainergie', 181: 'Pharamp',
  182: 'Joliflor', 183: 'Marill', 184: 'Azumarill', 185: 'Simularbre',
  186: 'Tarpaud', 187: 'Granivol', 188: 'Floravol', 189: 'Jumpluff',
  190: 'Capumain', 191: 'Grainipiot', 192: 'Heliatronc', 193: 'Yanma',
  194: 'Axoloto', 195: 'Maraiste', 196: 'Mentali', 197: 'Noctali',
  198: 'Corboss', 199: 'Roigada', 200: 'Feuforêve', 201: 'Zarbi',
  202: 'Lantise', 203: 'Girafarig', 204: 'Pomdepik', 205: 'Foretress',
  206: 'Banzaï', 207: 'Scorplane', 208: 'Steelix', 209: 'Snubbull',
  210: 'Granbull', 211: 'Qwilfish', 212: 'Cizayox', 213: 'Jocontion',
  214: 'Scarhino', 215: 'Farfuret', 216: 'Teddiursa', 217: 'Ursaring',
  218: 'Limagma', 219: 'Magcargo', 220: 'Marcacrin', 221: 'Cochignon',
  222: 'Corayon', 223: 'Remoraid', 224: 'Octillery', 225: 'Cadoizo',
  226: 'Mantax', 227: 'Airmure', 228: 'Malosse', 229: 'Démolosse',
  230: 'Hyporoi', 231: 'Phanpy', 232: 'Donphan', 233: 'Porygon2',
  234: 'Cerfrousse', 235: 'Queulorior', 236: 'Élébébé', 237: 'Tygnon',
  238: 'Lippouti', 239: 'Élébébé', 240: 'Magby', 241: 'Écrémeuh',
  242: 'Leuphorie', 243: 'Raikou', 244: 'Entei', 245: 'Suicune',
  246: 'Minidraco', 247: 'Reptincel', 248: 'Tyranocif',
  249: 'Lugia', 250: 'Ho-Oh', 251: 'Celebi',
  // Gen 3
  252: 'Arcko', 253: 'Massko', 254: 'Jungko',
  255: 'Poussifeu', 256: 'Galifeu', 257: 'Brasegali',
  258: 'Gobou', 259: 'Flobio', 260: 'Laggron',
  261: 'Zigzaton', 262: 'Loupgarou', 263: 'Zigzaton', 264: 'Linéon',
  265: 'Chenipotte', 266: 'Armulys', 267: 'Papinox', 268: 'Blindalys', 269: 'Papinox',
  270: 'Nénupiot', 271: 'Lombre', 272: 'Ludicolo',
  273: 'Grainéseed', 274: 'Pifeuil', 275: 'Tengalice',
  276: 'Möwe', 277: 'Pélicean',
  278: 'Gaguanin', 279: 'Maousse',
  280: 'Tarsal', 281: 'Kirlia', 282: 'Gardevoir',
  283: 'Spheal', 284: 'Sealeo',
  285: 'Balignon', 286: 'Chapignon',
  287: 'Parecool', 288: 'Vigoroth', 289: 'Monaflèz',
  290: 'Ningale', 291: 'Ninjask', 292: 'Munja',
  293: 'Chuchmur', 294: 'Ramboum', 295: 'Exploud',
  296: 'Makuhita', 297: 'Hariyama',
  298: 'Azurill',
  299: 'Mushmellow',
  300: 'Skitty', 301: 'Delcatty',
  302: 'Mysdibule',
  303: 'Mysdibule',
  304: 'Natu', 305: 'Larminoix', 306: 'Métang',
  307: 'Medithi', 308: 'Méditran',
  309: 'Dynavolt', 310: 'Élecsprint',
  311: 'Posipi', 312: 'Négapi',
  313: 'Tic-Bug', 314: 'Lumivole',
  315: 'Rosélia',
  316: 'Gloupti', 317: 'Beucrotte',
  318: 'Carvanha', 319: 'Sharpedo',
  320: 'Wailmer', 321: 'Wailord',
  322: 'Camérupt', 323: 'Numérama',
  324: 'Chartor',
  325: 'Spoink', 326: 'Groret',
  327: 'Spinda',
  328: 'Trapinch', 329: 'Vibrava', 330: 'Flygon',
  331: 'Cacnea', 332: 'Cacturne',
  333: 'Tylton', 334: 'Altaria',
  335: 'Zangoose',
  336: 'Seviper',
  337: 'Lune-du-lune', 338: 'Solrock',
  339: 'Barbicha', 340: 'Wailmer',
  341: 'Écrapince', 342: 'Colhomard',
  343: 'Baloud', 344: 'Claymonde',
  345: 'Lilia', 346: 'Camerupt',
  347: 'Anorith', 348: 'Armaldo',
  349: 'Poissebo', 350: 'Milobellus',
  351: 'Morphéo',
  352: 'Kecleon',
  353: 'Polichombr', 354: 'Banette',
  355: 'Ossatueur', 356: 'Duskull',
  357: 'Tropius',
  358: 'Charmina',
  359: 'Absol',
  360: 'Wynaut',
  361: 'Obalie', 362: 'Oniglali',
  363: 'Sféara', 364: 'Phogleur', 365: 'Kaimorse',
  366: 'Coquefeu', 367: 'Huntail', 368: 'Gorefish',
  369: 'Amonita',
  370: 'Lovdisc',
  371: 'Draby', 372: 'Draco', 373: 'Drattak',
  374: 'Terhal', 375: 'Métang', 376: 'Metagross',
  377: 'Regirock', 378: 'Regice', 379: 'Registeel',
  380: 'Latias', 381: 'Latios',
  382: 'Kyogre', 383: 'Groudon', 384: 'Rayquaza',
  385: 'Jirachi', 386: 'Deoxys',
};

function nomFrFallback(id: number, nomEn: string): string {
  return NOMS_FR[id] ?? nomEn.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

interface PokeApiResponse {
  id: number;
  name: string;
  types: { type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  sprites: { front_default: string; other?: { 'official-artwork'?: { front_default: string } } };
  moves?: { move: { name: string } }[];
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

const MAX_POKEMON = 386;

async function fetchPokemon(id: number): Promise<PokemonCache> {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const data: PokeApiResponse = await response.json();
  const { stats, bst } = extraireStats(data);
  const rarete = calculerRarete(bst);

  const mouvements = (data.moves ?? []).slice(-6).slice(-4).map((m: { move: { name: string } }) =>
    nomAttaqueFr(m.move.name)
  );

  return {
    id: data.id,
    nom: data.name,
    nomFr: nomFrFallback(data.id, data.name),
    types: data.types.map(t => t.type.name),
    stats,
    bst,
    rarete,
    sprite: data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default,
    mouvements,
  };
}

const CLE_CACHE_LOCAL = 'pokedraft_cache_v5';

export async function chargerCachePokemons(
  onProgression?: (loaded: number, total: number) => void
): Promise<PokemonCache[]> {
  // Vérifie le cache localStorage
  try {
    const cached = localStorage.getItem(CLE_CACHE_LOCAL);
    if (cached) {
      const data = JSON.parse(cached) as PokemonCache[];
      // Vérifie que le cache est valide et contient les champs rarete/bst et les 386 Pokémon
      if (data.length === MAX_POKEMON && data[0]?.rarete !== undefined && data[0]?.mouvements !== undefined) {
        onProgression?.(MAX_POKEMON, MAX_POKEMON);
        return data;
      }
    }
  } catch {
    // Ignore les erreurs de parsing du cache
  }

  // Fetch par lots de 10 pour ne pas surcharger l'API
  const pokemons: PokemonCache[] = [];
  const TAILLE_LOT = 10;

  for (let i = 1; i <= MAX_POKEMON; i += TAILLE_LOT) {
    const ids = Array.from({ length: Math.min(TAILLE_LOT, MAX_POKEMON + 1 - i) }, (_, j) => i + j);
    const resultats = await Promise.all(ids.map(fetchPokemon));
    pokemons.push(...resultats);
    onProgression?.(pokemons.length, MAX_POKEMON);
    // Petite pause pour respecter le rate limit
    if (i + TAILLE_LOT <= MAX_POKEMON) await new Promise(r => setTimeout(r, 100));
  }

  // Sauvegarde dans localStorage
  try {
    localStorage.setItem(CLE_CACHE_LOCAL, JSON.stringify(pokemons));
  } catch {
    // Ignore les erreurs de stockage
  }

  return pokemons;
}
