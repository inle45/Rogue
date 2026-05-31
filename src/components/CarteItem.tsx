// Carte d'affichage d'un item équipable
import type { ItemJeu } from '../data/items';

interface Props {
  item: ItemJeu;
  /** Affiche un bouton d'action (texte + handler) */
  action?: { label: string; onClick: () => void; desactive?: boolean };
}

export function CarteItem({ item, action }: Props) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/4 p-2 text-center">
      {/* Icône sprite officielle */}
      <img
        src={item.sprite}
        alt={item.nom}
        width={32}
        height={32}
        className="object-contain pixelated"
        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
      />
      <p className="text-[11px] font-bold text-white leading-tight">{item.nom}</p>
      <p className="text-[9px] text-white/45 leading-snug">{item.description}</p>
      <p className="text-[10px] text-yellow-400 font-black">₽{item.prix}</p>
      {action && (
        <button
          onClick={action.onClick}
          disabled={action.desactive}
          className="w-full mt-0.5 py-1 rounded-lg text-[10px] font-black tracking-wider transition-all
            bg-gradient-to-r from-indigo-700 to-violet-700
            hover:from-indigo-600 hover:to-violet-600
            disabled:from-gray-700 disabled:to-gray-800 disabled:text-white/30 disabled:cursor-not-allowed"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
