const CLE_SCORES = 'pokedraft_scores_v1';

export interface EntreeScore {
  score: number;
  etage: number;
  classe: string;
  date: string;
  combatsGagnes: number;
}

export function calculerScore(
  etage: number, pvJoueur: number, pvMax: number,
  degatsInfliges: number, combatsGagnes: number,
  classe: string | null,
): number {
  const multiClasse = classe === 'tacticien' ? 1.5 : classe === 'riche' ? 1.2 : 1.0;
  return Math.floor(
    (etage * 100 + (pvJoueur / pvMax) * 500 + combatsGagnes * 50 + Math.floor(degatsInfliges / 10)) * multiClasse
  );
}

export function sauvegarderScore(entree: EntreeScore): EntreeScore[] {
  const scores = chargerScores();
  scores.push(entree);
  scores.sort((a, b) => b.score - a.score);
  const top5 = scores.slice(0, 5);
  localStorage.setItem(CLE_SCORES, JSON.stringify(top5));
  return top5;
}

export function chargerScores(): EntreeScore[] {
  try { return JSON.parse(localStorage.getItem(CLE_SCORES) ?? '[]'); } catch { return []; }
}
