// Debug script for production Firebase issues
// Run this in the browser console on your production site

console.log('🔍 Firebase Production Debug Script');
console.log('=====================================');

// Check Firebase configuration
console.log('📋 Firebase Config:');
try {
  const firebaseConfig = {
    apiKey: "AIzaSyBVEsFeF2Aw0pTL3eYAYkZ-6bJxXkmLszU",
    authDomain: "trinity-chili-cook-off.firebaseapp.com",
    projectId: "trinity-chili-cook-off",
    storageBucket: "trinity-chili-cook-off.firebasestorage.app",
    messagingSenderId: "444280568515",
    appId: "1:444280568515:web:d33a50c11afbee06ce8076"
  };
  console.log('✅ Firebase config loaded:', firebaseConfig);
} catch (error) {
  console.error('❌ Firebase config error:', error);
}

// Check current domain
console.log('🌐 Current Domain:', window.location.origin);
console.log('🌐 Current URL:', window.location.href);

// Check if Firebase is loaded
console.log('🔥 Firebase Status:');
if (typeof firebase !== 'undefined') {
  console.log('✅ Firebase SDK loaded');
} else {
  console.log('❌ Firebase SDK not loaded');
}

// Check authentication status
console.log('🔐 Authentication Status:');
try {
  // This will be available if Firebase Auth is loaded
  if (window.firebase && window.firebase.auth) {
    const user = window.firebase.auth().currentUser;
    console.log('Current user:', user ? user.email : 'Not logged in');
  } else {
    console.log('Firebase Auth not available');
  }
} catch (error) {
  console.error('Auth check error:', error);
}

// Test Firestore connection
console.log('📊 Testing Firestore Connection:');
try {
  // This will help identify the exact error
  fetch('https://firestore.googleapis.com/v1/projects/trinity-chili-cook-off/databases/(default)/documents/chilis')
    .then(response => {
      console.log('Firestore response status:', response.status);
      if (!response.ok) {
        console.error('❌ Firestore connection failed:', response.status, response.statusText);
      } else {
        console.log('✅ Firestore connection successful');
      }
      return response.text();
    })
    .then(data => {
      console.log('Firestore response data:', data);
    })
    .catch(error => {
      console.error('❌ Firestore fetch error:', error);
    });
} catch (error) {
  console.error('❌ Firestore test error:', error);
}

console.log('=====================================');
console.log('📝 Instructions:');
console.log('1. Copy this entire output');
console.log('2. Share it with the developer');
console.log('3. Check Firebase Console authorized domains');
console.log('4. Add your Vercel domain to authorized domains');
