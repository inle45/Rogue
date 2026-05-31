export type TypeMeteo = 'soleil' | 'pluie' | 'sable' | 'grele' | 'neutre';

export interface DefinitionMeteo {
  nom: string;
  icone: string;
  description: string;
  typesBoostes: string[];    // +30% dégâts
  typesPenalises: string[];  // -20% dégâts
  degatsParTour: number;     // % pvMax de dégâts à toute l'équipe sauf types immunisés (0 = aucun)
  typesImmunsMeteo: string[]; // immunisés aux dégâts de météo
}

export const METEOS: Record<TypeMeteo, DefinitionMeteo> = {
  neutre: { nom: 'Ciel dégagé', icone: '☀️', description: '', typesBoostes: [], typesPenalises: [], degatsParTour: 0, typesImmunsMeteo: [] },
  soleil: { nom: 'Soleil intense', icone: '🌞', description: 'Feu ×1.3, Eau ×0.7', typesBoostes: ['fire'], typesPenalises: ['water', 'ice'], degatsParTour: 0, typesImmunsMeteo: [] },
  pluie: { nom: 'Pluie torrentielle', icone: '🌧️', description: 'Eau ×1.3, Feu ×0.7', typesBoostes: ['water'], typesPenalises: ['fire', 'rock'], degatsParTour: 0, typesImmunsMeteo: [] },
  sable: { nom: 'Tempête de sable', icone: '🏜️', description: 'Roche +30%, 5% PV/tour', typesBoostes: ['rock'], typesPenalises: [], degatsParTour: 0.05, typesImmunsMeteo: ['rock', 'ground', 'steel'] },
  grele: { nom: 'Grêle', icone: '🌨️', description: 'Glace immunisée, 5% PV/tour', typesBoostes: ['ice'], typesPenalises: [], degatsParTour: 0.05, typesImmunsMeteo: ['ice'] },
};

export function tirerMeteoAleatoire(): TypeMeteo {
  const options: TypeMeteo[] = ['neutre', 'neutre', 'soleil', 'pluie', 'sable', 'grele'];
  return options[Math.floor(Math.random() * options.length)];
}
