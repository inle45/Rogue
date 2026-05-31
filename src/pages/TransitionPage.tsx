import { useJeuStore } from '../store/jeuStore';
import type { TypeEtage } from '../store/jeuStore';

const ICONE_ETAGE: Record<TypeEtage, string> = {
  combat: '⚔️', repos: '💚', boutique_bonus: '🏪', boss: '💀', evenement: '🎲',
};
const NOM_ETAGE: Record<TypeEtage, string> = {
  combat: 'Combat', repos: 'Repos', boutique_bonus: 'Boutique Bonus', boss: 'BOSS', evenement: 'Événement',
};
const COULEUR_ETAGE: Record<TypeEtage, string> = {
  combat: 'text-red-400', repos: 'text-green-400', boutique_bonus: 'text-purple-400',
  boss: 'text-red-500', evenement: 'text-yellow-400',
};

export function TransitionPage() {
  const { etageTransition, typeEtageTransition } = useJeuStore();
  const type = typeEtageTransition ?? 'combat';

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950 gap-4 animate-fade-in">
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fade-in 0.4s ease-out; }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .slide-up { animation: slide-up 0.5s ease-out 0.2s both; }
      `}</style>
      <p className="text-6xl">{ICONE_ETAGE[type]}</p>
      <div className="text-center slide-up">
        <p className="text-white/40 text-sm tracking-widest font-bold">PROCHAIN ÉTAGE</p>
        <p className="text-5xl font-black text-white">{etageTransition}</p>
        <p className={`text-xl font-black tracking-wider mt-1 ${COULEUR_ETAGE[type]}`}>
          {NOM_ETAGE[type]}
        </p>
      </div>
      <div className="flex gap-1 mt-4">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full bg-white/20 animate-pulse"
            style={{ animationDelay: `${i * 0.3}s` }} />
        ))}
      </div>
    </div>
  );
}
