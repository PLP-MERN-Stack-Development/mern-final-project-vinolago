import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSignUp } from "@clerk/clerk-react";
import toast from 'react-hot-toast';

export default function VerifyEmailCode() {
    const { signUp, setActive } = useSignUp();
    const navigate = useNavigate();
    const location = useLocation();
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);

    const email = location.state?.email || "";

    const handleVerify = async (e) => {
        e.preventDefault();

        if (!code.trim()) {
            toast.error("Please enter the verification code");
            return;
        }

        setLoading(true);
        try {
            const result = await signUp.attemptEmailAddressVerification({
                code: code.trim(),
            });

            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId });
                toast.success("Email verified successfully! Welcome!");
                // Navigate to home instead of login since user is already authenticated
                navigate("/transactions");
            } else {
                toast.error("Verification failed. Please check your code and try again.");
            }
        } catch (error) {
            const errorMessage = error.errors?.[0]?.message || error.message || "Verification failed";
            toast.error("Verification failed: " + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
            toast.success("Verification code sent! Please check your email.");
        } catch (error) {
            toast.error("Failed to resend code. Please try again.");
        }
    };

    return (
        <div className="w-full sm:w-3/4 lg:w-2/3 mx-auto p-6 mt-12">
            <div className="bg-white p-8 rounded-2xl shadow-md max-w-md mx-auto text-center">
                <h2 className="text-2xl font-bold mb-4">Verify Your Email</h2>
                <p className="text-gray-600 mb-6">
                    We've sent a verification code to <strong>{email}</strong>.
                    Please enter it below to complete your registration.
                </p>

                <form onSubmit={handleVerify} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Enter verification code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-center text-lg font-mono"
                        maxLength={6}
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition disabled:bg-gray-400 cursor-pointer"
                    >
                        {loading ? "Verifying..." : "Verify Email"}
                    </button>
                </form>

                <div className="mt-6">
                    <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
                    <button
                        onClick={handleResend}
                        className="text-green-600 hover:text-green-700 underline text-sm"
                    >
                        Resend verification code
                    </button>
                </div>
            </div>
        </div>
    );
}