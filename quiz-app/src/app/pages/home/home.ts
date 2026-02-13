import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Représente les différentes banques de questions disponibles
 * pour les phytolicences.
 *
 * - 'np' : Non professionnel
 * - 'pp' : P1 (Assistant usage professionnel)
 * - 'p2' : Usage professionnel
 * - 'p3' : Distribution / Conseil usage professionnel
 */
type Bank = 'np' | 'pp' | 'p2' | 'p3';

/**
 * Modèle représentant une carte affichée sur la page d’accueil.
 */
interface LicenceCard {

  /**
   * Titre affiché sur la carte.
   */
  title: string;

  /**
   * Description explicative de la licence.
   */
  description: string;

  /**
   * Banque de questions associée à cette licence.
   * Utilisée pour rediriger vers le bon quiz.
   */
  bank: Bank;
}

/**
 * Composant Home
 *
 * Description :
 * Page d’accueil du module Quiz Phytolicence.
 * Elle affiche les différentes catégories de phytolicences
 * sous forme de cartes interactives.
 *
 * Fonctionnement :
 * - Chaque carte est générée dynamiquement via *ngFor.
 * - Les liens utilisent RouterLink avec queryParams.
 * - Le paramètre "bank" permet de charger la bonne banque de questions.
 *
 * Responsabilité :
 * Sélectionner une catégorie de phytolicence et démarrer un quiz adapté.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {

  /**
   * Liste des phytolicences affichées sur la page d’accueil.
   */
  licences: LicenceCard[] = [
    {
      title: 'Phytolicence NP',
      description:
        'Pour tout professionnel désirant acquérir une phytolicence NP <strong>"Distribution/Conseil de produits à usage non professionnel".</strong>',
      bank: 'np',
    },
    {
      title: 'Phytolicence P1',
      description: `Pour tout professionnel désirant acquérir une phytolicence P1 <strong>"Assistant usage professionnel"</strong>.`,
      bank: 'pp',
    },
    {
      title: 'Phytolicence P2',
      description: `
    Pour tout professionnel désirant acquérir une phytolicence P2 <strong>"Usage professionnel"</strong>.
    Les candidats ont la possibilité de personnaliser leur évaluation en choisissant un secteur spécifique lors de l'inscription :
    <ul>
      <li>Secteur agricole ;</li>
      <li>Secteur parcs et jardins / horticole.</li>
    </ul>`,
    bank: 'p2',
    },
    {
      title: 'Phytolicence P3',
      description: `
        L'obtention de la phytolicence P3 
        <strong>"Distribution/Conseil de produits à usage professionnel"</strong> 
        se déroule en deux étapes : une évaluation écrite suivie d'une évaluation orale.
    
        <p>
          Les exemples de <strong>questions orales</strong> sont disponibles ci-dessous :
        </p>
    
        <p>
          <a 
            href="assets/pdf/questions-evalutation-p3-valide.pdf" 
            target="_blank" 
            rel="noopener"
            class="ref-link"
          >
            Télécharger les exemples de questions orales (PDF)
          </a>
        </p>
    
        <p>
          Les questions portent sur l'ensemble de la matière reprise dans l'annexe 1 de 
          <a 
            href="assets/pdf/phytol_formation_initiale_programme.pdf" 
            target="_blank" 
            rel="noopener"
            class="ref-link"
          >
            l'Arrêté ministériel du 10/06/2016
          </a>.
        </p>
      `,
      bank: 'p3',
    }
    
    
  ];
}
