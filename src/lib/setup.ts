import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  Timestamp 
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { auth, db } from './firebase';

export interface SetupUser {
  email: string;
  password: string;
  role: 'admin' | 'judge';
  displayName: string;
}

export const defaultUsers: SetupUser[] = [
  {
    email: 'jeffw412@aol.com',
    role: 'judge',
    password: 'Chili2025',
    displayName: 'Jeff W'
  },
  {
    email: 'ckernyl@gmail.com',
    role: 'judge',
    password: 'Chili2025',
    displayName: 'C. Kernyl'
  },
  {
    email: 'amberkern317@gmail.com',
    role: 'judge',
    password: 'Chili2025',
    displayName: 'Amber Kern'
  },
  {
    email: 'matthew.c.weiser@gmail.com',
    role: 'judge',
    password: 'Chili2025',
    displayName: 'Matthew Weiser'
  },
  {
    email: 'jenn.heidy@gmail.com',
    role: 'admin',
    password: 'Chili2025',
    displayName: 'Jenn Heidy'
  }
];

export async function setupFirebaseDatabase(): Promise<{ success: boolean; message: string; details: string[] }> {
  const details: string[] = [];
  
  try {
    // Test if we can write to Firestore
    details.push('Testing Firestore connection...');
    
    // Try to create a test document
    const testDoc = doc(db, 'setup', 'test');
    await setDoc(testDoc, { 
      test: true, 
      timestamp: Timestamp.now() 
    });
    details.push('✅ Firestore connection successful');

    // Check if users collection exists
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    details.push(`Found ${usersSnapshot.size} existing users`);

    // Create/update user documents for each default user
    for (const userData of defaultUsers) {
      try {
        details.push(`Processing user: ${userData.email}`);
        
        // Try to create the user in Firebase Auth (if they don't exist)
        let userCredential;
        try {
          userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
          details.push(`✅ Created auth user: ${userData.email}`);
        } catch (authError: unknown) {
          if (authError && typeof authError === 'object' && 'code' in authError && authError.code === 'auth/email-already-in-use') {
            // User already exists, that's fine
            details.push(`ℹ️ Auth user already exists: ${userData.email}`);
            // Sign in to get the user object
            userCredential = await signInWithEmailAndPassword(auth, userData.email, userData.password);
          } else {
            const errorMessage = authError instanceof Error ? authError.message : 'Unknown auth error';
            details.push(`❌ Auth error for ${userData.email}: ${errorMessage}`);
            continue;
          }
        }

        // Create/update user document in Firestore
        const userDoc = doc(db, 'users', userCredential.user.uid);
        await setDoc(userDoc, {
          email: userData.email,
          role: userData.role,
          displayName: userData.displayName,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }, { merge: true });
        
        details.push(`✅ Created/updated Firestore document for: ${userData.email}`);
        
        // Sign out after creating each user
        await signOut(auth);
        
      } catch (userError: unknown) {
        const errorMessage = userError instanceof Error ? userError.message : 'Unknown error';
        details.push(`❌ Error processing ${userData.email}: ${errorMessage}`);
      }
    }

    // Create sample chili data
    details.push('Creating sample chili data...');
    const sampleChilis = [
      {
        name: 'Trinity Fire Chili',
        contestantName: 'Sample Contestant 1',
        spicinessLevel: 'Hot',
        createdAt: Timestamp.now(),
        isWinner: false
      },
      {
        name: 'Blazing Trinity Special',
        contestantName: 'Sample Contestant 2', 
        spicinessLevel: 'Extra Hot',
        createdAt: Timestamp.now(),
        isWinner: false
      }
    ];

    for (let i = 0; i < sampleChilis.length; i++) {
      const chiliDoc = doc(collection(db, 'chilis'));
      await setDoc(chiliDoc, sampleChilis[i]);
      details.push(`✅ Created sample chili: ${sampleChilis[i].name}`);
    }

    details.push('🎉 Database setup completed successfully!');
    
    return {
      success: true,
      message: 'Firebase database setup completed successfully!',
      details
    };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    details.push(`❌ Setup failed: ${errorMessage}`);
    return {
      success: false,
      message: `Setup failed: ${errorMessage}`,
      details
    };
  }
}

export async function createAdminUser(): Promise<{success: boolean; message: string; details: string[]}> {
  const details: string[] = [];

  try {
    details.push('Creating admin user...');

    const adminData = {
      email: 'jenn.heidy@gmail.com',
      password: 'Chili2025',
      role: 'admin' as const,
      displayName: 'Jenn Heidy'
    };

    let userCredential;

    try {
      // Try to create new user
      details.push(`Creating new auth user: ${adminData.email}`);
      userCredential = await createUserWithEmailAndPassword(auth, adminData.email, adminData.password);
      details.push(`✅ Created new auth user: ${adminData.email}`);
    } catch (authError: unknown) {
      if (authError instanceof Error && authError.message.includes('email-already-in-use')) {
        details.push(`ℹ️ Auth user already exists: ${adminData.email}`);
        // Try to sign in with the credentials we expect
        try {
          userCredential = await signInWithEmailAndPassword(auth, adminData.email, adminData.password);
          details.push(`✅ Successfully signed in existing user: ${adminData.email}`);
        } catch (signInError: unknown) {
          const errorMessage = signInError instanceof Error ? signInError.message : 'Unknown error';
          details.push(`❌ Cannot sign in with expected credentials: ${errorMessage}`);
          details.push(`⚠️ Admin user exists but password doesn't match. Please reset password in Firebase Console.`);
          return {
            success: false,
            message: 'Admin user exists but password mismatch. Please reset password manually.',
            details
          };
        }
      } else {
        const errorMessage = authError instanceof Error ? authError.message : 'Unknown error';
        details.push(`❌ Auth error for ${adminData.email}: ${errorMessage}`);
        return {
          success: false,
          message: `Failed to create admin user: ${errorMessage}`,
          details
        };
      }
    }

    // Create/update user document in Firestore
    const userDoc = doc(db, 'users', userCredential.user.uid);
    await setDoc(userDoc, {
      email: adminData.email,
      role: adminData.role,
      displayName: adminData.displayName,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }, { merge: true });

    details.push(`✅ Created/updated Firestore document for: ${adminData.email}`);

    // Sign out after creating user
    await signOut(auth);

    details.push('🎉 Admin user setup completed successfully!');

    return {
      success: true,
      message: 'Admin user created successfully!',
      details
    };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    details.push(`❌ Setup failed: ${errorMessage}`);
    return {
      success: false,
      message: `Admin user creation failed: ${errorMessage}`,
      details
    };
  }
}

export async function checkDatabaseStatus(): Promise<{ isSetup: boolean; userCount: number; chiliCount: number }> {
  try {
    const [usersSnapshot, chilisSnapshot] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'chilis'))
    ]);

    return {
      isSetup: usersSnapshot.size > 0,
      userCount: usersSnapshot.size,
      chiliCount: chilisSnapshot.size
    };
  } catch {
    return {
      isSetup: false,
      userCount: 0,
      chiliCount: 0
    };
  }
}
