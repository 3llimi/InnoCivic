import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Input } from '../components/forms/Input';
import { SubmitButton } from '../components/forms/SubmitButton';
import { Alert } from '../components/feedback/Alert';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail()) {
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Password reset requested for:', email);

      // Show success message
      setEmailSent(true);
    } catch (error) {
      console.error('Password reset error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="We've sent password reset instructions"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
              <svg
                className="h-8 w-8 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              We've sent password reset instructions to
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
              {email}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Didn't receive the email? Check your spam folder or try again.
            </p>
          </div>

          <div className="space-y-3">
            <SubmitButton
              type="button"
              onClick={() => setEmailSent(false)}
              className="w-full"
              variant="secondary"
            >
              Resend email
            </SubmitButton>

            <div className="text-center">
              <Link
                to="/innocivic/login"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email address and we'll send you instructions to reset your password"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert
            type="error"
            title="Error"
            message={error}
          />
        )}

        <div>
          <Input
            type="email"
            label="Email address"
            placeholder="Enter your email"
            value={email}
            onChange={(value) => {
              setEmail(value);
              if (error) setError('');
            }}
            error={error}
            required
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Enter the email address associated with your account
          </p>
        </div>

        <div>
          <SubmitButton
            type="submit"
            loading={loading}
            className="w-full"
          >
            Send reset instructions
          </SubmitButton>
        </div>

        <div className="text-center">
          <Link
            to="/innocivic/login"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Back to sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
