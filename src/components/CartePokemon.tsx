import React from 'react';
import type { PokemonCache, PokemonEquipe } from '../types/pokemon';
import { CarteType } from './CarteType';

const GRADIENT_TYPE: Record<string, string> = {
  fire:     'from-orange-900/60 to-red-950/80',
  water:    'from-blue-900/60 to-cyan-950/80',
  grass:    'from-green-900/60 to-emerald-950/80',
  electric: 'from-yellow-800/60 to-amber-950/80',
  ice:      'from-cyan-800/60 to-blue-950/80',
  fighting: 'from-red-900/60 to-rose-950/80',
  poison:   'from-purple-900/60 to-violet-950/80',
  ground:   'from-yellow-900/60 to-stone-950/80',
  flying:   'from-indigo-800/60 to-slate-950/80',
  psychic:  'from-pink-900/60 to-rose-950/80',
  bug:      'from-lime-900/60 to-green-950/80',
  rock:     'from-stone-800/60 to-gray-950/80',
  ghost:    'from-violet-900/60 to-purple-950/80',
  dragon:   'from-indigo-900/60 to-blue-950/80',
  dark:     'from-gray-800/60 to-zinc-950/80',
  steel:    'from-slate-700/60 to-gray-950/80',
  fairy:    'from-pink-800/60 to-rose-950/80',
  normal:   'from-gray-700/60 to-gray-950/80',
};

const BORDURE_TYPE: Record<string, string> = {
  fire: 'border-orange-700/50', water: 'border-blue-700/50', grass: 'border-green-700/50',
  electric: 'border-yellow-600/50', ice: 'border-cyan-600/50', fighting: 'border-red-700/50',
  poison: 'border-purple-700/50', ground: 'border-yellow-800/50', flying: 'border-indigo-600/50',
  psychic: 'border-pink-700/50', bug: 'border-lime-700/50', rock: 'border-stone-600/50',
  ghost: 'border-violet-700/50', dragon: 'border-indigo-700/50', dark: 'border-gray-600/50',
  steel: 'border-slate-500/50', fairy: 'border-pink-600/50', normal: 'border-gray-600/50',
};

interface Props {
  pokemon: PokemonCache | PokemonEquipe;
  onClick?: () => void;
  selectionne?: boolean;
  afficherStats?: boolean;
  compact?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
}

function estEquipe(p: PokemonCache | PokemonEquipe): p is PokemonEquipe {
  return 'pvActuels' in p;
}

export function CartePokemon({
  pokemon, onClick, selectionne, afficherStats = true, compact = false,
  draggable, onDragStart, onDrop, onDragOver,
}: Props) {
  const isEquipe = estEquipe(pokemon);
  const typeP = pokemon.types[0] || 'normal';
  const gradient = GRADIENT_TYPE[typeP] || GRADIENT_TYPE.normal;
  const bordure = BORDURE_TYPE[typeP] || BORDURE_TYPE.normal;

  const pvMax = isEquipe ? pokemon.stats.pv + pokemon.bonusPv : pokemon.stats.pv;
  const pvActuels = isEquipe ? pokemon.pvActuels : pvMax;
  const pctPv = pvMax > 0 ? (pvActuels / pvMax) * 100 : 100;
  const couleurPv = pctPv > 60 ? 'bg-green-400' : pctPv > 30 ? 'bg-yellow-400' : 'bg-red-500';

  return (
    <div
      className={`
        relative rounded-2xl border overflow-hidden cursor-pointer
        bg-gradient-to-b ${gradient} ${bordure}
        transition-all duration-200 select-none
        ${selectionne ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-gray-950' : 'hover:brightness-110'}
        ${compact ? 'w-full' : 'w-full'}
      `}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Sprite avec fond brillant */}
      <div className="relative flex justify-center pt-2 pb-0">
        <div className="absolute inset-0 bg-white/5 rounded-full scale-75 blur-xl" />
        <img
          src={pokemon.sprite}
          alt={pokemon.nomFr}
          className={`relative z-10 object-contain drop-shadow-2xl ${compact ? 'w-16 h-16' : 'w-24 h-24'}`}
          style={{ imageRendering: 'auto' }}
        />
      </div>

      {/* Infos */}
      <div className={`px-2 pb-2 ${compact ? 'pt-0.5' : 'pt-1'}`}>
        <p className={`font-black text-white text-center truncate ${compact ? 'text-xs' : 'text-sm'}`}>
          {pokemon.nomFr}
        </p>

        <div className="flex gap-1 justify-center mt-1 flex-wrap">
          {pokemon.types.map(t => <CarteType key={t} type={t} petit />)}
        </div>

        {/* Barre PV pour pokémon d'équipe */}
        {isEquipe && (
          <div className="mt-1.5">
            <div className="w-full bg-black/40 rounded-full h-1.5">
              <div className={`${couleurPv} h-1.5 rounded-full transition-all`} style={{ width: `${pctPv}%` }} />
            </div>
            <p className="text-center text-[10px] text-white/50 mt-0.5">{pvActuels}/{pvMax}</p>
          </div>
        )}

        {/* Stats */}
        {afficherStats && !compact && !isEquipe && (
          <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] text-white/60">
            <span className="flex items-center gap-1"><span className="text-orange-400">⚔</span>{pokemon.stats.attaque}</span>
            <span className="flex items-center gap-1"><span className="text-blue-400">🛡</span>{pokemon.stats.defense}</span>
            <span className="flex items-center gap-1"><span className="text-red-400">♥</span>{pokemon.stats.pv}</span>
            <span className="flex items-center gap-1"><span className="text-yellow-400">⚡</span>{pokemon.stats.vitesse}</span>
          </div>
        )}
      </div>
    </div>
  );
}
