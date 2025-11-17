import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

export default function VerifyEmail() {
    const navigate = useNavigate();
    const { user, isLoaded } = useUser();
    const [loading, setLoading] = useState(true);

    if (!isLoaded || loading) {
        return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <p className="text-gray-600">Checking verification status...</p>
        </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-4 text-green-600">
            Email Verified!
            </h2>
            <p className="text-gray-700 mb-6">
            Your email has been successfully confirmed.
            </p>

            {user ? (
            <>
                <button
                onClick={() => navigate("/")}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full"
                >
                Go to Dashboard
                </button>
                <p className="text-sm text-gray-500 mt-2">
                You’re already logged in.
                </p>
            </>
            ) : (
            <>
                <button
                onClick={() => navigate("/login")}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full"
                >
                Go to Login
                </button>
                <p className="text-sm text-gray-500 mt-2">
                Please log in to continue.
                </p>
            </>
            )}
        </div>
        </div>
    );
}
