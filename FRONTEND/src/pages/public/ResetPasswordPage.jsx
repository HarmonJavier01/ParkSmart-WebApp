import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import authService from '../../services/authService';
import InputField from '../../components/forms/InputField';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, success, error
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setLoading(true);
      setError('');
      await authService.resetPassword(token, password);
      setStatus('success');
      
      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/account');
      }, 3000);
    } catch (err) {
      setStatus('error');
      setError(err.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-2xl shadow-xl border border-gray-100 animate-fade-in text-center">
        {status === 'success' ? (
          <div className="space-y-6 py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Password Reset Successful!</h2>
            <p className="text-gray-600">
              Your password has been updated. You can now log in with your new password.
            </p>
            <p className="text-xs text-parking-primary font-medium italic animate-pulse">
              Redirecting to login page...
            </p>
            <div className="pt-6">
              <Link to="/account" className="w-full btn-primary inline-block py-3">
                Go to Login
              </Link>
            </div>
          </div>
        ) : status === 'error' ? (
          <div className="space-y-6 py-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Reset Link Invalid</h2>
            <p className="text-gray-600">{error}</p>
            <div className="pt-6 flex flex-col gap-4">
              <Link to="/forgot-password" title="Request new link" className="w-full btn-primary py-3">
                Request New Link
              </Link>
              <Link to="/account" className="w-full btn-secondary py-3">
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div>
              <div className="w-16 h-16 bg-parking-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-parking-primary" />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Reset Password
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Please enter your new password below.
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded text-red-700 text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <InputField
                  label="New Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Minimum 6 characters"
                />
                <InputField
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repeat your new password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3"
              >
                {loading ? 'Updating password...' : 'Reset Password'}
              </button>

              <div className="text-center">
                <Link
                  to="/account"
                  className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-parking-primary transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Cancel and Login
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
