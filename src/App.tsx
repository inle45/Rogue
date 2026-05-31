// Point d'entrée principal — routage entre les phases du jeu

import { useJeuStore } from './store/jeuStore';
import { ChargementPage } from './pages/ChargementPage';
import { DraftPage } from './pages/DraftPage';
import { CombatPage } from './pages/CombatPage';
import { GameOverPage } from './pages/GameOverPage';

export default function App() {
  const phase = useJeuStore(s => s.phase);
  const etage = useJeuStore(s => s.etage);

  const recommencer = () => {
    localStorage.removeItem('pokedraft_cache_v1');
    window.location.reload();
  };

  switch (phase) {
    case 'chargement': return <ChargementPage />;
    case 'draft':      return <DraftPage />;
    case 'combat':     return <CombatPage />;
    case 'defaite':    return <GameOverPage etage={etage} onRecommencer={recommencer} />;
    default:           return <ChargementPage />;
  }
}
