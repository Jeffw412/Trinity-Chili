import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Chili, Grade, User, GradeFormData } from '@/types';

// Chili functions
export const addChili = async (chiliData: Omit<Chili, 'id' | 'createdAt' | 'isWinner'>) => {
  try {
    const docRef = await addDoc(collection(db, 'chilis'), {
      ...chiliData,
      createdAt: Timestamp.now(),
      isWinner: false
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding chili:', error);
    throw error;
  }
};

export const getChilis = async (): Promise<Chili[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'chilis'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Chili));
  } catch (error) {
    console.error('Error getting chilis:', error);
    throw error;
  }
};

// Grade functions
export const addGrade = async (gradeData: GradeFormData & { chiliId: string; judgeId: string }) => {
  try {
    const totalScore = gradeData.taste + gradeData.presentation + gradeData.aroma + 
                      gradeData.uniqueness + gradeData.texture;
    
    const docRef = await addDoc(collection(db, 'grades'), {
      ...gradeData,
      totalScore,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding grade:', error);
    throw error;
  }
};

export const updateGrade = async (gradeId: string, gradeData: GradeFormData) => {
  try {
    const totalScore = gradeData.taste + gradeData.presentation + gradeData.aroma + 
                      gradeData.uniqueness + gradeData.texture;
    
    await updateDoc(doc(db, 'grades', gradeId), {
      ...gradeData,
      totalScore
    });
  } catch (error) {
    console.error('Error updating grade:', error);
    throw error;
  }
};

export const getGradesByJudge = async (judgeId: string): Promise<Grade[]> => {
  try {
    const q = query(collection(db, 'grades'), where('judgeId', '==', judgeId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Grade));
  } catch (error) {
    console.error('Error getting grades by judge:', error);
    throw error;
  }
};

export const getAllGrades = async (): Promise<Grade[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'grades'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Grade));
  } catch (error) {
    console.error('Error getting all grades:', error);
    throw error;
  }
};

// User functions
export const getUser = async (uid: string): Promise<User | null> => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        uid,
        ...docSnap.data()
      } as User;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

// Results functions
export const calculateResults = async () => {
  try {
    const [chilis, grades] = await Promise.all([getChilis(), getAllGrades()]);
    
    const results = chilis.map(chili => {
      const chiliGrades = grades.filter(grade => grade.chiliId === chili.id);
      const totalScore = chiliGrades.reduce((sum, grade) => sum + grade.totalScore, 0);
      const averageScore = chiliGrades.length > 0 ? totalScore / chiliGrades.length : 0;
      
      return {
        ...chili,
        averageScore,
        gradeCount: chiliGrades.length
      };
    });
    
    return results.sort((a, b) => b.averageScore - a.averageScore);
  } catch (error) {
    console.error('Error calculating results:', error);
    throw error;
  }
};

export const declareWinner = async (chiliId: string) => {
  try {
    // Calculate results to get the top 3
    const results = await calculateResults();

    // Get the top 3 chilis (only those with grades)
    const topThree = results.filter(chili => chili.gradeCount > 0).slice(0, 3);

    if (topThree.length < 3) {
      throw new Error('Not enough graded chilis to declare top 3 places');
    }

    // First, clear all placement flags from all chilis
    const chilis = await getChilis();
    const clearPromises = chilis.map(chili =>
      updateDoc(doc(db, 'chilis', chili.id), {
        isWinner: false,
        isSecondPlace: false,
        isThirdPlace: false
      })
    );
    await Promise.all(clearPromises);

    // Then set the top 3 placements
    const placementPromises = [
      updateDoc(doc(db, 'chilis', topThree[0].id), { isWinner: true }),
      updateDoc(doc(db, 'chilis', topThree[1].id), { isSecondPlace: true }),
      updateDoc(doc(db, 'chilis', topThree[2].id), { isThirdPlace: true })
    ];
    await Promise.all(placementPromises);
  } catch (error) {
    console.error('Error declaring winner:', error);
    throw error;
  }
};
