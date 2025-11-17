import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";

export default function CheckEmail() {
    const location = useLocation();
    const { signUp } = useClerk();

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Get email either from location state or localStorage fallback
    const email = location.state?.email || localStorage.getItem("pendingEmail");


    const handleResend = async () => {
        setLoading(true);
        setMessage("");
        setError("");

        try {
            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
            setMessage("A new confirmation email has been sent! Please check your inbox.");
        } catch (err) {
            setError(err.message || "Failed to resend verification email");
        } finally {
            setLoading(false);
        }
    };

    return (

        <div className="w-full sm:w-3/4 lg:w-2/3 mx-auto bg-white p-8 rounded-2xl shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Confirm Your Email</h2>
            <p className="text-gray-700 mb-4">
            We’ve sent a confirmation link to{" "}
            <span className="font-semibold !underline mb-2">{email}</span>. <br />
            Please check your inbox and verify your email before logging in.
            </p>
            <p className="mt-4 text-sm text-gray-500">
            Didn’t get the email? Check your spam folder or request a new one.
            </p>

            {message && <p className="mt-3 text-green-600">{message}</p>}
            {error && <p className="mt-3 text-red-600">{error}</p>}

            <button
            onClick={handleResend}
            disabled={loading}
            className="mt-4 px-4 py-2 mb-8 !text-white  rounded-lg"
            >
            {loading ? "Resending..." : "Resend Email"}
            </button>
        </div>
    
    );
}


