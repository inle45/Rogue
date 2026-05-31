// Table des évolutions Gen 1-3 (pokemonId → evolutionId)
export const TABLE_EVOLUTIONS: Record<number, number> = {
  // Gen 1
  1: 2, 2: 3,    // Bulbizarre → Herbizarre → Florizarre
  4: 5, 5: 6,    // Salamèche → Reptincel → Dracaufeu
  7: 8, 8: 9,    // Carapuce → Carabaffe → Tortank
  10: 11, 11: 12, 13: 14, 14: 15,
  16: 17, 17: 18, 19: 20, 21: 22, 23: 24, 25: 26, 27: 28,
  29: 30, 30: 31, 32: 33, 33: 34, 35: 36, 37: 38, 39: 40,
  41: 42, 43: 44, 44: 45, 46: 47, 48: 49, 50: 51, 52: 53,
  54: 55, 56: 57, 58: 59, 60: 61, 61: 62, 63: 64, 64: 65,
  66: 67, 67: 68, 69: 70, 70: 71, 72: 73, 74: 75, 75: 76,
  77: 78, 79: 80, 81: 82, 84: 85, 86: 87, 88: 89, 90: 91,
  92: 93, 93: 94, 96: 97, 98: 99, 100: 101, 102: 103, 104: 105,
  109: 110, 111: 112, 116: 117, 118: 119, 120: 121, 129: 130,
  138: 139, 140: 141, 147: 148, 148: 149,

  // Gen 2
  152: 153, 153: 154,  // Germignon → Macronium → Méganium
  155: 156, 156: 157,  // Héricendre → Feurisson → Typhlosion
  158: 159, 159: 160,  // Kaiminus → Crocrodil → Aligatueur
  161: 162,            // Fouinette → Fouinar
  163: 164,            // Hoothoot → Noarfang
  165: 166,            // Ledyba → Ledian
  167: 168,            // Arakdo → Migalos
  170: 171,            // Loupio → Lanturn
  172: 25,             // Pichu → Pikachu
  175: 176,            // Togepi → Togetic
  177: 178,            // Natu → Xatu
  179: 180, 180: 181,  // Wattouat → Lainergie → Pharamp
  183: 184,            // Marill → Azumarill
  187: 188, 188: 189,  // Granivol → Floravol → Jumpluff
  194: 195,            // Axoloto → Maraiste
  204: 205,            // Pomdepik → Foretress
  209: 210,            // Snubbull → Granbull
  216: 217,            // Teddiursa → Ursaring
  218: 219,            // Limagma → Magcargo
  220: 221,            // Marcacrin → Cochignon
  223: 224,            // Remoraid → Octillery
  231: 232,            // Phanpy → Donphan
  246: 247, 247: 248,  // Minidraco (246) → Reptincel (247) → Tyranocif (248)

  // Gen 3
  252: 253, 253: 254,  // Arcko → Massko → Jungko
  255: 256, 256: 257,  // Poussifeu → Galifeu → Brasegali
  258: 259, 259: 260,  // Gobou → Flobio → Laggron
  261: 262,            // Zigzaton → Loupgarou
  265: 266, 266: 267,  // Chenipotte → Armulys → Papinox
  270: 271, 271: 272,  // Nénupiot → Lombre → Ludicolo
  273: 274, 274: 275,  // Grainéseed → Pifeuil → Tengalice
  280: 281, 281: 282,  // Tarsal → Kirlia → Gardevoir
  285: 286,            // Balignon → Chapignon
  287: 288, 288: 289,  // Parecool → Vigoroth → Monaflèz
  290: 291,            // Ningale → Ninjask
  293: 294, 294: 295,  // Chuchmur → Ramboum → Exploud
  296: 297,            // Makuhita → Hariyama
  300: 301,            // Skitty → Delcatty
  304: 305, 305: 306,  // Aron → Lairon → Aggron
  307: 308,            // Medithi → Méditran
  309: 310,            // Dynavolt → Élecsprint
  316: 317,            // Gloupti → Beucrotte
  318: 319,            // Carvanha → Sharpedo
  320: 321,            // Wailmer → Wailord
  325: 326,            // Spoink → Groret
  328: 329, 329: 330,  // Trapinch → Vibrava → Flygon
  331: 332,            // Cacnea → Cacturne
  333: 334,            // Tylton → Altaria
  341: 342,            // Écrapince → Colhomard
  343: 344,            // Baloud → Claymonde
  347: 348,            // Anorith → Armaldo
  349: 350,            // Poissebo → Milobellus
  353: 354,            // Polichombr → Banette
  361: 362,            // Obalie → Oniglali
  363: 364, 364: 365,  // Sféara → Phogleur → Kaimorse
  366: 367,            // Coquefeu → Huntail
  371: 372, 372: 373,  // Draby → Draco → Drattak
  374: 375, 375: 376,  // Terhal → Métang → Metagross
};
