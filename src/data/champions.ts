export interface Champion {
  nom: string;
  titre: string;
  typeSpecialite: string;
  icone: string;
  description: string;
}

export const CHAMPIONS: Record<number, Champion> = {
  5:  { nom: 'Ondine',    titre: 'Championne Eau',     typeSpecialite: 'water',    icone: '🌊', description: 'Maître des types Eau' },
  10: { nom: 'Lt. Surge', titre: 'Champion Électrik',  typeSpecialite: 'electric', icone: '⚡', description: 'Le guerrier électrique' },
  15: { nom: 'Drake',     titre: 'Champion Dragon',    typeSpecialite: 'dragon',   icone: '🐉', description: 'Maître des Dragons' },
};

// Boss alternatifs par classe pour l'étage 15
export const BOSS_FINAUX: Record<string, Champion> = {
  classique: { nom: 'Mewtwo',    titre: 'Le Pokémon Génétique', typeSpecialite: 'psychic', icone: '🔮', description: 'La puissance ultime de la science.' },
  riche:     { nom: 'Ho-Oh',     titre: 'L\'Oiseau Légendaire', typeSpecialite: 'fire',    icone: '🌟', description: 'Le gardien du paradis.' },
  tacticien: { nom: 'Tyranocif', titre: 'Le Roi des Dragons',   typeSpecialite: 'dragon',  icone: '🐉', description: 'Seul la stratégie peut le vaincre.' },
};
