import { motion } from "framer-motion";
import { useUser } from "@clerk/clerk-react";
import { Button } from "../ui";
import { Shield, Star, CheckCircle, Award, Clock, CreditCard, Bell, KeyRound, Smartphone, Plus } from "lucide-react";

export default function Profile() {
    const { user } = useUser();
    
    // Demo data (in real app, fetch this from backend)
    const stats = {
        joinDate: "March 2024",
        completedEscrows: 14,
        activeDeals: 2,
        rating: 4.8,
        reviews: 9,
        verified: true,
    };

    const recentReviews = [
        {
        id: 1,
        name: "Kevin M.",
        comment: "Smooth transaction, excellent communication!",
        rating: 5,
        date: "Oct 2025",
        },
        {
        id: 2,
        name: "Faith W.",
        comment: "Very reliable and responsive throughout the deal.",
        rating: 5,
        date: "Sept 2025",
        },
        {
        id: 3,
        name: "Brian O.",
        comment: "Fast, transparent process — would trade again.",
        rating: 4.5,
        date: "Aug 2025",
        },
    ];

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-2xl overflow-hidden">
        {/* Profile Header */}
        <div className="bg-[#9fe870] text-white px-8 py-6">
          <h1 className="text-2xl text-white font-extrabold mb-8 font-bold">Account Information</h1>
          <p className="text-sm !text-[#163300] font-semibold mb-6">
            Please complete your account information. Make sure your name matches the name on your bank account, as Escrow does not make or accept third-party payments.
          </p>
            <div className="bg-white shadow-md rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                    {user?.firstName?.[0] || "U"}
                </div>
                {stats.verified && (
                    <span className="absolute bottom-2 right-2 bg-green-500 text-white p-1 rounded-full">
                    <CheckCircle size={20} />
                    </span>
                )}
            </div>
            

            <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-semibold text-gray-800">
                    {user?.fullName || `${user?.firstName || "Unnamed"} ${user?.lastName || ""}`}
                </h1>
                <p className="text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
                <p className="text-sm text-gray-400 mt-1">Member since {stats.joinDate}</p>

                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                    <div className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                        <Shield size={16} /> Verified Account
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm">
                        <Award size={16} /> {stats.completedEscrows} Completed Escrows
                    </div>
                </div>
            </div>
        </div>
        </div>

        {/* Account Info Section */}
        <div className="p-8 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Personal Information</h2>
            <div className="space-y-3 text-gray-700">
              <p><span className="font-medium">Your Name:</span> Not set</p>
              <p><span className="font-medium">Email Address:</span> {user?.primaryEmailAddress?.emailAddress || "Not set"}</p>
              <p><span className="font-medium">Primary Phone:</span> Not set</p>
              <p><span className="font-medium">Alternate Phone:</span> Not set</p>
              <p><span className="font-medium">Billing Address:</span> Not set</p>
            </div>
          </div>

          {/* Security Section */}
          <div className="pt-4 border-t">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" /> Security
            </h2>
            <div className="space-y-3 text-gray-700">
              <div className="flex justify-between items-center">
                <p>Password</p>
                <Button className="bg-[#9fe870] text-[#163300] hover:bg-[#65cf21]">Edit Password</Button>
              </div>
              <div className="flex justify-between items-center">
                <p>Two-Factor Authentication</p>
                <Button className="bg-[#9fe870] text-[#163300] hover:bg-[#65cf21] flex items-center gap-2">
                  <KeyRound size={16} /> Configure 2FA
                </Button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="pt-4 border-t">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Bell className="w-5 h-5 text-green-600" /> Notification Settings
            </h2>
            <p className="text-gray-700">Manage how you receive transaction alerts, verification updates, and payment notifications.</p>
            <Button className="mt-2 bg-[#9fe870] text-[#163300] hover:bg-[#65cf21]">Configure Notifications</Button>
          </div>

          {/* Disbursement Methods */}
          <div className="pt-4 border-t">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-600" /> Saved Disbursement Methods
            </h2>
            <p className="text-gray-700">
              Your saved disbursement methods are listed below. You may also add new ones. Changes here won’t affect ongoing transactions.
            </p>
            <div className="mt-3 border rounded-lg p-4 flex justify-between items-center bg-gray-50">
              <p className="text-gray-600">No disbursement methods added yet.</p>
              <Button className="flex items-center gap-2 bg-[#9fe870] text-[#163300] hover:bg-[#65cf21]">
                <Plus size={16} /> Add New Method
              </Button>
            </div>
          </div>

          {/* Transaction Limits */}
          <div className="pt-4 border-t">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-green-600" /> Transaction Limits
            </h2>
            <p className="text-gray-700 mb-2">
              Based on your recent transactions, you can only pay/receive up to the following limits for your account:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><span className="font-medium">Pay as a buyer:</span> KES 50,000</li>
              <li><span className="font-medium">Receive as a seller:</span> KES 20,000</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

  );
}


      