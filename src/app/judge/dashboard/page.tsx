'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getChilis, getGradesByJudge, addGrade, updateGrade } from '@/lib/database';
import { Chili, Grade, GradeFormData } from '@/types';

export default function JudgeDashboard() {
  const [chilis, setChilis] = useState<Chili[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChili, setSelectedChili] = useState<Chili | null>(null);
  const [gradeForm, setGradeForm] = useState<GradeFormData>({
    taste: 3,
    presentation: 3,
    aroma: 3,
    uniqueness: 3,
    texture: 3
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { user, signOut } = useAuth();
  const router = useRouter();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [chilisData, gradesData] = await Promise.all([
        getChilis(),
        getGradesByJudge(user?.uid || '')
      ]);
      setChilis(chilisData);
      setGrades(gradesData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (!user) {
      router.push('/judge/login');
      return;
    }
    loadData();
  }, [user, router, loadData]);

  const handleChiliSelect = (chili: Chili) => {
    setSelectedChili(chili);
    setError('');
    
    // Check if this chili has already been graded by this judge
    const existingGrade = grades.find(grade => grade.chiliId === chili.id);
    if (existingGrade) {
      setGradeForm({
        taste: existingGrade.taste,
        presentation: existingGrade.presentation,
        aroma: existingGrade.aroma,
        uniqueness: existingGrade.uniqueness,
        texture: existingGrade.texture
      });
    } else {
      setGradeForm({
        taste: 3,
        presentation: 3,
        aroma: 3,
        uniqueness: 3,
        texture: 3
      });
    }
  };

  const handleGradeChange = (category: keyof GradeFormData, value: number) => {
    setGradeForm(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSubmitGrade = async () => {
    if (!selectedChili || !user) return;

    setSubmitting(true);
    setError('');

    try {
      const existingGrade = grades.find(grade => grade.chiliId === selectedChili.id);
      
      if (existingGrade) {
        // Update existing grade
        await updateGrade(existingGrade.id, gradeForm);
      } else {
        // Add new grade
        await addGrade({
          ...gradeForm,
          chiliId: selectedChili.id,
          judgeId: user.uid
        });
      }

      // Reload grades
      await loadData();
      setSelectedChili(null);
      
    } catch (error) {
      console.error('Error submitting grade:', error);
      setError('Failed to submit grade. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getGradeForChili = (chiliId: string) => {
    return grades.find(grade => grade.chiliId === chiliId);
  };

  const getTotalScore = () => {
    return gradeForm.taste + gradeForm.presentation + gradeForm.aroma + 
           gradeForm.uniqueness + gradeForm.texture;
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-trinity-red mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading judge dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="card mb-8">
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
                <h1 className="text-3xl font-bold">Judge Dashboard</h1>
                <p className="text-gray-600">Welcome, {user?.displayName || user?.email}</p>
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

        {error && (
          <div className="card mb-8 bg-red-50 border-red-200">
            <div className="error-message">
              <span className="text-xl mr-2">⚠️</span>
              {error}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Chilis List */}
          <div className="card">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🌶️</div>
              <h2 className="text-2xl font-bold mb-2">Chilis to Judge</h2>
              <p className="text-gray-600">Select a chili to grade</p>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {chilis.map((chili, index) => {
                const existingGrade = getGradeForChili(chili.id);
                return (
                  <div
                    key={chili.id}
                    onClick={() => handleChiliSelect(chili)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      selectedChili?.id === chili.id
                        ? 'border-trinity-red bg-red-50'
                        : existingGrade
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-trinity-red hover:bg-red-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="bg-trinity-red text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <h3 className="font-bold text-lg">{chili.chiliName}</h3>
                      </div>
                      {existingGrade && (
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 font-semibold">✓ Graded</span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                            {existingGrade.totalScore}/25
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Heat Level</p>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{'🌶️'.repeat(chili.spicinessLevel)}</span>
                          <span className="text-sm font-medium text-gray-600">Level {chili.spicinessLevel}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Ingredients</p>
                      <p className="text-gray-700 text-sm leading-relaxed">{chili.ingredients}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grading Form */}
          <div className="card">
            {selectedChili ? (
              <>
                <div className="text-center mb-6">
                  <div className="text-4xl mb-4">📝</div>
                  <h2 className="text-2xl font-bold mb-2">Grade Chili</h2>
                  <p className="text-gray-600">Rate each category from 1-5</p>
                  <h3 className="text-xl font-semibold text-trinity-red mt-4">{selectedChili.chiliName}</h3>
                </div>

                <div className="space-y-6">
                  {Object.entries(gradeForm).map(([category, value]) => (
                    <div key={category} className="form-group">
                      <label className="form-label capitalize">
                        {category === 'uniqueness' ? 'Uniqueness' : category}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={value}
                        onChange={(e) => handleGradeChange(category as keyof GradeFormData, parseInt(e.target.value))}
                        className="grade-slider"
                      />
                      <div className="flex justify-between text-sm text-gray-600 mt-2">
                        <span>Poor (1)</span>
                        <span className="font-semibold text-lg text-trinity-red">{value}</span>
                        <span>Excellent (5)</span>
                      </div>
                    </div>
                  ))}

                  <div className="bg-gray-50 p-6 rounded-xl text-center">
                    <p className="text-lg font-semibold text-gray-700 mb-2">Total Score</p>
                    <p className="text-4xl font-bold text-trinity-red">{getTotalScore()}/25</p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setSelectedChili(null)}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitGrade}
                      disabled={submitting}
                      className={`btn-primary flex-1 ${submitting ? 'loading' : ''}`}
                    >
                      {submitting ? 'Submitting...' : grades.find(g => g.chiliId === selectedChili.id) ? 'Update Grade' : 'Submit Grade'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Select a Chili to Grade</h2>
                <p className="text-gray-600">Choose a chili from the list to start grading</p>
              </div>
            )}
          </div>
        </div>

        {/* Grading Summary */}
        <div className="card mt-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-2xl font-bold mb-2">Your Grading Progress</h2>
            <p className="text-gray-600">Track your judging progress</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-blue-50 p-6 rounded-xl">
              <div className="text-3xl font-bold text-blue-600">{chilis.length}</div>
              <p className="text-blue-800 font-medium">Total Chilis</p>
            </div>
            <div className="bg-green-50 p-6 rounded-xl">
              <div className="text-3xl font-bold text-green-600">{grades.length}</div>
              <p className="text-green-800 font-medium">Graded</p>
            </div>
            <div className="bg-orange-50 p-6 rounded-xl">
              <div className="text-3xl font-bold text-orange-600">{chilis.length - grades.length}</div>
              <p className="text-orange-800 font-medium">Remaining</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
