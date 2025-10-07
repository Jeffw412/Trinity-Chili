'use client';

import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, addDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Chili } from '@/types';
import { getChilis } from '@/lib/database';
import Link from 'next/link';

export default function Home() {
  const [chilis, setChilis] = useState<Chili[]>([]);
  const [loading, setLoading] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);

  // Form state
  const [teamName, setTeamName] = useState('');
  const [chiliName, setChiliName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [spicinessLevel, setSpicinessLevel] = useState(1);

  useEffect(() => {
    loadChilis();
  }, []);

  const loadChilis = async () => {
    try {
      const chilisData = await getChilis();
      setChilis(chilisData);
    } catch (error) {
      console.error('Error loading chilis:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, 'chilis'), {
        teamName,
        chiliName,
        ingredients,
        spicinessLevel,
        createdAt: Timestamp.now(),
        isWinner: false
      });

      // Reset form
      setTeamName('');
      setChiliName('');
      setIngredients('');
      setSpicinessLevel(1);

      // Reload chilis
      await loadChilis();
      alert('🌶️ Chili registered successfully!');
    } catch (error) {
      console.error('Error registering chili:', error);
      alert('Error registering chili. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const setupDatabase = async () => {
    setSetupLoading(true);
    
    try {
      // Sample users to create
      const users = [
        { email: 'jeffw412@aol.com', password: 'Chili2025', role: 'judge', displayName: 'Jeff W' },
        { email: 'admin@trinity.com', password: 'Admin2025', role: 'admin', displayName: 'Admin' }
      ];

      // Sample chilis to create
      const sampleChilis = [
        { teamName: 'Fire Dragons', chiliName: 'Dragon&apos;s Breath', ingredients: 'Ghost peppers, tomatoes, onions, garlic', spicinessLevel: 5 },
        { teamName: 'Mild Riders', chiliName: 'Comfort Classic', ingredients: 'Ground beef, kidney beans, bell peppers', spicinessLevel: 2 },
        { teamName: 'Spice Masters', chiliName: 'Inferno Supreme', ingredients: 'Carolina Reaper, beef, beans, secret spices', spicinessLevel: 5 }
      ];

      // Create users
      for (const userData of users) {
        try {
          // Create user in Firebase Auth
          let userCredential;
          try {
            userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
          } catch (authError: unknown) {
            if (authError && typeof authError === 'object' && 'code' in authError && authError.code === 'auth/email-already-in-use') {
              // User exists, sign in to get UID
              userCredential = await signInWithEmailAndPassword(auth, userData.email, userData.password);
            } else {
              throw authError;
            }
          }

          // Create user document in Firestore
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            email: userData.email,
            role: userData.role,
            displayName: userData.displayName,
            createdAt: Timestamp.now()
          });
        } catch (error) {
          console.error(`Error creating user ${userData.email}:`, error);
        }
      }

      // Create sample chilis
      for (const chili of sampleChilis) {
        await addDoc(collection(db, 'chilis'), {
          teamName: chili.teamName,
          chiliName: chili.chiliName,
          ingredients: chili.ingredients,
          spicinessLevel: chili.spicinessLevel,
          createdAt: Timestamp.now(),
          isWinner: false
        });
      }

      alert('🎉 Database setup completed successfully! You can now:\n\n• Register chilis\n• Login as judge: jeffw412@aol.com / Chili2025\n• Login as admin: admin@trinity.com / Admin2025');
    } catch (error: unknown) {
      console.error('Setup error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Setup failed: ${errorMessage}`);
    } finally {
      setSetupLoading(false);
    }
  };

  const winner = chilis.find(chili => chili.isWinner);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src="/TC+Logo+with+lettering+extra+whitespace.webp" 
            alt="Trinity Logo" 
            className="logo-large mx-auto mb-6"
          />
          <h1 className="text-4xl font-bold trinity-red mb-4">🌶️ Trinity Chili Cook-off 🌶️</h1>
          <p className="text-gray-600 text-lg">Register your chili and compete for the championship!</p>
        </div>

        {/* Winner Announcement */}
        {winner && (
          <div className="card mb-8 text-center bg-yellow-50 border-2 border-yellow-300">
            <h2 className="text-2xl font-bold text-yellow-800 mb-2">🏆 WINNER ANNOUNCED! 🏆</h2>
            <p className="text-xl text-yellow-700">
              <strong>{winner.teamName}</strong> wins with <strong>&quot;{winner.chiliName}&quot;</strong>!
            </p>
          </div>
        )}

        {/* Quick Setup Button */}
        <div className="card mb-8 text-center bg-blue-50 border-2 border-blue-300">
          <h2 className="text-xl font-bold text-blue-800 mb-4">🚀 Quick Setup</h2>
          <p className="text-blue-700 mb-4">
            Set up sample data and user accounts for testing the application.
          </p>
          <button 
            onClick={setupDatabase}
            disabled={setupLoading}
            className="btn-primary bg-blue-600 hover:bg-blue-700"
          >
            {setupLoading ? 'Setting up...' : 'Setup Database'}
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Registration Form */}
          <div className="card">
            <h2 className="text-2xl font-bold trinity-red mb-6">Register Your Chili</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Team Name</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="form-input"
                  required
                  placeholder="Enter your team name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Chili Name</label>
                <input
                  type="text"
                  value={chiliName}
                  onChange={(e) => setChiliName(e.target.value)}
                  className="form-input"
                  required
                  placeholder="Give your chili a creative name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ingredients</label>
                <textarea
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  className="form-input"
                  rows={3}
                  required
                  placeholder="List your main ingredients"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Spiciness Level (1-5)</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={spicinessLevel}
                  onChange={(e) => setSpicinessLevel(parseInt(e.target.value))}
                  className="grade-slider"
                />
                <div className="text-center text-sm text-gray-600">
                  {spicinessLevel === 1 && '🌶️ Mild'}
                  {spicinessLevel === 2 && '🌶️🌶️ Medium'}
                  {spicinessLevel === 3 && '🌶️🌶️🌶️ Hot'}
                  {spicinessLevel === 4 && '🌶️🌶️🌶️🌶️ Very Hot'}
                  {spicinessLevel === 5 && '🌶️🌶️🌶️🌶️🌶️ EXTREME!'}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Registering...' : 'Register Chili'}
              </button>
            </form>
          </div>

          {/* Registered Chilis */}
          <div className="card">
            <h2 className="text-2xl font-bold trinity-red mb-6">Registered Chilis</h2>
            {chilis.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No chilis registered yet. Be the first!</p>
            ) : (
              <div className="space-y-4">
                {chilis.map((chili) => (
                  <div key={chili.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{chili.chiliName}</h3>
                      {chili.isWinner && <span className="winner-badge">🏆 WINNER</span>}
                    </div>
                    <p className="text-gray-600 mb-1"><strong>Team:</strong> {chili.teamName}</p>
                    <p className="text-gray-600 mb-2"><strong>Ingredients:</strong> {chili.ingredients}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">
                        {'🌶️'.repeat(chili.spicinessLevel)} Spice Level {chili.spicinessLevel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <div className="text-center mt-8 space-x-4">
          <Link href="/judge/login" className="btn-secondary">
            Judge Login
          </Link>
          <Link href="/admin/login" className="btn-secondary">
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}
