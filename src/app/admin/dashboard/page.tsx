'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  getChilis,
  getAllGrades,
  calculateResults,
  declareWinner,
  addChili
} from '@/lib/database';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Chili, Grade } from '@/types';

interface ChiliWithResults extends Chili {
  averageScore: number;
  gradeCount: number;
}

export default function AdminDashboard() {
  const [chilis, setChilis] = useState<Chili[]>([]);
  const [results, setResults] = useState<ChiliWithResults[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  type TabType = 'overview' | 'chilis' | 'results' | 'add';
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add Chili Form State
  const [newChili, setNewChili] = useState({
    competitorName: '',
    chiliName: '',
    spicinessLevel: 3
  });
  const [submitting, setSubmitting] = useState(false);

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
      setLoading(true);
      const [chilisData, gradesData, resultsData] = await Promise.all([
        getChilis(),
        getAllGrades(),
        calculateResults()
      ]);
      setChilis(chilisData);
      setGrades(gradesData);
      setResults(resultsData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeclareWinner = async (chiliId: string) => {
    try {
      setSubmitting(true);
      await declareWinner(chiliId);
      await loadData();
      setSuccess('Winner declared successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error declaring winner:', error);
      setError('Failed to declare winner. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddChili = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await addChili(newChili);
      setNewChili({
        competitorName: '',
        chiliName: '',
        spicinessLevel: 3
      });
      await loadData();
      setSuccess('Chili added successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setActiveTab('chilis');
    } catch (error) {
      console.error('Error adding chili:', error);
      setError('Failed to add chili. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteChili = async (chiliId: string) => {
    if (!confirm('Are you sure you want to delete this chili? This action cannot be undone.')) {
      return;
    }

    try {
      setSubmitting(true);
      // Note: We need to add a delete function to the database.ts file
      // For now, we'll update the chili to mark it as deleted
      await updateDoc(doc(db, 'chilis', chiliId), { deleted: true });
      await loadData();
      setSuccess('Chili deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting chili:', error);
      setError('Failed to delete chili. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const getGradesForChili = (chiliId: string) => {
    return grades.filter(grade => grade.chiliId === chiliId);
  };

  const getFullyGradedChilisCount = () => {
    // Get the number of active judges (unique judge IDs from grades)
    const activeJudges = new Set(grades.map(grade => grade.judgeId));
    const totalActiveJudges = activeJudges.size;

    if (totalActiveJudges === 0) return 0;

    // Count chilis that have been graded by all active judges
    let fullyGradedCount = 0;

    chilis.forEach(chili => {
      const chiliGrades = getGradesForChili(chili.id);
      const uniqueJudgesForChili = new Set(chiliGrades.map(grade => grade.judgeId));

      // If this chili has grades from all active judges, count it
      if (uniqueJudgesForChili.size === totalActiveJudges) {
        fullyGradedCount++;
      }
    });

    return fullyGradedCount;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-trinity-red mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="card mb-8 trinity-bg-blue">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <Image 
                src="/TC+Logo+with+lettering+extra+whitespace.webp" 
                alt="Trinity Logo" 
                width={120}
                height={72}
                className="object-contain"
              />
              <div>
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">Admin Dashboard</h1>
                <p className="text-blue-100">Welcome, {user?.displayName || user?.email}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Link href="/" className="btn-secondary">
                🏠 Home
              </Link>
              <button onClick={handleSignOut} className="btn-primary">
                🚪 Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="card mb-8 bg-red-50 border-red-200">
            <div className="error-message">
              <span className="text-xl mr-2">⚠️</span>
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="card mb-8 bg-green-50 border-green-200">
            <div className="success-message">
              <span className="text-xl mr-2">✅</span>
              {success}
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="card mb-8">
          <div className="flex flex-wrap gap-4 justify-center">
            {[
              { id: 'overview', label: '📊 Overview', icon: '📊' },
              { id: 'chilis', label: '🌶️ Manage Chilis', icon: '🌶️' },
              { id: 'results', label: '🏆 Results & Rankings', icon: '🏆' },
              { id: 'add', label: '➕ Add Chili', icon: '➕' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-[var(--trinity-red)] text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="card bg-blue-50 border-blue-200">
              <div className="text-center">
                <div className="text-4xl mb-2">🌶️</div>
                <div className="text-3xl font-bold text-blue-600">{chilis.length}</div>
                <p className="text-blue-800 font-medium">Total Chilis</p>
              </div>
            </div>
            <div className="card bg-green-50 border-green-200">
              <div className="text-center">
                <div className="text-4xl mb-2">📝</div>
                <div className="text-3xl font-bold text-green-600">{grades.length}</div>
                <p className="text-green-800 font-medium">Total Grades</p>
              </div>
            </div>
            <div className="card bg-purple-50 border-purple-200">
              <div className="text-center">
                <div className="text-4xl mb-2">👨‍⚖️</div>
                <div className="text-3xl font-bold text-purple-600">
                  {new Set(grades.map(g => g.judgeId)).size}
                </div>
                <p className="text-purple-800 font-medium">Active Judges</p>
              </div>
            </div>
            <div className="card bg-orange-50 border-orange-200">
              <div className="text-center">
                <div className="text-4xl mb-2">✅</div>
                <div className="text-3xl font-bold text-orange-600">{getFullyGradedChilisCount()}</div>
                <p className="text-orange-800 font-medium">Fully Graded</p>
              </div>
            </div>
            <div className="card bg-yellow-50 border-yellow-200">
              <div className="text-center">
                <div className="text-4xl mb-2">🏆</div>
                <div className="text-3xl font-bold text-yellow-600">
                  {chilis.filter(c => c.isWinner).length}
                </div>
                <p className="text-yellow-800 font-medium">Winners Declared</p>
              </div>
            </div>
          </div>
        )}

        {/* Chilis Management Tab */}
        {activeTab === 'chilis' && (
          <div className="card">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🌶️</div>
              <h2 className="text-2xl font-bold mb-2">Manage Chilis</h2>
              <p className="text-gray-600">View and manage all registered chilis</p>
            </div>

            <div className="space-y-4">
              {chilis.map((chili, index) => {
                const chiliGrades = getGradesForChili(chili.id);
                const averageScore = chiliGrades.length > 0 
                  ? chiliGrades.reduce((sum, grade) => sum + grade.totalScore, 0) / chiliGrades.length 
                  : 0;

                return (
                  <div key={chili.id} className="bg-gradient-to-r from-white to-gray-50 rounded-xl p-6 border-l-4 border-trinity-red shadow-md">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-trinity-red text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-bold text-xl text-gray-800">{chili.chiliName}</h3>
                          <p className="text-trinity-blue font-medium">{chili.competitorName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {chili.isWinner && <span className="winner-badge">🏆 WINNER</span>}
                        <button
                          onClick={() => handleDeleteChili(chili.id)}
                          className="bg-red-100 text-red-600 px-3 py-1 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                          disabled={submitting}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Heat Level</p>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{'🌶️'.repeat(chili.spicinessLevel)}</span>
                          <span className="text-sm font-medium text-gray-600">Level {chili.spicinessLevel}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Grades</p>
                        <p className="text-lg font-medium text-gray-800">{chiliGrades.length} judges</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Average Score</p>
                        <p className="text-lg font-medium text-gray-800">
                          {averageScore > 0 ? `${averageScore.toFixed(1)}/25` : 'Not graded'}
                        </p>
                      </div>
                    </div>
                    

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="card">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold mb-2">Competition Results</h2>
              <p className="text-gray-600">Rankings based on average scores from all judges</p>
            </div>

            <div className="space-y-4">
              {results.map((chili, index) => (
                <div key={chili.id} className={`rounded-xl p-6 border-2 ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-400' :
                  index === 1 ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-400' :
                  index === 2 ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-400' :
                  'bg-white border-gray-200'
                }`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        index === 0 ? 'bg-yellow-400 text-yellow-900' :
                        index === 1 ? 'bg-gray-400 text-gray-900' :
                        index === 2 ? 'bg-orange-400 text-orange-900' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-xl">{chili.chiliName}</h3>
                        <p className="text-gray-600">{chili.competitorName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-trinity-red">
                        {chili.averageScore.toFixed(1)}/25
                      </div>
                      <p className="text-sm text-gray-600">{chili.gradeCount} judges</p>
                      <div className="mt-2 flex gap-2">
                        {!chili.isWinner && (
                          <button
                            onClick={() => handleDeclareWinner(chili.id)}
                            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                            disabled={submitting}
                          >
                            🏆 Declare Winner
                          </button>
                        )}
                        {chili.isWinner && (
                          <span className="winner-badge">🏆 CURRENT WINNER</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Chili Tab */}
        {activeTab === 'add' && (
          <div className="card max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">➕</div>
              <h2 className="text-2xl font-bold mb-2">Add New Chili</h2>
              <p className="text-gray-600">Register a new chili entry to the competition</p>
            </div>

            <form onSubmit={handleAddChili} className="space-y-6">
              <div className="form-group">
                <label className="form-label">Competitor&apos;s Name</label>
                <input
                  type="text"
                  value={newChili.competitorName}
                  onChange={(e) => setNewChili(prev => ({ ...prev, competitorName: e.target.value }))}
                  className="form-input"
                  required
                  placeholder="Enter competitor's name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Chili Name</label>
                <input
                  type="text"
                  value={newChili.chiliName}
                  onChange={(e) => setNewChili(prev => ({ ...prev, chiliName: e.target.value }))}
                  className="form-input"
                  required
                  placeholder="Enter chili name"
                />
              </div>



              <div className="form-group">
                <label className="form-label">Spiciness Level</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={newChili.spicinessLevel}
                  onChange={(e) => setNewChili(prev => ({ ...prev, spicinessLevel: parseInt(e.target.value) }))}
                  className="grade-slider"
                />
                <div className="text-center mt-4 p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl mb-2">
                    {'🌶️'.repeat(newChili.spicinessLevel)}
                  </div>
                  <div className="font-semibold text-gray-700">
                    {newChili.spicinessLevel === 1 && 'Mild & Gentle'}
                    {newChili.spicinessLevel === 2 && 'Medium Heat'}
                    {newChili.spicinessLevel === 3 && 'Hot & Spicy'}
                    {newChili.spicinessLevel === 4 && 'Very Hot'}
                    {newChili.spicinessLevel === 5 && 'EXTREME FIRE!'}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`btn-primary w-full text-lg py-4 ${submitting ? 'loading' : ''}`}
              >
                {submitting ? 'Adding Chili...' : '🌶️ Add Chili to Competition'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
