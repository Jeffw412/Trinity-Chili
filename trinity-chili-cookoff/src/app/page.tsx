'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Chili, SpicinessLevel } from '@/types';
import { addChili, subscribeToChilis } from '@/lib/database';
import {
  collection,
  doc,
  setDoc,
  Timestamp
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';

export default function Home() {
  const [chilis, setChilis] = useState<Chili[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    chiliName: '',
    contestantName: '',
    spicinessLevel: 'Mild' as SpicinessLevel
  });
  const [setupLoading, setSetupLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToChilis((updatedChilis) => {
      setChilis(updatedChilis);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.chiliName.trim() || !formData.contestantName.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await addChili(formData.chiliName, formData.contestantName, formData.spicinessLevel);
      setFormData({
        chiliName: '',
        contestantName: '',
        spicinessLevel: 'Mild'
      });
      alert('Chili registered successfully!');
    } catch (error) {
      console.error('Error registering chili:', error);
      if (error instanceof Error && error.message.includes('permission-denied')) {
        alert('Database not yet configured. Please contact the administrator to set up Firebase.');
      } else {
        alert('Error registering chili. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSetupDatabase = async () => {
    if (setupLoading) return;

    setSetupLoading(true);
    try {
      // Create users
      const users = [
        { email: 'jeffw412@aol.com', password: 'Chili2025', role: 'judge', displayName: 'Jeff W' },
        { email: 'admin@trinity.com', password: 'Admin2025', role: 'admin', displayName: 'Trinity Admin' },
        { email: 'judge1@trinity.com', password: 'Judge2025', role: 'judge', displayName: 'Judge 1' },
        { email: 'judge2@trinity.com', password: 'Judge2025', role: 'judge', displayName: 'Judge 2' }
      ];

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

          // Sign out
          await signOut(auth);
        } catch (error) {
          console.error(`Error creating user ${userData.email}:`, error);
        }
      }

      // Create sample chilis
      const sampleChilis = [
        { name: 'Trinity Fire Chili', contestantName: 'Sample Contestant 1', spicinessLevel: 'Hot' },
        { name: 'Blazing Trinity Special', contestantName: 'Sample Contestant 2', spicinessLevel: 'Extra Hot' }
      ];

      for (const chili of sampleChilis) {
        await setDoc(doc(collection(db, 'chilis')), {
          name: chili.name,
          contestantName: chili.contestantName,
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <Image
              src="/TC+Logo+with+lettering+extra+whitespace.webp"
              alt="Trinity College Logo"
              width={200}
              height={120}
              className="object-contain"
            />
            <h1 className="text-4xl font-bold text-red-600">Trinity Chili Cookoff 2025</h1>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleSetupDatabase}
              disabled={setupLoading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
            >
              {setupLoading ? '⏳ Setting up...' : '🔧 Setup DB'}
            </button>
            <Link
              href="/judge/login"
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Judge Login
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Winner Display */}
        {winner && (
          <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-6 mb-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <span className="text-6xl">🏆</span>
            </div>
            <h2 className="text-2xl font-bold text-yellow-800 mb-2">Winner Announced!</h2>
            <p className="text-xl text-yellow-700">{winner.name}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Registration Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Register Your Chili</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="chiliName" className="block text-sm font-medium text-gray-700 mb-1">
                  Chili Name *
                </label>
                <input
                  type="text"
                  id="chiliName"
                  value={formData.chiliName}
                  onChange={(e) => setFormData({...formData, chiliName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter your chili's name"
                  required
                />
              </div>

              <div>
                <label htmlFor="contestantName" className="block text-sm font-medium text-gray-700 mb-1">
                  Contestant Name *
                </label>
                <input
                  type="text"
                  id="contestantName"
                  value={formData.contestantName}
                  onChange={(e) => setFormData({...formData, contestantName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div>
                <label htmlFor="spicinessLevel" className="block text-sm font-medium text-gray-700 mb-1">
                  Spiciness Level *
                </label>
                <select
                  id="spicinessLevel"
                  value={formData.spicinessLevel}
                  onChange={(e) => setFormData({...formData, spicinessLevel: e.target.value as SpicinessLevel})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="Mild">Mild</option>
                  <option value="Medium">Medium</option>
                  <option value="Hot">Hot</option>
                  <option value="Extra Hot">Extra Hot</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Registering...' : 'Register Chili'}
              </button>
            </form>
          </div>

          {/* Chili List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Registered Chilis</h2>
            {chilis.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No chilis registered yet. Be the first!</p>
            ) : (
              <div className="space-y-3">
                {chilis.map((chili) => (
                  <div key={chili.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-800">{chili.name}</h3>
                      <p className="text-sm text-gray-600">Spiciness: {chili.spicinessLevel}</p>
                    </div>
                    {chili.isWinner && (
                      <span className="text-2xl">🏆</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
