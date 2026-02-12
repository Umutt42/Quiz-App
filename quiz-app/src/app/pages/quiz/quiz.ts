import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  HostListener,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { QuizService } from '../../services/quiz.service';
import { ChoiceKey, Question } from '../../models/quiz.models';

/**
 * Représente le résultat d’une réponse donnée par l’utilisateur
 * pour une question spécifique.
 */
interface AnswerReview {
  question: Question;
  selected: ChoiceKey | null;
  isCorrect: boolean;
}

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './quiz.html',
  styleUrl: './quiz.scss',
})
export class Quiz implements OnInit {

  /** Indique si le quiz est en cours de chargement */
  loading = true;

  /** Message d’erreur éventuel */
  error: string | null = null;

  /** Mode du quiz : 'random' (30 questions) ou 'all' */
  private mode: 'random' | 'all' = 'random';

  /** Banque de questions sélectionnée */
  private bank: 'pp' | 'np' | 'p2' | 'p3' = 'pp';

  /** Ensemble complet des questions chargées */
  private allQuestions: Question[] = [];

  /** Questions réellement utilisées pour la session */
  questions: Question[] = [];

  /** Index de la question actuelle */
  index = 0;

  /** Score actuel */
  score = 0;

  /** Réponse sélectionnée */
  selected: ChoiceKey | null = null;

  /** Indique si la correction est affichée */
  showCorrection = false;

  /** Indique si la réponse est correcte */
  isCorrect: boolean | null = null;

  /** Historique des réponses */
  reviews: AnswerReview[] = [];

  /** ---------------- IMAGE MODAL ---------------- */

  /** Indique si l'image est affichée en grand */
  isImageOpen = false;

  /**
   * Ouvre l’image en grand
   */
  openImage(): void {
    this.isImageOpen = true;
    document.body.style.overflow = 'hidden'; // bloque scroll arrière-plan
  }

  /**
   * Ferme l’image
   */
  closeImage(): void {
    this.isImageOpen = false;
    document.body.style.overflow = 'auto';
  }

  /**
   * Ferme la modal si on appuie sur ESC
   */
  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.isImageOpen) {
      this.closeImage();
    }
  }

  /** -------------------------------------------- */

  constructor(
    private readonly quizService: QuizService,
    private readonly route: ActivatedRoute,
  ) {}

  get current(): Question | null {
    return this.questions[this.index] ?? null;
  }

  get wrongAnswers(): AnswerReview[] {
    return this.reviews.filter((r) => !r.isCorrect);
  }

  get passed(): boolean {
    if (this.mode !== 'random' || !this.questions.length) return false;
    const threshold = 21;
    return this.score >= threshold;
  }

  formatAnswer(question: Question, key: ChoiceKey | null): string {
    if (!key) return '';

    const choice = question.choices.find((c) => c.key === key);
    if (!choice) return key.toUpperCase();

    return `${key.toUpperCase()} – ${choice.text}`;
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.mode = params.get('mode') === 'all' ? 'all' : 'random';

      const bankParam = params.get('bank');
      this.bank =
        bankParam === 'np'
          ? 'np'
          : bankParam === 'p2'
          ? 'p2'
          : bankParam === 'p3'
          ? 'p3'
          : 'pp';

      this.load();
    });
  }

  select(key: ChoiceKey): void {
    if (!this.current || this.showCorrection) return;

    this.selected = key;
    this.isCorrect = key === this.current.answer;

    if (this.isCorrect) this.score += 1;

    this.reviews.push({
      question: this.current,
      selected: key,
      isCorrect: this.isCorrect ?? false,
    });

    this.showCorrection = true;
  }

  next(): void {
    if (!this.current) return;

    this.index += 1;
    this.selected = null;
    this.showCorrection = false;
    this.isCorrect = null;
  }

  restart(): void {
    if (this.allQuestions.length) {
      this.resetQuiz();
      this.error = null;
      this.loading = false;
      return;
    }

    this.load();
  }

  private load(): void {
    this.loading = true;
    this.error = null;
    this.questions = [];
    this.allQuestions = [];
    this.index = 0;
    this.score = 0;
    this.selected = null;
    this.showCorrection = false;
    this.isCorrect = null;
    this.reviews = [];
    this.isImageOpen = false;

    this.quizService.loadQuestions(this.bank).subscribe({
      next: (qs) => {
        this.allQuestions = qs ?? [];
        this.resetQuiz();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Impossible de charger les questions.';
      },
    });
  }

  private resetQuiz(): void {
    if (!this.allQuestions.length) return;

    if (this.mode === 'all') {
      this.questions = [...this.allQuestions];
    } else {
      const pool = [...this.allQuestions];

      for (let i = pool.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }

      const count = Math.min(30, pool.length);
      this.questions = pool.slice(0, count);
    }

    this.index = 0;
    this.score = 0;
    this.selected = null;
    this.showCorrection = false;
    this.isCorrect = null;
    this.reviews = [];
  }
}
