// Slot de terrain ou de banc avec support drag-and-drop

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
  const [surbrillance, setSurbrillance] = useState(false);
  const echangerSlots = useJeuStore(s => s.echangerSlots);

  const onDragStart = (e: React.DragEvent) => {
    if (!pokemon) return;
    e.dataTransfer.setData('instanceId', pokemon.instanceId);
    e.dataTransfer.setData('sourceType', type);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setSurbrillance(true);
  };

  const onDragLeave = () => setSurbrillance(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setSurbrillance(false);
    const instanceId = e.dataTransfer.getData('instanceId');
    const sourceType = e.dataTransfer.getData('sourceType') as 'terrain' | 'banc';
    if (!instanceId) return;
    echangerSlots(instanceId, sourceType, index, type);
  };

  const libelle = type === 'terrain' ? `Terrain ${index + 1}` : `Banc ${index + 1}`;

  return (
    <div
      className={`
        rounded-xl border-2 min-h-[180px] flex items-center justify-center transition-all duration-200
        ${surbrillance
          ? 'border-cyan-400 bg-cyan-900/20'
          : pokemon
          ? 'border-gray-600 bg-gray-800/50'
          : 'border-dashed border-gray-700 bg-gray-800/20'}
      `}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {pokemon ? (
        <CartePokemon pokemon={pokemon} draggable onDragStart={onDragStart} petit />
      ) : (
        <div className="text-center text-gray-600">
          <p className="text-2xl">+</p>
          <p className="text-xs">{libelle}</p>
        </div>
      )}
    </div>
  );
}
