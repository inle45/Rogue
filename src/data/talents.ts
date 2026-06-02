export interface Talent {
  nom: string;
  description: string;
}

// Talents par nom de Pokémon (nomFr exact)
export const TALENTS_POKEMON: Record<string, Talent> = {
  // Électrik
  'Pikachu':    { nom: 'Électrostatique', description: 'Paralyse sa cible au premier coup.' },
  'Raichu':     { nom: 'Électrostatique+', description: 'Paralyse sa cible à chaque capacité.' },
  'Ampharos':   { nom: 'Plus', description: 'Les capacités électriques ont +50% de chance de paralyser.' },
  // Feu
  'Dracaufeu':  { nom: 'Brasier', description: '+50% ATK quand PV < 33%.' },
  'Typhlosion': { nom: 'Brasier', description: '+50% ATK quand PV < 33%.' },
  'Arcanin':    { nom: 'Intimidation', description: 'Réduit l\'ATK de tous les ennemis de 10% au début du combat.' },
  // Normal
  'Ronflex':    { nom: 'Gros Estomac', description: 'Immunisé au sommeil et à la paralysie.' },
  'Kangourex':  { nom: 'Parental Bond', description: 'Attaque deux fois par tour (×0.6 la seconde).' },
  // Eau
  'Léviator':   { nom: 'Intimidation', description: 'Réduit l\'ATK de tous les ennemis de 10% au début du combat.' },
  'Tentacruel': { nom: 'Liquide Ooze', description: 'Soins reçus par les ennemis sont annulés.' },
  // Psy
  'Mewtwo':     { nom: 'Pression', description: 'Les adversaires utilisent leurs capacités 50% plus souvent (consomment plus de PP).' },
  'Alakazam':   { nom: 'Bon Sens', description: 'Immunisé à la confusion et au sommeil.' },
  'Gardevoir':  { nom: 'Trace', description: 'Copie le talent de l\'ennemi avec le plus haut BST.' },
  // Dragon
  'Dracolosse': { nom: 'Frénésie', description: 'ATK +10% à chaque tour (cumule jusqu\'à +50%).' },
  'Drattak':    { nom: 'Frénésie', description: 'ATK +10% à chaque tour (cumule jusqu\'à +50%).' },
  'Rayquaza':   { nom: 'Régulation Aérienne', description: 'Annule les effets de la météo. +20% ATK et DEF.' },
  // Spectre/Ténèbres
  'Ectoplasma': { nom: 'Lévitation', description: 'Immunisé aux attaques Sol. +10% esquive.' },
  'Démolosse': { nom: 'Intimidation', description: 'Réduit l\'ATK de tous les ennemis de 10% au début du combat.' },
  // Combat
  'Mackogneur': { nom: 'Implacable', description: 'Ses attaques ignorent la DEF adverse.' },
  'Hariyama':   { nom: 'Morale', description: 'Soigne 10% de ses PV max à chaque KO ennemi.' },
  // Plante
  'Méganium':   { nom: 'Chlorophylle', description: 'VIT ×2 sous le soleil.' },
  'Venusaur':   { nom: 'Chlorophylle', description: 'VIT ×2 sous le soleil.' },
  // Acier
  'Metagross':  { nom: 'Bras de Fer', description: 'DEF +20% et immunisé au poison.' },
  // Glace
  'Lokhlass':   { nom: 'Gel Hydro', description: 'Absorbe les attaques Eau (soin au lieu de dégâts).' },
};

export function getTalent(nomFr: string): Talent | null {
  return TALENTS_POKEMON[nomFr] ?? null;
}
