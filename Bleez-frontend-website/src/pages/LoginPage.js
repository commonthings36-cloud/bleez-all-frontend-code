import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { IMG } from '../data/travelImages';
import AuthLayout, { SocialButtons, OrDivider } from '../components/AuthLayout';
import { Mail, Lock, Loader2, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const fieldClass =
  'w-full h-12 rounded-xl border border-border bg-background pl-12 pr-4 text-sm text-foreground placeholder:text-muted-foreground/70 transition-all focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, googleLogin, facebookLogin, linkedinLogin, instagramLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/my-trips');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const providers = {
    google: googleLogin,
    facebook: facebookLogin,
    linkedin: linkedinLogin,
    instagram: instagramLogin,
  };

  const handleSocialLogin = async (provider) => {
    setSocialLoading(provider);
    try {
      const result = await providers[provider]();
      if (result?.error === 'coming_soon') {
        toast.info(result.message, { icon: '🚀', duration: 3000 });
      } else if (result?.error === 'cancelled') {
        // User cancelled, do nothing
      } else if (result && !result.error) {
        toast.success('Welcome! You are now signed in.');
        navigate('/my-trips');
      }
    } catch (err) {
      console.error(`${provider} login error:`, err);
      toast.error(`${provider} sign-in failed. Please try again.`);
    }
    setSocialLoading(null);
  };

  return (
    <AuthLayout
      testId="login-page"
      variant="center"
      image={IMG.paris(1600)}
      headline="Your next adventure starts here."
      tagline="Sign in to pick up your trips, wishlists and plans right where you left off."
      footer={
        <>
          {"Don't have an account? "}
          <Link to="/register" className="font-semibold text-primary hover:underline" data-testid="login-register-link">
            Create one
          </Link>
        </>
      }
    >
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-1.5">Welcome back</h1>
        <p className="text-muted-foreground">Sign in to continue your journey.</p>
      </div>

      <SocialButtons idPrefix="login" socialLoading={socialLoading} onSelect={handleSocialLogin} />
      <OrDivider />

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div role="alert" className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={fieldClass}
              required
              data-testid="login-email"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className={`${fieldClass} pr-12`}
              required
              data-testid="login-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          data-testid="login-submit"
          className="group w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Signing in...
            </>
          ) : (
            <>
              Sign In <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
