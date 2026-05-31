import { useState } from 'react';
import { useJeuStore } from '../store/jeuStore';
import { CartePokemon } from '../components/CartePokemon';
import { SlotEquipe } from '../components/SlotEquipe';
import { PanneauSynergies } from '../components/PanneauSynergies';

type Onglet = 'boutique' | 'equipe' | 'combat';

export function DraftPage() {
  const [onglet, setOnglet] = useState<Onglet>('boutique');
  const {
    pokedollars, pvJoueur, pvJoueurMax, etage,
    terrain, banc, boutique, coutRefresh,
    acheterPokemon, refreshBoutique, lancerCombat,
  } = useJeuStore();

  const nbTerrain = terrain.filter(Boolean).length;
  const nbBanc = banc.filter(Boolean).length;
  const nbTotal = nbTerrain + nbBanc;
  const peutCombattre = nbTerrain > 0;
  const pctPv = (pvJoueur / pvJoueurMax) * 100;
  const couleurPv = pctPv > 50 ? 'bg-green-400' : pctPv > 25 ? 'bg-yellow-400' : 'bg-red-500';

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* ── Header ── */}
      <header className="sticky top-0 z-20 bg-gray-950/95 backdrop-blur border-b border-white/8 px-4 py-2.5">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          {/* Étage */}
          <div className="flex flex-col items-center min-w-[36px]">
            <span className="text-[9px] text-white/40 tracking-widest">ÉTAGE</span>
            <span className="text-xl font-black text-cyan-400 leading-none">{etage}</span>
          </div>

          <div className="w-px h-8 bg-white/10" />

          {/* Pokédollars */}
          <div className="flex items-center gap-1">
            <span className="text-yellow-400 font-black text-lg leading-none">₽{pokedollars}</span>
          </div>

          {/* Barre PV — pousse vers la droite */}
          <div className="flex-1 mx-1">
            <div className="flex justify-between text-[9px] text-white/40 mb-0.5">
              <span>PV</span>
              <span>{pvJoueur}/{pvJoueurMax}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className={`${couleurPv} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${pctPv}%` }}
              />
            </div>
          </div>

          {/* Logo */}
          <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-yellow-400 text-sm whitespace-nowrap">
            PokéDraft
          </span>
        </div>
      </header>

      {/* ── Contenu par onglet ── */}
      <main className="flex-1 overflow-y-auto pb-24 max-w-lg mx-auto w-full">

        {/* ── ONGLET BOUTIQUE ── */}
        {onglet === 'boutique' && (
          <div className="p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-purple-300 tracking-widest">🏪 BOUTIQUE</h2>
              <button
                onClick={refreshBoutique}
                disabled={pokedollars < coutRefresh}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all
                  bg-purple-900/50 border border-purple-700/50 hover:bg-purple-800/60
                  disabled:opacity-30 disabled:cursor-not-allowed"
              >
                🔄 Rafraîchir
                <span className="text-yellow-400">₽{coutRefresh}</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {boutique.map((p, i) => (
                <div key={`${p.id}_${i}`} className="relative flex flex-col gap-1.5">
                  <CartePokemon pokemon={p} afficherStats />
                  {p.achete ? (
                    <div className="absolute inset-0 rounded-2xl bg-gray-950/75 flex items-center justify-center">
                      <span className="text-green-400 font-black text-sm">✓</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => acheterPokemon(p)}
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
              ))}
            </div>

            {nbTotal >= 6 && (
              <p className="text-center text-orange-400 text-xs bg-orange-950/30 border border-orange-800/30 rounded-xl py-2">
                Équipe pleine — libérez une place
              </p>
            )}
          </div>
        )}

        {/* ── ONGLET ÉQUIPE ── */}
        {onglet === 'equipe' && (
          <div className="p-4 flex flex-col gap-4">
            <PanneauSynergies />

            {/* Terrain */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-green-400 tracking-widest">⚔️ TERRAIN</span>
                <span className="text-xs text-white/30">{nbTerrain}/3</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {terrain.map((p, i) => <SlotEquipe key={i} pokemon={p} index={i} type="terrain" />)}
              </div>
            </div>

            {/* Banc */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-blue-400 tracking-widest">🪑 BANC</span>
                <span className="text-xs text-white/30">{nbBanc}/3</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {banc.map((p, i) => <SlotEquipe key={i} pokemon={p} index={i} type="banc" />)}
              </div>
            </div>

            <p className="text-center text-white/25 text-xs">Glissez les cartes pour réorganiser</p>
          </div>
        )}

        {/* ── ONGLET COMBAT ── */}
        {onglet === 'combat' && (
          <div className="p-4 flex flex-col items-center gap-6 pt-12">
            <div className="text-center">
              <p className="text-5xl mb-3">⚔️</p>
              <h2 className="text-2xl font-black text-white">Prêt au combat ?</h2>
              <p className="text-white/40 text-sm mt-1">Étage {etage} — Équipe : {nbTerrain} sur le terrain</p>
            </div>

            {/* Aperçu équipe terrain */}
            {nbTerrain > 0 ? (
              <div className="grid grid-cols-3 gap-2 w-full">
                {terrain.filter(Boolean).map(p => p && (
                  <CartePokemon key={p.instanceId} pokemon={p} compact afficherStats={false} />
                ))}
              </div>
            ) : (
              <div className="text-white/30 text-sm text-center">
                Aucun Pokémon sur le terrain.<br/>Allez dans l'onglet Équipe.
              </div>
            )}

            <button
              onClick={() => peutCombattre && lancerCombat()}
              disabled={!peutCombattre}
              className={`w-full py-5 rounded-2xl font-black text-xl tracking-widest transition-all
                shadow-xl
                ${peutCombattre
                  ? 'bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 shadow-red-900/40 active:scale-95'
                  : 'bg-gray-800 text-white/30 cursor-not-allowed'}`}
            >
              ⚔️ COMBATTRE
            </button>
          </div>
        )}
      </main>

      {/* ── Barre de navigation fixe en bas ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-gray-950/95 backdrop-blur border-t border-white/8">
        <div className="flex max-w-lg mx-auto">
          {([
            { id: 'boutique', icon: '🏪', label: 'Boutique' },
            { id: 'equipe',   icon: '🎮', label: `Équipe ${nbTotal > 0 ? `(${nbTotal})` : ''}` },
            { id: 'combat',   icon: '⚔️', label: 'Combat' },
          ] as { id: Onglet; icon: string; label: string }[]).map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => setOnglet(id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-3 transition-all text-xs font-bold
                ${onglet === id
                  ? 'text-cyan-400 border-t-2 border-cyan-400 -mt-px'
                  : 'text-white/30 hover:text-white/60'}`}
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
