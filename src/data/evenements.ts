export interface EvenementNarratif {
  id: string;
  titre: string;
  texte: string;
  icone: string;
  choix: [
    { label: string; effet: 'relique_gratuite' | 'pokedollars' | 'soin_equipe' | 'pokemon_gratuit'; valeur: number },
    { label: string; effet: 'relique_gratuite' | 'pokedollars' | 'soin_equipe' | 'pokemon_gratuit'; valeur: number },
  ];
}

export const EVENEMENTS: EvenementNarratif[] = [
  {
    id: 'blessé', icone: '🦊',
    titre: 'Un Pokémon blessé',
    texte: 'Vous trouvez un Évoli blessé sur le bord du chemin. Que faites-vous ?',
    choix: [
      { label: '💚 Le soigner et le garder', effet: 'pokemon_gratuit', valeur: 133 },
      { label: '₽ Vendre l\'info au Labo', effet: 'pokedollars', valeur: 8 },
    ],
  },
  {
    id: 'marchand', icone: '🏪',
    titre: 'Marchand Mystérieux',
    texte: 'Un marchand vous propose un objet rare contre une faveur.',
    choix: [
      { label: '✨ Accepter (relique gratuite)', effet: 'relique_gratuite', valeur: 1 },
      { label: '₽ Payer en espèces', effet: 'pokedollars', valeur: 5 },
    ],
  },
  {
    id: 'fontaine', icone: '⛲',
    titre: 'Fontaine de Jouvence',
    texte: 'Une fontaine mystérieuse. L\'eau brille d\'une lumière dorée.',
    choix: [
      { label: '💧 Soigner toute l\'équipe', effet: 'soin_equipe', valeur: 1 },
      { label: '₽ Collecter de l\'eau (+₽12)', effet: 'pokedollars', valeur: 12 },
    ],
  },
  {
    id: 'temple', icone: '🏛️',
    titre: 'Temple Ancien',
    texte: 'Un temple oublié. Une inscription dit : "Seul le brave mérite la relique."',
    choix: [
      { label: '⚡ Entrer (risque, mais relique)', effet: 'relique_gratuite', valeur: 1 },
      { label: '🚶 Passer votre chemin (+₽5)', effet: 'pokedollars', valeur: 5 },
    ],
  },
  {
    id: 'rival', icone: '🧑',
    titre: 'Votre Rival',
    texte: '"Je t\'attendais ! Prends ça !" — Il vous lance une Poké Ball.',
    choix: [
      { label: '🎁 Récupérer le Pokémon', effet: 'pokemon_gratuit', valeur: 0 },
      { label: '₽ Refuser poliment (+₽6)', effet: 'pokedollars', valeur: 6 },
    ],
  },
  {
    id: 'sage', icone: '🧙',
    titre: 'Le Sage Pokémon',
    texte: '"La connaissance est ma plus grande richesse. Laisse-moi t\'enseigner."',
    choix: [
      { label: '📚 Apprendre (soin équipe)', effet: 'soin_equipe', valeur: 1 },
      { label: '✨ Demander un artefact (relique)', effet: 'relique_gratuite', valeur: 1 },
    ],
  },
];

export function tirerEvenementAleatoire(etage: number): EvenementNarratif {
  return EVENEMENTS[etage % EVENEMENTS.length];
}
