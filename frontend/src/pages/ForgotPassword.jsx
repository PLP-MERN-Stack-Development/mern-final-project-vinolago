import { useState } from "react";
import { useClerk } from "@clerk/clerk-react";
import toast from 'react-hot-toast';
import { Input, Button } from "../ui";

export default function ForgotPassword() {
    const { signIn } = useClerk();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const handleForgotPassword = async (e) => {
      e.preventDefault();
      if (!email) {
        toast.error('Enter your email first.');
        return;
      }

      setLoading(true);
      try {
        await signIn.create({
          strategy: "reset_password_email_code",
          identifier: email,
        });
        setMessage(`Password reset email sent to ${email}. Please check your inbox.`);
        setMessageType("success");
        setEmail("");
      } catch (error) {
        setMessage("Error: " + error.message);
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };

    return (
      
        <div className="w-full sm:w-3/4 lg:w-2/3 mx-auto bg-white py-18 space-y-6 ">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-4">Forgot Your Password? </h2>
            <p>Please enter your email address below. We'll send you a password reset link.</p>
          </div>
          <form onSubmit={handleForgotPassword} className="space-y-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="w-full p-2 border border-gray-300 px-4 py-2 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#163300]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded w-full text-[#163300] ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#9fe870] cursor-pointer hover:bg-[#65cf21]"
            }`}
            >
              {loading ? "Sending..." : "Request Password Reset"}
            </Button>
          </form>

          {message && (
            <p
              className={`mt-4 text-sm ${messageType === "success" ? "text-green-600" : "text-red-600"
                }`}
              dangerouslySetInnerHTML={{ __html: message }} />)}

          <p className="text-sm text-center mt-4 ">
            Remembered your password?{" "}
            <a href="/login" className=" !underline">
              Back to Login
            </a>
          </p>
        </div>
      
    );
}
