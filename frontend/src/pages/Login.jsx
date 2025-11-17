import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSignIn, useUser } from "@clerk/clerk-react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import toast from 'react-hot-toast';
import { Button, Input, Card } from "../ui";

export default function LoginPage() {
   const navigate = useNavigate();
   const { signIn, setActive } = useSignIn();
   const { user, isLoaded } = useUser();
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [showPassword, setShowPassword] = useState("");
   const [loading, setLoading] = useState(false);

   // Redirect if user is already logged in
   useEffect(() => {
      if (isLoaded && user) {
         // Small delay to prevent rapid navigation
         const timer = setTimeout(() => navigate("/transactions"), 100);
         return () => clearTimeout(timer);
      }
   }, [isLoaded, user, navigate]);

  //  Email + Password Login
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("Login successful!");
        localStorage.removeItem("pendingEmail");
        navigate("/transactions");
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (error) {
      toast.error("Login failed: " + error.errors[0]?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  //  Google OAuth Login
  const handleGoogleLogin = async () => {
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/transactions",
      });
    } catch (error) {
      toast.error("Google login failed: " + error.message);
    }
  };

  //  Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    navigate('/forgot-password')
  };

  return (
    <div className="w-full sm:w-3/4 lg:w-2/3 mx-auto p-6 mt-12">
      <Card className="p-6">
        <div className="max-w-md mx-auto mb-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Welcome back.</h2>
          <p className="text-sm mb-4">
            Don't have an account?{" "}
            <Link to="/signup" className="underline hover:underline">
              Sign up
            </Link>
          </p>
        </div>


        <form onSubmit={handleLogin} className="space-y-4 max-w-md mx-auto">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            
          />

          <div className="relative w-full mb-2">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password (min 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              
            />

            <button
              type="button"
              className="eye-toggle absolute inset-y-0 rounded-md right-2 flex items-center text-gray-500 focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOffIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          <Button
            className="w-full mt-6 cursor-pointer"
            type="submit"
            disabled={loading}
            variant="primary"
          >
            {loading ? "Logging in..." : "Log in"}
          </Button>
        </form>

        <div className="w-full text-left mt-2 max-w-md mx-auto mb-8">
          <Link
            to="/forgot-password"
            className="underline bg-transparent text-sm border-none p-0"
          >
            Forgot your password?
          </Link>

          <p className="mt-4">-Or-</p>

          {/* OAuth login */}
          <div className="mt-6 text-center rounded">
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
