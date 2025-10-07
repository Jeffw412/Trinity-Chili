# Firebase Setup Guide for Trinity Chili Cookoff

## Quick Setup Steps

### 1. Set up Firestore Database
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `trinity-chili-cook-off`
3. Click on "Firestore Database" in the left sidebar
4. Click "Create database"
5. Choose "Start in production mode"
6. Select a location (choose closest to your users)

### 2. Configure Security Rules
1. In Firestore Database, click on the "Rules" tab
2. Replace the default rules with the content from `firestore.rules` file:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to get user role
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
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
      // Anyone can read chili names and basic info (but contestant names are filtered in the app)
      allow read: if true;
      
      // Allow anyone to create chilis for public registration (no auth required)
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
```

3. Click "Publish"

### 3. Set up Authentication
1. Click on "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" provider
5. Click "Save"

### 4. Create Admin and Judge Users
1. Go to the "Users" tab in Authentication
2. Click "Add user"
3. Create an admin user:
   - Email: `admin@trinity.com` (or your preferred email)
   - Password: Create a secure password
4. Create judge users:
   - Email: `judge1@trinity.com`, `judge2@trinity.com`, etc.
   - Passwords: Create secure passwords

### 5. Add User Roles to Firestore
1. Go back to Firestore Database
2. Click "Start collection"
3. Collection ID: `users`
4. For each user you created, add a document:
   - Document ID: Use the UID from Authentication (copy from Users tab)
   - Fields:
     ```
     email: "admin@trinity.com"
     role: "admin"
     displayName: "Admin User"
     createdAt: (current timestamp)
     ```
   - For judges, use role: "judge"

### 6. Test the Application
1. The public registration should now work
2. Test judge login with the credentials you created
3. Test admin login with the admin credentials

## Troubleshooting

### Permission Denied Errors
- Make sure Firestore rules are published
- Verify user documents exist in the `users` collection
- Check that user roles are correctly set

### Authentication Issues
- Verify Email/Password is enabled in Authentication
- Check that user accounts exist in Authentication > Users
- Ensure passwords are correct

### Real-time Updates Not Working
- Check browser console for errors
- Verify Firestore rules allow read access
- Make sure the database is in the correct region

## Security Notes

- Public users can register chilis without authentication
- Contestant names are hidden from judges during grading
- Only admins can manage chilis and declare winners
- Judges can only see and edit their own grades
- All sensitive operations require proper authentication and authorization
