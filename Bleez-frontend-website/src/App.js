import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { AlertsProvider } from "./contexts/AlertsContext";
import { DynamicBackgroundProvider } from "./contexts/DynamicBackgroundContext";
import { TutorialProvider } from "./contexts/TutorialContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import DynamicBackground from "./components/DynamicBackground";
import TutorialOverlay from "./components/TutorialOverlay";
import ScrollToTop from "./components/ScrollToTop";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AuthCallback from "./pages/AuthCallback";
import TripPlannerPage from "./pages/TripPlannerPage";
import ItineraryPage from "./pages/ItineraryPage";
import MyTripsPage from "./pages/MyTripsPage";
import ProfilePage from "./pages/ProfilePage";
import AlbumsPage from "./pages/AlbumsPage";
import CommunityPage from "./pages/CommunityPage";
import BookingComparePage from "./pages/BookingComparePage";
import BookingPage from "./pages/BookingPage";
import ExpensesPage from "./pages/ExpensesPage";
import AlertsPage from "./pages/AlertsPage";
import AIChatBubble from "./components/AIChatBubble";
import EmergencyIcon from "./components/EmergencyIcon";
import TutorialPage from "./pages/TutorialPage";
import DownloadAppPage from "./pages/DownloadAppPage";
import CustomerSubscriptionPage from "./pages/CustomerSubscriptionPage";
import ExplorePage from "./pages/ExplorePage";
import WishlistPage from "./pages/WishlistPage";
import AboutPage from "./pages/AboutPage";
import HelpPage from "./pages/HelpPage";
import EmergencyPage from "./pages/EmergencyPage";
import LegalPage from "./pages/LegalPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import FaqPage from "./pages/FaqPage";
import ContactPage from "./pages/ContactPage";
import "./App.css";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function AppContent() {
  const location = useLocation();
  
  // Check for Google auth callback with session_id
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <DynamicBackgroundProvider>
      <DynamicBackground>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/tutorial" element={<TutorialPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/emergency" element={<EmergencyPage />} />
          <Route path="/privacy" element={<LegalPage type="privacy" />} />
          <Route path="/terms" element={<LegalPage type="terms" />} />
          <Route path="/download" element={<DownloadAppPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/plan" element={<TripPlannerPage />} />
          <Route path="/itinerary/:id" element={<ItineraryPage />} />
          <Route path="/booking-compare" element={<BookingComparePage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route 
            path="/expenses" 
            element={
              <ProtectedRoute>
                <ExpensesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/expenses/:tripId" 
            element={
              <ProtectedRoute>
                <ExpensesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-trips" 
            element={
              <ProtectedRoute>
                <MyTripsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/albums" 
            element={
              <ProtectedRoute>
                <AlbumsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/alerts" 
            element={
              <ProtectedRoute>
                <AlertsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-subscription" 
            element={
              <ProtectedRoute>
                <CustomerSubscriptionPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
        <AIChatBubble />
        <EmergencyIcon />
        <TutorialOverlay />
      </DynamicBackground>
    </DynamicBackgroundProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <NotificationProvider>
          <AuthProvider>
            <SubscriptionProvider>
              <AlertsProvider>
                <TutorialProvider>
                  <BrowserRouter>
                    <AppContent />
                    <Toaster 
                      position="top-right" 
                      toastOptions={{
                        style: {
                          background: 'rgba(30, 41, 59, 0.95)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#F8FAFC',
                          backdropFilter: 'blur(12px)'
                        }
                      }}
                    />
                  </BrowserRouter>
                </TutorialProvider>
              </AlertsProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </NotificationProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}

export default App;
