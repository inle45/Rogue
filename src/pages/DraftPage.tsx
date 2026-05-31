// Écran principal de draft — boutique + gestion de l'équipe par drag-and-drop

import { useJeuStore } from '../store/jeuStore';
import { CartePokemon } from '../components/CartePokemon';
import { SlotEquipe } from '../components/SlotEquipe';
import { PanneauSynergies } from '../components/PanneauSynergies';

export function DraftPage() {
  const {
    pokedollars, pvJoueur, pvJoueurMax, etage,
    terrain, banc, boutique, coutRefresh,
    acheterPokemon, refreshBoutique, lancerCombat,
  } = useJeuStore();

  const nbPokemonsEquipe = terrain.filter(Boolean).length + banc.filter(Boolean).length;
  const peutCombattre = terrain.filter(Boolean).length > 0;
  const pourcentagePvJoueur = (pvJoueur / pvJoueurMax) * 100;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 flex flex-col gap-6 max-w-6xl mx-auto">
      {/* En-tête */}
      <div className="flex items-center justify-between bg-gray-900 rounded-xl p-4 border border-gray-700">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-gray-400 text-xs">ÉTAGE</p>
            <p className="text-3xl font-black text-cyan-400">{etage}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">POKÉDOLLARS</p>
            <p className="text-2xl font-bold text-yellow-400">₽{pokedollars}</p>
          </div>
        </div>

        <div className="flex-1 mx-8">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>PV DU JOUEUR</span>
            <span>{pvJoueur}/{pvJoueurMax}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${pourcentagePvJoueur > 50 ? 'bg-green-500' : pourcentagePvJoueur > 25 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${pourcentagePvJoueur}%` }}
            />
          </div>
        </div>

        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-yellow-400">
          PokéDraft
        </h1>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Terrain + Banc + Boutique */}
        <div className="col-span-2 flex flex-col gap-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
            <h2 className="text-sm font-bold text-green-400 mb-3 tracking-widest">
              ⚔️ TERRAIN ({terrain.filter(Boolean).length}/3)
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {terrain.map((p, i) => <SlotEquipe key={i} pokemon={p} index={i} type="terrain" />)}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
            <h2 className="text-sm font-bold text-blue-400 mb-3 tracking-widest">
              🪑 BANC ({banc.filter(Boolean).length}/3)
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {banc.map((p, i) => <SlotEquipe key={i} pokemon={p} index={i} type="banc" />)}
            </div>
          </div>

          {/* Boutique */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-purple-400 tracking-widest">🏪 BOUTIQUE</h2>
              <button
                onClick={refreshBoutique}
                disabled={pokedollars < coutRefresh}
                className="px-3 py-1.5 bg-purple-800 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-xs font-bold transition-colors"
              >
                Rafraîchir ₽{coutRefresh}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {boutique.map((p, i) => (
                <div key={`${p.id}_${i}`} className="relative">
                  <CartePokemon pokemon={p} afficherStats />
                  {p.achete ? (
                    <div className="absolute inset-0 bg-gray-900/80 rounded-xl flex items-center justify-center">
                      <span className="text-green-400 font-bold text-lg">✓ Acheté</span>
                    </div>
                  ) : (
                    <div className="mt-1 text-center">
                      <button
                        onClick={() => acheterPokemon(p)}
                        disabled={pokedollars < p.prix || nbPokemonsEquipe >= 6}
                        className="w-full py-1.5 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-xs font-bold transition-colors"
                      >
                        Acheter ₽{p.prix}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Synergies + Actions */}
        <div className="flex flex-col gap-4">
          <PanneauSynergies />

          <button
            onClick={lancerCombat}
            disabled={!peutCombattre}
            className="w-full py-4 bg-gradient-to-r from-red-700 to-orange-600 hover:from-red-600 hover:to-orange-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 rounded-xl font-black text-lg tracking-widest transition-all transform hover:scale-105 disabled:scale-100 shadow-lg"
          >
            ⚔️ COMBATTRE
            {!peutCombattre && <p className="text-xs font-normal mt-1">Placez au moins 1 Pokémon</p>}
          </button>

          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 text-sm">
            <p className="text-gray-400 text-xs font-bold mb-2">ÉQUIPE</p>
            <p className="text-white">{nbPokemonsEquipe}/6 Pokémon</p>
            <p className="text-gray-500 text-xs mt-1">Glissez les cartes pour réorganiser</p>
          </div>
        </div>
      </div>
    </div>
  );
}
