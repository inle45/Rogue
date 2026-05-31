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
