// Global learning taxonomy.
//
// Replaces the old MUST-specific college/department/degree-level hierarchy
// (see git history for `universityStructure.ts`) with categories and levels
// that apply to any institution, bootcamp, company, or independent
// instructor using the platform.
//
// These are discovery/labeling values, not a database-enforced taxonomy:
// `category` and `level` on a course are free-text fields on the backend,
// so instructors can enter something outside this list if they need to.
// This list exists to give the course-creation and course-browsing UI a
// consistent, curated set of options.

export interface LearningCategory {
  id: string;
  name: string;
}

export const categories: LearningCategory[] = [
  { id: 'technology', name: 'Technology' },
  { id: 'business', name: 'Business' },
  { id: 'design', name: 'Design' },
  { id: 'engineering', name: 'Engineering' },
  { id: 'data-ai', name: 'Data & AI' },
  { id: 'science', name: 'Science' },
  { id: 'languages', name: 'Languages' },
  { id: 'personal-development', name: 'Personal Development' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'finance', name: 'Finance' },
];

export const levels = [
  { id: 'beginner', name: 'Beginner' },
  { id: 'intermediate', name: 'Intermediate' },
  { id: 'advanced', name: 'Advanced' },
];

// ids kept as 'normal' | 'short' to match the existing course_type values
// already stored on courses and checked elsewhere in the app.
export const courseTypes = [
  { id: 'normal', name: 'Full Course' },
  { id: 'short', name: 'Short Course' },
];
