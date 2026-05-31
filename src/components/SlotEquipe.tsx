import React, { useState } from 'react';
import type { PokemonEquipe } from '../types/pokemon';
import { CartePokemon } from './CartePokemon';
import { useJeuStore } from '../store/jeuStore';

interface Props {
  pokemon: PokemonEquipe | null;
  index: number;
  type: 'terrain' | 'banc';
}

export function SlotEquipe({ pokemon, index, type }: Props) {
  const [survol, setSurvol] = useState(false);
  const echangerSlots = useJeuStore(s => s.echangerSlots);

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
        rounded-2xl min-h-[140px] flex items-center justify-center transition-all duration-150
        ${survol
          ? 'border-2 border-cyan-400 bg-cyan-900/20 scale-[1.02]'
          : pokemon
            ? 'border border-white/10'
            : 'border border-dashed border-white/15 bg-white/2'}
      `}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {pokemon ? (
        <CartePokemon
          pokemon={pokemon}
          draggable
          onDragStart={onDragStart}
          compact
          afficherStats={false}
        />
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
