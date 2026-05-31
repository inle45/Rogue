import { useJeuStore } from '../store/jeuStore';
import { CarteType } from './CarteType';

export function PanneauSynergies() {
  const synergies = useJeuStore(s => s.synergiesActives);

  if (synergies.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 p-3">
        <p className="text-white/30 text-xs font-bold tracking-widest">SYNERGIES</p>
        <p className="text-white/20 text-xs mt-1">Aucune synergie active</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-3">
      <p className="text-cyan-400 text-xs font-bold tracking-widest mb-2">⚡ SYNERGIES ACTIVES</p>
      <div className="flex flex-col gap-1.5">
        {synergies.map(s => (
          <div key={s.type} className="flex items-start gap-2 bg-white/5 rounded-xl px-2 py-1.5">
            <CarteType type={s.type} petit />
            <p className="text-[11px] text-white/70 leading-tight">{s.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
