import { Lesson } from './lesson';

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  completed: boolean;
  locked?: boolean;
}
