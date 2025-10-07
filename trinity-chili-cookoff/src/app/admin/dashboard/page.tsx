'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Chili, Grade, SpicinessLevel } from '@/types';
import { getChilis, getAllGrades, deleteChili, addChili, setWinner } from '@/lib/database';

interface ChiliWithResults extends Chili {
  totalScore: number;
  averageScore: number;
  gradeCount: number;
}

export default function AdminDashboard() {
  const [chilis, setChilis] = useState<ChiliWithResults[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newChili, setNewChili] = useState({
    name: '',
    contestantName: '',
    spicinessLevel: 'Mild' as SpicinessLevel
  });
  
  const { user, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/admin/login');
      return;
    }

    if (user.role !== 'admin') {
      router.push('/');
      return;
    }

    loadData();
  }, [user, router]);

  const loadData = async () => {
    try {
      const [chilisData, gradesData] = await Promise.all([
        getChilis(),
        getAllGrades()
      ]);

      // Calculate scores for each chili
      const chilisWithResults = chilisData.map(chili => {
        const chiliGrades = gradesData.filter(grade => grade.chiliId === chili.id);
        const totalScore = chiliGrades.reduce((sum, grade) => 
          sum + grade.taste + grade.presentation + grade.aroma + grade.uniqueness + grade.texture, 0
        );
        const averageScore = chiliGrades.length > 0 ? totalScore / chiliGrades.length : 0;

        return {
          ...chili,
          totalScore,
          averageScore,
          gradeCount: chiliGrades.length
        };
      });

      // Sort by total score (highest first)
      chilisWithResults.sort((a, b) => b.totalScore - a.totalScore);

      setChilis(chilisWithResults);
      setGrades(gradesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChili = async (chiliId: string, chiliName: string) => {
    if (!confirm(`Are you sure you want to delete "${chiliName}"? This will also delete all grades for this chili.`)) {
      return;
    }

    try {
      await deleteChili(chiliId);
      await loadData(); // Reload data
      alert('Chili deleted successfully!');
    } catch (error) {
      console.error('Error deleting chili:', error);
      alert('Error deleting chili. Please try again.');
    }
  };

  const handleAddChili = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChili.name.trim() || !newChili.contestantName.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await addChili(newChili.name, newChili.contestantName, newChili.spicinessLevel);
      setNewChili({ name: '', contestantName: '', spicinessLevel: 'Mild' });
      setShowAddForm(false);
      await loadData(); // Reload data
      alert('Chili added successfully!');
    } catch (error) {
      console.error('Error adding chili:', error);
      alert('Error adding chili. Please try again.');
    }
  };

  const handleDeclareWinner = async (chiliId: string, chiliName: string) => {
    if (!confirm(`Declare "${chiliName}" as the winner? This will be displayed on the main page.`)) {
      return;
    }

    try {
      await setWinner(chiliId);
      await loadData(); // Reload data
      alert('Winner declared successfully!');
    } catch (error) {
      console.error('Error declaring winner:', error);
      alert('Error declaring winner. Please try again.');
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome, {user.displayName || user.email}</p>
          </div>
          <div className="flex space-x-4">
            <Link 
              href="/judge/dashboard"
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Judge Portal
            </Link>
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
        {/* Add Chili Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Manage Chilis</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              {showAddForm ? 'Cancel' : 'Add Chili'}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddChili} className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chili Name *
                  </label>
                  <input
                    type="text"
                    value={newChili.name}
                    onChange={(e) => setNewChili({...newChili, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contestant Name *
                  </label>
                  <input
                    type="text"
                    value={newChili.contestantName}
                    onChange={(e) => setNewChili({...newChili, contestantName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Spiciness Level *
                  </label>
                  <select
                    value={newChili.spicinessLevel}
                    onChange={(e) => setNewChili({...newChili, spicinessLevel: e.target.value as SpicinessLevel})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Mild">Mild</option>
                    <option value="Medium">Medium</option>
                    <option value="Hot">Hot</option>
                    <option value="Extra Hot">Extra Hot</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Chili
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Results and Chili List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Results & Management</h2>
            <div className="text-sm text-gray-600">
              Total Grades: {grades.length}
            </div>
          </div>
          
          {chilis.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No chilis registered yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Rank</th>
                    <th className="px-4 py-2 text-left">Chili Name</th>
                    <th className="px-4 py-2 text-left">Contestant</th>
                    <th className="px-4 py-2 text-left">Spiciness</th>
                    <th className="px-4 py-2 text-left">Total Score</th>
                    <th className="px-4 py-2 text-left">Avg Score</th>
                    <th className="px-4 py-2 text-left">Grades</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {chilis.map((chili, index) => (
                    <tr key={chili.id} className={`border-b ${chili.isWinner ? 'bg-yellow-50' : ''}`}>
                      <td className="px-4 py-2">
                        {index === 0 && chili.gradeCount > 0 ? (
                          <span className="text-2xl">🥇</span>
                        ) : index === 1 && chili.gradeCount > 0 ? (
                          <span className="text-2xl">🥈</span>
                        ) : index === 2 && chili.gradeCount > 0 ? (
                          <span className="text-2xl">🥉</span>
                        ) : (
                          <span className="text-gray-500">#{index + 1}</span>
                        )}
                      </td>
                      <td className="px-4 py-2 font-semibold">
                        {chili.name}
                        {chili.isWinner && <span className="ml-2 text-yellow-600">👑</span>}
                      </td>
                      <td className="px-4 py-2">{chili.contestantName}</td>
                      <td className="px-4 py-2">{chili.spicinessLevel}</td>
                      <td className="px-4 py-2 font-bold">{chili.totalScore}</td>
                      <td className="px-4 py-2">{chili.averageScore.toFixed(1)}</td>
                      <td className="px-4 py-2">{chili.gradeCount}</td>
                      <td className="px-4 py-2">
                        <div className="flex space-x-2">
                          {!chili.isWinner && chili.gradeCount > 0 && (
                            <button
                              onClick={() => handleDeclareWinner(chili.id, chili.name)}
                              className="bg-yellow-600 text-white px-2 py-1 rounded text-sm hover:bg-yellow-700 transition-colors"
                            >
                              Declare Winner
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteChili(chili.id, chili.name)}
                            className="bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="text-blue-600 hover:text-blue-700"
          >
            ← Back to Main Page
          </Link>
        </div>
      </main>
    </div>
  );
}
