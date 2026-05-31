export type EffetRelique =
  | 'bonus_atk_global' | 'bonus_def_global' | 'bonus_pv_global'
  | 'soin_apres_victoire' | 'pokedollars_bonus' | 'vitesse_globale'
  | 'coup_critique_chance' | 'resistance_boss';

export interface DefinitionRelique {
  id: string;
  nom: string;
  description: string;
  icone: string;
  effet: EffetRelique;
  valeur: number;
}

export const RELIQUES_DISPONIBLES: DefinitionRelique[] = [
  { id: 'cape_heros',     nom: 'Cape du Héros',    description: '+20% ATK à toute l\'équipe',                      icone: '🦸', effet: 'bonus_atk_global',      valeur: 0.2 },
  { id: 'bouclier_titan', nom: 'Bouclier Titan',   description: '+25% DEF à toute l\'équipe',                      icone: '🛡️', effet: 'bonus_def_global',      valeur: 0.25 },
  { id: 'amulette_sante', nom: 'Amulette Santé',   description: '+30% PV max à toute l\'équipe',                   icone: '💎', effet: 'bonus_pv_global',       valeur: 0.3 },
  { id: 'potion_victoire',nom: 'Potion Victoire',  description: 'Soigne 20% PV joueur après chaque combat',        icone: '🧪', effet: 'soin_apres_victoire',   valeur: 0.2 },
  { id: 'bourse_or',      nom: 'Bourse d\'Or',     description: '+5 Pokédollars par étage en bonus',               icone: '💰', effet: 'pokedollars_bonus',     valeur: 5 },
  { id: 'bottes_rapides', nom: 'Bottes Rapides',   description: '+15% Vitesse à toute l\'équipe',                  icone: '👟', effet: 'vitesse_globale',       valeur: 0.15 },
  { id: 'griffe_critique',nom: 'Griffe Critique',  description: '15% de chance de doubler les dégâts',             icone: '🎯', effet: 'coup_critique_chance',  valeur: 0.15 },
  { id: 'talisman_boss',  nom: 'Talisman de Boss', description: '-20% dégâts reçus contre les champions',          icone: '🔮', effet: 'resistance_boss',       valeur: 0.2 },
];

export function tirerReliquesAleatoires(nb: number, deja: string[]): DefinitionRelique[] {
  const disponibles = RELIQUES_DISPONIBLES.filter(r => !deja.includes(r.id));
  const shuffled = [...disponibles].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, nb);
}
