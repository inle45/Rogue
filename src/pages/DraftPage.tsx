import { useState } from 'react';
import { useJeuStore } from '../store/jeuStore';
import { CartePokemon } from '../components/CartePokemon';
import { SlotEquipe } from '../components/SlotEquipe';
import { PanneauSynergies } from '../components/PanneauSynergies';
import { CarteEtages } from '../components/CarteEtages';
import { Audio } from '../services/audioService';
import type { PokemonEquipe } from '../types/pokemon';

type Onglet = 'boutique' | 'equipe' | 'combat';

const ETOILES: Record<1 | 2 | 3 | 4, string> = { 1: '★', 2: '★★', 3: '★★★', 4: '★★★★' };
const COULEUR_RARETE: Record<1 | 2 | 3 | 4, string> = {
  1: 'text-gray-400', 2: 'text-green-400', 3: 'text-blue-400', 4: 'text-yellow-400',
};

function compterTypeEquipe(equipe: (PokemonEquipe | null)[], type: string): number {
  return equipe.filter(p => p?.types.includes(type)).length;
}

export function DraftPage() {
  const [onglet, setOnglet] = useState<Onglet>('boutique');

  const {
    pokedollars, pvJoueur, pvJoueurMax, etage, meilleurEtage,
    terrain, banc, boutique, coutRefresh, carteEtages,
    boutiqueItems, itemEnAttente, reliques,
    acheterPokemon, refreshBoutique, lancerCombat, fuir,
    acheterItem, equiperItemSurPokemon,
  } = useJeuStore();

  const nbTerrain = terrain.filter(Boolean).length;
  const nbBanc = banc.filter(Boolean).length;
  const nbTotal = nbTerrain + nbBanc;
  const peutCombattre = nbTerrain > 0;
  const pctPv = (pvJoueur / pvJoueurMax) * 100;
  const couleurPv = pctPv > 50 ? 'bg-green-400' : pctPv > 25 ? 'bg-yellow-400' : 'bg-red-500';

  const handleAcheterPokemon = (p: Parameters<typeof acheterPokemon>[0]) => {
    acheterPokemon(p);
    Audio.achat();
  };

  const handleRefresh = () => {
    refreshBoutique();
    Audio.refresh();
  };

  const handleSlotClick = (instanceId: string) => {
    if (itemEnAttente) {
      equiperItemSurPokemon(instanceId);
      Audio.achat();
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* ── Header ── */}
      <header className="sticky top-0 z-20 bg-gray-950/98 backdrop-blur border-b border-white/8">
        <div className="flex items-center gap-3 max-w-lg mx-auto px-4 py-2.5">
          <div className="flex flex-col items-center min-w-[36px]">
            <span className="text-[9px] text-white/40 tracking-widest">ÉTAGE</span>
            <span className="text-xl font-black text-cyan-400 leading-none">{etage}</span>
            {meilleurEtage > 0 && <span className="text-[9px] text-yellow-600">🏆{meilleurEtage}</span>}
          </div>
          <div className="w-px h-8 bg-white/10" />
          <span className="text-yellow-400 font-black text-lg leading-none">₽{pokedollars}</span>
          <div className="flex-1 mx-1">
            <div className="flex justify-between text-[9px] text-white/40 mb-0.5">
              <span>PV</span><span>{pvJoueur}/{pvJoueurMax}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className={`${couleurPv} h-2 rounded-full transition-all duration-500`} style={{ width: `${pctPv}%` }} />
            </div>
          </div>
          <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-yellow-400 text-sm whitespace-nowrap">
            PokéDraft
          </span>
        </div>

        {/* Carte des étages sous le header */}
        <CarteEtages carte={carteEtages} etageActuel={etage} />

        {/* Reliques actives */}
        {reliques.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap px-4 py-1 border-t border-white/5">
            {reliques.map(r => (
              <span key={r.id} title={`${r.nom}: ${r.description}`} className="text-base cursor-help">{r.icone}</span>
            ))}
          </div>
        )}
      </header>

      {/* ── Bannière item en attente ── */}
      {itemEnAttente && (
        <div className="sticky top-0 z-10 bg-yellow-900/90 border-b border-yellow-600/50 px-4 py-2 flex items-center gap-2 max-w-lg mx-auto w-full">
          <img src={itemEnAttente.sprite} alt={itemEnAttente.nom} className="w-5 h-5" />
          <p className="text-yellow-200 text-xs font-bold flex-1">
            {itemEnAttente.nom} — Touchez un Pokémon pour l'équiper
          </p>
          <button
            className="text-yellow-400/60 text-xs hover:text-yellow-300"
            onClick={() => {
              useJeuStore.setState(s => ({
                pokedollars: s.pokedollars + (s.itemEnAttente?.prix ?? 0),
                boutiqueItems: s.itemEnAttente ? [...s.boutiqueItems, s.itemEnAttente] : s.boutiqueItems,
                itemEnAttente: null,
              }));
            }}
          >
            ✕ Annuler
          </button>
        </div>
      )}

      {/* ── Contenu ── */}
      <main className="flex-1 overflow-y-auto pb-24 max-w-lg mx-auto w-full">

        {/* ── BOUTIQUE ── */}
        {onglet === 'boutique' && (
          <div className="p-4 flex flex-col gap-5">

            {/* Pokémon */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-purple-300 tracking-widest">🏪 POKÉMON</h2>
                <button
                  onClick={handleRefresh}
                  disabled={pokedollars < coutRefresh}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all
                    bg-purple-900/50 border border-purple-700/50 hover:bg-purple-800/60
                    disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  🔄 Rafraîchir <span className="text-yellow-400">₽{coutRefresh}</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {boutique.map((p, i) => {
                  const touteEquipe = [...terrain, ...banc];
                  const comptesTypes = p.types.map(t => ({ type: t, count: compterTypeEquipe(touteEquipe, t) }));
                  return (
                    <div key={`${p.id}_${i}`} className="relative flex flex-col gap-1.5">
                      {/* Badge rareté */}
                      <div className={`absolute top-1.5 left-1.5 z-10 text-[10px] font-black ${COULEUR_RARETE[p.rarete]}`}>
                        {ETOILES[p.rarete]}
                      </div>

                      <CartePokemon pokemon={p} afficherStats />

                      {/* Indicateurs de types */}
                      <div className="flex gap-1 justify-center flex-wrap min-h-[18px]">
                        {comptesTypes.map(({ type, count }) => count > 0 && (
                          <span key={type} className="text-[10px] text-cyan-400 font-bold bg-cyan-950/50 border border-cyan-800/50 rounded-lg px-1.5 py-0.5">
                            {count}× {type}
                          </span>
                        ))}
                      </div>

                      {p.achete ? (
                        <div className="absolute inset-0 rounded-2xl bg-gray-950/75 flex items-center justify-center">
                          <span className="text-green-400 font-black text-sm">✓</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAcheterPokemon(p)}
                          disabled={pokedollars < p.prix || nbTotal >= 6}
                          className="w-full py-2 rounded-xl text-xs font-black tracking-wider transition-all
                            bg-gradient-to-r from-yellow-600 to-amber-500
                            hover:from-yellow-500 hover:to-amber-400
                            disabled:from-gray-700 disabled:to-gray-800 disabled:text-white/30
                            shadow-lg shadow-yellow-900/30"
                        >
                          ₽{p.prix} — ACHETER
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              {nbTotal >= 6 && (
                <p className="text-center text-orange-400 text-xs bg-orange-950/30 border border-orange-800/30 rounded-xl py-2 mt-2">
                  Équipe pleine — libérez une place
                </p>
              )}
            </div>

            {/* Objets */}
            <div>
              <h2 className="text-sm font-bold text-teal-300 tracking-widest mb-3">🎒 OBJETS</h2>
              <div className="grid grid-cols-3 gap-3">
                {boutiqueItems.map(item => (
                  <div key={item.instanceId} className="flex flex-col gap-1.5">
                    <div className="rounded-2xl border border-white/10 bg-gray-900 p-3 flex flex-col items-center gap-2">
                      <img src={item.sprite} alt={item.nom} className="w-10 h-10 object-contain" />
                      <p className="text-xs font-bold text-white text-center leading-tight">{item.nom}</p>
                      <p className="text-[10px] text-white/40 text-center leading-tight">{item.description}</p>
                    </div>
                    <button
                      onClick={() => { acheterItem(item); setOnglet('equipe'); Audio.achat(); }}
                      disabled={pokedollars < item.prix}
                      className="w-full py-2 rounded-xl text-xs font-black tracking-wider transition-all
                        bg-gradient-to-r from-teal-700 to-cyan-600
                        hover:from-teal-600 hover:to-cyan-500
                        disabled:from-gray-700 disabled:to-gray-800 disabled:text-white/30"
                    >
                      ₽{item.prix} — ÉQUIPER
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ÉQUIPE ── */}
        {onglet === 'equipe' && (
          <div className="p-4 flex flex-col gap-4">
            <PanneauSynergies />

            {itemEnAttente && (
              <div className="rounded-xl border border-yellow-600/40 bg-yellow-900/20 p-3 flex items-center gap-2">
                <img src={itemEnAttente.sprite} alt={itemEnAttente.nom} className="w-6 h-6" />
                <p className="text-yellow-300 text-xs font-bold">Touchez un Pokémon pour équiper <span className="text-yellow-200">{itemEnAttente.nom}</span></p>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-green-400 tracking-widest">⚔️ TERRAIN</span>
                <span className="text-xs text-white/30">{nbTerrain}/3</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {terrain.map((p, i) => (
                  <div key={i} onClick={() => p && handleSlotClick(p.instanceId)}>
                    <SlotEquipe pokemon={p} index={i} type="terrain" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-blue-400 tracking-widest">🪑 BANC</span>
                <span className="text-xs text-white/30">{nbBanc}/3</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {banc.map((p, i) => (
                  <div key={i} onClick={() => p && handleSlotClick(p.instanceId)}>
                    <SlotEquipe pokemon={p} index={i} type="banc" />
                  </div>
                ))}
              </div>
            </div>

            <p className="text-center text-white/25 text-xs">Glissez pour réorganiser · Touchez pour équiper un objet</p>
          </div>
        )}

        {/* ── COMBAT ── */}
        {onglet === 'combat' && (
          <div className="p-4 flex flex-col items-center gap-6 pt-8">
            <div className="text-center">
              <p className="text-5xl mb-3">⚔️</p>
              <h2 className="text-2xl font-black text-white">Prêt au combat ?</h2>
              <p className="text-white/40 text-sm mt-1">Étage {etage} — {nbTerrain} Pokémon sur le terrain</p>
            </div>

            {nbTerrain > 0 ? (
              <div className="grid grid-cols-3 gap-2 w-full">
                {terrain.filter(Boolean).map(p => p && (
                  <CartePokemon key={p.instanceId} pokemon={p} compact afficherStats={false} />
                ))}
              </div>
            ) : (
              <p className="text-white/30 text-sm text-center">Aucun Pokémon sur le terrain.</p>
            )}

            <button
              onClick={() => { if (peutCombattre) { lancerCombat(); Audio.clic(); } }}
              disabled={!peutCombattre}
              className={`w-full py-5 rounded-2xl font-black text-xl tracking-widest transition-all shadow-xl
                ${peutCombattre
                  ? 'bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 shadow-red-900/40 active:scale-95'
                  : 'bg-gray-800 text-white/30 cursor-not-allowed'}`}
            >
              ⚔️ COMBATTRE
            </button>

            <button
              onClick={() => { fuir(); Audio.defaite(); }}
              className="w-full py-3 rounded-2xl font-bold text-sm tracking-wider transition-all
                border border-orange-800/40 bg-orange-950/20 text-orange-400
                hover:bg-orange-900/30 active:scale-95"
            >
              🏃 FUIR (−20 PV, passer l'étage)
            </button>
          </div>
        )}
      </main>

      {/* ── Navigation ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-gray-950/95 backdrop-blur border-t border-white/8">
        <div className="flex max-w-lg mx-auto">
          {([
            { id: 'boutique', icon: '🏪', label: 'Boutique' },
            { id: 'equipe',   icon: '🎮', label: `Équipe${nbTotal > 0 ? ` (${nbTotal})` : ''}` },
            { id: 'combat',   icon: '⚔️', label: 'Combat' },
          ] as { id: Onglet; icon: string; label: string }[]).map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => { setOnglet(id); Audio.clic(); }}
              className={`flex-1 flex flex-col items-center gap-0.5 py-3 transition-all text-xs font-bold
                ${onglet === id ? 'text-cyan-400 border-t-2 border-cyan-400 -mt-px' : 'text-white/30 hover:text-white/60'}`}
            >
              <span className="text-lg leading-none">{icon}</span>
              <span className="tracking-wide">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
