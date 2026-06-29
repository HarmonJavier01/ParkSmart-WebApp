import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  const hasCalled = useRef(false);

  useEffect(() => {
    if (!token || hasCalled.current) return;
    hasCalled.current = true;

    const verifyToken = async () => {
      try {
        const response = await authService.verifyEmail(token);
        setStatus('success');
        setMessage(response.message);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/account');
        }, 3000);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
      }
    };

    verifyToken();
  }, [token, navigate]);

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
            Email Verification
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {status === 'verifying' ? 'Please wait while we verify your email address...' : 'Verification status update'}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-6 mt-4">
          {status === 'verifying' && (
            <>
              <ArrowPathIcon className="h-16 w-16 text-parking-primary animate-spin" />
              <p className="mt-4 text-sm text-gray-400 font-medium">Validating security token...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircleIcon className="h-20 w-20 text-emerald-500 animate-bounce" />
              <div className="mt-6 text-xl font-extrabold text-gray-900">{message || 'Verification Successful!'}</div>
              <p className="mt-3 text-sm text-gray-500 leading-relaxed px-2">
                Your email has been successfully verified. You can now access all driver features and manage your parking bookings.
              </p>
              <p className="mt-6 text-xs text-parking-primary font-bold italic animate-pulse">
                Redirecting you to login page in a few seconds...
              </p>
              <Link
                to="/account"
                className="mt-8 w-full py-3.5 bg-gradient-to-r from-parking-primary to-parking-secondary hover:brightness-110 active:scale-95 text-white font-bold rounded-xl shadow-lg shadow-parking-primary/20 transition-all flex items-center justify-center gap-2"
              >
                Go to Login
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircleIcon className="h-20 w-20 text-red-500" />
              <div className="mt-6 text-xl font-extrabold text-gray-900">Verification Failed</div>
              <p className="mt-3 text-sm text-gray-500 leading-relaxed px-4">
                {message || 'The verification link may be invalid, or it has expired after 24 hours.'}
              </p>
              <Link
                to="/account"
                className="mt-8 w-full py-3.5 bg-gray-800 hover:bg-gray-900 active:scale-95 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center"
              >
                Try Logging In / Registering
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
