import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Composant racine de l’application.
 *
 * Responsabilités :
 * - Héberger le RouterOutlet pour afficher les pages.
 * - Servir de point d’entrée principal de l’application Angular.
 *
 * Remarque :
 * Utilise un signal Angular pour stocker le titre de l’application.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  /**
   * Titre de l’application.
   * Utilise un signal Angular pour une réactivité future.
   */
  protected readonly title = signal('quiz-app');
}
