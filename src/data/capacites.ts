// Capacités spéciales par type — se déclenchent tous les 3 coups portés

export type EffetCapacite = 'soin_equipe' | 'degats_aoe' | 'frappe_puissante' | 'paralysie';

export interface DefinitionCapacite {
  nom: string;
  description: string;
  effet: EffetCapacite;
  valeur: number;
}

export const CAPACITES_PAR_TYPE: Record<string, DefinitionCapacite> = {
  fire:     { nom: 'Flambeaux',    description: 'Brûle tous les ennemis (50% ATK)',       effet: 'degats_aoe',       valeur: 0.5 },
  water:    { nom: 'Aqua-Soin',    description: 'Soigne toute l\'équipe de 20% PV',        effet: 'soin_equipe',      valeur: 0.2 },
  grass:    { nom: 'Synthèse',     description: 'Soigne toute l\'équipe de 25% PV',        effet: 'soin_equipe',      valeur: 0.25 },
  electric: { nom: 'Para-Onde',    description: 'Paralyse la cible (passe son tour)',       effet: 'paralysie',        valeur: 1 },
  psychic:  { nom: 'Psyko',        description: 'Frappe à ×2.0 de puissance',               effet: 'frappe_puissante', valeur: 2.0 },
  fighting: { nom: 'Coup Bas',     description: 'Frappe à ×1.5 (ignore la défense)',        effet: 'frappe_puissante', valeur: 1.5 },
  ice:      { nom: 'Blizzard',     description: 'Grêle sur tous les ennemis (30% ATK)',     effet: 'degats_aoe',       valeur: 0.3 },
  dragon:   { nom: 'Draco-Charge', description: 'Frappe à ×2.5 de puissance',               effet: 'frappe_puissante', valeur: 2.5 },
  dark:     { nom: 'Croque-Nuit',  description: 'Frappe à ×1.8 de puissance',               effet: 'frappe_puissante', valeur: 1.8 },
  ghost:    { nom: 'Malédiction',  description: 'Paralyse la cible (passe son tour)',       effet: 'paralysie',        valeur: 1 },
  normal:   { nom: 'Tranche',      description: 'Frappe à ×1.5 de puissance',               effet: 'frappe_puissante', valeur: 1.5 },
  poison:   { nom: 'Toxik',        description: 'Frappe à ×1.3 de puissance',               effet: 'frappe_puissante', valeur: 1.3 },
  ground:   { nom: 'Séisme',       description: 'Secousse sur tous les ennemis (40% ATK)',  effet: 'degats_aoe',       valeur: 0.4 },
  flying:   { nom: 'Aérotranche',  description: 'Frappe à ×1.6 de puissance',               effet: 'frappe_puissante', valeur: 1.6 },
  bug:      { nom: 'Essaim',       description: 'Soigne toute l\'équipe de 15% PV',         effet: 'soin_equipe',      valeur: 0.15 },
  rock:     { nom: 'Jet-Roc',      description: 'Frappe à ×1.4 de puissance',               effet: 'frappe_puissante', valeur: 1.4 },
  steel:    { nom: 'Poing-Acier',  description: 'Frappe à ×1.7 de puissance',               effet: 'frappe_puissante', valeur: 1.7 },
  fairy:    { nom: 'Lumière-Fée',  description: 'Soigne toute l\'équipe de 20% PV',         effet: 'soin_equipe',      valeur: 0.2 },
};
