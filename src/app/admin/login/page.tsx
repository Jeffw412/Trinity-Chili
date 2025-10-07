'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn(email, password);
      router.push('/admin/dashboard');
    } catch (error: unknown) {
      setError('Invalid email or password');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full">
        <div className="card trinity-bg-blue glass-effect hover-lift">
          <div className="text-center mb-8">
            <div className="hover-lift">
              <Image
                src="/TC+Logo+with+lettering+extra+whitespace.webp"
                alt="Trinity Logo"
                width={250}
                height={150}
                className="logo-large mx-auto mb-6"
              />
            </div>
            <div className="text-4xl mb-4">⚙️</div>
            <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Admin Dashboard</h2>
            <p className="text-lg text-blue-100">Competition Management System</p>
          </div>

          <div className="bg-white bg-opacity-95 rounded-xl p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Administrator Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    placeholder="Enter your admin email"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              {error && (
                <div className="error-message text-center bg-red-50 p-4 rounded-xl">
                  <span className="text-xl mr-2">⚠️</span>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`btn-primary w-full text-lg py-4 ${loading ? 'loading' : ''}`}
              >
                {loading ? 'Authenticating...' : '🔐 Access Admin Dashboard'}
              </button>

              <div className="text-center space-y-4">
                <Link href="/" className="btn-secondary inline-flex items-center">
                  <span className="mr-2">←</span>
                  Back to Competition
                </Link>
              </div>

              <div className="text-center bg-blue-50 p-6 rounded-xl">
                <p className="text-sm font-semibold text-blue-800 mb-2">Demo Credentials</p>
                <div className="space-y-1 text-sm text-blue-600">
                  <p><strong>Email:</strong> admin@trinity.com</p>
                  <p><strong>Password:</strong> Admin2025</p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
