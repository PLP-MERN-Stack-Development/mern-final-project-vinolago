import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";

export default function Verify() {
  const navigate = useNavigate();
  const { getToken, isVerified, loading: authLoading, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Redirect if user is already verified
  useEffect(() => {
    if (!authLoading && isVerified) {
      navigate("/transactions");
    }
  }, [isVerified, authLoading, navigate]);
  const [formData, setFormData] = useState(() => {
    // Load saved draft if exists
    const saved = localStorage.getItem("verifyForm");
    return saved ? JSON.parse(saved) : {
      fullName: "",
      dob: "",
      street: "",
      city: "",
      county: "",
      postalCode: "",
      phone: "",
      idType: "",
      idNumber: "",
      idFile: null,
      selfie: null,
      payoutMethod: "",
      bankName: "",
      accountName: "",
      accountNumber: "",
      bankBranch: "",
      mpesaNumber: "",
      referralCode: "",
      agreeTerms: false,
      agreePrivacy: false,
    };
  });

  // Auto-save draft
  useEffect(() => {
    localStorage.setItem("verifyForm", JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : files ? files[0] : value,
    });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
      if (!formData.dob) newErrors.dob = "Date of birth is required";
      else {
        const birthDate = new Date(formData.dob);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
        if (actualAge < 18) {
          newErrors.dob = "You must be at least 18 years old";
        }
      }
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
      else if (!/^(\+254|254|0)[17]\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = "Please enter a valid Kenyan phone number";
      }
    } else if (currentStep === 2) {
      if (!formData.idType) newErrors.idType = "ID type is required";
      if (!formData.idNumber.trim()) newErrors.idNumber = "ID number is required";
      else {
        if (formData.idType === 'national_id' && !/^\d{8}$/.test(formData.idNumber)) {
          newErrors.idNumber = "National ID must be 8 digits";
        } else if (formData.idType === 'passport' && !/^[A-Z]\d{7}$/.test(formData.idNumber)) {
          newErrors.idNumber = "Passport must be 1 letter followed by 7 digits";
        } else if (formData.idType === 'driver_license' && !/^[A-Z]{2}\d{6}[A-Z]{2}$/.test(formData.idNumber)) {
          newErrors.idNumber = "Driver's license must be 2 letters, 6 digits, 2 letters";
        }
      }
    } else if (currentStep === 3) {
      if (!formData.payoutMethod) newErrors.payoutMethod = "Payout method is required";
      if (formData.payoutMethod === 'bank') {
        if (!formData.bankName.trim()) newErrors.bankName = "Bank name is required";
        if (!formData.accountName.trim()) newErrors.accountName = "Account holder name is required";
        if (!formData.accountNumber.trim()) newErrors.accountNumber = "Account number is required";
        if (!formData.bankBranch.trim()) newErrors.bankBranch = "Bank branch is required";
      } else if (formData.payoutMethod === 'mpesa') {
        if (!formData.mpesaNumber.trim()) newErrors.mpesaNumber = "M-Pesa number is required";
        else if (!/^2547\d{8}$/.test(formData.mpesaNumber.replace(/\s/g, ''))) {
          newErrors.mpesaNumber = "Please enter a valid M-Pesa number (e.g., 2547XXXXXXXX)";
        }
      }
    } else if (currentStep === 4) {
      if (!formData.agreeTerms) newErrors.agreeTerms = "You must agree to the terms";
      if (!formData.agreePrivacy) newErrors.agreePrivacy = "You must agree to privacy policy";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((s) => s + 1);
    }
  };
  const prevStep = () => setStep((s) => s - 1);

  const progress = Math.round((step / 4) * 100);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(4)) {
      toast.error("Please fix all validation errors before submitting");
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      const response = await axios.post('http://localhost:5000/api/auth/verify-profile', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        toast.success("Profile verified successfully!");
        localStorage.removeItem("verifyForm");
        await refreshUser(); // Update context with new verification status
        navigate("/transactions");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Failed to verify profile";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking verification status
  if (authLoading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-md rounded-xl p-6 my-8">
      <h2 className="text-2xl font-semibold mb-4 text-left pt-6">
        Please verify your account
        </h2>
        <p className="text-sm mb-6">
        We protect both sides of the transaction by verifying the identity of all users. <br />
        Your verified identity must be the same as the account holder's name on any bank account or MPESA number used to pay or receive funds from Escrow.</p>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-[#9fe870] h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STEP 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">1. Personal details</h3>
            <input
              type="text"
              name="fullName"
              placeholder="Full legal name"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
            {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              max={new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              className="w-full border p-2 rounded"
              required
            />
            {errors.dob && <p className="text-red-500 text-sm">{errors.dob}</p>}
            <input
              type="text"
              name="street"
              placeholder="Street address"
              value={formData.street}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                className="border p-2 rounded"
              />
              <input
                type="text"
                name="county"
                placeholder="County"
                value={formData.county}
                onChange={handleChange}
                className="border p-2 rounded"
              />
            </div>
            <input
              type="text"
              name="postalCode"
              placeholder="Postal code"
              value={formData.postalCode}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone number (e.g., 2547XXXXXXXX)"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
          </div>
        )}

        {/* STEP 2: ID Verification */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">2. Identity verification</h3>
            <select
              name="idType"
              value={formData.idType}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">Select ID Type</option>
              <option value="national_id">National ID</option>
              <option value="passport">Passport</option>
              <option value="driver_license">Driver’s License</option>
            </select>
            {errors.idType && <p className="text-red-500 text-sm">{errors.idType}</p>}
            <input
              type="text"
              name="idNumber"
              placeholder="ID Number"
              value={formData.idNumber}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
            {errors.idNumber && <p className="text-red-500 text-sm">{errors.idNumber}</p>}
            <div>
              <label className="block mb-1 text-sm text-gray-600">
                Upload ID (optional)
              </label>
              <input type="file" name="idFile" onChange={handleChange} />
            </div>
            <div>
              <label className="block mb-1 text-sm text-gray-600">
                Selfie / Liveness (optional)
              </label>
              <input type="file" name="selfie" onChange={handleChange} />
            </div>
          </div>
        )}

        {/* STEP 3: Financial Info */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">3. Financial details</h3>
            <select
              name="payoutMethod"
              value={formData.payoutMethod}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">Select payout method</option>
              <option value="mpesa">M-Pesa</option>
              <option value="bank">Bank Account</option>
            </select>
            {errors.payoutMethod && <p className="text-red-500 text-sm">{errors.payoutMethod}</p>}

            {formData.payoutMethod === "bank" && (
              <div className="space-y-3">
                <input
                  type="text"
                  name="bankName"
                  placeholder="Bank name"
                  value={formData.bankName}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                />
                {errors.bankName && <p className="text-red-500 text-sm">{errors.bankName}</p>}
                <input
                  type="text"
                  name="accountName"
                  placeholder="Account holder name"
                  value={formData.accountName}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                />
                {errors.accountName && <p className="text-red-500 text-sm">{errors.accountName}</p>}
                <input
                  type="text"
                  name="accountNumber"
                  placeholder="Account number"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                />
                {errors.accountNumber && <p className="text-red-500 text-sm">{errors.accountNumber}</p>}
                <input
                  type="text"
                  name="bankBranch"
                  placeholder="Bank branch"
                  value={formData.bankBranch}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                />
                {errors.bankBranch && <p className="text-red-500 text-sm">{errors.bankBranch}</p>}
              </div>
            )}

            {formData.payoutMethod === "mpesa" && (
              <div className="space-y-3">
                <input
                  type="text"
                  name="mpesaNumber"
                  placeholder="M-Pesa phone number (e.g., 2547XXXXXXXX)"
                  value={formData.mpesaNumber}
                  onChange={handleChange}
                  pattern="^2547\d{8}$"
                  title="Enter a valid M-Pesa number (e.g., 2547XXXXXXXX)"
                  className="w-full border p-2 rounded"
                />
                {errors.mpesaNumber && <p className="text-red-500 text-sm">{errors.mpesaNumber}</p>}
              </div>
            )}

          </div>
        )}

        {/* STEP 4: Review & Consent */}
        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">4. Review & submit</h3>
            <p className="text-sm text-gray-600">
              Please confirm your details and agree to the terms below.
            </p>
            <div className="flex items-center">
                <input
                type="text"
                name="referralCode"
                placeholder="Referral / Partner code (optional)"
                value={formData.referralCode}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="mr-2"
              />
              <label>I agree to the Terms & Conditions</label>
            </div>
            {errors.agreeTerms && <p className="text-red-500 text-sm">{errors.agreeTerms}</p>}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="agreePrivacy"
                checked={formData.agreePrivacy}
                onChange={handleChange}
                className="mr-2"
            />

              <label>I consent to data verification and KYC checks</label>
            </div>
            {errors.agreePrivacy && <p className="text-red-500 text-sm">{errors.agreePrivacy}</p>}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="px-4 py-2 bg-gray-200 rounded cursor-pointer hover:bg-gray-300"
            >
              Back
            </button>
          )}
          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-4 py-2 bg-[#9fe870] text-[#163300] cursor-pointer rounded hover:bg-[#65cf21]"
            >
              Save and next
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#9fe870] text-[#163300] cursor-pointer rounded hover:bg-[#65cf21] disabled:bg-gray-400"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          )}
        </div>

        <p className="text-sm text-gray-500 text-center mt-3">
          Progress: {progress}%
        </p>
      </form>
    </div>
  );
}
