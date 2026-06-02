import { useJeuStore } from '../store/jeuStore';
import { chargerScores } from '../data/scores';
import { getNbVus } from '../data/pokedex';

interface Props {
  etage: number;
  onRecommencer: () => void;
}

export function GameOverPage({ etage, onRecommencer }: Props) {
  const meilleurEtage = useJeuStore(s => s.meilleurEtage);
  const statsRun = useJeuStore(s => s.statsRun);
  const reliques = useJeuStore(s => s.reliques);
  const nouveauxAchievements = useJeuStore(s => s.nouveauxAchievements);
  const nouveauRecord = etage >= meilleurEtage && etage > 1;
  const scores = chargerScores();
  const nbVus = getNbVus();

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-6 px-8 max-w-lg mx-auto">
      <div className="text-center flex flex-col gap-3">
        <p className="text-8xl">💀</p>
        <h1 className="text-5xl font-black text-red-400 tracking-wider">GAME OVER</h1>
        <p className="text-white/40 text-lg">
          Étage atteint : <span className="text-white font-bold">{etage}</span>
        </p>

        {nouveauRecord ? (
          <div className="mt-1 flex items-center justify-center gap-2 text-yellow-400 font-black text-lg animate-pulse">
            🏆 Nouveau record !
          </div>
        ) : (
          <p className="text-white/25 text-sm">
            Record : étage {meilleurEtage}
          </p>
        )}
      </div>

      {/* Bilan du run */}
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

      {/* Score actuel + Top 5 */}
      {scores.length > 0 && (
        <div className="w-full rounded-2xl border border-white/10 bg-white/3 p-4 flex flex-col gap-2">
          <p className="text-white/40 text-xs font-bold tracking-widest">CLASSEMENT</p>
          {scores.map((s, i) => (
            <div key={i} className={`flex items-center justify-between text-sm ${i === 0 ? 'text-yellow-400 font-black' : 'text-white/60'}`}>
              <span>#{i + 1} {s.classe} — Étage {s.etage}</span>
              <span className="font-bold">{s.score.toLocaleString()} pts</span>
            </div>
          ))}
        </div>
      )}

      {/* Pokédex */}
      <p className="text-white/50 text-sm">📖 Pokédex : {nbVus} / 386 Pokémon découverts</p>

      {/* Nouveaux achievements */}
      {nouveauxAchievements.length > 0 && (
        <div className="w-full flex flex-col gap-2">
          <p className="text-white/40 text-xs font-bold tracking-widest">SUCCÈS DÉBLOQUÉS</p>
          {nouveauxAchievements.map(a => (
            <div key={a.id} className="flex items-center gap-2 bg-yellow-900/30 border border-yellow-700/40 rounded-xl p-2">
              <span className="text-2xl">{a.icone}</span>
              <div>
                <p className="text-yellow-300 font-black text-sm">{a.nom}</p>
                <p className="text-white/50 text-xs">{a.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onRecommencer}
        className="px-10 py-4 rounded-2xl font-black text-xl tracking-widest
          bg-gradient-to-r from-cyan-600 to-blue-600
          hover:from-cyan-500 hover:to-blue-500
          shadow-xl shadow-cyan-900/40 active:scale-95 transition-all"
      >
        🔄 RECOMMENCER
      </button>
    </div>
  );
}
