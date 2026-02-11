import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

/**
 * Configuration globale de l’application Angular.
 *
 * Responsabilités :
 * - Initialisation du routeur avec les routes définies.
 * - Activation du HttpClient pour les requêtes HTTP.
 * - Enregistrement des gestionnaires d’erreurs globaux du navigateur.
 *
 * Remarque :
 * Ce fichier est utilisé dans le bootstrap de l’application
 * dans un contexte Angular standalone (sans AppModule).
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
  ]
};
