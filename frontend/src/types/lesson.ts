export interface ContentBlock {
  id: string;
  type: 'text' | 'video' | 'image' | 'pdf' | 'ppt' | 'audio' | 'code' | 'doc';
  title?: string;
  content: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
}

export interface Lesson {
  id: string;
  title: string;
  duration_minutes?: number;
  difficulty?: string;
  objectives?: string;
  prerequisites?: string;
  tags?: string[];
  order?:number;
  content_blocks: ContentBlock[];
  quiz_questions?: QuizQuestion[];

  is_completed?: boolean;
  locked?: boolean;
}
