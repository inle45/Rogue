import { useEffect, useState, useRef } from 'react';
import { useJeuStore } from '../store/jeuStore';
import { resoudreCombat, genererEquipeEnnemi } from '../services/moteurCombat';
import type { TourCombat } from '../types/jeu';
import type { PokemonEquipe } from '../types/pokemon';


function MiniPokemon({ p, mort }: { p: PokemonEquipe; mort?: boolean }) {
  const pct = p.pvActuels / Math.max(1, p.stats.pv + p.bonusPv) * 100;
  const coul = pct > 50 ? 'bg-green-400' : pct > 25 ? 'bg-yellow-400' : 'bg-red-500';
  return (
    <div className={`flex flex-col items-center gap-0.5 transition-all ${mort ? 'opacity-30 grayscale' : ''}`}>
      <img src={p.sprite} alt={p.nomFr} className="w-14 h-14 object-contain" />
      <p className="text-[10px] text-white/70 font-bold truncate max-w-[60px] text-center">{p.nomFr}</p>
      <div className="w-12 bg-black/40 rounded-full h-1.5">
        <div className={`${coul} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
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
  const journalRef = useRef<HTMLDivElement>(null);

  const equipeJoueur = terrain.filter(Boolean) as PokemonEquipe[];

  // Génère l'équipe ennemie une seule fois au montage du composant
  // cachePokemons et etage ne changent pas pendant un combat — la dépendance vide est intentionnelle
  useEffect(() => {
    if (cachePokemons.length > 0) setEquipeEnnemi(genererEquipeEnnemi(cachePokemons, etage));
  }, [cachePokemons, etage]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (journalRef.current) journalRef.current.scrollTop = journalRef.current.scrollHeight;
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
      if (i >= res.tours.length) { clearInterval(iv); setTimeout(() => setPhase('resultat'), 700); }
    }, 450);
  };

  const terminer = () => appliquerResultatCombat(victoire ? 0 : 10 + etage * 2, victoire);

  // États en temps réel des Pokémon (extrait du journal)
  const equipeJoueurEnCours = phase === 'resultat' ? equipeFinalJoueur : equipeJoueur;
  const toursVisibles = tours.slice(0, tourAffiche);

  // Correction : tracking par instanceId pour éviter les collisions sur les doublons de nom
  const pvEnCours: Record<string, number> = {};
  [...equipeJoueur, ...equipeEnnemi].forEach(p => { pvEnCours[p.instanceId] = p.pvActuels; });
  toursVisibles.forEach(t => { pvEnCours[t.instanceIdDefenseur] = t.pvRestantsDefenseur; });

  const joueurAvecPvEnCours = equipeJoueurEnCours.map(p => ({
    ...p,
    pvActuels: pvEnCours[p.instanceId] ?? p.pvActuels,
  }));
  const ennemiAvecPvEnCours = equipeEnnemi.map(p => ({
    ...p,
    pvActuels: pvEnCours[p.instanceId] ?? p.pvActuels,
  }));

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col max-w-lg mx-auto">

      {/* Header */}
      <header className="px-4 pt-4 pb-2 border-b border-white/8">
        <h1 className="text-center text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
          ⚔️ COMBAT — ÉTAGE {etage}
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

        {/* Arène */}
        <div className="grid grid-cols-2 gap-3">
          {/* Joueur */}
          <div className="rounded-2xl border border-green-800/40 bg-green-950/20 p-3">
            <p className="text-green-400 text-[10px] font-bold tracking-widest mb-2">VOTRE ÉQUIPE</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {joueurAvecPvEnCours.map(p => (
                <MiniPokemon key={p.instanceId} p={p} mort={p.pvActuels <= 0} />
              ))}
            </div>
          </div>

          {/* Ennemi */}
          <div className="rounded-2xl border border-red-800/40 bg-red-950/20 p-3">
            <p className="text-red-400 text-[10px] font-bold tracking-widest mb-2">ENNEMI</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {ennemiAvecPvEnCours.map(p => (
                <MiniPokemon key={p.instanceId} p={p} mort={p.pvActuels <= 0} />
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
            <p className="text-white/30 text-[10px] font-bold tracking-widest mb-1 sticky top-0 bg-transparent">
              JOURNAL DE COMBAT
            </p>
            {toursVisibles.map((t, i) => (
              <p
                key={i}
                className={`text-sm leading-snug ${
                  t.multiplicateur >= 2 ? 'text-yellow-300 font-bold'
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

          {phase === 'resultat' && (
            <div className="w-full flex flex-col items-center gap-4">
              <div className={`text-5xl font-black text-center ${victoire ? 'text-green-400' : 'text-red-400'}`}>
                {victoire ? '🏆 VICTOIRE !' : '💀 DÉFAITE'}
              </div>
              <p className="text-white/50 text-sm text-center">
                {victoire
                  ? `Récompense : +${5 + etage} Pokédollars au prochain étage`
                  : `Vous perdez ${10 + etage * 2} PV`}
              </p>
              <button
                onClick={terminer}
                className={`w-full py-4 rounded-2xl font-black text-lg tracking-widest transition-all active:scale-95 shadow-xl
                  ${victoire
                    ? 'bg-gradient-to-r from-green-600 to-teal-500 shadow-green-900/40'
                    : 'bg-gradient-to-r from-red-700 to-red-600 shadow-red-900/40'}`}
              >
                {victoire ? '→ Étage suivant' : '→ Continuer'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
