import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizService } from '../../services/quiz.service';
import { ChoiceKey, Question } from '../../models/quiz.models';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz.html',
  styleUrl: './quiz.scss'
})
export class QuizComponent implements OnInit {
  questions: Question[] = [];
  index = 0;
  score = 0;

  selected: ChoiceKey | null = null;
  isCorrect: boolean | null = null;
  showCorrection = false;

  loading = true;
  error: string | null = null;

  constructor(private quizService: QuizService) {}

  ngOnInit(): void {
    this.quizService.loadQuestions().subscribe({
      next: (qs) => {
        this.questions = qs;
        this.loading = false;
      },
      error: () => {
        this.error = "Impossible de charger les questions.";
        this.loading = false;
      }
    });
  }

  get current(): Question | null {
    return this.questions[this.index] ?? null;
  }

  select(choice: ChoiceKey) {
    if (!this.current || this.showCorrection) return;

    this.selected = choice;
    this.isCorrect = choice === this.current.answer;
    this.showCorrection = true;

    if (this.isCorrect) this.score++;
  }

  next() {
    if (!this.current) return;

    this.selected = null;
    this.isCorrect = null;
    this.showCorrection = false;

    this.index++;
  }

  restart() {
    this.index = 0;
    this.score = 0;
    this.selected = null;
    this.isCorrect = null;
    this.showCorrection = false;
  }
}
