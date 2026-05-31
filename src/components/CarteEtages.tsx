// Mini-carte horizontale des prochains étages

import type { TypeEtage } from '../store/jeuStore';

const ICONE: Record<TypeEtage, string> = {
  combat:        '⚔️',
  repos:         '💚',
  boutique_bonus:'🏪',
  boss:          '💀',
};

const COULEUR_ETAGE: Record<TypeEtage, string> = {
  combat:         'border-gray-700 text-gray-400',
  repos:          'border-green-800/60 text-green-400',
  boutique_bonus: 'border-purple-800/60 text-purple-400',
  boss:           'border-red-800/60 text-red-400',
};

interface Props {
  carte: TypeEtage[];
  etageActuel: number;
}

export function CarteEtages({ carte, etageActuel }: Props) {
  // Affiche les étages 1..15, centrés sur l'étage actuel
  const debut = Math.max(0, etageActuel - 2);
  const fin   = Math.min(carte.length, debut + 7);
  const visibles = carte.slice(debut, fin);

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none px-4 py-2">
      {visibles.map((type, i) => {
        const num = debut + i + 1;
        const actuel = num === etageActuel;
        const passe  = num < etageActuel;
        return (
          <div
            key={num}
            className={`
              flex-shrink-0 flex flex-col items-center gap-0.5
              rounded-xl border px-2 py-1.5 min-w-[44px] transition-all
              ${actuel
                ? 'border-cyan-400 bg-cyan-900/30 scale-110'
                : passe
                  ? 'border-white/5 opacity-30'
                  : COULEUR_ETAGE[type]}
            `}
          >
            <span className="text-base leading-none">{ICONE[type]}</span>
            <span className={`text-[9px] font-bold ${actuel ? 'text-cyan-400' : 'text-white/40'}`}>
              {num}
            </span>
          </div>
        );
      })}
    </div>
  );
}
