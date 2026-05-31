import { useEffect, useState, useRef } from 'react';
import { useJeuStore } from '../store/jeuStore';
import { resoudreCombat, genererEquipeEnnemi } from '../services/moteurCombat';
import type { TourCombat } from '../types/jeu';
import type { PokemonEquipe } from '../types/pokemon';

// Pokémon miniature avec animation au coup
function MiniPokemon({
  p, mort, enCoup, recoitSoin,
}: {
  p: PokemonEquipe; mort?: boolean; enCoup?: boolean; recoitSoin?: boolean;
}) {
  const pct = p.pvActuels / Math.max(1, p.stats.pv + p.bonusPv) * 100;
  const coulPv = pct > 50 ? 'bg-green-400' : pct > 25 ? 'bg-yellow-400' : 'bg-red-500';

  return (
    <div
      className={`
        flex flex-col items-center gap-0.5 transition-all duration-200
        ${mort ? 'opacity-25 grayscale' : ''}
        ${enCoup ? 'animate-shake' : ''}
      `}
      style={enCoup ? { animation: 'shake 0.3s ease-in-out' } : undefined}
    >
      {/* Flash de dégâts / soin */}
      <div className="relative">
        <img
          src={p.sprite}
          alt={p.nomFr}
          className={`w-14 h-14 object-contain transition-all duration-150 ${enCoup ? 'brightness-200' : recoitSoin ? 'brightness-150 saturate-200 hue-rotate-90' : ''}`}
        />
      </div>
      <p className="text-[10px] text-white/70 font-bold truncate max-w-[60px] text-center">{p.nomFr}</p>
      <div className="w-12 bg-black/40 rounded-full h-1.5">
        <div className={`${coulPv} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// Éran de victoire temporaire
function EcranVictoire({ etage, recompense, onContinuer }: { etage: number; recompense: number; onContinuer: () => void }) {
  useEffect(() => {
    const t = setTimeout(onContinuer, 3000);
    return () => clearTimeout(t);
  }, [onContinuer]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950/95 backdrop-blur gap-6 animate-fade-in">
      <div className="text-center flex flex-col items-center gap-3">
        <p className="text-7xl animate-bounce">🏆</p>
        <h1 className="text-4xl font-black text-green-400 tracking-wider">VICTOIRE !</h1>
        <p className="text-white/60 text-lg">Étage {etage} terminé</p>
        <div className="flex items-center gap-2 text-yellow-400 text-2xl font-black">
          <span>+{recompense}</span>
          <span className="text-sm text-yellow-600">Pokédollars</span>
        </div>
      </div>
      <button
        onClick={onContinuer}
        className="px-8 py-3 rounded-2xl bg-green-700/60 border border-green-600/40 text-green-300 font-bold text-sm hover:bg-green-600/60 transition-all"
      >
        Continuer →
      </button>
      <div className="flex gap-1 mt-2">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-white/20 animate-pulse"
            style={{ animationDelay: `${i * 0.5}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export function CombatPage() {
  const { terrain, cachePokemons, etage, appliquerResultatCombat } = useJeuStore();
  const [phase, setPhase] = useState<'preparation' | 'combat' | 'resultat'>('preparation');
  const [tours, setTours] = useState<TourCombat[]>([]);
  const [tourAffiche, setTourAffiche] = useState(0);
  const [equipeFinalJoueur, setEquipeFinalJoueur] = useState<PokemonEquipe[]>([]);
  const [equipeEnnemi, setEquipeEnnemi] = useState<PokemonEquipe[]>([]);
  const [victoire, setVictoire] = useState(false);
  const [idEnCoup, setIdEnCoup] = useState<string | null>(null);
  const [idsEnSoin, setIdsEnSoin] = useState<string[]>([]);
  const [afficherVictoire, setAfficherVictoire] = useState(false);
  const journalRef = useRef<HTMLDivElement>(null);

  const equipeJoueur = terrain.filter(Boolean) as PokemonEquipe[];

  useEffect(() => {
    if (cachePokemons.length > 0) setEquipeEnnemi(genererEquipeEnnemi(cachePokemons, etage));
  }, [cachePokemons, etage]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (journalRef.current) journalRef.current.scrollTop = journalRef.current.scrollHeight;
    // Déclenche animation au coup sur le dernier tour affiché
    if (tourAffiche > 0 && tours[tourAffiche - 1]) {
      const t = tours[tourAffiche - 1];
      if (t.degats > 0) {
        setIdEnCoup(t.instanceIdDefenseur);
        setTimeout(() => setIdEnCoup(null), 350);
      }
      if (t.capacite && (t.capacite.description.includes('Soigne') || t.capacite.description.includes('soin'))) {
        const allIds = [...equipeJoueur, ...equipeEnnemi].map(p => p.instanceId);
        setIdsEnSoin(allIds);
        setTimeout(() => setIdsEnSoin([]), 500);
      }
    }
  }, [tourAffiche]);

  const lancerAnimation = () => {
    if (!equipeEnnemi.length) return;
    const res = resoudreCombat(equipeJoueur, equipeEnnemi);
    setTours(res.tours);
    setEquipeFinalJoueur(res.equipeFinalJoueur);
    setVictoire(res.victoire);
    setPhase('combat');
    setTourAffiche(0);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setTourAffiche(i);
      if (i >= res.tours.length) {
        clearInterval(iv);
        setTimeout(() => {
          setPhase('resultat');
          if (res.victoire) setAfficherVictoire(true);
        }, 700);
      }
    }, 450);
  };

  const terminer = () => {
    setAfficherVictoire(false);
    appliquerResultatCombat(victoire ? 0 : 10 + etage * 2, victoire);
  };

  const pvEnCours: Record<string, number> = {};
  [...equipeJoueur, ...equipeEnnemi].forEach(p => { pvEnCours[p.instanceId] = p.pvActuels; });
  tours.slice(0, tourAffiche).forEach(t => { pvEnCours[t.instanceIdDefenseur] = t.pvRestantsDefenseur; });

  const equipeJoueurEnCours = phase === 'resultat' ? equipeFinalJoueur : equipeJoueur;
  const joueurAvecPv = equipeJoueurEnCours.map(p => ({ ...p, pvActuels: pvEnCours[p.instanceId] ?? p.pvActuels }));
  const ennemiAvecPv = equipeEnnemi.map(p => ({ ...p, pvActuels: pvEnCours[p.instanceId] ?? p.pvActuels }));
  const toursVisibles = tours.slice(0, tourAffiche);
  const recompense = 5 + etage;

  return (
    <>
      {/* Overlay victoire */}
      {afficherVictoire && (
        <EcranVictoire etage={etage} recompense={recompense} onContinuer={terminer} />
      )}

      {/* Keyframes shake dans le head via style tag */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-5px); }
          40% { transform: translateX(5px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>

      <div className="min-h-screen bg-gray-950 text-white flex flex-col max-w-lg mx-auto">
        <header className="px-4 pt-4 pb-2 border-b border-white/8">
          <h1 className="text-center text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
            ⚔️ COMBAT — ÉTAGE {etage}
          </h1>
        </header>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

          {/* Arène */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-green-800/40 bg-green-950/20 p-3">
              <p className="text-green-400 text-[10px] font-bold tracking-widest mb-2">VOTRE ÉQUIPE</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {joueurAvecPv.map(p => (
                  <MiniPokemon
                    key={p.instanceId}
                    p={p}
                    mort={p.pvActuels <= 0}
                    enCoup={idEnCoup === p.instanceId}
                    recoitSoin={idsEnSoin.includes(p.instanceId)}
                  />
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-red-800/40 bg-red-950/20 p-3">
              <p className="text-red-400 text-[10px] font-bold tracking-widest mb-2">ENNEMI</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {ennemiAvecPv.map(p => (
                  <MiniPokemon
                    key={p.instanceId}
                    p={p}
                    mort={p.pvActuels <= 0}
                    enCoup={idEnCoup === p.instanceId}
                    recoitSoin={idsEnSoin.includes(p.instanceId)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Journal */}
          {phase !== 'preparation' && (
            <div
              ref={journalRef}
              className="rounded-2xl border border-white/10 bg-white/3 p-3 h-52 overflow-y-auto flex flex-col gap-1"
            >
              <p className="text-white/30 text-[10px] font-bold tracking-widest mb-1">JOURNAL</p>
              {toursVisibles.map((t, i) => (
                <p
                  key={i}
                  className={`text-sm leading-snug ${
                    t.capacite ? 'text-yellow-300 font-bold'
                    : t.degats === 0 ? 'text-orange-300 italic'
                    : t.multiplicateur >= 2 ? 'text-yellow-200 font-semibold'
                    : t.multiplicateur === 0 ? 'text-white/25 italic'
                    : t.multiplicateur < 1 ? 'text-white/45'
                    : 'text-white/75'
                  }`}
                >
                  {t.message}
                </p>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col items-center gap-3">
            {phase === 'preparation' && equipeEnnemi.length > 0 && (
              <button
                onClick={lancerAnimation}
                className="w-full py-4 rounded-2xl font-black text-xl tracking-widest
                  bg-gradient-to-r from-red-600 to-orange-500
                  hover:from-red-500 hover:to-orange-400
                  shadow-xl shadow-red-900/40 active:scale-95 transition-all"
              >
                ▶ LANCER LE COMBAT
              </button>
            )}

            {phase === 'combat' && (
              <div className="flex items-center gap-2 text-white/40 text-sm">
                <span className="animate-pulse text-xl">⚔️</span>
                <span>Combat en cours…</span>
              </div>
            )}

            {phase === 'resultat' && !victoire && (
              <div className="w-full flex flex-col items-center gap-4">
                <div className="text-5xl font-black text-red-400">💀 DÉFAITE</div>
                <p className="text-white/50 text-sm">Vous perdez {10 + etage * 2} PV</p>
                <button
                  onClick={terminer}
                  className="w-full py-4 rounded-2xl font-black text-lg tracking-widest
                    bg-gradient-to-r from-red-700 to-red-600 shadow-xl shadow-red-900/40 active:scale-95 transition-all"
                >
                  → Continuer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
