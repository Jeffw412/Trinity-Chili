// Firebase Setup Script for Trinity Chili Cookoff
// Run this in Firebase Console or use Firebase Admin SDK

// 1. First, you need to create the Firestore database
// Go to Firebase Console > Firestore Database > Create Database

// 2. Set up the security rules (copy this to Rules tab in Firestore)
const firestoreRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to get user role (with null check)
    function getUserRole() {
      return request.auth != null ? 
        (exists(/databases/$(database)/documents/users/$(request.auth.uid)) ? 
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role : 
          'public') : 
        'public';
    }
    
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && getUserRole() == 'admin';
    }
    
    // Helper function to check if user is judge
    function isJudge() {
      return request.auth != null && getUserRole() == 'judge';
    }
    
    // Helper function to check if user is judge or admin
    function isJudgeOrAdmin() {
      return request.auth != null && (getUserRole() == 'judge' || getUserRole() == 'admin');
    }
    
    // Chilis collection
    match /chilis/{chiliId} {
      // Anyone can read chili names and basic info
      allow read: if true;
      
      // Allow anyone to create chilis for public registration
      allow create: if true;
      
      // Only admins can update or delete chilis
      allow update, delete: if isAdmin();
    }
    
    // Grades collection
    match /grades/{gradeId} {
      // Judges can read their own grades, admins can read all grades
      allow read: if isAdmin() || (isJudge() && resource.data.judgeId == request.auth.uid);
      
      // Judges can create grades for chilis they haven't graded yet
      allow create: if isJudge() && request.auth.uid == request.resource.data.judgeId;
      
      // Judges can update their own grades, admins can update any grades
      allow update: if isAdmin() || (isJudge() && resource.data.judgeId == request.auth.uid);
      
      // Only admins can delete grades
      allow delete: if isAdmin();
    }
    
    // Users collection
    match /users/{userId} {
      // Users can read their own data, admins can read all user data
      allow read: if request.auth != null && (request.auth.uid == userId || isAdmin());
      
      // Only admins can create, update, or delete user records
      allow create, update, delete: if isAdmin();
    }
  }
}
`;

// 3. Create user document for jeffw412@aol.com
// You need to get the UID from Firebase Auth first
const createUserDocument = {
  // Replace 'USER_UID_HERE' with the actual UID from Firebase Auth
  collection: 'users',
  documentId: 'USER_UID_HERE', // Get this from Firebase Auth > Users
  data: {
    email: 'jeffw412@aol.com',
    role: 'judge', // or 'admin' if you want admin access
    displayName: 'Jeff W',
    createdAt: new Date()
  }
};

console.log('Firebase Setup Instructions:');
console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
console.log('2. Select project: trinity-chili-cook-off');
console.log('3. Create Firestore Database if not exists');
console.log('4. Copy the rules above to Firestore Rules tab');
console.log('5. Create user document with the data above');
console.log('6. Get UID from Authentication > Users for jeffw412@aol.com');
