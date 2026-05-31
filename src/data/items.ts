// Définition des 8 items officiels équipables

export interface DefinitionItem {
  id: string;
  nom: string;
  description: string;
  sprite: string;
  prix: number;
}

export interface ItemJeu extends DefinitionItem {
  instanceId: string;
}

export const ITEMS_DISPONIBLES: DefinitionItem[] = [
  {
    id: 'leftovers',
    nom: 'Restes',
    description: 'Régénère 6% des PV max à chaque tour.',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/leftovers.png',
    prix: 4,
  },
  {
    id: 'choice-band',
    nom: 'Épi de Choix',
    description: '+50% en Attaque.',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/choice-band.png',
    prix: 5,
  },
  {
    id: 'life-orb',
    nom: 'Pierre de Vie',
    description: '+30% dégâts mais retire 8% PV max par tour.',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/life-orb.png',
    prix: 4,
  },
  {
    id: 'focus-sash',
    nom: 'Focale',
    description: 'Survit à 1 PV si KO d\'un coup depuis PV max (usage unique).',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/focus-sash.png',
    prix: 3,
  },
  {
    id: 'sitrus-berry',
    nom: 'Baie Sitrus',
    description: 'Soin unique de 30% PV max quand PV < 50% (usage unique).',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/sitrus-berry.png',
    prix: 3,
  },
  {
    id: 'rocky-helmet',
    nom: 'Restes de Rocher',
    description: 'L\'attaquant perd 12% de ses PV max quand il attaque ce Pokémon.',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rocky-helmet.png',
    prix: 4,
  },
  {
    id: 'expert-belt',
    nom: 'Ceinture Expert',
    description: '+20% dégâts supplémentaires si l\'attaque est super efficace (×2).',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/expert-belt.png',
    prix: 4,
  },
  {
    id: 'quick-claw',
    nom: 'Serre Griffe',
    description: 'Vitesse ×1,5 pour l\'ordre d\'attaque.',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/quick-claw.png',
    prix: 3,
  },
];

export function genererItemsAleatoires(nb: number): ItemJeu[] {
  const melanges = [...ITEMS_DISPONIBLES].sort(() => Math.random() - 0.5);
  return melanges.slice(0, nb).map(item => ({
    ...item,
    instanceId: Math.random().toString(36).slice(2, 9),
  }));
}
