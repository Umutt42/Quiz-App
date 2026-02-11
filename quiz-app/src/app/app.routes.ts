import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Quiz } from './pages/quiz/quiz';

/**
 * Définition des routes principales de l’application.
 *
 * Routes disponibles :
 * - ''       : Page d’accueil (sélection de la phytolicence)
 * - 'quiz'   : Page de quiz (chargement dynamique via queryParams)
 *
 * Route fallback :
 * - '**'     : Redirection vers l’accueil si l’URL est inconnue.
 *
 * Remarque :
 * La page Quiz utilise des queryParams (bank, mode)
 * pour déterminer la banque de questions et le type de session.
 */
export const routes: Routes = [
  { path: '', component: Home },
  { path: 'quiz', component: Quiz },
  { path: '**', redirectTo: '' },
];
