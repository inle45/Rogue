export const NOMS_ATTAQUES_FR: Record<string, string> = {
  // Attaques de base
  'tackle': 'Charge', 'scratch': 'Griffe', 'pound': 'Écras\'Face', 'growl': 'Rugissement',
  'tail-whip': 'Mimi-Queue', 'leer': 'Grognement', 'string-shot': 'Sécrétion',
  // Eau
  'water-gun': 'Pistolet à O', 'surf': 'Surf', 'hydro-pump': 'Hydrocanon',
  'bubble': 'Écume', 'bubble-beam': 'Bulles d\'O', 'waterfall': 'Cascade', 'whirlpool': 'Tourbillon',
  // Feu
  'ember': 'Flammèche', 'flamethrower': 'Lance-Flammes', 'fire-blast': 'Déflagration',
  'fire-punch': 'Poing de Feu', 'fire-spin': 'Torche',
  // Électrik
  'thunder-shock': 'Éclair', 'thunderbolt': 'Tonnerre', 'thunder': 'Foudre',
  'thunder-punch': 'Poing Éclair', 'thunder-wave': 'Cage Éclair',
  // Plante
  'vine-whip': 'Fouet Lianes', 'razor-leaf': 'Tranche', 'solar-beam': 'Laser Solaire',
  'petal-dance': 'Danse-Pétale', 'leech-seed': 'Vampigraine',
  // Psy
  'psychic': 'Psyko', 'psybeam': 'Psyko-Rayon', 'confusion': 'Choc Mental',
  'future-sight': 'Troisième Œil', 'teleport': 'Téléport',
  // Glace
  'ice-beam': 'Blizzard', 'blizzard': 'Tempête', 'ice-punch': 'Poing Glace',
  'aurora-beam': 'Beam Aurora', 'powder-snow': 'Jackpot',
  // Combat
  'karate-chop': 'Tranche-Karaté', 'low-kick': 'Basse Frappe', 'submission': 'Soumission',
  'seismic-toss': 'Jet Punch', 'high-jump-kick': 'Saut de Pied',
  // Normal
  'quick-attack': 'Vive-Attaque', 'double-edge': 'Damocles', 'body-slam': 'Tonnerre',
  'hyper-beam': 'Ultralaser', 'slam': 'Claquement', 'mega-punch': 'Mégapoing',
  'mega-kick': 'Méga Pied', 'skull-bash': 'Bélier', 'take-down': 'Banzaï',
  'swift': 'Météores', 'rage': 'Rage', 'cut': 'Coupe',
  // Poison
  'poison-sting': 'Dard-Venin', 'sludge': 'Bombe Boue', 'acid': 'Acide',
  'toxic': 'Toxik', 'sludge-bomb': 'Bomb Beurk',
  // Sol
  'earthquake': 'Séisme', 'dig': 'Fouille', 'sand-attack': 'Jet de Sable',
  // Roche
  'rock-throw': 'Jet-Pierres', 'rock-slide': 'Éboulement', 'stone-edge': 'Lame de Roc',
  // Spectre
  'lick': 'Léchouille', 'night-shade': 'Ténèbres', 'shadow-ball': 'Ball\'Ombre',
  // Dragon
  'dragon-rage': 'Draco-Rage', 'dragon-breath': 'Dracosouffle', 'dragon-claw': 'Draco-Griffe',
  // Ténèbres
  'bite': 'Morsure', 'crunch': 'Crocs Hyper', 'dark-pulse': 'Ténèbres Aura',
  // Vol
  'gust': 'Rafale', 'wing-attack': 'Cru-Aile', 'fly': 'Vol',
  // Insecte
  'pin-missile': 'Dard-Nuée', 'twineedle': 'Dard Jumeau', 'bug-buzz': 'Chant Sirène',
  // Acier
  'iron-tail': 'Queue de Fer', 'flash-cannon': 'Éclat Météore', 'metal-claw': 'Griffe Acier',
  // Fée
  'fairy-wind': 'Vent Féérique', 'moonblast': 'Blizzard Lune', 'dazzling-gleam': 'Éclat Magique',
  // Soins
  'recover': 'Soin', 'rest': 'Repos', 'synthesis': 'Synthèse', 'moonlight': 'Clair de Lune',
  // Divers
  'double-team': 'Clonage', 'minimize': 'Diminution', 'harden': 'Armure', 'withdraw': 'Jackpot',
};

export function nomAttaqueFr(nomEn: string): string {
  return NOMS_ATTAQUES_FR[nomEn.toLowerCase()] ??
    nomEn.replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
