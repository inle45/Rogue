// Carte visuelle d'un Pokémon — utilisée en boutique et en équipe

import type { PokemonCache, PokemonEquipe } from '../types/pokemon';
import { CarteType } from './CarteType';

interface Props {
  pokemon: PokemonCache | PokemonEquipe;
  onClick?: () => void;
  selectionne?: boolean;
  afficherStats?: boolean;
  petit?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

function estPokemonEquipe(p: PokemonCache | PokemonEquipe): p is PokemonEquipe {
  return 'pvActuels' in p;
}

export function CartePokemon({
  pokemon,
  onClick,
  selectionne,
  afficherStats = true,
  petit = false,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
}: Props) {
  const estEquipe = estPokemonEquipe(pokemon);
  const pvMax = estEquipe ? pokemon.stats.pv + pokemon.bonusPv : pokemon.stats.pv;
  const pvActuels = estEquipe ? pokemon.pvActuels : pvMax;
  const pourcentagePv = pvMax > 0 ? (pvActuels / pvMax) * 100 : 0;

  const couleurPv = pourcentagePv > 60 ? 'bg-green-500' : pourcentagePv > 30 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div
      className={`
        relative rounded-xl border-2 cursor-pointer transition-all duration-200
        ${selectionne ? 'border-cyan-400 shadow-lg shadow-cyan-500/30' : 'border-gray-700 hover:border-gray-500'}
        ${petit ? 'p-2' : 'p-3'}
        bg-gray-900 flex flex-col items-center gap-1
      `}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Sprite */}
      <img
        src={pokemon.sprite}
        alt={pokemon.nomFr}
        className={`${petit ? 'w-14 h-14' : 'w-20 h-20'} object-contain drop-shadow-lg`}
        style={{ imageRendering: 'pixelated' }}
      />

      {/* Nom */}
      <p className={`font-bold text-white ${petit ? 'text-xs' : 'text-sm'} text-center`}>
        {pokemon.nomFr}
      </p>

      {/* Types */}
      <div className="flex gap-1 flex-wrap justify-center">
        {pokemon.types.map(t => <CarteType key={t} type={t} petit={petit} />)}
      </div>

      {/* Barre de PV */}
      {estEquipe && (
        <div className="w-full">
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div
              className={`${couleurPv} h-1.5 rounded-full transition-all`}
              style={{ width: `${pourcentagePv}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 text-center">{pvActuels}/{pvMax} PV</p>
        </div>
      )}

      {/* Stats condensées */}
      {afficherStats && !petit && (
        <div className="grid grid-cols-2 gap-x-3 text-xs text-gray-400 w-full mt-1">
          <span>⚔️ {pokemon.stats.attaque}</span>
          <span>🛡️ {pokemon.stats.defense}</span>
          <span>❤️ {pokemon.stats.pv}</span>
          <span>⚡ {pokemon.stats.vitesse}</span>
        </div>
      )}
    </div>
  );
}
