// Capacités spéciales par type — se déclenchent tous les 3 coups portés
// Ultimates — se déclenchent tous les 6 coups portés

export type EffetCapacite = 'soin_equipe' | 'degats_aoe' | 'frappe_puissante' | 'paralysie';

export interface DefinitionCapacite {
  nom: string;
  description: string;
  effet: EffetCapacite;
  valeur: number;
}

export interface DefinitionUltimate {
  nom: string;
  description: string;
  effet: 'nuke' | 'soin_max' | 'buff_equipe' | 'reset_statuts';
  valeur: number;
}

export const ULTIMATES_PAR_TYPE: Record<string, DefinitionUltimate> = {
  fire:     { nom: 'Apocalypse Feu',      description: 'Inflige 200% ATK à toute l\'équipe ennemie.',          effet: 'nuke',          valeur: 2.0 },
  water:    { nom: 'Déluge Ultime',       description: 'Soigne toute l\'équipe à 100% des PV.',                effet: 'soin_max',      valeur: 1.0 },
  grass:    { nom: 'Éden Verdoyant',      description: 'Soigne 60% PV max à toute l\'équipe.',                 effet: 'soin_max',      valeur: 0.6 },
  electric: { nom: 'Foudre Absolue',      description: 'Paralyse tous les ennemis et inflige 150% ATK.',       effet: 'nuke',          valeur: 1.5 },
  psychic:  { nom: 'Explosion Mentale',   description: 'Inflige 180% ATK et confusionne toute l\'équipe ennemie.', effet: 'nuke',     valeur: 1.8 },
  ice:      { nom: 'Blizzard Éternel',    description: 'Gèle tous les ennemis et inflige 120% ATK.',           effet: 'nuke',          valeur: 1.2 },
  dragon:   { nom: 'Outrage Draconique',  description: 'Inflige 250% ATK à la cible. Inévitable.',             effet: 'nuke',          valeur: 2.5 },
  fighting: { nom: 'Mégapoing Final',     description: 'Inflige 200% ATK en ignorant la DEF.',                 effet: 'nuke',          valeur: 2.0 },
  ghost:    { nom: 'Cauchemar Éternel',   description: 'Endort toute l\'équipe ennemie.',                      effet: 'reset_statuts', valeur: 1.0 },
  dark:     { nom: 'Ombre Absolue',       description: 'Réduit l\'ATK ennemie de 30% et inflige 100% ATK.',    effet: 'buff_equipe',   valeur: 0.3 },
  steel:    { nom: 'Armure Absolue',      description: 'Donne +50% DEF à toute l\'équipe alliée.',             effet: 'buff_equipe',   valeur: 0.5 },
  normal:   { nom: 'Ultralaser',          description: 'Inflige 300% ATK à la cible. Ne peut pas rater.',      effet: 'nuke',          valeur: 3.0 },
  poison:   { nom: 'Toxik Total',         description: 'Empoisonne toute l\'équipe ennemie et inflige 80% ATK.', effet: 'nuke',        valeur: 0.8 },
  ground:   { nom: 'Tremblement Ultime',  description: 'Inflige 150% ATK à toute l\'équipe ennemie.',          effet: 'nuke',          valeur: 1.5 },
  flying:   { nom: 'Tempête Aérienne',    description: 'Inflige 120% ATK + 20% bonus météo.',                  effet: 'nuke',          valeur: 1.2 },
  bug:      { nom: 'Essaim Final',        description: 'Attaque 5 fois à 40% ATK chacune.',                    effet: 'nuke',          valeur: 2.0 },
  rock:     { nom: 'Déluge de Rocs',      description: 'Inflige 130% ATK à toute l\'équipe ennemie.',          effet: 'nuke',          valeur: 1.3 },
  fairy:    { nom: 'Éclat Lunaire',       description: 'Soigne toute l\'équipe et inflige 80% ATK à l\'ennemi.', effet: 'soin_max',    valeur: 0.4 },
};

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
