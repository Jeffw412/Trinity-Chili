'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Chili } from '@/types';
import { getChilis } from '@/lib/database';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const [chilis, setChilis] = useState<Chili[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [competitorName, setCompetitorName] = useState('');
  const [chiliName, setChiliName] = useState('');
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
        competitorName,
        chiliName,
        spicinessLevel,
        createdAt: Timestamp.now(),
        isWinner: false
      });

      // Reset form
      setCompetitorName('');
      setChiliName('');
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



  const winner = chilis.find(chili => chili.isWinner);
  const secondPlace = chilis.find(chili => chili.isSecondPlace);
  const thirdPlace = chilis.find(chili => chili.isThirdPlace);

  // Helper function to check if a chili is in top 3
  const isInTopThree = (chili: Chili) => {
    return chili.isWinner || chili.isSecondPlace || chili.isThirdPlace;
  };

  return (
    <div className="min-h-screen py-4 md:py-12">
      <div className="max-w-6xl mx-auto px-4 md:px-6 container">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="hover-lift">
            <Image
              src="/TC+Logo+with+lettering+extra+whitespace.webp"
              alt="Trinity Logo"
              width={300}
              height={180}
              className="logo-large mx-auto mb-8"
            />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">🌶️ Trinity Chili Cook-off 2025 🌶️</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
            Join the ultimate culinary competition! Register your signature chili recipe and compete for the championship title.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <div className="bg-white px-4 py-2 md:px-6 md:py-3 rounded-full shadow-md hover-lift">
              <span className="text-trinity-red font-semibold text-sm md:text-base">🏆 Annual Competition</span>
            </div>
            <div className="bg-white px-4 py-2 md:px-6 md:py-3 rounded-full shadow-md hover-lift">
              <span className="text-trinity-blue font-semibold text-sm md:text-base">🌶️ All Spice Levels</span>
            </div>
            <div className="bg-white px-4 py-2 md:px-6 md:py-3 rounded-full shadow-md hover-lift">
              <span className="text-trinity-gold font-semibold text-sm md:text-base">🥇 Prizes Awarded</span>
            </div>
          </div>
        </div>

        {/* Winner Announcement */}
        {winner && (
          <div className="card mb-12 text-center trinity-bg-gold glass-effect border-4 border-yellow-400">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">CHAMPION ANNOUNCED!</h2>
            <div className="bg-white bg-opacity-90 rounded-xl p-6 mx-auto max-w-md">
              <p className="text-2xl font-bold text-gray-800">
                <span className="text-trinity-red">{winner.competitorName}</span>
              </p>
              <p className="text-lg text-gray-600 mt-2">
                wins with <strong className="text-trinity-blue">&quot;{winner.chiliName}&quot;</strong>!
              </p>
            </div>
          </div>
        )}

        {/* Top 3 Podium Display */}
        {winner && secondPlace && thirdPlace && (
          <div className="card mb-12">
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">🏆🥈🥉</div>
              <h2 className="text-2xl font-bold mb-2">Final Rankings</h2>
              <p className="text-gray-600">Top 3 Finishers</p>
            </div>

            <div className="flex justify-center items-end gap-4 max-w-4xl mx-auto">
              {/* 2nd Place */}
              <div className="text-center">
                <div className="bg-gradient-to-t from-gray-300 to-gray-400 rounded-t-lg p-6 mb-4 shadow-lg border-2 border-gray-300">
                  <div className="text-4xl mb-2">🥈</div>
                  <div className="text-lg font-bold text-gray-800">{secondPlace.competitorName}</div>
                  <div className="text-sm text-gray-600 mt-1">&quot;{secondPlace.chiliName}&quot;</div>
                </div>
                <div className="bg-gray-400 text-white font-bold py-2 px-4 rounded-b-lg">
                  2nd Place
                </div>
              </div>

              {/* 1st Place */}
              <div className="text-center">
                <div className="bg-gradient-to-t from-yellow-300 to-yellow-400 rounded-t-lg p-8 mb-4 shadow-xl border-4 border-yellow-400 transform scale-110">
                  <div className="text-6xl mb-3">🏆</div>
                  <div className="text-xl font-bold text-yellow-900">{winner.competitorName}</div>
                  <div className="text-sm text-yellow-800 mt-1">&quot;{winner.chiliName}&quot;</div>
                </div>
                <div className="bg-yellow-500 text-yellow-900 font-bold py-3 px-6 rounded-b-lg text-lg">
                  CHAMPION
                </div>
              </div>

              {/* 3rd Place */}
              <div className="text-center">
                <div className="bg-gradient-to-t from-amber-600 to-amber-700 rounded-t-lg p-6 mb-4 shadow-lg border-2 border-amber-600">
                  <div className="text-4xl mb-2">🥉</div>
                  <div className="text-lg font-bold text-amber-100">{thirdPlace.competitorName}</div>
                  <div className="text-sm text-amber-200 mt-1">&quot;{thirdPlace.chiliName}&quot;</div>
                </div>
                <div className="bg-amber-700 text-amber-100 font-bold py-2 px-4 rounded-b-lg">
                  3rd Place
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Registration Form */}
          <div className="card hover-lift fade-in">
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">🌶️</div>
              <h2 className="text-3xl font-bold mb-2">Register Your Chili</h2>
              <p className="text-gray-600">Submit your signature recipe to the competition</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-group">
                <label className="form-label">Competitor&apos;s Name</label>
                <input
                  type="text"
                  value={competitorName}
                  onChange={(e) => setCompetitorName(e.target.value)}
                  className="form-input"
                  required
                  placeholder="Enter your name"
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
                <label className="form-label">Spiciness Level</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={spicinessLevel}
                  onChange={(e) => setSpicinessLevel(parseInt(e.target.value))}
                  className="grade-slider"
                />
                <div className="text-center mt-4 p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl mb-2">
                    {spicinessLevel === 1 && '🌶️'}
                    {spicinessLevel === 2 && '🌶️🌶️'}
                    {spicinessLevel === 3 && '🌶️🌶️🌶️'}
                    {spicinessLevel === 4 && '🌶️🌶️🌶️🌶️'}
                    {spicinessLevel === 5 && '🌶️🌶️🌶️🌶️🌶️'}
                  </div>
                  <div className="font-semibold text-gray-700">
                    {spicinessLevel === 1 && 'Mild & Gentle'}
                    {spicinessLevel === 2 && 'Medium Heat'}
                    {spicinessLevel === 3 && 'Hot & Spicy'}
                    {spicinessLevel === 4 && 'Very Hot'}
                    {spicinessLevel === 5 && 'EXTREME FIRE!'}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`btn-primary w-full text-lg py-4 ${loading ? 'loading' : ''}`}
              >
                {loading ? 'Registering Your Chili...' : '🚀 Register My Chili'}
              </button>
            </form>
          </div>

          {/* Registered Chilis */}
          <div className="card hover-lift fade-in">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🌶️</div>
              <h2 className="text-2xl font-bold mb-2">Registered Chilis</h2>
              <p className="text-gray-600">See who&apos;s competing in the cook-off</p>
              <div className="mt-4 text-sm text-gray-500">
                <span className="font-semibold">{chilis.length}</span> chilis registered
              </div>
            </div>

            {chilis.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🍽️</div>
                <p className="text-gray-500 text-lg">No chilis registered yet!</p>
                <p className="text-gray-400">Be the first to enter the competition</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-trinity-red scrollbar-track-gray-100 pr-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
                  {chilis.map((chili, index) => (
                    <div
                      key={chili.id}
                      className={`
                        group relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer
                        hover:scale-[1.02] hover:shadow-xl transform-gpu
                        ${chili.isWinner
                          ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300 shadow-lg ring-2 ring-yellow-200'
                          : chili.isSecondPlace
                          ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300 shadow-lg ring-2 ring-gray-200'
                          : chili.isThirdPlace
                          ? 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300 shadow-lg ring-2 ring-amber-200'
                          : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-trinity-red hover:shadow-lg'
                        }
                      `}
                    >
                      {chili.isWinner && (
                        <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 rounded-full p-1 shadow-lg">
                          <span className="text-lg">🏆</span>
                        </div>
                      )}
                      {chili.isSecondPlace && (
                        <div className="absolute -top-2 -right-2 bg-gray-400 text-gray-900 rounded-full p-1 shadow-lg">
                          <span className="text-lg">🥈</span>
                        </div>
                      )}
                      {chili.isThirdPlace && (
                        <div className="absolute -top-2 -right-2 bg-amber-600 text-amber-100 rounded-full p-1 shadow-lg">
                          <span className="text-lg">🥉</span>
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-3">
                        <div className={`
                          flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white shadow-md
                          ${chili.isWinner
                            ? 'bg-yellow-500'
                            : chili.isSecondPlace
                            ? 'bg-gray-500'
                            : chili.isThirdPlace
                            ? 'bg-amber-600'
                            : 'bg-trinity-red'}
                        `}>
                          {index + 1}
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(chili.spicinessLevel, 5) }, (_, i) => (
                            <span key={i} className="text-lg">🌶️</span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className={`
                          font-bold text-lg leading-tight group-hover:text-trinity-red transition-colors
                          ${chili.isWinner
                            ? 'text-yellow-900'
                            : chili.isSecondPlace
                            ? 'text-gray-800'
                            : chili.isThirdPlace
                            ? 'text-amber-900'
                            : 'text-gray-800'}
                        `}>
                          {chili.chiliName || `Chili #${index + 1}`}
                        </h3>

                        <div className="flex items-center justify-between text-sm">
                          <span className={`
                            font-medium
                            ${chili.isWinner
                              ? 'text-yellow-800'
                              : chili.isSecondPlace
                              ? 'text-gray-700'
                              : chili.isThirdPlace
                              ? 'text-amber-800'
                              : 'text-gray-600'}
                          `}>
                            {isInTopThree(chili) ? chili.competitorName : 'Anonymous Chef'}
                          </span>
                          <span className={`
                            px-2 py-1 rounded-full text-xs font-medium
                            ${chili.isWinner
                              ? 'bg-yellow-200 text-yellow-800'
                              : chili.isSecondPlace
                              ? 'bg-gray-200 text-gray-700'
                              : chili.isThirdPlace
                              ? 'bg-amber-200 text-amber-800'
                              : 'bg-gray-100 text-gray-600'
                            }
                          `}>
                            Level {chili.spicinessLevel}
                          </span>
                        </div>
                      </div>

                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-trinity-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  ))}
                </div>

                {chilis.length > 6 && (
                  <div className="text-center mt-4 text-sm text-gray-500 bg-gray-50 rounded-lg py-2">
                    <span className="inline-flex items-center gap-2">
                      <span>↕️</span>
                      Scroll to see all {chilis.length} registered chilis
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <div className="text-center mt-16">
          <div className="card glass-effect max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Competition Officials</h3>
            <p className="text-gray-600 mb-8">Access the judging and administration portals</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/judge/login" className="btn-secondary hover-lift">
                <span className="text-2xl mr-2">👨‍⚖️</span>
                Judge Portal
              </Link>
              <Link href="/admin/login" className="btn-primary hover-lift">
                <span className="text-2xl mr-2">⚙️</span>
                Admin Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 py-8 border-t border-gray-200">
          <p className="text-gray-500">
            © 2025 Trinity College Chili Cook-off • Made with ❤️ and 🌶️
          </p>
        </div>
      </div>
    </div>
  );
}
