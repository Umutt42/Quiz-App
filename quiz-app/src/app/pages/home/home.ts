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
        'Pour tout professionnel désirant acquérir une phytolicence NP "Distribution/Conseil de produits à usage non professionnel".',
      bank: 'np',
    },
    {
      title: 'Phytolicence P1',
      description:
        'Pour tout professionnel désirant acquérir une phytolicence P1 "Assistant usage professionnel".',
      bank: 'pp',
    },
    {
      title: 'Phytolicence P2',
      description:
        'Pour tout professionnel désirant acquérir une phytolicence P2 "Usage professionnel". Les candidats ont la possibilité de personnaliser leur évaluation en choisissant un secteur spécifique lors de l inscription : 1) Secteur agricole; 2) Secteur parcs et jardins / horticole.',
      bank: 'p2',
    },
    {
      title: 'Phytolicence P3',
      description:
        'L obtention de la phytolicence P3 Distribution/Conseil de produits à usage professionnel se déroule en deux étapes : une évaluation écrite suivie d une évaluation orale.',
      bank: 'p3',
    },
  ];
}
