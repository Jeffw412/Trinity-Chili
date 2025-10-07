import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  setDoc,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Chili, Grade, GradeFormData, SpicinessLevel, User } from '@/types';

// Chili operations
export const addChili = async (name: string, contestantName: string, spicinessLevel: SpicinessLevel) => {
  const docRef = await addDoc(collection(db, 'chilis'), {
    name,
    contestantName,
    spicinessLevel,
    createdAt: Timestamp.now(),
    isWinner: false
  });
  return docRef.id;
};

export const getChilis = async (): Promise<Chili[]> => {
  const querySnapshot = await getDocs(collection(db, 'chilis'));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate()
  })) as Chili[];
};

export const deleteChili = async (chiliId: string) => {
  await deleteDoc(doc(db, 'chilis', chiliId));
  
  // Also delete all grades for this chili
  const gradesQuery = query(collection(db, 'grades'), where('chiliId', '==', chiliId));
  const gradesSnapshot = await getDocs(gradesQuery);
  
  const deletePromises = gradesSnapshot.docs.map(gradeDoc => 
    deleteDoc(doc(db, 'grades', gradeDoc.id))
  );
  
  await Promise.all(deletePromises);
};

export const setWinner = async (chiliId: string) => {
  // First, remove winner status from all chilis
  const chilis = await getChilis();
  const updatePromises = chilis.map(chili => 
    updateDoc(doc(db, 'chilis', chili.id), { isWinner: false })
  );
  await Promise.all(updatePromises);
  
  // Then set the new winner
  await updateDoc(doc(db, 'chilis', chiliId), { isWinner: true });
};

// Grade operations
export const addGrade = async (chiliId: string, judgeId: string, gradeData: GradeFormData) => {
  const docRef = await addDoc(collection(db, 'grades'), {
    chiliId,
    judgeId,
    ...gradeData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  return docRef.id;
};

export const updateGrade = async (gradeId: string, gradeData: GradeFormData) => {
  await updateDoc(doc(db, 'grades', gradeId), {
    ...gradeData,
    updatedAt: Timestamp.now()
  });
};

export const getGradesByJudge = async (judgeId: string): Promise<Grade[]> => {
  const q = query(collection(db, 'grades'), where('judgeId', '==', judgeId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt.toDate()
  })) as Grade[];
};

export const getAllGrades = async (): Promise<Grade[]> => {
  const querySnapshot = await getDocs(collection(db, 'grades'));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt.toDate()
  })) as Grade[];
};

// User operations
export const createUser = async (uid: string, email: string, role: 'judge' | 'admin', displayName?: string) => {
  await setDoc(doc(db, 'users', uid), {
    email,
    role,
    displayName,
    createdAt: Timestamp.now()
  });
};

export const getUser = async (uid: string): Promise<User | null> => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    const data = userDoc.data();
    return {
      uid,
      email: data.email,
      role: data.role,
      displayName: data.displayName
    };
  }
  return null;
};

// Real-time listeners
export const subscribeToChilis = (callback: (chilis: Chili[]) => void) => {
  const q = query(collection(db, 'chilis'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const chilis = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate()
    })) as Chili[];
    callback(chilis);
  }, (error) => {
    console.error('Error in chilis subscription:', error);
    // For now, just call callback with empty array if there's a permission error
    callback([]);
  });
};
