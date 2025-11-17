import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';



export default function TransactionSummary() {
      const [deal, setDeal] = useState(null);
      const [mail, setMail] = useState("");
      const [contact, setContact] = useState("");
      const [agreed, setAgreed] = useState(false);
      const [errors, setErrors] = useState({});
      const [message, setMessage] = useState("");
      const [isStarting, setIsStarting] = useState(false);
      const navigate = useNavigate();
  
      const { getToken, isSignedIn } = useAuth();
  

      useEffect(() => {
        const saved = localStorage.getItem("dealDraft");
        if (saved) setDeal(JSON.parse(saved));
      }, []);

      if (!deal)
        return <p className="p-6">No deal found. Please create one first.</p>;

      // --- Core fee logic ---
      const escrowFee = Math.round(deal.price * 0.005);
      const halfFee = Math.round(escrowFee / 2);
      const totalBuyerPays = parseInt(deal.price) + halfFee;
      const sellerReceives = parseInt(deal.price) - halfFee;

      // --- Validation helpers ---
      const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const validateKenyanPhone = (phone) => /^\+254(7\d{8}|1\d{8})$/.test(phone);

      const normalizePhone = (input) => {
        let phone = input.replace(/\D/g, "");
        if (phone.startsWith("07") || phone.startsWith("01")) phone = `254${phone.slice(1)}`;
        else if (phone.startsWith("7") || phone.startsWith("1")) phone = `254${phone}`;
        else if (!phone.startsWith("254")) phone = `254${phone}`;
        return `+${phone.slice(0, 12)}`;
      };

      const handleEmailChange = (e) => {
        const value = e.target.value;
        setMail(value);
        setErrors((prev) => ({ ...prev, email: validateEmail(value) ? "" : "Enter a valid email." }));
        setAgreed(false);
      };

      const handlePhoneChange = (e) => {
        const formatted = normalizePhone(e.target.value);
        setContact(formatted);
        setErrors((prev) => ({
          ...prev,
          contact: validateKenyanPhone(formatted)
            ? ""
            : "Enter a valid Kenyan phone (e.g. +254712345678).",
        }));
        setAgreed(false);
      };

      const handleStart = async () => {
        setMessage(`Creating transaction...`);
        setIsStarting(true);

        try {
 
          // Get valid clerk JWT
          const token = await getToken();

           // Create transaction in backend using axios + JWT
           const response = await axios.post('http://localhost:5000/api/transactions', {
             transactionTitle: deal.transactionTitle,
             role: deal.role,
             assetType: deal.assetType,
             assetTitle: deal.assetTitle,
             assetDescription: deal.assetDescription,
             price: deal.price,
             terms: deal.terms.toLowerCase().replace(/\s*\([^)]*\)/, ''),
             deadline: deal.deadline,
             ...(deal.role === 'buyer'
               ? { sellerEmail: mail, sellerContact: contact }
               : { buyerEmail: mail, buyerContact: contact }
             )
           }, {
             headers: {
               'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
             },

           });
          

           const newTransaction = response.data;
           toast.success(`Transaction created successfully! ID: ${newTransaction.transaction.id}`);
           setMessage(`Redirecting to transaction progress...`);

           setTimeout(() => {
             navigate(`/transaction-progress?id=${newTransaction.transaction.id}`);
           }, 2000);
         } catch (error) {
           console.error('Error creating transaction:', error);
           const errorMessage = error.response?.data?.error || error.message || 'Failed to create transaction';
           toast.error(`Failed to create transaction: ${errorMessage}`);
           setMessage('Failed to create transaction. Please try again.');
           setIsStarting(false);
         }
      };

      const inputsAreValid =
        validateEmail(mail) && validateKenyanPhone(contact);

      return (
        <div className="w-[60vw] max-w-4xl mx-auto mt-10 space-y-6 mb-72">
          {/* Deal Summary */}
          <div className="bg-white p-6 rounded-2xl shadow-md border-none">
            <h2 className="text-2xl font-bold mb-4">Transaction Summary</h2>
            <ul className="text-sm space-y-2">
              <li><strong>Transaction title:</strong> {deal.transactionTitle}</li>
              <li><strong>Role:</strong> {deal.role }</li>
              <li><strong>Asset:</strong> {deal.assetTitle} ({deal.assetType})</li>
              <li><strong>Description:</strong> {deal.assetDescription}</li>
              <li className="pt-2 border-t border-gray-200">
                <strong>Asset price:</strong> KES {deal.price.toLocaleString()}
              </li>
              <li><strong>Total escrow fee (0.50%):</strong> KES {escrowFee.toLocaleString()}</li>

              {/* Escrow Split Box */}
              <div className="mt-4 bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="text-gray-800 font-semibold mb-3 flex items-center gap-2">
                  Escrow Fee Split (50/50)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Buyer */}
                  <div className="flex flex-col items-center justify-center bg-green-50 border border-green-100 rounded-lg py-3">
                    <p className="text-green-800 font-medium">Buyer Pays</p>
                    <p className="text-lg font-semibold text-green-700">
                      KES {halfFee.toLocaleString()}
                    </p>
                    <span className="text-xs text-gray-500 mt-1">0.50% fee shared equally</span>
                  </div>

                  {/* Seller */}
                  <div className="flex flex-col items-center justify-center bg-blue-50 border border-blue-100 rounded-lg py-3">
                    <p className="text-blue-800 font-medium">Seller Pays</p>
                    <p className="text-lg font-semibold text-blue-700">
                      KES {halfFee.toLocaleString()}
                    </p>
                    <span className="text-xs text-gray-500 mt-1">Deducted from payout</span>
                  </div>
                </div>
              </div>
              
              <li className="pt-3 border-t border-gray-200">
                <strong>Amount buyer pays:</strong>{" "}
                <span className="text-green-700 font-semibold">
                  KES {totalBuyerPays.toLocaleString()}
                </span>
              </li>
              <li>
                <strong>Seller receives:</strong>{" "}
                <span className="text-blue-700 font-semibold">
                  KES {sellerReceives.toLocaleString()}
                </span>
              </li>
              <li><strong>Deadline:</strong> {deal.deadline || "Not set"}</li>
            </ul>
          </div>

          {/* Seller Form */}
          <div className="bg-white p-6 rounded-2xl shadow-md border-none">
            <h3 className="text-lg font-semibold mb-4">
              {deal.role === 'buyer' ? 'Add Seller Details' : 'Add Buyer Details'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Email */}
              <div>
                <fieldset className="border border-gray-300 p-2 rounded focus-within:border-green-500 transition">
                  <legend className="text-sm px-1 text-gray-600">
                    {deal.role === 'buyer' ? 'Seller Email' : 'Buyer Email'}
                  </legend>
                  <input
                    type="email"
                    placeholder={deal.role === 'buyer' ? 'seller@example.com' : 'buyer@example.com'}
                    value={mail}
                    onChange={handleEmailChange}
                    className={`w-full p-2 rounded outline-none ${errors.email ? "border-red-500" : ""}`}
                  />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </fieldset>
              </div>

              {/* Phone */}
              <div>
                <fieldset className="border border-gray-300 p-2 rounded focus-within:border-green-500 transition">
                  <legend className="text-sm px-1 text-gray-600">
                    {deal.role === 'buyer' ? 'Seller Phone' : 'Buyer Phone'}
                  </legend>
                  <input
                    type="tel"
                    placeholder="712345678"
                    value={contact}
                    onChange={handlePhoneChange}
                    className={`w-full p-2 rounded outline-none ${errors.contact ? "border-red-500" : ""}`}
                  />
                  {errors.contact && <p className="text-red-500 text-sm">{errors.contact}</p>}
                </fieldset>
              </div>
            </div>

            {/* Checkbox */}
            <label className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={agreed}
                disabled={!inputsAreValid}
                onChange={() => setAgreed(!agreed)}
              />
              <span>
                I agree to the{" "}
                <a href="#" className="text-blue-600 underline">Escrow Terms & Conditions</a>.
              </span>
            </label>

            {/* Start Transaction Button */}
            {agreed && (
              <button
                onClick={handleStart}
                disabled={isStarting}
                className="px-4 py-2 rounded cursor-pointer text-white bg-green-600 hover:bg-green-700 transition"
              >
                {isStarting ? "Creating..." : "Start Transaction"}
              </button>
            )}

              {message && (
              <p className="mt-2 text-sm text-green-600">{message}</p>
            )}
          </div>
        </div>
      );
  }
