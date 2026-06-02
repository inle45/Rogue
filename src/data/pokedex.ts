const CLE_POKEDEX = 'pokedraft_pokedex';

export function chargerPokedex(): Set<number> {
  try { return new Set(JSON.parse(localStorage.getItem(CLE_POKEDEX) ?? '[]')); } catch { return new Set(); }
}

export function enregistrerPokemonVu(id: number): void {
  const dex = chargerPokedex();
  dex.add(id);
  localStorage.setItem(CLE_POKEDEX, JSON.stringify([...dex]));
}

export function getNbVus(): number {
  return chargerPokedex().size;
}
