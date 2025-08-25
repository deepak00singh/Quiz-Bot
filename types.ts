export interface MultipleChoiceQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface TrueFalseQuestion {
  question:string;
  correctAnswer: boolean;
}

export interface ShortAnswerQuestion {
  question: string;
  answer: string;
}

export interface TopicSummary {
  topic: string;
  summary: string;
}

export interface QuizData {
  multipleChoice: MultipleChoiceQuestion[];
  trueFalse: TrueFalseQuestion[];
  shortAnswer: ShortAnswerQuestion[];
  topicSummaries: TopicSummary[];
}

export type AppState = 'apiKeyNeeded' | 'initial' | 'parsing' | 'generating' | 'finished' | 'error';