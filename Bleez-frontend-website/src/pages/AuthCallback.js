import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { processGoogleCallback, processSocialCallback } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Use useRef to prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      // Check for OAuth code in query params (Facebook, LinkedIn, Instagram)
      const urlParams = new URLSearchParams(location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state'); // Contains provider info
      
      // Check for session_id in hash (Emergent Auth / Google direct)
      const hash = window.location.hash;
      const sessionIdMatch = hash.match(/session_id=([^&]+)/);
      
      if (code) {
        // OAuth authorization code flow (Facebook, LinkedIn, Instagram)
        const provider = state || 'google'; // Default to google if no state
        try {
          const userData = await processSocialCallback(provider, code);
          toast.success(`Welcome${userData?.name ? ', ' + userData.name : ''}!`);
          window.history.replaceState(null, '', window.location.pathname);
          navigate('/my-trips', { replace: true });
        } catch (error) {
          console.error('Social auth callback error:', error);
          toast.error('Authentication failed. Please try again.');
          navigate('/login');
        }
      } else if (sessionIdMatch) {
        // Session ID flow (Google via direct OAuth)
        const sessionId = sessionIdMatch[1];
        try {
          const userData = await processGoogleCallback(sessionId);
          toast.success(`Welcome${userData?.name ? ', ' + userData.name : ''}!`);
          window.history.replaceState(null, '', window.location.pathname);
          navigate('/my-trips', { replace: true, state: { user: userData } });
        } catch (error) {
          console.error('Auth callback error:', error);
          toast.error('Authentication failed. Please try again.');
          navigate('/login');
        }
      } else {
        toast.error('Authentication failed - no credentials received');
        navigate('/login');
      }
    };

    processAuth();
  }, [location.search, navigate, processGoogleCallback, processSocialCallback]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background" data-testid="auth-callback">
      <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Completing sign in...</p>
    </div>
  );
};

export default AuthCallback;
