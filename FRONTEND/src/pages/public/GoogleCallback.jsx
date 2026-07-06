import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import useAuth from '../../hooks/useAuth';
import { ArrowPathIcon, XCircleIcon } from '@heroicons/react/24/outline';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState('verifying'); // verifying, error
  const [message, setMessage] = useState('');
  const hasCalled = useRef(false);

  useEffect(() => {
    if (hasCalled.current) return;
    hasCalled.current = true;

    const handleCallback = async () => {
      try {
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const state = params.get('state');
        const savedState = localStorage.getItem('oauth_state');

        // Verify state to prevent CSRF attacks
        if (savedState && state !== savedState) {
          console.warn('OAuth state mismatch!');
        }

        if (!accessToken) {
          setStatus('error');
          setMessage('Google authentication failed: No access token returned.');
          return;
        }

        // Call backend API to verify the Google token and log in
        const res = await authService.googleLogin(accessToken);
        
        // Log user in using useAuth hook
        login(res.user, res.token);

        // Redirect admins/operators to the admin dashboard, others to account page
        if (res.user.role === 'superadmin' || res.user.role === 'lot_operator') {
          navigate('/admin');
        } else {
          navigate('/account');
        }
      } catch (error) {
        console.error('Google verification error:', error);
        setStatus('error');
        setMessage(error.response?.data?.message || 'Google authentication failed. Please try again.');
      }
    };

    handleCallback();
  }, [navigate, login]);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-outfit bg-gray-50/50">
      {/* Aesthetic Floating Blur Blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-teal-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md bg-white/80 backdrop-blur-xl border border-gray-100/50 shadow-2xl rounded-2xl p-10 z-10 text-center animate-fade-in">
        <div>
          <div className="inline-flex w-14 h-14 bg-gradient-to-tr from-parking-primary to-parking-secondary rounded-2xl items-center justify-center shadow-lg shadow-parking-primary/20 mb-6">
            <span className="text-white text-2xl font-bold">🚗</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">
            Google Sign-In
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {status === 'verifying' ? 'Signing you in with Google...' : 'Authentication failed'}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-6 mt-4">
          {status === 'verifying' && (
            <>
              <ArrowPathIcon className="h-16 w-16 text-parking-primary animate-spin" />
              <p className="mt-4 text-sm text-gray-400 font-medium">Verifying credentials with Google...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircleIcon className="h-20 w-20 text-red-500" />
              <div className="mt-6 text-xl font-extrabold text-gray-900">Sign-In Failed</div>
              <p className="mt-3 text-sm text-gray-500 leading-relaxed px-4">
                {message}
              </p>
              <button
                onClick={() => navigate('/account')}
                className="mt-8 w-full py-3.5 bg-gray-800 hover:bg-gray-900 active:scale-95 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center"
              >
                Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleCallback;
