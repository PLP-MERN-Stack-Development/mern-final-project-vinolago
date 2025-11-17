import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignUp } from "@clerk/clerk-react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import toast from 'react-hot-toast';
import { Button } from "../ui";
 

export default function Signup() {
    const { signUp, setActive } = useSignUp();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [termsChecked, setTermsChecked] = useState(false);
    const [localChecked, setLocalChecked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const validatePassword = (value) => {
        const lengthCheck = value.length >= 8;
        const upperLowerCheck = /[a-z]/.test(value) && /[A-Z]/.test(value);
        const numSpecialCheck = /[0-9!@#$%^&*]/.test(value);

        return {
            length: lengthCheck,
            upperLower: upperLowerCheck,
            numSpecial: numSpecialCheck,
            valid: lengthCheck && upperLowerCheck && numSpecialCheck,
        };
    };

    const handlePasswordChange = (e) => {
        
        const value = e.target.value;
        setPassword(value);
        const checks = validatePassword(value);
        setErrors((prev) => ({
            ...prev,
            passwordRules : checks,
        }))
    }

    const handleConfirmPassword = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);
        setErrors((prev) => ({
            ...prev,
            confirm: value && value !== password ? "Passwords do not match" : "",
        }));
    }

    const validateEmail = (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);

        setErrors((prev) => ({
            ...prev,
            email: value && !validateEmail(value) ? "Please enter a valid email" : "",
        }))
    }

    const validateForm = () => {
        let newErrors = {};
        let isValid = true;

        // Email validation
        if (!email.trim()) {
            newErrors.email = "Email is required";
            isValid = false;
        } else if (!validateEmail(email)) {
            newErrors.email = "Please enter a valid email address";
            isValid = false;
        }

        // Password validation
        if (!password) {
            newErrors.password = "Password is required";
            isValid = false;
        } else {
            const passwordChecks = validatePassword(password);
            if (!passwordChecks.valid) {
                newErrors.password = "Password must be at least 8 characters, include upper & lower case, and one number/special character";
                isValid = false;
            }
        }

        // Confirm password validation
        if (!confirmPassword) {
            newErrors.confirm = "Please confirm your password";
            isValid = false;
        } else if (password !== confirmPassword) {
            newErrors.confirm = "Passwords do not match";
            isValid = false;
        }

        // Terms validation
        if (!termsChecked) {
            newErrors.terms = "You must agree to the Terms & Conditions";
            isValid = false;
        }
        if (!localChecked) {
            newErrors.localTerms = "You must agree to use Escrow for local transactions only";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        // Comprehensive validation with inline error display
        if (!validateForm()) {
            // Show toast if user tries to submit with validation errors
            toast.error("Please fix the validation errors above before submitting");
            return;
        }

        // Double-check password match (belt and suspenders)
        if (password !== confirmPassword) {
            setErrors(prev => ({ ...prev, confirm: "Passwords do not match" }));
            toast.error("Please fix the validation errors above before submitting");
            return;
        }

        // Ensure terms are accepted
        if (!termsChecked || !localChecked) {
            setErrors(prev => ({
                ...prev,
                terms: !termsChecked ? "You must agree to the Terms & Conditions" : "",
                localTerms: !localChecked ? "You must agree to use Escrow for local transactions only" : ""
            }));
            toast.error("Please fix the validation errors above before submitting");
            return;
        }

        // If all validations pass, proceed with signup
        setLoading(true);
        try {
            const result = await signUp.create({
                emailAddress: email.trim(),
                password,
                firstName: firstName.trim() || undefined,
                lastName: lastName.trim() || undefined,
                phoneNumber: phoneNumber.trim() || undefined,
            });

            // Check if signup was successful and requires email verification
            if (result.status === "complete") {
                // User is immediately signed in (no email verification required)
                toast.success("Account created successfully! Welcome!");
                navigate("/verify-profile");
            } else {
                // Start email verification process
                await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
                toast.success("Account created! Please check your email and enter the verification code.");
                navigate("/verify-email-code", { state: { email } });
            }
        } catch (error) {
            const errorMessage = error.errors?.[0]?.message || error.message || "An error occurred during signup";
            toast.error("Sign up failed: " + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        if (!termsChecked || !localChecked) {
            toast.error("You must agree to all terms before signing up with Google.");
            return;
        }

        try {
            await signUp.authenticateWithRedirect({
                strategy: "oauth_google",
                redirectUrl: "/sso-callback",
                redirectUrlComplete: "/verify-profile",
            });
        } catch (error) {
            toast.error("Google signup failed: " + error.message);
        }
    };

    return (
        
            <div className="w-full sm:w-3/4 lg:w-2/3 mx-auto bg-white p-8 rounded-2xl shadow-md m-12">
                <h2 className="text-2xl font-bold text-center mb-6">Create your Escrow account</h2>
                
                <p className="text-sm text-center mt-4 mb-6">
                Already have an account?{" "}
                <a href="/login" className="!underline">
                    Sign in
                </a>
                </p>   

                <form onSubmit={handleSignup} className="space-y-4 max-w-md mx-auto">
                {/* Email */}
                <div>       
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-2 border border-gray-300 px-4 py-2 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#163300] mb-6"
                    value={email}
                    onChange={handleEmailChange}
                    required
                />
                            
                {errors.email && <p className="text-red-500">{errors.email}</p>}
                </div>
                        
                {/* Password */}
                <div className="w-full mb-6 ">
                    <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="w-full border border-gray-300 px-4 py-2 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#163300] mb-6"
                        value={password}
                        onChange={handlePasswordChange }
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="eye-toggle absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 focus:outline-none "
                
                    >
                        {showPassword ? (<EyeOffIcon className="w-5 h-5" />) : (<EyeIcon className="w-5 h-5" />)}           
                        </button>
                    </div>
                                
                    {errors.passwordRules && (
                        <div className="text-sm mt-2 space-y-1 min-h-[72px]">
                        <p className="font-medium flex items-start text-gray-500 mb-1">Password must be:</p>
                        
                        <div className={errors.passwordRules.length ? "flex items-start text-green-600" : " flex items-start text-gray-500"}>
                            - At least 8 characters
                        </div>
                        <div className={errors.passwordRules.upperLower ? "flex items-start text-green-600" : "flex items-start text-gray-500"}>
                            - At least one UPPER and one lower case character
                        </div>
                        <div className={errors.passwordRules.numSpecial ? "flex items-start  text-green-600" : "flex items-start text-gray-500"}>
                            - At least one number or special character
                        </div>
                        
                        </div>
                    )}
                            
                </div>

                {/*Confirm password */}
                <div className="w-full mb-4">
                <div className="relative">
                <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    className="w-full border border-gray-300 px-4 py-2 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#163300] mb-8"
                    value={confirmPassword}
                    onChange={handleConfirmPassword}
                    required
                    />
                
                            
                    <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="eye-toggle absolute right-3 top-1/4 -translate-y-1/4 text-gray-500 focus:outline-none"
                                
                    >
                
                    {showConfirmPassword ? (<EyeOffIcon className="h-5 w-5" /> ): (<EyeIcon className="h-5 w-5" />)}           
                        </button>  
                </div>  
                    
                {errors.confirm && <p className="text-red-500">{errors.confirm}</p>}
                </div>

                {/* Terms */}            
                <div className="flex items-center space-x-2 mb-4">
                    <input
                    type="checkbox"
                    checked={termsChecked}
                    onChange={() => setTermsChecked(!termsChecked)}
                    />
                    <label className="text-sm text-gray-700">
                    I agree to Escrow <a href="/terms" className="text-blue-600 underline">Terms & Conditions</a>
                    </label>
                </div>

                <div className="flex items-center space-x-2">
                    <input
                    type="checkbox"
                    checked={localChecked}
                    onChange={() => setLocalChecked(!localChecked)}
                    />
                    <label className="text-sm text-gray-700">
                    I agree to use Escrow for <b>local transactions only</b>
                    </label>
                    {errors.terms && <p className="text-red-500">{errors.terms}</p>}
                    {errors.localTerms && <p className="text-red-500">{errors.localTerms}</p>}
                </div>

                {/* General errors */}
                {errors.general && <p className="text-red-500">{errors.general}</p>}
                
                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full font-bold text-[#163300] bg-[#9fe870] py-3 rounded-lg hover:bg-[#65cf21] transition disabled:bg-gray-400 mt-8 cursor-pointer"
                >
                    {loading ? "Signing up..." : "Sign Up"}
                </Button>
                </form>

                <div className="mt-4 text-left max-w-md mx-auto"> 
                    <p>-Or-</p>
                    {/* OAuth login */}
                    <div className="mt-4 text-center rounded">
                        <button
                          onClick={handleGoogleSignup}
                          className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 cursor-pointer"
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
            

            </div>
        
    );
}
