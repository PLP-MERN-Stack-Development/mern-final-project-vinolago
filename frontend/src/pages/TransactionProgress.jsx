import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

export default function TransactionProgress() {
    const [searchParams] = useSearchParams();
    const transactionId = searchParams.get("id") || "13129690";
    const [assetType, setAssetType] = useState("");
    const [initiator, setInitiator] = useState("");
    const [createdAt, setCreatedAt] = useState(null);
    const [transactionStatus, setTransactionStatus] = useState("agreement");
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);
    const { getToken, user } = useAuth();

    // Fetch transaction data from backend
    useEffect(() => {
        const fetchTransaction = async () => {
            try {
                const token = await getToken();
                const response = await axios.get(`http://localhost:5000/api/transactions/${transactionId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = response.data;
                setTransaction(data);
                setTransactionStatus(data.status);
                setAssetType(data.assetType);
                setCreatedAt(new Date(data.createdAt));
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch transaction:", error);
                setLoading(false);
            }
        };

        if (transactionId) {
            fetchTransaction();
            // Poll for status updates every 30 seconds
            const interval = setInterval(fetchTransaction, 30000);
            return () => clearInterval(interval);
        }
    }, [transactionId, getToken]);

    // Determine if current user is seller or buyer
    const isSeller = transaction && user && transaction.seller?.clerkId === user.id;
    const isBuyer = transaction && user && transaction.buyer?.clerkId === user.id;

    const steps = [
        { key: "agreement", label: "Agreement" },
        { key: "payment", label: "Payment" },
        { key: "transfer", label: "Asset Transfer" },
        { key: "confirm", label: "Confirmation" },
        { key: "closed", label: "Closed" },
    ];

    const activeIndex = steps.findIndex((s) => s.key === transactionStatus);
    const formattedDate = transaction ? new Date(transaction.createdAt).toLocaleString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
    }) : "";

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4 flex justify-center">
                <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md p-6">
                    <div className="text-center">Loading transaction...</div>
                </div>
            </div>
        );
    }

    if (!transaction) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4 flex justify-center">
                <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md p-6">
                    <div className="text-center">Transaction not found</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 flex justify-center mb-48">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md p-6 space-y-6">
            {/* Header */}
            <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">This transaction is for sale of a {transaction.assetType}</h2>
            <p className="text-sm text-gray-500">Created on: {formattedDate}</p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between relative">
            {steps.map((step, index) => (
                <div key={step.key} className="flex flex-col items-center w-full relative">
                <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm z-10
                    ${
                        index <= activeIndex
                        ? "bg-green-500 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                >
                    {index + 1}
                </div>
                <span
                    className={`text-sm mt-1 ${
                    index <= activeIndex ? "text-green-600 font-medium" : "text-gray-700"
                    }`}
                >
                    {step.label}
                </span>
                {index < steps.length - 1 && (
                    <div
                    className={`absolute top-4 left-[50%] right-[-50%] h-[2px] 
                        ${index < activeIndex ? "bg-green-500" : "bg-gray-300"}`}
                    />
                )}
                </div>
            ))}
            </div>

            <p className="text-sm text-gray-500 text-center">Last updated: {formattedDate}</p>

            {/* Agreement Section */}
            {transactionStatus === 'agreement' && (
                <div className="bg-green-50 rounded-xl p-6 text-center space-y-4">
                    {isSeller ? (
                        <>
                            <h3 className="text-lg font-semibold text-gray-800">Review the transaction</h3>
                            <p className="text-gray-600">
                                You are the seller. Please wait for buyer ({transaction.buyer?.email || transaction.buyer?.name || 'buyer'}) to review terms and pay.
                            </p>
                            <a
                                href={`/deal-details/${transactionId}`}
                                onClick={() => toast.success("Redirecting to transaction details...")}
                                className="inline-block bg-[#9fe870] hover:bg-[#65cf21] text-white font-semibold py-3 px-6 rounded-lg transition"
                            >
                                View transaction
                            </a>
                        </>
                    ) : isBuyer ? (
                        <>
                            <h3 className="text-lg font-semibold text-gray-800">
                                {transaction.seller?.name || transaction.seller?.email || 'Seller'} initiated this transaction. Please review and agree to the terms to proceed.
                            </h3>
                            <a
                                href={`/deal-details/${transactionId}`}
                                onClick={() => toast.success("Redirecting to transaction details...")}
                                className="inline-block bg-[#9fe870] hover:bg-[#65cf21] text-white font-semibold py-3 px-6 rounded-lg transition"
                            >
                                Review transaction
                            </a>
                        </>
                    ) : (
                        <>
                            <h3 className="text-lg font-semibold text-gray-800">Agree to the transaction</h3>
                            <p className="text-gray-600">
                                Please review and agree to the terms to proceed.
                            </p>
                            <a
                                href={`/deal-details/${transactionId}`}
                                onClick={() => toast.success("Redirecting to transaction details...")}
                                className="inline-block bg-[#9fe870] hover:bg-[#65cf21] text-white font-semibold py-3 px-6 rounded-lg transition"
                            >
                                Review transaction
                            </a>
                        </>
                    )}
                </div>
            )}
        </div>
        </div>
    );
}
