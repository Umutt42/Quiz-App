/**
 * Représente la clé d’un choix possible pour une question.
 * 
 * 'a' | 'b' | 'c' correspond aux différentes réponses proposées.
 */
export type ChoiceKey = 'a' | 'b' | 'c';

/**
 * Représente un choix de réponse pour une question.
 */
export interface Choice {

  /**
   * Identifiant court du choix (a, b ou c).
   */
  key: ChoiceKey;

  /**
   * Texte affiché pour ce choix.
   */
  text: string;
}

/**
 * Représente une question du quiz.
 */
export interface Question {

  /**
   * Identifiant unique de la question.
   */
  id: number;

  /**
   * Texte principal de la question affichée à l’utilisateur.
   */
  question: string;

  /**
   * URL optionnelle d’une image associée à la question.
   */
  image?: string;

  /**
   * Liste des choix proposés à l’utilisateur.
   */
  choices: Choice[];

  /**
   * Clé correspondant à la bonne réponse.
   */
  answer: ChoiceKey;

  /**
   * Explication optionnelle affichée après la réponse,
   * permettant de justifier la bonne solution.
   */
  explanation?: string;
}
