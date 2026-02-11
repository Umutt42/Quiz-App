import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Question } from '../models/quiz.models';

import questionsPP from '@questions.json';
import questionsNP from '@questionsNP.json';
import questionsP2 from '@questionsP2.json';
import questionsP3 from '@questionsP3.json';

/**
 * Représente les différentes banques de questions disponibles.
 *
 * - 'pp' : P1 (Assistant usage professionnel)
 * - 'np' : Non professionnel
 * - 'p2' : Usage professionnel
 * - 'p3' : Distribution / Conseil usage professionnel
 */
export type QuestionBank = 'pp' | 'np' | 'p2' | 'p3';

/**
 * Service QuizService
 *
 * Responsabilité :
 * Fournir les questions correspondant à une banque donnée.
 *
 * Fonctionnement :
 * - Les questions sont stockées dans des fichiers JSON statiques.
 * - Le service sélectionne la bonne source selon la banque demandée.
 * - Retourne les données sous forme d’Observable pour garder
 *   une cohérence avec une future API backend.
 *
 * Remarque :
 * L’utilisation d’Observable permet de remplacer facilement
 * l’implémentation actuelle par un appel HTTP sans modifier
 * le composant Quiz.
 */
@Injectable({ providedIn: 'root' })
export class QuizService {

  /**
   * Charge les questions correspondant à une banque spécifique.
   *
   * @param bank Banque de questions souhaitée
   * @returns Observable contenant la liste des questions
   */
  loadQuestions(bank: QuestionBank = 'pp'): Observable<Question[]> {

    const data =
      bank === 'np'
        ? questionsNP
        : bank === 'p2'
        ? questionsP2
        : bank === 'p3'
        ? questionsP3
        : questionsPP;

    return of(data as Question[]);
  }
}
