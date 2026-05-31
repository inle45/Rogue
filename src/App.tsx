// Point d'entrée principal — routage entre les phases du jeu

import { useJeuStore } from './store/jeuStore';
import { ChargementPage } from './pages/ChargementPage';
import { DraftPage } from './pages/DraftPage';
import { CombatPage } from './pages/CombatPage';
import { GameOverPage } from './pages/GameOverPage';
import { EcranChoixClasse } from './pages/EcranChoixClasse';
import { EcranVictorieFinal } from './pages/EcranVictorieFinal';
import { TransitionPage } from './pages/TransitionPage';

export default function App() {
  const phase = useJeuStore(s => s.phase);
  const etage = useJeuStore(s => s.etage);

  const recommencer = () => {
    localStorage.removeItem('pokedraft_cache_v5');
    window.location.reload();
  };

  switch (phase) {
    case 'chargement':      return <ChargementPage />;
    case 'choix_classe':    return <EcranChoixClasse />;
    case 'draft':           return <DraftPage />;
    case 'combat':          return <CombatPage />;
    case 'transition':      return <TransitionPage />;
    case 'defaite':         return <GameOverPage etage={etage} onRecommencer={recommencer} />;
    case 'victoire_finale': return <EcranVictorieFinal />;
    default:                return <ChargementPage />;
  }
}
