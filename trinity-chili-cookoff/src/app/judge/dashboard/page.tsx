'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Chili, Grade, ChiliWithGrades } from '@/types';
import { getChilis, getGradesByJudge } from '@/lib/database';

export default function JudgeDashboard() {
  const [chilis, setChilis] = useState<ChiliWithGrades[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/judge/login');
      return;
    }

    if (user.role !== 'judge' && user.role !== 'admin') {
      router.push('/');
      return;
    }

    loadData();
  }, [user, router]);

  const loadData = async () => {
    try {
      const [chilisData, gradesData] = await Promise.all([
        getChilis(),
        user ? getGradesByJudge(user.uid) : []
      ]);

      const chilisWithGrades = chilisData.map(chili => {
        const userGrade = gradesData.find(grade => grade.chiliId === chili.id);
        return {
          ...chili,
          grades: [],
          hasUserGraded: !!userGrade,
          userGrade
        };
      });

      setChilis(chilisWithGrades);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'judge' && user.role !== 'admin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-red-600">Judge Portal</h1>
            <p className="text-gray-600">Welcome, {user.displayName || user.email}</p>
          </div>
          <div className="flex space-x-4">
            {user.role === 'admin' && (
              <Link 
                href="/admin/dashboard"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Admin Dashboard
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Chilis to Grade</h2>
          
          {chilis.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No chilis registered yet.</p>
          ) : (
            <div className="space-y-4">
              {chilis.map((chili) => (
                <div key={chili.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{chili.name}</h3>
                    <p className="text-sm text-gray-600">Spiciness: {chili.spicinessLevel}</p>
                    {chili.hasUserGraded && (
                      <p className="text-sm text-green-600 mt-1">✓ You have graded this chili</p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {chili.hasUserGraded ? (
                      <Link
                        href={`/judge/grade/${chili.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Edit Grade
                      </Link>
                    ) : (
                      <Link
                        href={`/judge/grade/${chili.id}`}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Grade
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="text-red-600 hover:text-red-700"
          >
            ← Back to Main Page
          </Link>
        </div>
      </main>
    </div>
  );
}
