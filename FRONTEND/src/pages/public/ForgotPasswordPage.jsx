import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, KeyRound, Lock, ArrowLeft, CheckCircle, ShieldCheck } from 'lucide-react';
import authService from '../../services/authService';
import InputField from '../../components/forms/InputField';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await authService.forgotPassword(email);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await authService.verifyOTP(email, otp);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    try {
      setLoading(true);
      setError('');
      await authService.resetPassword(email, otp, password);
      setSuccess(true);
      setTimeout(() => navigate('/account'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-outfit">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-2xl shadow-2xl border border-gray-100 animate-fade-in relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
          <div 
            className="h-full bg-parking-primary transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {success ? (
          <div className="text-center space-y-6 py-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-short">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Success!</h2>
            <p className="text-gray-600">
              Your password has been successfully reset. Redirecting you to login...
            </p>
            <div className="pt-4">
              <Link to="/account" className="btn-primary w-full inline-block py-3">
                Go to Login
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center">
              <div className="w-16 h-16 bg-parking-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                {step === 1 && <Mail className="w-8 h-8 text-parking-primary" />}
                {step === 2 && <ShieldCheck className="w-8 h-8 text-parking-primary" />}
                {step === 3 && <Lock className="w-8 h-8 text-parking-primary" />}
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                {step === 1 && 'Forgot Password?'}
                {step === 2 && 'Verify OTP'}
                {step === 3 && 'New Password'}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {step === 1 && "Enter your email and we'll send you a 6-digit code."}
                {step === 2 && `We've sent a 6-digit code to ${email}`}
                {step === 3 && 'Set your new secure password below.'}
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={
              step === 1 ? handleSendOTP : 
              step === 2 ? handleVerifyOTP : 
              handleResetPassword
            }>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded text-red-700 text-sm animate-shake">
                  {error}
                </div>
              )}
              
              {step === 1 && (
                <InputField
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <InputField
                    label="6-Digit Code"
                    type="text"
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    placeholder="Enter OTP"
                    className="text-center text-2xl tracking-[1em] font-mono"
                  />
                  <div className="text-center">
                    <button 
                      type="button" 
                      onClick={() => setStep(1)}
                      className="text-xs text-parking-primary hover:underline"
                    >
                      Wrong email? Change it
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <InputField
                    label="New Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Min. 6 characters"
                  />
                  <InputField
                    label="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat new password"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 shadow-lg hover:shadow-parking-primary/20 transition-all"
              >
                {loading ? 'Processing...' : (
                  step === 1 ? 'Send Code' : 
                  step === 2 ? 'Verify Code' : 
                  'Reset Password'
                )}
              </button>

              <div className="text-center">
                <Link
                  to="/account"
                  className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-parking-primary transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
