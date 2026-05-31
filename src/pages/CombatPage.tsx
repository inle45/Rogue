// Écran de résolution automatique du combat tour par tour

import { useEffect, useState, useRef } from 'react';
import { useJeuStore } from '../store/jeuStore';
import { resoudreCombat, genererEquipeEnnemi } from '../services/moteurCombat';
import type { TourCombat } from '../types/jeu';
import type { PokemonEquipe } from '../types/pokemon';
import { CartePokemon } from '../components/CartePokemon';

export function CombatPage() {
  const { terrain, cachePokemons, etage, appliquerResultatCombat } = useJeuStore();
  const [phase, setPhase] = useState<'preparation' | 'combat' | 'resultat'>('preparation');
  const [toursCombat, setToursCombat] = useState<TourCombat[]>([]);
  const [tourAffiche, setTourAffiche] = useState(0);
  const [equipeFinalJoueur, setEquipeFinalJoueur] = useState<PokemonEquipe[]>([]);
  const [equipeEnnemi, setEquipeEnnemi] = useState<PokemonEquipe[]>([]);
  const [victoire, setVictoire] = useState(false);
  const journalRef = useRef<HTMLDivElement>(null);

  const equipeJoueur = terrain.filter(Boolean) as PokemonEquipe[];

  useEffect(() => {
    if (cachePokemons.length > 0) {
      setEquipeEnnemi(genererEquipeEnnemi(cachePokemons, etage));
    }
  }, [cachePokemons, etage]);

  useEffect(() => {
    if (journalRef.current) {
      journalRef.current.scrollTop = journalRef.current.scrollHeight;
    }
  }, [tourAffiche]);

  const lancerAnimation = () => {
    if (equipeEnnemi.length === 0) return;
    const resultat = resoudreCombat(equipeJoueur, equipeEnnemi);
    setToursCombat(resultat.tours);
    setEquipeFinalJoueur(resultat.equipeFinalJoueur);
    setVictoire(resultat.victoire);
    setPhase('combat');
    setTourAffiche(0);

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTourAffiche(i);
      if (i >= resultat.tours.length) {
        clearInterval(interval);
        setTimeout(() => setPhase('resultat'), 600);
      }
    }, 500);
  };

  const terminerCombat = () => {
    const degatsJoueur = victoire ? 0 : Math.floor(10 + etage * 2);
    appliquerResultatCombat(degatsJoueur, victoire);
  };

  const toursVisibles = toursCombat.slice(0, tourAffiche);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 flex flex-col gap-4 max-w-4xl mx-auto">
      <h1 className="text-center text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
        ⚔️ COMBAT — ÉTAGE {etage}
      </h1>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-green-800 rounded-xl p-4">
          <h2 className="text-green-400 font-bold text-sm mb-3 tracking-widest">VOTRE ÉQUIPE</h2>
          <div className="flex flex-wrap gap-2">
            {(phase === 'resultat' ? equipeFinalJoueur : equipeJoueur).map(p => (
              <CartePokemon key={p.instanceId} pokemon={p} petit afficherStats={false} />
            ))}
          </div>
        </div>

        <div className="bg-gray-900 border border-red-800 rounded-xl p-4">
          <h2 className="text-red-400 font-bold text-sm mb-3 tracking-widest">ÉQUIPE ENNEMIE</h2>
          <div className="flex flex-wrap gap-2">
            {equipeEnnemi.map(p => (
              <CartePokemon key={p.instanceId} pokemon={p} petit afficherStats={false} />
            ))}
          </div>
        </div>
      </div>

      {phase !== 'preparation' && (
        <div
          ref={journalRef}
          className="bg-gray-900 border border-gray-700 rounded-xl p-4 h-64 overflow-y-auto flex flex-col gap-1"
        >
          <h3 className="text-gray-400 text-xs font-bold mb-2 tracking-widest sticky top-0 bg-gray-900 pb-1">
            JOURNAL DE COMBAT
          </h3>
          {toursVisibles.map((tour, i) => (
            <p
              key={i}
              className={`text-sm ${
                tour.multiplicateur >= 2
                  ? 'text-yellow-300 font-bold'
                  : tour.multiplicateur === 0
                  ? 'text-gray-500'
                  : tour.multiplicateur < 1
                  ? 'text-gray-400'
                  : 'text-gray-300'
              }`}
            >
              {tour.message}
            </p>
          ))}
        </div>
      )}

      <div className="flex justify-center gap-4">
        {phase === 'preparation' && equipeEnnemi.length > 0 && (
          <button
            onClick={lancerAnimation}
            className="px-8 py-4 bg-gradient-to-r from-red-700 to-orange-600 hover:from-red-600 hover:to-orange-500 rounded-xl font-black text-xl tracking-widest transition-all transform hover:scale-105 shadow-lg"
          >
            ▶ LANCER LE COMBAT
          </button>
        )}

        {phase === 'resultat' && (
          <div className="text-center flex flex-col items-center gap-4">
            <div className={`text-4xl font-black ${victoire ? 'text-green-400' : 'text-red-400'}`}>
              {victoire ? '🏆 VICTOIRE !' : '💀 DÉFAITE'}
            </div>
            <p className="text-gray-400">
              {victoire
                ? `+${5 + etage} Pokédollars gagnés à l'étage suivant`
                : `Vous perdez ${10 + etage * 2} PV`}
            </p>
            <button
              onClick={terminerCombat}
              className={`px-8 py-3 rounded-xl font-bold text-lg transition-all transform hover:scale-105 ${
                victoire
                  ? 'bg-gradient-to-r from-green-700 to-teal-600 hover:from-green-600'
                  : 'bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700'
              }`}
            >
              {victoire ? '→ Étage suivant' : '→ Continuer'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
