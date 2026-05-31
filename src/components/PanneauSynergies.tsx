// Panneau d'affichage des synergies actives sur le terrain

import { useJeuStore } from '../store/jeuStore';
import { CarteType } from './CarteType';

export function PanneauSynergies() {
  const synergies = useJeuStore(s => s.synergiesActives);

  if (synergies.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
        <h3 className="text-gray-400 text-sm font-bold mb-2">SYNERGIES</h3>
        <p className="text-gray-600 text-xs">Aucune synergie active</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
      <h3 className="text-cyan-400 text-sm font-bold mb-3">SYNERGIES ACTIVES</h3>
      <div className="flex flex-col gap-2">
        {synergies.map(s => (
          <div key={s.type} className="flex items-start gap-2 bg-gray-800 rounded-lg p-2">
            <CarteType type={s.type} petit />
            <p className="text-xs text-gray-300">{s.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
