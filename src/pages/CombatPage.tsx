import { useEffect, useState, useRef } from 'react';
import { useJeuStore } from '../store/jeuStore';
import { resoudreCombat, genererEquipeEnnemi } from '../services/moteurCombat';
import type { TourCombat } from '../types/jeu';
import type { PokemonEquipe } from '../types/pokemon';
import { Audio } from '../services/audioService';
import { METEOS } from '../data/meteo';
import { CHAMPIONS, BOSS_FINAUX } from '../data/champions';

// Couleur de flash par type pour les animations de capacité
const FLASH_TYPE: Record<string, string> = {
  fire: 'hue-rotate-0 saturate-200', water: 'hue-rotate-180 saturate-200',
  grass: 'hue-rotate-90 saturate-200', electric: 'sepia saturate-[10]',
  psychic: 'hue-rotate-300 saturate-200', ice: 'hue-rotate-150 saturate-150',
  fighting: 'hue-rotate-0 saturate-150', dragon: 'hue-rotate-240 saturate-200',
  ghost: 'hue-rotate-270 saturate-150', dark: 'brightness-50',
};

interface FloatingDmg {
  id: string;
  valeur: number;
  couleur: string;
  key: number;
}

// Pokémon miniature avec animation au coup et flash de capacité
function MiniPokemon({
  p, mort, enCoup, recoitSoin, flashCapacite, floatingDmg,
}: {
  p: PokemonEquipe; mort?: boolean; enCoup?: boolean; recoitSoin?: boolean; flashCapacite?: string;
  floatingDmg?: FloatingDmg[];
}) {
  const pct = p.pvActuels / Math.max(1, p.stats.pv + p.bonusPv) * 100;
  const coulPv = pct > 50 ? 'bg-green-400' : pct > 25 ? 'bg-yellow-400' : 'bg-red-500';

  return (
    <div className="relative">
      {/* Dégâts flottants */}
      {floatingDmg?.filter(d => d.id === p.instanceId).map(d => (
        <div
          key={d.key}
          className="float-dmg absolute -top-2 left-1/2 -translate-x-1/2 text-sm font-black pointer-events-none z-10 drop-shadow-lg"
          style={{ color: d.couleur }}
        >
          -{d.valeur}
        </div>
      ))}
      <div
        className={`
          flex flex-col items-center gap-0.5 transition-all duration-200
          ${mort ? 'opacity-25 grayscale' : ''}
        `}
        style={enCoup ? { animation: 'shake 0.3s ease-in-out' } : undefined}
      >
        <div className="relative">
          {/* Halo de capacité */}
          {flashCapacite && (
            <div className="absolute inset-0 rounded-full animate-ping opacity-60"
              style={{ background: flashCapacite }} />
          )}
          <img
            src={p.sprite}
            alt={p.nomFr}
            className={`w-14 h-14 object-contain transition-all duration-150
              ${enCoup ? 'brightness-200' : ''}
              ${recoitSoin ? 'brightness-150 hue-rotate-90 saturate-200' : ''}
              ${flashCapacite ? (FLASH_TYPE[p.types[0]] ?? '') : ''}
            `}
          />
          {/* Badge item équipé */}
          {p.item && (
            <img src={p.item.sprite} alt={p.item.nom}
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gray-900 border border-white/20 p-0.5" />
          )}
        </div>
        <p className="text-[10px] text-white/70 font-bold truncate max-w-[60px] text-center">{p.nomFr}</p>
        <div className="w-12 bg-black/40 rounded-full h-1.5">
          <div className={`${coulPv} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
        </div>
        {/* Badge statut */}
        {p.statut && (
          <span className="text-[9px] font-bold px-1 rounded" style={{
            background: p.statut === 'poison' ? '#7e22ce' : p.statut === 'brulure' ? '#c2410c' :
            p.statut === 'paralysie' ? '#a16207' : p.statut === 'gel' ? '#164e63' : '#166534',
            color: 'white'
          }}>
            {p.statut === 'poison' ? '☠' : p.statut === 'brulure' ? '🔥' :
             p.statut === 'paralysie' ? '⚡' : p.statut === 'gel' ? '🧊' : '💤'}
          </span>
        )}
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

// Couleur CSS par type pour le halo de capacité
const HALO_COULEUR: Record<string, string> = {
  fire: '#f97316', water: '#3b82f6', grass: '#22c55e', electric: '#eab308',
  psychic: '#ec4899', ice: '#67e8f9', fighting: '#ef4444', dragon: '#6366f1',
  ghost: '#8b5cf6', dark: '#374151', normal: '#9ca3af', poison: '#a855f7',
  ground: '#ca8a04', flying: '#818cf8', bug: '#84cc16', rock: '#78716c',
  steel: '#94a3b8', fairy: '#f9a8d4',
};

export function CombatPage() {
  const {
    terrain, cachePokemons, etage, appliquerResultatCombat,
    meteoActuelle, reliques, reliquesProposees, choisirRelique,
    combatDifficile, classeDresseur, enregistrerDegatsRun,
  } = useJeuStore();
  const [phase, setPhase] = useState<'preparation' | 'combat' | 'resultat'>('preparation');
  const [tours, setTours] = useState<TourCombat[]>([]);
  const [tourAffiche, setTourAffiche] = useState(0);
  const [equipeFinalJoueur, setEquipeFinalJoueur] = useState<PokemonEquipe[]>([]);
  const [equipeEnnemi, setEquipeEnnemi] = useState<PokemonEquipe[]>([]);
  const [victoire, setVictoire] = useState(false);
  const [idEnCoup, setIdEnCoup] = useState<string | null>(null);
  const [idsEnSoin, setIdsEnSoin] = useState<string[]>([]);
  const [afficherVictoire, setAfficherVictoire] = useState(false);
  // instanceId + type du Pokémon qui vient de déclencher une capacité
  const [flashCapacite, setFlashCapacite] = useState<{ id: string; type: string } | null>(null);
  // Dégâts flottants
  const [floatingDmg, setFloatingDmg] = useState<FloatingDmg[]>([]);
  // Vitesse de l'animation (Feature 3)
  const [vitesse, setVitesse] = useState<1 | 2 | 3>(1);
  const vitesseRef = useRef<1 | 2 | 3>(vitesse);
  // Overlay super efficace (Feature 4)
  const [overlayEfficacite, setOverlayEfficacite] = useState<{ texte: string; couleur: string } | null>(null);
  // Statuts en cours pour l'affichage pendant l'animation (Feature 5)
  const [statutsEnCours, setStatutsEnCours] = useState<Record<string, PokemonEquipe['statut']>>({});
  const journalRef = useRef<HTMLDivElement>(null);

  // Sync vitesse ref
  useEffect(() => {
    vitesseRef.current = vitesse;
  }, [vitesse]);

  const equipeJoueur = terrain.filter(Boolean) as PokemonEquipe[];
  const bossAlternatif = etage === 15 && classeDresseur ? BOSS_FINAUX[classeDresseur] : null;
  const champion = bossAlternatif ?? CHAMPIONS[etage];
  const estBoss = !!champion;

  useEffect(() => {
    if (cachePokemons.length > 0) setEquipeEnnemi(genererEquipeEnnemi(cachePokemons, etage, combatDifficile, classeDresseur));
  }, [cachePokemons, etage]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (journalRef.current) journalRef.current.scrollTop = journalRef.current.scrollHeight;
    // Déclenche animation au coup sur le dernier tour affiché
    if (tourAffiche > 0 && tours[tourAffiche - 1]) {
      const t = tours[tourAffiche - 1];

      // Mise à jour des statuts en cours
      if (t.statutApplique && t.instanceIdDefenseur) {
        setStatutsEnCours(prev => ({
          ...prev,
          [t.instanceIdDefenseur]: t.statutApplique as PokemonEquipe['statut'],
        }));
      }

      if (t.degats > 0) {
        setIdEnCoup(t.instanceIdDefenseur);
        setTimeout(() => setIdEnCoup(null), 350);

        // Dégâts flottants
        const couleur = t.multiplicateur >= 2 ? '#facc15'
          : t.multiplicateur === 0 ? '#6b7280'
          : t.multiplicateur < 1 ? '#94a3b8'
          : '#f87171';
        const dmgKey = Date.now() + Math.random();
        setFloatingDmg(prev => [...prev, { id: t.instanceIdDefenseur, valeur: t.degats, couleur, key: dmgKey }]);
        setTimeout(() => setFloatingDmg(prev => prev.filter(d => d.key !== dmgKey)), 900);

        // Overlay efficacité (Feature 4)
        if (t.multiplicateur >= 2) {
          setOverlayEfficacite({ texte: '⚡ SUPER EFFICACE !', couleur: '#facc15' });
          setTimeout(() => setOverlayEfficacite(null), 800);
        } else if (t.multiplicateur === 0) {
          setOverlayEfficacite({ texte: '🛡️ AUCUN EFFET', couleur: '#6b7280' });
          setTimeout(() => setOverlayEfficacite(null), 800);
        } else if (t.multiplicateur < 1 && t.multiplicateur > 0) {
          setOverlayEfficacite({ texte: '💤 PEU EFFICACE…', couleur: '#94a3b8' });
          setTimeout(() => setOverlayEfficacite(null), 800);
        }

        // Son différent selon capacité ou coup normal
        if (t.capacite) {
          // Trouve le type de l'attaquant pour le flash
          const attaquant = [...equipeJoueur, ...equipeEnnemi].find(p => p.nomFr === t.attaquant);
          if (attaquant) {
            const type = attaquant.types[0];
            Audio.capacite(type);
            setFlashCapacite({ id: attaquant.instanceId, type });
            setTimeout(() => setFlashCapacite(null), 700);
          }
        } else {
          Audio.coup();
        }
      }
      if (t.capacite && (t.capacite.description.includes('Soigne') || t.message.includes('💚'))) {
        const allIds = [...equipeJoueur, ...equipeEnnemi].map(p => p.instanceId);
        setIdsEnSoin(allIds);
        setTimeout(() => setIdsEnSoin([]), 500);
      }
    }
  }, [tourAffiche]); // eslint-disable-line react-hooks/exhaustive-deps

  const lancerAnimation = () => {
    if (!equipeEnnemi.length) return;
    const res = resoudreCombat(equipeJoueur, equipeEnnemi, meteoActuelle, reliques, estBoss, classeDresseur);
    setTours(res.tours);
    setEquipeFinalJoueur(res.equipeFinalJoueur);
    setVictoire(res.victoire);
    setPhase('combat');
    setTourAffiche(0);
    setStatutsEnCours({});
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setTourAffiche(i);
      if (i >= res.tours.length) {
        clearInterval(iv);
        setTimeout(() => {
          setPhase('resultat');
          if (res.victoire) { setAfficherVictoire(true); Audio.victoire(); }
          else Audio.defaite();
        }, 700);
      }
    }, Math.round(450 / vitesseRef.current));

    // Écoute les changements de vitesse en cours d'animation
    // en mettant à jour l'intervalle via une ref — l'interval lit vitesseRef.current à chaque tick
    void iv; // iv est géré par le closure ci-dessus
  };

  const terminer = () => {
    setAfficherVictoire(false);
    // Calcule les dégâts infligés par le joueur : PV perdus par les ennemis
    if (victoire) {
      const degatsInfliges = equipeEnnemi.reduce((total, ennemi) => {
        const pvInitiaux = ennemi.stats.pv;
        const pvFinaux = equipeFinalJoueur.length > 0
          ? (tours.reduce((pv, t) => {
              if (t.instanceIdDefenseur === ennemi.instanceId) return t.pvRestantsDefenseur;
              return pv;
            }, ennemi.pvActuels))
          : ennemi.pvActuels;
        return total + Math.max(0, pvInitiaux - pvFinaux);
      }, 0);
      enregistrerDegatsRun(degatsInfliges);
    }
    appliquerResultatCombat(victoire ? 0 : 10 + etage * 2, victoire);
  };

  const pvEnCours: Record<string, number> = {};
  [...equipeJoueur, ...equipeEnnemi].forEach(p => { pvEnCours[p.instanceId] = p.pvActuels; });
  tours.slice(0, tourAffiche).forEach(t => { pvEnCours[t.instanceIdDefenseur] = t.pvRestantsDefenseur; });

  const equipeJoueurEnCours = phase === 'resultat' ? equipeFinalJoueur : equipeJoueur;
  const joueurAvecPv = equipeJoueurEnCours.map(p => ({
    ...p,
    pvActuels: pvEnCours[p.instanceId] ?? p.pvActuels,
    statut: statutsEnCours[p.instanceId] ?? p.statut,
  }));
  const ennemiAvecPv = equipeEnnemi.map(p => ({
    ...p,
    pvActuels: pvEnCours[p.instanceId] ?? p.pvActuels,
    statut: statutsEnCours[p.instanceId] ?? p.statut,
  }));
  const toursVisibles = tours.slice(0, tourAffiche);
  const recompense = combatDifficile ? (5 + etage) * 2 : 5 + etage;

  return (
    <>
      {/* Overlay victoire */}
      {afficherVictoire && (
        <EcranVictoire etage={etage} recompense={recompense} onContinuer={terminer} />
      )}

      {/* Modal choix de relique */}
      {!afficherVictoire && reliquesProposees.length > 0 && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950/95 backdrop-blur gap-6 p-4">
          <h2 className="text-2xl font-black text-yellow-400">✨ Choisissez une Relique</h2>
          <p className="text-white/50 text-sm">Bonus permanent pour le reste du run</p>
          <div className="flex flex-col gap-3 w-full max-w-sm">
            {reliquesProposees.map(r => (
              <button
                key={r.id}
                onClick={() => { choisirRelique(r.id); Audio.achat(); }}
                className="rounded-2xl border border-yellow-600/40 bg-yellow-900/20 p-4 flex items-center gap-3 hover:bg-yellow-800/30 transition-all active:scale-95"
              >
                <span className="text-3xl">{r.icone}</span>
                <div className="text-left">
                  <p className="text-yellow-300 font-black">{r.nom}</p>
                  <p className="text-white/60 text-xs">{r.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
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
        @keyframes float-up {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          60%  { opacity: 1; transform: translateY(-28px) scale(1.15); }
          100% { opacity: 0; transform: translateY(-48px) scale(0.9); }
        }
        .float-dmg { animation: float-up 0.8s ease-out forwards; }
        @keyframes efficacite {
          0%   { opacity: 0; transform: scale(0.7); }
          20%  { opacity: 1; transform: scale(1.1); }
          80%  { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.9); }
        }
        .anim-efficacite { animation: efficacite 0.8s ease-out forwards; }
      `}</style>

      <div className="min-h-screen bg-gray-950 text-white flex flex-col max-w-lg mx-auto">
        <header className="px-4 pt-4 pb-2 border-b border-white/8">
          <h1 className="text-center text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
            ⚔️ COMBAT — ÉTAGE {etage}
            {combatDifficile && <span className="ml-2 text-red-400 text-sm">💀 DIFFICILE</span>}
          </h1>
        </header>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

          {/* Bandeau champion boss */}
          {champion && (
            <div className="rounded-2xl border border-yellow-600/50 bg-yellow-900/20 p-3 flex items-center gap-3">
              <span className="text-4xl">{champion.icone}</span>
              <div>
                <p className="text-yellow-400 font-black text-sm">COMBAT DE CHAMPION !</p>
                <p className="text-white font-bold">{champion.nom} — {champion.titre}</p>
                <p className="text-white/50 text-xs">{champion.description}</p>
              </div>
            </div>
          )}

          {/* Bannière météo */}
          {phase !== 'preparation' && meteoActuelle !== 'neutre' && (
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 flex items-center gap-2 text-sm">
              <span className="text-xl">{METEOS[meteoActuelle].icone}</span>
              <span className="text-white/70 font-bold">{METEOS[meteoActuelle].nom}</span>
              <span className="text-white/40 text-xs">{METEOS[meteoActuelle].description}</span>
            </div>
          )}

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
                    flashCapacite={
                      flashCapacite?.id === p.instanceId
                        ? HALO_COULEUR[flashCapacite.type] ?? '#ffffff'
                        : undefined
                    }
                    floatingDmg={floatingDmg}
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
                    flashCapacite={
                      flashCapacite?.id === p.instanceId
                        ? HALO_COULEUR[flashCapacite.type] ?? '#ffffff'
                        : undefined
                    }
                    floatingDmg={floatingDmg}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Overlay super efficace (Feature 4) */}
          {overlayEfficacite && (
            <div className="flex justify-center">
              <span className="anim-efficacite text-sm font-black px-3 py-1 rounded-full bg-black/60" style={{ color: overlayEfficacite.couleur }}>
                {overlayEfficacite.texte}
              </span>
            </div>
          )}

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

            {/* Indicateur combat + bouton vitesse (Feature 3) */}
            {phase === 'combat' && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-white/40 text-sm">
                  <span className="animate-pulse text-xl">⚔️</span>
                  <span>Combat en cours…</span>
                </div>
                <button
                  onClick={() => setVitesse(v => v === 1 ? 2 : v === 2 ? 3 : 1)}
                  className="px-3 py-1 rounded-lg bg-white/10 text-white/60 text-xs font-bold hover:bg-white/20 transition-all"
                >
                  ×{vitesse}
                </button>
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
