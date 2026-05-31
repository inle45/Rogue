import { useJeuStore } from '../store/jeuStore';

interface Props {
  etage: number;
  onRecommencer: () => void;
}

export function GameOverPage({ etage, onRecommencer }: Props) {
  const meilleurEtage = useJeuStore(s => s.meilleurEtage);
  const nouveauRecord = etage >= meilleurEtage && etage > 1;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-8 px-8">
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
