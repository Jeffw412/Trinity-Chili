'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Chili, Grade, GradeFormData } from '@/types';
import { getChilis, getGradesByJudge, addGrade, updateGrade } from '@/lib/database';

export default function GradeChili() {
  const [chili, setChili] = useState<Chili | null>(null);
  const [existingGrade, setExistingGrade] = useState<Grade | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<GradeFormData>({
    taste: 1,
    presentation: 1,
    aroma: 1,
    uniqueness: 1,
    texture: 1
  });

  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const chiliId = params.chiliId as string;

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
  }, [user, router, chiliId]);

  const loadData = async () => {
    try {
      const [chilisData, gradesData] = await Promise.all([
        getChilis(),
        user ? getGradesByJudge(user.uid) : []
      ]);

      const foundChili = chilisData.find(c => c.id === chiliId);
      if (!foundChili) {
        router.push('/judge/dashboard');
        return;
      }

      const existingGradeData = gradesData.find(grade => grade.chiliId === chiliId);
      
      setChili(foundChili);
      setExistingGrade(existingGradeData || null);
      
      if (existingGradeData) {
        setFormData({
          taste: existingGradeData.taste,
          presentation: existingGradeData.presentation,
          aroma: existingGradeData.aroma,
          uniqueness: existingGradeData.uniqueness,
          texture: existingGradeData.texture
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !chili) return;

    setSubmitting(true);
    try {
      if (existingGrade) {
        await updateGrade(existingGrade.id, formData);
        alert('Grade updated successfully!');
      } else {
        await addGrade(chiliId, user.uid, formData);
        alert('Grade submitted successfully!');
      }
      router.push('/judge/dashboard');
    } catch (error) {
      console.error('Error submitting grade:', error);
      alert('Error submitting grade. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleScoreChange = (category: keyof GradeFormData, value: number) => {
    setFormData(prev => ({
      ...prev,
      [category]: value
    }));
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

  if (!chili) {
    return null;
  }

  const categories = [
    { key: 'taste' as keyof GradeFormData, label: 'Taste', description: 'Overall flavor and taste experience' },
    { key: 'presentation' as keyof GradeFormData, label: 'Presentation', description: 'Visual appeal and appearance' },
    { key: 'aroma' as keyof GradeFormData, label: 'Aroma', description: 'Smell and fragrance' },
    { key: 'uniqueness' as keyof GradeFormData, label: 'Uniqueness', description: 'Creativity and originality' },
    { key: 'texture' as keyof GradeFormData, label: 'Texture', description: 'Consistency and mouthfeel' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-red-600">
            {existingGrade ? 'Edit Grade' : 'Grade Chili'}
          </h1>
          <p className="text-gray-600">Chili: {chili.name}</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{chili.name}</h2>
            <p className="text-gray-600">Spiciness Level: {chili.spicinessLevel}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {categories.map((category) => (
              <div key={category.key} className="border border-gray-200 rounded-lg p-4">
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">{category.label}</h3>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 w-8">1</span>
                  <div className="flex space-x-2 flex-1">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => handleScoreChange(category.key, score)}
                        className={`w-12 h-12 rounded-full border-2 transition-colors ${
                          formData[category.key] >= score
                            ? 'bg-red-600 border-red-600 text-white'
                            : 'border-gray-300 text-gray-600 hover:border-red-300'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 w-8">5</span>
                </div>
                
                <div className="mt-2 text-center">
                  <span className="text-lg font-semibold text-red-600">
                    Score: {formData[category.key]}/5
                  </span>
                </div>
              </div>
            ))}

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Score</h3>
              <p className="text-2xl font-bold text-red-600">
                {Object.values(formData).reduce((sum, score) => sum + score, 0)}/25
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Submitting...' : (existingGrade ? 'Update Grade' : 'Submit Grade')}
              </button>
              
              <Link
                href="/judge/dashboard"
                className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
