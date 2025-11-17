import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Hero from "../components/home/Hero";
import TrustSection from "../components/home/TrustSection";
import HowItWorks from "../components/home/HowItWorks";
import GetStarted from "../components/home/GetStarted";
import EscrowCategories from "../components/home/EscrowCategories";
import Comparison from "../components/home/Comparison";
import FAQS from "../components/home/Faqs";
import LogoCarousel from "../components/home/LogoCarousel";
import SecureCTA from "../components/home/CTA";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      // If user is already logged in, redirect to transactions
      navigate('/transactions', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Hero />
      <LogoCarousel />
      <TrustSection />
      <Comparison />
      <HowItWorks />
      <GetStarted />
      <EscrowCategories />
      <SecureCTA />
      <FAQS />




    </>
  );
}