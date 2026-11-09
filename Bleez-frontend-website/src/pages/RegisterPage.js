import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { IMG } from '../data/travelImages';
import AuthLayout, { SocialButtons, OrDivider } from '../components/AuthLayout';
import { Mail, Lock, User, Loader2, AlertCircle, Eye, EyeOff, ArrowRight, MapPin, Plane as PlaneIcon } from 'lucide-react';
import { toast } from 'sonner';


const FloatingCards = () => (
  <>
    <div className="absolute top-10 right-10 z-10 w-64 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/25 p-4 text-white shadow-2xl">
      <div className="flex items-center gap-3 mb-3">
        <span className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><PlaneIcon className="w-5 h-5" /></span>
        <div>
          <p className="text-sm font-semibold">Maldives · 6 days</p>
          <p className="text-xs text-white/75">AI itinerary ready</p>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-white/20 overflow-hidden"><div className="h-full w-4/5 rounded-full bg-[#E8A33D]" /></div>
    </div>
    <div className="absolute top-44 right-24 z-10 flex items-center gap-3 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/25 px-4 py-3 text-white shadow-2xl">
      <span className="w-9 h-9 rounded-full bg-emerald-400/90 flex items-center justify-center"><MapPin className="w-4 h-4 text-white" /></span>
      <div>
        <p className="text-sm font-semibold">50+ destinations</p>
        <p className="text-xs text-white/75">Curated for you</p>
      </div>
    </div>
  </>
);

const fieldClass =
  'w-full h-12 rounded-xl border border-border bg-background pl-12 pr-4 text-sm text-foreground placeholder:text-muted-foreground/70 transition-all focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, googleLogin, facebookLogin, linkedinLogin, instagramLogin } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await register(name, email, password);
      toast.success('Account created successfully!');
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
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
        toast.success('Account created successfully!');
        navigate('/my-trips');
      }
    } catch (err) {
      console.error(`${provider} login error:`, err);
      toast.error(`${provider} sign-up failed. Please try again.`);
    }
    setSocialLoading(null);
  };

  const strength = Math.min(4, (password.length >= 6) + (password.length >= 10) + /[A-Z]/.test(password) + /[0-9!@#$%^&*]/.test(password));
  const strengthColors = ['bg-border', 'bg-red-500', 'bg-amber-500', 'bg-lime-500', 'bg-emerald-500'];

  return (
    <AuthLayout
      testId="register-page"
      variant="split"
      floating={<FloatingCards />}
      image={IMG.maldives(1600)}
      headline="Plan less. Travel more."
      tagline="Create your free account and let Bleez.AI build trips you'll actually want to take."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline" data-testid="register-login-link">
            Sign in
          </Link>
        </>
      }
    >
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-1.5">Join Bleez</h1>
        <p className="text-muted-foreground">Create your account and start exploring.</p>
      </div>

      <SocialButtons idPrefix="register" socialLoading={socialLoading} onSelect={handleSocialLogin} />
      <OrDivider />

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div role="alert" className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">Full name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className={fieldClass}
              required
              data-testid="register-name"
            />
          </div>
        </div>

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
              data-testid="register-email"
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className={`${fieldClass} pr-12`}
              required
              data-testid="register-password"
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
          <div className="flex gap-1.5 pt-1" aria-hidden="true">
            {[1, 2, 3, 4].map((i) => (
              <span key={i} className={`h-1 flex-1 rounded-full transition-colors ${strength >= i ? strengthColors[strength] : 'bg-border'}`} />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          data-testid="register-submit"
          className="group w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Creating account...
            </>
          ) : (
            <>
              Create Account <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
