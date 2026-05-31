// Écran de fin de partie


interface Props {
  etage: number;
  onRecommencer: () => void;
}

export function GameOverPage({ etage, onRecommencer }: Props) {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-8">
      <div className="text-center">
        <p className="text-8xl mb-4">💀</p>
        <h1 className="text-5xl font-black text-red-400">GAME OVER</h1>
        <p className="text-gray-400 mt-4 text-xl">Vous avez atteint l'étage {etage}</p>
      </div>
      <button
        onClick={onRecommencer}
        className="px-10 py-4 bg-gradient-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600 rounded-xl font-black text-xl tracking-widest transition-all transform hover:scale-105 shadow-lg"
      >
        🔄 RECOMMENCER
      </button>
    </div>
  );
}
