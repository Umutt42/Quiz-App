import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
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
   bank: 'pp' | 'np' | 'p2' | 'p3' = 'pp';

  /** Ensemble complet des questions chargées */
  private allQuestions: Question[] = [];

  /** Questions réellement utilisées pour la session */
  questions: Question[] = [];

  /** Index de la question actuelle */
  index = 0;

  /** Score actuel */
  score = 0;

  /** Réponse sélectionnée (UI) */
  selected: ChoiceKey | null = null;

  /** Indique si la correction est affichée (UI) */
  showCorrection = false;

  /** Indique si la réponse est correcte (UI) */
  isCorrect: boolean | null = null;

  /**
   * Réponses utilisateur par index de question.
   * Permet de conserver/restaurer la réponse quand on fait précédent/suivant.
   */
  answers: (ChoiceKey | null)[] = [];

  /**
   * Historique des réponses (pour l'écran final "Tes erreurs").
   * On le garde car ton template l'utilise, mais on le reconstruit depuis `answers`.
   */
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
  @HostListener('document:keydown', ['$event'])
  handleKeydown(e: KeyboardEvent): void {
    if (this.isImageOpen) {
      if (e.key === 'Escape') this.closeImage();
      return;
    }

    if (!this.current) return;

    switch (e.key) {
      case 'a':
      case 'A':
        this.select('a');
        break;
      case 'b':
      case 'B':
        this.select('b');
        break;
      case 'c':
      case 'C':
        this.select('c');
        break;
      case 'ArrowRight':
      case 'Enter':
        if (this.canGoNext) this.next();
        break;
      case 'ArrowLeft':
        this.previous();
        break;
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

  /**
   * Utilisé pour activer/désactiver le bouton "Suivant" si tu choisis de bloquer
   * tant que la question n'est pas répondue.
   *
   * 👉 Dans le HTML: [disabled]="!canGoNext"
   */
  get canGoNext(): boolean {
    return !!this.answers[this.index];
  }

  /**
   * "Tes erreurs" (écran final)
   * On retourne uniquement les réponses fausses.
   */
  get wrongAnswers(): AnswerReview[] {
    return this.reviews.filter((r) => !r.isCorrect);
  }

  /**
   * Seuil de réussite (70%) calculé sur le nombre de questions du quiz.
   * - random : 30 -> ceil(30*0.7)=21
   * - all    : total -> ceil(total*0.7)
   */
  get threshold(): number {
    const total = this.questions.length;
    if (!total) return 0;
    return Math.ceil(total * 0.7);
  }

  /**
   * Réussite active pour tous les modes (random + all), sur base de 70%.
   */
  get passed(): boolean {
    if (!this.questions.length) return false;
    return this.score >= this.threshold;
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

  /**
   * Enregistre la réponse et affiche la correction.
   * ✅ La réponse est conservée quand on navigue.
   * ✅ Le score est recalculé (pas d'incrément) => pas de bug quand on revient.
   */
  select(key: ChoiceKey): void {
    if (!this.current) return;

    this.answers[this.index] = key;

    // Restaurer l'état UI sur cette question
    this.restoreState();

    // Recalculer score + reconstruire les reviews
    this.recomputeScoreAndReviews();
  }

  /**
   * Va à la question suivante.
   * Option: bloque si pas répondu (via canGoNext).
   */
  next(): void {
    if (!this.current) return;

    // ✅ Optionnel : empêche d'aller plus loin sans répondre
    if (!this.canGoNext) return;

    // Dernière question => passe en "finished"
    if (this.index >= this.questions.length - 1) {
      this.index += 1;
      return;
    }

    this.index += 1;
    this.restoreState();
  }

  /**
   * Va à la question précédente.
   * ✅ Restaure la réponse (si déjà donnée).
   */
  previous(): void {
    if (this.index <= 0) return;

    this.index -= 1;
    this.restoreState();
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
    this.answers = [];
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

    // ✅ initialise un tableau de réponses de la même taille que questions
    this.answers = new Array(this.questions.length).fill(null);

    // ✅ état UI
    this.selected = null;
    this.showCorrection = false;
    this.isCorrect = null;

    // ✅ score + reviews
    this.score = 0;
    this.reviews = [];
  }

  /**
   * Restaure l'état UI (selected/correction/isCorrect) depuis answers[index].
   * Appelé après next/previous et après select.
   */
  private restoreState(): void {
    const q = this.current;
    if (!q) {
      this.selected = null;
      this.showCorrection = false;
      this.isCorrect = null;
      return;
    }

    const a = this.answers[this.index] ?? null;
    this.selected = a;

    if (a) {
      this.showCorrection = true;
      this.isCorrect = a === q.answer;
    } else {
      this.showCorrection = false;
      this.isCorrect = null;
    }
  }

  /**
   * Recalcule le score et reconstruit la liste `reviews` depuis `answers`.
   * ✅ évite le bug "score qui double" et "réponses qui disparaissent"
   */
  private recomputeScoreAndReviews(): void {
    let s = 0;
    const rev: AnswerReview[] = [];

    for (let i = 0; i < this.questions.length; i += 1) {
      const q = this.questions[i];
      const a = this.answers[i] ?? null;

      if (!q || !a) continue;

      const ok = a === q.answer;
      if (ok) s += 1;

      rev.push({
        question: q,
        selected: a,
        isCorrect: ok,
      });
    }

    this.score = s;
    this.reviews = rev;
  }
  startNewRandomQuiz(): void {
    // force le mode random
    this.mode = 'random';

    // recrée une session random depuis la banque déjà chargée
    this.resetQuiz();

    // et revient au début du quiz
    this.index = 0;
    this.restoreState();
  }

  exportPdf(): void {
    const bankLabels: Record<string, string> = {
      pp: 'PP / P1',
      np: 'NP',
      p2: 'P2',
      p3: 'P3',
    };

    const questionsHtml = this.questions
      .map(
        (q, i) => `
        <div class="question-block">
          <p class="question-text">${i + 1}. ${q.question}</p>
          ${q.choices.map((c) => `<p class="choice"><b>${c.key.toUpperCase()}.</b> ${c.text}</p>`).join('')}
        </div>`,
      )
      .join('');

    const corrigeHtml = this.questions
      .map((q, i) => {
        const answerChoice = q.choices.find((c) => c.key === q.answer);
        const answerText = answerChoice
          ? `${q.answer.toUpperCase()}. ${answerChoice.text}`
          : q.answer.toUpperCase();
        return `
        <div class="question-block">
          <p class="question-text">${i + 1}. ${q.question}</p>
          <p class="answer">&#8594; ${answerText}</p>
          ${q.explanation ? `<p class="explanation">${q.explanation}</p>` : ''}
        </div>`;
      })
      .join('');

    const content = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Quiz Phytolicence – ${bankLabels[this.bank]}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 11pt; color: #0f172a; padding: 28px 36px; }
    h1 { font-size: 18pt; margin-bottom: 4px; }
    .meta { font-size: 9pt; color: #64748b; margin-bottom: 14px; }
    hr { border: none; border-top: 2px solid #4d9c18; margin-bottom: 14px; }
    .question-block { margin-bottom: 16px; page-break-inside: avoid; }
    .question-text { font-weight: bold; margin-bottom: 5px; line-height: 1.45; }
    .choice { padding: 2px 0 2px 12px; line-height: 1.4; }
    .corrige { page-break-before: always; margin-top: 30px; }
    .corrige h2 { font-size: 15pt; color: #2f7a0b; margin-bottom: 8px; }
    .answer { color: #2f7a0b; font-weight: bold; padding-left: 12px; margin-top: 4px; line-height: 1.4; }
    .explanation { color: #555; font-size: 9.5pt; padding-left: 12px; margin-top: 3px; line-height: 1.4; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>Quiz Phytolicence – ${bankLabels[this.bank]}</h1>
  <p class="meta">Généré le ${new Date().toLocaleDateString('fr-BE')} &ndash; ${this.questions.length} questions</p>
  <hr>
  ${questionsHtml}
  <div class="corrige">
    <h2>Corrigé</h2>
    <hr>
    ${corrigeHtml}
  </div>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (win) {
      win.document.documentElement.innerHTML = content;
      win.addEventListener('load', () => win.print());
    }
  }

  downloadHtml(): void {
    const bankLabels: Record<string, string> = {
      pp: 'PP_P1',
      np: 'NP',
      p2: 'P2',
      p3: 'P3',
    };

    const questionsHtml = this.questions
      .map(
        (q, i) => `
        <div class="question-block">
          <p class="question-text">${i + 1}. ${q.question}</p>
          ${q.choices.map((c) => `<p class="choice"><b>${c.key.toUpperCase()}.</b> ${c.text}</p>`).join('')}
        </div>`,
      )
      .join('');

    const corrigeHtml = this.questions
      .map((q, i) => {
        const answerChoice = q.choices.find((c) => c.key === q.answer);
        const answerText = answerChoice
          ? `${q.answer.toUpperCase()}. ${answerChoice.text}`
          : q.answer.toUpperCase();
        return `
        <div class="question-block">
          <p class="question-text">${i + 1}. ${q.question}</p>
          <p class="answer">&#8594; ${answerText}</p>
          ${q.explanation ? `<p class="explanation">${q.explanation}</p>` : ''}
        </div>`;
      })
      .join('');

    const bankLabel = bankLabels[this.bank] ?? this.bank;

    const content = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Quiz Phytolicence – ${bankLabel.replace('_', ' / ')}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 11pt; color: #0f172a; padding: 28px 36px; }
    h1 { font-size: 18pt; margin-bottom: 4px; }
    .meta { font-size: 9pt; color: #64748b; margin-bottom: 14px; }
    hr { border: none; border-top: 2px solid #4d9c18; margin-bottom: 14px; }
    .question-block { margin-bottom: 16px; page-break-inside: avoid; }
    .question-text { font-weight: bold; margin-bottom: 5px; line-height: 1.45; }
    .choice { padding: 2px 0 2px 12px; line-height: 1.4; }
    .corrige { page-break-before: always; margin-top: 30px; }
    .corrige h2 { font-size: 15pt; color: #2f7a0b; margin-bottom: 8px; }
    .answer { color: #2f7a0b; font-weight: bold; padding-left: 12px; margin-top: 4px; line-height: 1.4; }
    .explanation { color: #555; font-size: 9.5pt; padding-left: 12px; margin-top: 3px; line-height: 1.4; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>Quiz Phytolicence – ${bankLabel.replace('_', ' / ')}</h1>
  <p class="meta">Généré le ${new Date().toLocaleDateString('fr-BE')} &ndash; ${this.questions.length} questions</p>
  <hr>
  ${questionsHtml}
  <div class="corrige">
    <h2>Corrigé</h2>
    <hr>
    ${corrigeHtml}
  </div>
</body>
</html>`;

    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Quiz_Phytolicence_${bankLabel}_${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

}
