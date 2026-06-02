const CLE_ACHIEVEMENTS = 'pokedraft_achievements';

export interface Achievement {
  id: string;
  nom: string;
  description: string;
  icone: string;
  verifie: (stats: {
    etage: number; pvJoueur: number; pvJoueurMax: number;
    degatsInfliges: number; combatsGagnes: number;
    pokemonUtilises: string[]; classe: string | null;
    victoire: boolean;
  }) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'premier_sang', nom: 'Premier Sang', description: 'Terminer votre premier combat', icone: '⚔️',
    verifie: s => s.combatsGagnes >= 1 },
  { id: 'etage5', nom: 'Survivant', description: 'Atteindre l\'étage 5', icone: '🛡️',
    verifie: s => s.etage >= 5 },
  { id: 'boss_slayer', nom: 'Tueur de Boss', description: 'Battre les 3 champions d\'arène', icone: '🏆',
    verifie: s => s.combatsGagnes >= 10 && s.etage >= 15 },
  { id: 'invincible', nom: 'Invincible', description: 'Finir un run avec 100% de PV', icone: '💎',
    verifie: s => s.victoire && s.pvJoueur >= s.pvJoueurMax },
  { id: 'riche', nom: 'Plein aux As', description: 'Gagner avec la classe Le Riche', icone: '💰',
    verifie: s => s.victoire && s.classe === 'riche' },
  { id: 'tacticien', nom: 'L\'Art de la Guerre', description: 'Gagner avec Le Tacticien', icone: '🧠',
    verifie: s => s.victoire && s.classe === 'tacticien' },
  { id: 'degats10k', nom: 'Machine de Guerre', description: 'Infliger 10 000 dégâts en un run', icone: '💥',
    verifie: s => s.degatsInfliges >= 10000 },
  { id: 'collectionneur', nom: 'Collectionneur', description: 'Utiliser 10 Pokémon différents en un run', icone: '📚',
    verifie: s => s.pokemonUtilises.length >= 10 },
  { id: 'legendaire', nom: 'Dresseur Légendaire', description: 'Avoir un Légendaire dans l\'équipe', icone: '✨',
    verifie: s => s.pokemonUtilises.some(n => ['Mewtwo', 'Mew', 'Lugia', 'Ho-Oh', 'Rayquaza', 'Kyogre', 'Groudon', 'Jirachi', 'Deoxys'].includes(n)) },
  { id: 'runcomplet', nom: 'Champion', description: 'Terminer les 15 étages', icone: '👑',
    verifie: s => s.victoire && s.etage >= 15 },
];

export function chargerAchievementsDebloques(): string[] {
  try { return JSON.parse(localStorage.getItem(CLE_ACHIEVEMENTS) ?? '[]'); } catch { return []; }
}

export function verifierEtSauvegarder(stats: Parameters<Achievement['verifie']>[0]): Achievement[] {
  const deja = new Set(chargerAchievementsDebloques());
  const nouveaux: Achievement[] = [];
  for (const a of ACHIEVEMENTS) {
    if (!deja.has(a.id) && a.verifie(stats)) {
      deja.add(a.id);
      nouveaux.push(a);
    }
  }
  localStorage.setItem(CLE_ACHIEVEMENTS, JSON.stringify([...deja]));
  return nouveaux;
}
