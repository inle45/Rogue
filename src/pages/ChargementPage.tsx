// Écran de chargement pendant le fetch de la PokeAPI

import { useEffect, useState } from 'react';
import { chargerCachePokemons } from '../services/pokeApiService';
import { useJeuStore } from '../store/jeuStore';

export function ChargementPage() {
  const [progression, setProgression] = useState(0);
  const [erreur, setErreur] = useState<string | null>(null);
  const initialiserCache = useJeuStore(s => s.initialiserCache);

  useEffect(() => {
    chargerCachePokemons((charge, total) => setProgression(Math.floor((charge / total) * 100)))
      .then(cache => initialiserCache(cache))
      .catch(e => setErreur(`Erreur de chargement: ${(e as Error).message}`));
  }, [initialiserCache]);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-8">
      {/* Logo */}
      <div className="text-center">
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-yellow-400">
          PokéDraft
        </h1>
        <p className="text-gray-400 mt-2 tracking-widest text-sm">AUTO-BATTLER ROGUE-LITE</p>
      </div>

      {/* Barre de progression */}
      {!erreur ? (
        <div className="w-80 flex flex-col gap-3">
          <div className="w-full bg-gray-800 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-cyan-500 to-yellow-400 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progression}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Chargement des Pokémon…</span>
            <span className="text-cyan-400 font-bold">{progression}%</span>
          </div>
          <p className="text-center text-gray-600 text-xs">
            Récupération des 151 premiers Pokémon depuis la PokéAPI
          </p>
        </div>
      ) : (
        <div className="text-red-400 text-center">
          <p className="text-xl">⚠️ {erreur}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-red-800 hover:bg-red-700 rounded-lg text-white"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Pokéball animée */}
      <div className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center animate-spin" style={{ animationDuration: '2s' }}>
        <div className="w-full h-0.5 bg-white" />
      </div>
    </div>
  );
}
