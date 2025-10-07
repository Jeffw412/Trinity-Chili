export interface Chili {
  id: string;
  teamName: string;
  chiliName: string;
  ingredients: string;
  spicinessLevel: number;
  createdAt: unknown;
  isWinner: boolean;
}

export interface Grade {
  id: string;
  chiliId: string;
  judgeId: string;
  taste: number;
  presentation: number;
  aroma: number;
  uniqueness: number;
  texture: number;
  totalScore: number;
  createdAt: unknown;
}

export interface User {
  uid: string;
  email: string;
  role: 'judge' | 'admin';
  displayName?: string;
  createdAt: unknown;
}

export interface GradeFormData {
  taste: number;
  presentation: number;
  aroma: number;
  uniqueness: number;
  texture: number;
}

export type UserRole = 'judge' | 'admin';
