import React from 'react';
import type { PokemonCache, PokemonEquipe, PokemonBoutique } from '../types/pokemon';
import { CarteType } from './CarteType';
import { getTalent } from '../data/talents';

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
  pokemon: PokemonCache | PokemonEquipe | PokemonBoutique;
  onClick?: () => void;
  selectionne?: boolean;
  afficherStats?: boolean;
  compact?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
}

function estEquipe(p: PokemonCache | PokemonEquipe | PokemonBoutique): p is PokemonEquipe {
  return 'pvActuels' in p;
}
function estBoutique(p: PokemonCache | PokemonEquipe | PokemonBoutique): p is PokemonBoutique {
  return 'pokemonSemaine' in p;
}

export function CartePokemon({
  pokemon, onClick, selectionne, afficherStats = true, compact = false,
  draggable, onDragStart, onDrop, onDragOver,
}: Props) {
  const isEquipe = estEquipe(pokemon);
  const isBoutique = estBoutique(pokemon);
  const typeP = pokemon.types[0] || 'normal';
  const gradient = GRADIENT_TYPE[typeP] || GRADIENT_TYPE.normal;
  const bordure = BORDURE_TYPE[typeP] || BORDURE_TYPE.normal;

  const pvMax = isEquipe ? pokemon.stats.pv + pokemon.bonusPv : pokemon.stats.pv;
  const pvActuels = isEquipe ? pokemon.pvActuels : pvMax;
  const pctPv = pvMax > 0 ? (pvActuels / pvMax) * 100 : 100;
  const couleurPv = pctPv > 60 ? 'bg-green-400' : pctPv > 30 ? 'bg-yellow-400' : 'bg-red-500';

  const isShiny = 'shiny' in pokemon && pokemon.shiny === true;
  const etoiles = isEquipe ? (pokemon as PokemonEquipe).etoiles : undefined;
  const pokemonSemaine = isBoutique ? (pokemon as PokemonBoutique).pokemonSemaine : false;
  const talent = getTalent(pokemon.nomFr);

  return (
    <div
      className={`
        relative rounded-2xl border overflow-hidden cursor-pointer
        bg-gradient-to-b ${gradient}
        transition-all duration-200 select-none
        ${isShiny ? 'border-yellow-400 ring-1 ring-yellow-400/50' : bordure}
        ${selectionne ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-gray-950' : 'hover:brightness-110'}
        ${compact ? 'w-full' : 'w-full'}
      `}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Badge Pokémon de la Semaine */}
      {pokemonSemaine && (
        <div className="absolute -top-1 inset-x-0 flex justify-center z-30">
          <span className="bg-gradient-to-r from-pink-600 to-purple-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full">
            ⭐ POKÉMON DE LA SEMAINE
          </span>
        </div>
      )}

      {/* Badge étoiles (fusion) */}
      {etoiles && etoiles > 1 && (
        <div className={`absolute top-1 right-1 z-20 text-xs font-black px-1.5 py-0.5 rounded-lg ${
          etoiles === 2 ? 'bg-yellow-500 text-black' : 'bg-amber-300 text-black'
        }`}>
          {'★'.repeat(etoiles)}
        </div>
      )}

      {/* Badge shiny */}
      {isShiny && (
        <div className="absolute top-1.5 right-1.5 z-20 bg-yellow-900/80 border border-yellow-500/60 rounded-lg px-1.5 py-0.5 text-[9px] font-black text-yellow-300 leading-none">
          ✨ SHINY
        </div>
      )}

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
        {talent && (
          <p className="text-[8px] text-cyan-400/70 text-center leading-tight font-bold truncate px-1">
            ⚡ {talent.nom}
          </p>
        )}
        {!compact && pokemon.nature && pokemon.nature.statBonus && (
          <p className="text-[9px] text-center">
            <span className="text-green-400">↑{pokemon.nature.statBonus}</span>
            {' '}<span className="text-red-400">↓{pokemon.nature.statMalus}</span>
            {' '}<span className="text-white/30">{pokemon.nature.nom}</span>
          </p>
        )}
        {!compact && pokemon.nature && !pokemon.nature.statBonus && (
          <p className="text-[9px] text-white/30 text-center">{pokemon.nature.nom}</p>
        )}

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
            <span className="flex items-center gap-1"><span className="text-orange-400">⚔</span>{isShiny ? Math.floor(pokemon.stats.attaque * 1.1) : pokemon.stats.attaque}</span>
            <span className="flex items-center gap-1"><span className="text-blue-400">🛡</span>{isShiny ? Math.floor(pokemon.stats.defense * 1.1) : pokemon.stats.defense}</span>
            <span className="flex items-center gap-1"><span className="text-red-400">♥</span>{isShiny ? Math.floor(pokemon.stats.pv * 1.1) : pokemon.stats.pv}</span>
            <span className="flex items-center gap-1"><span className="text-yellow-400">⚡</span>{isShiny ? Math.floor(pokemon.stats.vitesse * 1.1) : pokemon.stats.vitesse}</span>
          </div>
        )}
      </div>
    </div>
  );
}
