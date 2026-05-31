import { useJeuStore } from '../store/jeuStore';
import { Audio } from '../services/audioService';

const CLASSES = [
  {
    id: 'classique' as const,
    nom: 'Classique',
    icone: '🎒',
    description: 'Le parcours standard du dresseur.',
    bonus: ['Commence avec ₽10', 'Règles normales'],
    malus: [],
    couleur: 'border-gray-600/50 bg-gray-900/40',
    couleurTexte: 'text-gray-300',
    couleurBtn: 'from-gray-700 to-gray-600',
  },
  {
    id: 'riche' as const,
    nom: 'Le Riche',
    icone: '💰',
    description: 'Argent facile, mais les vendeurs le savent.',
    bonus: ['Commence avec ₽30'],
    malus: ['Pokémon coûtent ₽1 de plus'],
    couleur: 'border-yellow-700/50 bg-yellow-950/30',
    couleurTexte: 'text-yellow-300',
    couleurBtn: 'from-yellow-700 to-amber-600',
  },
  {
    id: 'tacticien' as const,
    nom: 'Le Tacticien',
    icone: '🧠',
    description: 'Qualité sur quantité. Chaque Pokémon compte.',
    bonus: ['+30% toutes stats sur le terrain'],
    malus: ['Seulement 2 slots sur le terrain'],
    couleur: 'border-purple-700/50 bg-purple-950/30',
    couleurTexte: 'text-purple-300',
    couleurBtn: 'from-purple-700 to-violet-600',
  },
];

export function EcranChoixClasse() {
  const demarrerAvecClasse = useJeuStore(s => s.demarrerAvecClasse);
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6 gap-6">
      <div className="text-center">
        <p className="text-5xl mb-3">🏟️</p>
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-yellow-400">
          PokéDraft
        </h1>
        <p className="text-white/50 mt-1">Choisissez votre classe de dresseur</p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        {CLASSES.map(c => (
          <button
            key={c.id}
            onClick={() => { demarrerAvecClasse(c.id); Audio.clic(); }}
            className={`rounded-2xl border p-4 text-left transition-all active:scale-95 hover:brightness-110 ${c.couleur}`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{c.icone}</span>
              <div>
                <p className={`font-black text-lg ${c.couleurTexte}`}>{c.nom}</p>
                <p className="text-white/40 text-xs">{c.description}</p>
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              {c.bonus.map(b => (
                <p key={b} className="text-green-400 text-xs font-bold">✓ {b}</p>
              ))}
              {c.malus.map(m => (
                <p key={m} className="text-red-400 text-xs font-bold">✗ {m}</p>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
