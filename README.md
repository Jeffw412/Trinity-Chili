# Trinity Chili Cookoff 2025

A comprehensive web application for managing the Trinity Chili Cookoff 2025 competition with public registration, judge grading, and admin management.

## Features

### Public Landing Page
- **Registration Form**: Contestants can register their chili with name, contestant name, and spiciness level
- **Public Chili List**: Displays all registered chilis (contestant names hidden for anonymity)
- **Winner Display**: Shows the winning chili with trophy icon when declared
- **Judge Login**: Access point for judges to grade chilis

### Judge Portal
- **Secure Authentication**: Firebase-based login system
- **Chili Grading**: Grade chilis on 5 categories (Taste, Presentation, Aroma, Uniqueness, Texture)
- **Score Management**: Edit previously submitted grades
- **Real-time Updates**: See new chilis as they're registered

### Admin Portal
- **Full Management**: Add/remove chili entries manually
- **Results Calculation**: View rankings based on total scores across all judges
- **Winner Declaration**: Declare and publish winners to the main page
- **Complete Visibility**: See contestant names and all grading data

## Technology Stack

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: Firebase (Firestore Database + Authentication)
- **Real-time**: Firestore real-time listeners
- **Security**: Row Level Security with Firebase Security Rules

## Setup Instructions

### 1. Prerequisites
- Node.js 18+ installed
- Firebase project set up (already configured)

### 2. Installation
```bash
npm install
```

### 3. Firebase Configuration
The Firebase configuration is already set up in `src/lib/firebase.ts`. You need to:

1. Go to your Firebase Console: https://console.firebase.google.com/
2. Select your project: `trinity-chili-cook-off`
3. Set up Firestore Database:
   - Go to Firestore Database
   - Create database in production mode
   - Copy the security rules from `firestore.rules` and paste them in the Rules tab

### 4. Create Admin and Judge Users
In Firebase Console:
1. Go to Authentication > Users
2. Add users manually with email/password
3. After creating users, add them to the `users` collection in Firestore:

```javascript
// Example user document in Firestore 'users' collection
{
  email: "admin@trinity.com",
  role: "admin",
  displayName: "Admin User",
  createdAt: timestamp
}

// Judge user example
{
  email: "judge1@trinity.com",
  role: "judge",
  displayName: "Judge 1",
  createdAt: timestamp
}
```

### 5. Run the Application
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## User Roles & Access

### Public Users
- Can register chilis
- Can view public chili list (names only)
- Can see winner when declared

### Judges
- Login at `/judge/login`
- Access judge dashboard at `/judge/dashboard`
- Grade chilis on 5-point scale across 5 categories
- Edit their own grades
- Cannot see contestant names during grading

### Admins
- Login at `/admin/login`
- Access admin dashboard at `/admin/dashboard`
- Full CRUD operations on chilis
- View complete results and rankings
- Declare winners
- Can also access judge portal

## Database Schema

### Collections

#### `chilis`
```typescript
{
  id: string,
  name: string,
  contestantName: string,
  spicinessLevel: 'Mild' | 'Medium' | 'Hot' | 'Extra Hot',
  createdAt: Date,
  isWinner: boolean
}
```

#### `grades`
```typescript
{
  id: string,
  chiliId: string,
  judgeId: string,
  taste: number (1-5),
  presentation: number (1-5),
  aroma: number (1-5),
  uniqueness: number (1-5),
  texture: number (1-5),
  createdAt: Date,
  updatedAt: Date
}
```

#### `users`
```typescript
{
  uid: string,
  email: string,
  role: 'judge' | 'admin',
  displayName: string,
  createdAt: Date
}
```

## Security Features

- **Authentication**: Firebase Auth with email/password
- **Authorization**: Role-based access control (public, judge, admin)
- **Data Privacy**: Contestant names hidden from judges during grading
- **Real-time Security**: Firestore security rules enforce access control
- **Input Validation**: Form validation on both client and server side

## Scoring System

- Each chili is graded on 5 categories: Taste, Presentation, Aroma, Uniqueness, Texture
- Each category scored 1-5 points
- Maximum possible score: 25 points per judge
- Final ranking based on total points across all judges
- Winner declared by admin and displayed on main page
