import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { IMG } from '../data/travelImages';
import { Navbar } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Plane, Mail, Lock, User, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// Social Media Icons
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 mr-3">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 mr-3" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 mr-3" fill="#0A66C2">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 mr-3">
    <defs>
      <linearGradient id="ig-gradient-reg" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FFDC80"/>
        <stop offset="25%" stopColor="#F77737"/>
        <stop offset="50%" stopColor="#E1306C"/>
        <stop offset="75%" stopColor="#C13584"/>
        <stop offset="100%" stopColor="#833AB4"/>
      </linearGradient>
    </defs>
    <path fill="url(#ig-gradient-reg)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, googleLogin, facebookLogin, linkedinLogin, instagramLogin } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleSocialLogin = async (provider, loginFn) => {
    setSocialLoading(provider);
    try {
      const result = await loginFn();
      if (result?.error === 'coming_soon') {
        toast.info(result.message, {
          icon: '🚀',
          duration: 3000
        });
      } else if (result?.error === 'cancelled') {
        // User cancelled, do nothing
      } else if (result && !result.error) {
        // Successful login
        toast.success('Account created successfully!');
        navigate('/my-trips');
      }
    } catch (err) {
      console.error(`${provider} login error:`, err);
      toast.error(`${provider} sign-up failed. Please try again.`);
    }
    setSocialLoading(null);
  };

  return (
    <div className="min-h-screen flex flex-col" data-testid="register-page">
      <Navbar />
      
      <div className="relative flex-1 flex items-center justify-center py-24 px-6 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(rgba(42,14,77,0.65), rgba(28,8,56,0.8)), url(${IMG.maldives(1600)})` }}>
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-6">
              <Plane className="w-8 h-8 text-background" />
            </div>
            <h1 className="text-3xl font-serif mb-2 text-white">Join Bleez</h1>
            <p className="text-muted-foreground">
              Create your account and start exploring
            </p>
          </div>

          {/* Form */}
          <div className="glass-card p-8">
            {/* Social Sign Up Buttons */}
            <div className="space-y-3 mb-6">
              {/* Google */}
              <Button 
                onClick={() => handleSocialLogin('google', googleLogin)}
                disabled={socialLoading === 'google'}
                variant="outline"
                className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border-gray-200"
                data-testid="google-register-btn"
              >
                {socialLoading === 'google' ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <GoogleIcon />
                )}
                Continue with Google
              </Button>

              {/* Facebook */}
              <Button 
                onClick={() => handleSocialLogin('facebook', facebookLogin)}
                disabled={socialLoading === 'facebook'}
                variant="outline"
                className="w-full h-12 bg-[#1877F2] hover:bg-[#166FE5] text-white border-[#1877F2]"
                data-testid="facebook-register-btn"
              >
                {socialLoading === 'facebook' ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <FacebookIcon />
                )}
                Continue with Facebook
              </Button>

              {/* LinkedIn */}
              <Button 
                onClick={() => handleSocialLogin('linkedin', linkedinLogin)}
                disabled={socialLoading === 'linkedin'}
                variant="outline"
                className="w-full h-12 bg-[#0A66C2] hover:bg-[#004182] text-white border-[#0A66C2]"
                data-testid="linkedin-register-btn"
              >
                {socialLoading === 'linkedin' ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <LinkedInIcon />
                )}
                Continue with LinkedIn
              </Button>

              {/* Instagram */}
              <Button 
                onClick={() => handleSocialLogin('instagram', instagramLogin)}
                disabled={socialLoading === 'instagram'}
                variant="outline"
                className="w-full h-12 bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737] hover:opacity-90 text-white border-0"
                data-testid="instagram-register-btn"
              >
                {socialLoading === 'instagram' ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <InstagramIcon />
                )}
                Continue with Instagram
              </Button>
            </div>

            <div className="relative mb-6">
              <Separator />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                OR
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-sm">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  <span>{error}</span>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="pl-12 input-field"
                    required
                    data-testid="register-name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pl-12 input-field"
                    required
                    data-testid="register-email"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-12 input-field"
                    required
                    data-testid="register-password"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimum 6 characters
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full btn-primary py-6"
                disabled={isLoading}
                data-testid="register-submit"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center mt-8 text-white/80">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline" data-testid="register-login-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
