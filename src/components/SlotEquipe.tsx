import React, { useState } from 'react';
import type { PokemonEquipe } from '../types/pokemon';
import { CartePokemon } from './CartePokemon';
import { useJeuStore } from '../store/jeuStore';
import { TABLE_EVOLUTIONS } from '../data/evolutions';

interface Props {
  pokemon: PokemonEquipe | null;
  index: number;
  type: 'terrain' | 'banc';
}

export function SlotEquipe({ pokemon, index, type }: Props) {
  const [survol, setSurvol] = useState(false);
  const [survolCarte, setSurvolCarte] = useState(false);
  const echangerSlots = useJeuStore(s => s.echangerSlots);
  const vendrePokemon = useJeuStore(s => s.vendrePokemon);

  const onDragStart = (e: React.DragEvent) => {
    if (!pokemon) return;
    e.dataTransfer.setData('instanceId', pokemon.instanceId);
    e.dataTransfer.setData('sourceType', type);
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setSurvol(true); };
  const onDragLeave = () => setSurvol(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setSurvol(false);
    const instanceId = e.dataTransfer.getData('instanceId');
    const sourceType = e.dataTransfer.getData('sourceType') as 'terrain' | 'banc';
    if (instanceId) echangerSlots(instanceId, sourceType, index, type);
  };

  return (
    <div
      className={`
        relative rounded-2xl min-h-[140px] flex items-center justify-center transition-all duration-150
        ${survol
          ? 'border-2 border-cyan-400 bg-cyan-900/20 scale-[1.02]'
          : pokemon
            ? 'border border-white/10'
            : 'border border-dashed border-white/15'}
      `}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onMouseEnter={() => setSurvolCarte(true)}
      onMouseLeave={() => setSurvolCarte(false)}
    >
      {pokemon ? (
        <>
          <CartePokemon
            pokemon={pokemon}
            draggable
            onDragStart={onDragStart}
            compact
            afficherStats={false}
          />
          {/* Badge shiny dans le slot */}
          {pokemon.shiny && (
            <div className="absolute top-1.5 left-1.5 z-10 text-base leading-none" title="Pokémon Shiny">
              ✨
            </div>
          )}
          {/* Badge évolution disponible */}
          {TABLE_EVOLUTIONS[pokemon.id] !== undefined && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-blue-900/80 border border-blue-500/60 rounded-lg px-1.5 py-0.5 text-[8px] font-black text-blue-300 leading-none whitespace-nowrap">
              → évol
            </div>
          )}
          {/* Bouton vente — visible au survol */}
          <button
            onClick={() => vendrePokemon(pokemon.instanceId)}
            className={`
              absolute top-1.5 right-1.5 w-6 h-6 rounded-full
              bg-red-900/80 border border-red-700/60 text-red-300
              text-[10px] font-black flex items-center justify-center
              transition-all duration-150
              ${survolCarte ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
              hover:bg-red-700 hover:text-white z-10
            `}
            title="Vendre ce Pokémon (+₽1)"
          >
            ✕
          </button>
          {/* Prix de vente au survol */}
          {survolCarte && (
            <div className="absolute bottom-1.5 right-1.5 bg-yellow-900/70 border border-yellow-700/40 rounded-lg px-1.5 py-0.5 text-[9px] text-yellow-400 font-bold z-10">
              Vendre ₽1
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-1 text-white/20">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth="1.5" strokeDasharray="4 2" />
            <line x1="12" y1="8" x2="12" y2="16" strokeWidth="1.5" />
            <line x1="8" y1="12" x2="16" y2="12" strokeWidth="1.5" />
          </svg>
          <span className="text-[10px]">{type === 'terrain' ? 'Terrain' : 'Banc'} {index + 1}</span>
        </div>
      )}
    </div>
  );
}
