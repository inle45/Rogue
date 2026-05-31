// Composant badge de type Pokémon


const COULEURS_TYPES: Record<string, string> = {
  fire: 'bg-orange-500',
  water: 'bg-blue-500',
  grass: 'bg-green-500',
  electric: 'bg-yellow-400',
  ice: 'bg-cyan-300',
  fighting: 'bg-red-700',
  poison: 'bg-purple-500',
  ground: 'bg-yellow-700',
  flying: 'bg-indigo-400',
  psychic: 'bg-pink-500',
  bug: 'bg-lime-600',
  rock: 'bg-stone-500',
  ghost: 'bg-violet-700',
  dragon: 'bg-indigo-700',
  dark: 'bg-gray-800',
  steel: 'bg-slate-400',
  fairy: 'bg-pink-300',
  normal: 'bg-gray-500',
};

const NOMS_FR_TYPES: Record<string, string> = {
  fire: 'FEU', water: 'EAU', grass: 'PLANTE', electric: 'ÉLEC', ice: 'GLACE',
  fighting: 'COMBAT', poison: 'POISON', ground: 'SOL', flying: 'VOL',
  psychic: 'PSY', bug: 'INSECTE', rock: 'ROCHE', ghost: 'SPECTRE',
  dragon: 'DRAGON', dark: 'TÉNÈBRES', steel: 'ACIER', fairy: 'FÉE', normal: 'NORMAL',
};

interface Props {
  type: string;
  petit?: boolean;
}

export function CarteType({ type, petit }: Props) {
  const couleur = COULEURS_TYPES[type] || 'bg-gray-500';
  const nom = NOMS_FR_TYPES[type] || type.toUpperCase();
  return (
    <span className={`${couleur} ${petit ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-0.5'} rounded text-white font-bold tracking-wider`}>
      {nom}
    </span>
  );
}
