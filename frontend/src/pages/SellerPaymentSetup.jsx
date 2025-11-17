import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';
import { Card } from "../ui";

export default function SellerPaymentSetup() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    nationalId: "",
    phoneNumber: "",
    bankName: "",
    accountNumber: "",
    accountName: ""
  });
  const [errors, setErrors] = useState({});

  const validateKenyanPhone = (phone) => {
    const normalized = phone.replace(/\D/g, "");
    if (normalized.startsWith("07") || normalized.startsWith("01")) {
      return `+254${normalized.slice(1)}`;
    } else if (normalized.startsWith("7") || normalized.startsWith("1")) {
      return `+254${normalized}`;
    } else if (!normalized.startsWith("254")) {
      return `+254${normalized}`;
    }
    return `+${normalized}`;
  };

  const isValidKenyanPhone = (phone) => {
    const normalized = validateKenyanPhone(phone);
    return /^\+254(7\d{8}|1\d{8})$/.test(normalized);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }

    // Validate phone number
    if (name === "phoneNumber") {
      if (!isValidKenyanPhone(value)) {
        setErrors(prev => ({ ...prev, phoneNumber: "Enter a valid Kenyan phone number (e.g. +254712345678)" }));
      }
    }
  };

  const handleSave = async () => {
    try {
      const token = await getToken();

      let paymentData = {
        paymentMethod,
        ...formData
      };

      // Validate required fields based on payment method
      if (paymentMethod === "mpesa") {
        if (!formData.firstName || !formData.lastName || !formData.nationalId || !formData.phoneNumber) {
          toast.error("Please fill in all required fields for M-Pesa");
          return;
        }
        if (!isValidKenyanPhone(formData.phoneNumber)) {
          toast.error("Please enter a valid Kenyan phone number");
          return;
        }
        paymentData.phoneNumber = validateKenyanPhone(formData.phoneNumber);
      } else if (paymentMethod === "bank") {
        if (!formData.bankName || !formData.accountNumber || !formData.accountName) {
          toast.error("Please fill in all required fields for Bank transfer");
          return;
        }
      }

      await axios.post('http://localhost:5000/api/users/payment-details', paymentData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Payment details saved successfully!");
      setTimeout(() => {
        navigate('/transactions');
      }, 2000);
    } catch (error) {
      console.error("Failed to save payment details:", error);
      toast.error("Failed to save payment details. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Set Up Payment Method</h2>

        {/* Payment Method Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose Payment Method
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select payment method</option>
            <option value="mpesa">M-Pesa</option>
            <option value="bank">Bank Transfer</option>
          </select>
        </div>

        {/* M-Pesa Form */}
        {paymentMethod === "mpesa" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">M-Pesa Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter first name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                National ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nationalId"
                value={formData.nationalId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter national ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.phoneNumber ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="+254712345678"
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
              )}
            </div>
          </div>
        )}

        {/* Bank Transfer Form */}
        {paymentMethod === "bank" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Bank Transfer Details</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name <span className="text-red-500">*</span>
              </label>
              <select
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select bank</option>
                <option value="kcb">KCB Bank</option>
                <option value="equity">Equity Bank</option>
                <option value="cooperative">Cooperative Bank</option>
                <option value="absa">Absa Bank</option>
                <option value="stanbic">Stanbic Bank</option>
                <option value="standard-chartered">Standard Chartered</option>
                <option value="barclays">Barclays Bank</option>
                <option value="diamond-trust">Diamond Trust Bank</option>
                <option value="family-bank">Family Bank</option>
                <option value="nic-bank">NIC Bank</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter account number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="accountName"
                value={formData.accountName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter account name"
              />
            </div>
          </div>
        )}

        {/* Save Button */}
        {paymentMethod && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
            >
              Save Payment Details
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}