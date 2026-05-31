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
      .catch(e => setErreur(`Erreur de chargement : ${(e as Error).message}`));
  }, [initialiserCache]);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-10 px-8">
      {/* Logo */}
      <div className="text-center">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-yellow-400">
          PokéDraft
        </h1>
        <p className="text-white/30 mt-2 tracking-[0.3em] text-xs uppercase">Auto-Battler · Rogue-Lite</p>
      </div>

      {!erreur ? (
        <div className="w-full max-w-xs flex flex-col gap-3">
          {/* Barre */}
          <div className="w-full bg-white/8 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-yellow-400 transition-all duration-300 shadow-lg shadow-cyan-500/30"
              style={{ width: `${progression}%` }}
            />
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-white/40">Chargement des Pokémon…</span>
            <span className="text-cyan-400 font-black">{progression}%</span>
          </div>
          {progression === 0 && (
            <p className="text-center text-white/20 text-[10px]">
              Premiers 151 Pokémon · Cache local activé
            </p>
          )}
        </div>
      ) : (
        <div className="text-center flex flex-col gap-4">
          <p className="text-red-400 text-sm">{erreur}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-800/60 border border-red-700/50 rounded-2xl text-white font-bold hover:bg-red-700/60 transition-all"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Pokéball */}
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-14 h-14 rounded-full border-4 border-white/80 relative overflow-hidden animate-spin"
          style={{ animationDuration: '2s' }}
        >
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-red-500/80" />
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-white/10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-white border-2 border-white/30" />
          </div>
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/80 -translate-y-px" />
        </div>
      </div>
    </div>
  );
}
