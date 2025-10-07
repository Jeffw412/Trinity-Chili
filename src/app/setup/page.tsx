'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function SetupPage() {
  const [loading, setLoading] = useState(true);
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupResult, setSetupResult] = useState<string | null>(null);

  useEffect(() => {
    setLoading(false);
  }, []);

  const runSetup = async () => {
    setSetupLoading(true);
    setSetupResult(null);

    try {
      // Import the setup function dynamically to avoid build issues
      const { setupFirebaseDatabase } = await import('@/lib/setup');
      const result = await setupFirebaseDatabase();
      setSetupResult(result.success ? 'Setup completed successfully!' : `Setup failed: ${result.message}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setSetupResult(`Setup failed: ${errorMessage}`);
    } finally {
      setSetupLoading(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/TC+Logo+with+lettering+extra+whitespace.webp"
              alt="Trinity College Logo"
              width={200}
              height={120}
              className="object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-blue-600 mb-2">Trinity Chili Cookoff 2025</h1>
          <h2 className="text-2xl font-semibold text-gray-700">Database Setup</h2>
        </div>

        {/* Setup Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Automatic Database Setup</h3>
          <p className="text-gray-600 mb-4">
            Click the button below to automatically set up your Firebase database with:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1">
            <li>User accounts and roles for judges and admins</li>
            <li>Firestore collections (users, chilis, grades)</li>
            <li>Sample chili data for testing</li>
            <li>Proper security permissions</li>
          </ul>

          <button
            onClick={runSetup}
            disabled={setupLoading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-semibold"
          >
            {setupLoading ? 'Setting up database...' : '🚀 Setup Database Now'}
          </button>
        </div>

        {/* Users that will be created */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">User Accounts That Will Be Created</h3>
          <div className="space-y-2 text-sm">
            <div><strong>jeffw412@aol.com</strong> - Password: Chili2025 - Role: Judge</div>
            <div><strong>admin@trinity.com</strong> - Password: Admin2025 - Role: Admin</div>
            <div><strong>judge1@trinity.com</strong> - Password: Judge2025 - Role: Judge</div>
            <div><strong>judge2@trinity.com</strong> - Password: Judge2025 - Role: Judge</div>
          </div>
        </div>

        {/* Setup Result */}
        {setupResult && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold mb-4 text-blue-800">Setup Result</h3>
            <p className="text-blue-700">{setupResult}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="text-center space-x-4">
          <Link
            href="/"
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to Main Page
          </Link>
          <Link
            href="/judge/login"
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Judge Login
          </Link>
          <Link
            href="/admin/login"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}
