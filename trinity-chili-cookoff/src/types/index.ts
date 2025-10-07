export type SpicinessLevel = 'Mild' | 'Medium' | 'Hot' | 'Extra Hot';

export type UserRole = 'public' | 'judge' | 'admin';

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
}

export interface Chili {
  id: string;
  name: string;
  contestantName: string;
  spicinessLevel: SpicinessLevel;
  createdAt: Date;
  isWinner?: boolean;
}

export interface Grade {
  id: string;
  chiliId: string;
  judgeId: string;
  taste: number; // 1-5
  presentation: number; // 1-5
  aroma: number; // 1-5
  uniqueness: number; // 1-5
  texture: number; // 1-5
  createdAt: Date;
  updatedAt: Date;
}

export interface GradeFormData {
  taste: number;
  presentation: number;
  aroma: number;
  uniqueness: number;
  texture: number;
}

export interface ChiliWithGrades extends Chili {
  grades: Grade[];
  totalScore?: number;
  averageScore?: number;
  hasUserGraded?: boolean;
  userGrade?: Grade;
}
