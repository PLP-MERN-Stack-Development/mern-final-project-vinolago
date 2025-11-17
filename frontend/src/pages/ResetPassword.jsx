import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';

export default function ResetPassword() {
    const { user } = useUser();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const validatePassword = (password) => {
        const lengthCheck = password.length >= 8;
        const upperLowerCheck = /[a-z]/.test(password) && /[A-Z]/.test(password);
        const numSpecialCheck = /[0-9!@#$%^&*]/.test(password);

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
        passwordRules: checks,
        }));
    };

    const handleConfirmPassword = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);
        setErrors((prev) => ({
        ...prev,
        confirm: value && value !== password ? "Passwords do not match" : "",
        }));
    };

    const validateForm = () => {
        let newErrors = {};

        if (!password) newErrors.password = "Password is required";
        if (!confirmPassword) newErrors.confirm = "Please confirm password";
        if (password && confirmPassword && password !== confirmPassword) {
        newErrors.confirm = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
        };
        
    const isFormValid =
    password &&
    confirmPassword &&
    errors.passwordRules?.valid &&
    !errors.confirm;


    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        if (!user) {
            toast.error("User not authenticated");
            return;
        }

        try {
            await user.updatePassword({ newPassword: password });
            toast.success("Password updated successfully!");
            navigate("/");
        } catch (error) {
            toast.error("Failed to update password: " + error.message);
        }
    };

    return (
        
        <div className="w-full sm:w-3/4 lg:w-2/3 mx-auto bg-white p-8 rounded-2xl shadow-lg text-center m-12">
            <h2 className="text-2xl font-bold mb-4">Reset Password</h2>

            {/* Password Field */}
            <div className="relative w-full mb-2 max-w-md mx-auto">
            <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                className="border px-3 py-2 pr-10 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                value={password}
                onChange={handlePasswordChange}
            />
            <button
                type="button"
                className="eye-toggle absolute inset-y-0 rounded-md right-2 flex items-center text-gray-500 focus:outline-none "
                onClick={() => setShowPassword(!showPassword)}
            >
                {showPassword ? (
                <EyeOffIcon className="h-5 w-5" />
                ) : (
                <EyeIcon className="h-5 w-5" />
                )}
            </button>
            </div>

            {errors.passwordRules && (
            <div className="text-sm mt-2 space-y-1 text-center">
                <p className="font-medium text-gray-500 mb-1">Password must be:</p>
                <div className={errors.passwordRules.length ? "text-green-600" : "text-gray-500"}>
                - At least 8 characters
                </div>
                <div className={errors.passwordRules.upperLower ? "text-green-600" : "text-gray-500"}>
                - At least one UPPER and one lower case character
                </div>
                <div className={errors.passwordRules.numSpecial ? "text-green-600" : "text-gray-500"}>
                - At least one number or special character
                </div>
            </div>
            )}

            {/* Confirm Password Field */}
            <div className="relative w-full mt-4 mb-2 max-w-md mx-auto">
            <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                className="border px-3 py-2 pr-10 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                value={confirmPassword}
                onChange={handleConfirmPassword}
            />
            <button
                type="button"
                className="eye-toggle absolute inset-y-0 rounded-md right-2 flex items-center text-gray-500 focus:outline-none "
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
                {showConfirmPassword ? (
                <EyeOffIcon className="h-5 w-5" />
                ) : (
                <EyeIcon className="h-5 w-5" />
                )}
            </button>
            </div>
            {errors.confirm && <p className="text-red-500 text-sm mb-2">{errors.confirm}</p>}

            {/* Submit */}
            <button
            onClick={handleResetPassword}
            className="px-4 py-2 rounded w-full !text-white !font-bold max-w-md mx-auto"
            >
            Update Password
            </button>

            {message && <p className="mt-3 text-gray-700">{message}</p>}
        </div>
    );
}
