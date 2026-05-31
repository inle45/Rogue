import { useEffect } from 'react';
import { useJeuStore } from '../store/jeuStore';
import { Audio } from '../services/audioService';

export function EcranVictorieFinal() {
  const statsRun = useJeuStore(s => s.statsRun);
  const meilleurEtage = useJeuStore(s => s.meilleurEtage);
  const reliques = useJeuStore(s => s.reliques);

  useEffect(() => { Audio.victoire(); }, []);

  const onRecommencer = () => {
    localStorage.removeItem('pokedraft_cache_v5');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6 gap-6 max-w-lg mx-auto">
      <div className="text-center">
        <p className="text-6xl mb-2">🏆</p>
        <h1 className="text-4xl font-black text-yellow-400">RUN TERMINÉ !</h1>
        <p className="text-white/50 mt-1">Vous avez conquis les 15 étages</p>
        {meilleurEtage > 0 && (
          <p className="text-yellow-600 text-sm mt-1">Record : étage {meilleurEtage}</p>
        )}
      </div>

      <div className="w-full rounded-2xl border border-white/10 bg-white/3 p-4 flex flex-col gap-3">
        <p className="text-white/40 text-xs font-bold tracking-widest">BILAN DU RUN</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-green-400">{statsRun.combatsGagnes}</p>
            <p className="text-white/40 text-xs">Combats gagnés</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-red-400">{statsRun.degatsInfliges.toLocaleString()}</p>
            <p className="text-white/40 text-xs">Dégâts infligés</p>
          </div>
        </div>
        {statsRun.pokemonUtilisesNoms.length > 0 && (
          <div>
            <p className="text-white/40 text-xs mb-1">Pokémon utilisés</p>
            <p className="text-white/70 text-sm">{statsRun.pokemonUtilisesNoms.join(', ')}</p>
          </div>
        )}
        {reliques.length > 0 && (
          <div>
            <p className="text-white/40 text-xs mb-1">Reliques obtenues</p>
            <div className="flex gap-2 flex-wrap">
              {reliques.map(r => (
                <span key={r.id} title={r.nom} className="text-2xl cursor-help">{r.icone}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onRecommencer}
        className="w-full py-4 rounded-2xl font-black text-lg bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 transition-all active:scale-95"
      >
        🔄 Nouvelle Partie
      </button>
    </div>
  );
}
