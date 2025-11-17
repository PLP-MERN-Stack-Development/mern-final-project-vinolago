import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "../ui";
import toast from 'react-hot-toast';

export default function PaymentConfirmation() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [transaction, setTransaction] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState("pending");

    useEffect(() => {
        const fetchTransaction = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/transactions/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setTransaction(data);
                    setPaymentStatus(data.paymentStatus || "pending");
                }
            } catch (error) {
                console.error("Failed to fetch transaction:", error);
            }
        };

        fetchTransaction();

        // Poll for payment status updates
        const interval = setInterval(fetchTransaction, 10000); // Check every 10 seconds
        return () => clearInterval(interval);
    }, [id]);

    const handleConfirmPayment = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/transactions/${id}/confirm-payment`, {
                method: 'POST'
            });

            if (response.ok) {
                toast.success("Payment confirmed! Transaction status updated.");
                navigate(`/asset-transfer/${id}`);
            } else {
                toast.error("Failed to confirm payment. Please try again.");
            }
        } catch (error) {
            toast.error("Confirmation failed. Please contact support.");
        }
    };

    if (!transaction) return <div className="text-center py-8">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto mt-8 p-6">
            <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Payment Confirmation</h2>

                <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-semibold">Transaction #{transaction.id}</p>
                        <p>Amount: KES {transaction.amount}</p>
                        <p>Asset: {transaction.assetType}</p>
                    </div>

                    <div className="border-t pt-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-4 h-4 rounded-full ${
                                paymentStatus === "completed" ? "bg-green-500" :
                                paymentStatus === "pending" ? "bg-yellow-500" : "bg-red-500"
                            }`}></div>
                            <span className="font-medium">
                                Payment Status: {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
                            </span>
                        </div>

                        {paymentStatus === "completed" ? (
                            <div className="space-y-3">
                                <p className="text-green-600 font-medium">
                                    ✅ Payment received successfully!
                                </p>
                                <button
                                    onClick={handleConfirmPayment}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                                >
                                    Proceed to Asset Transfer
                                </button>
                            </div>
                        ) : paymentStatus === "pending" ? (
                            <div className="text-center py-4">
                                <p className="text-yellow-600 mb-3">
                                    ⏳ Waiting for payment confirmation...
                                </p>
                                <p className="text-sm text-gray-600">
                                    This may take a few minutes. Please do not close this page.
                                </p>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-red-600 mb-3">
                                    ❌ Payment failed or was cancelled.
                                </p>
                                <button
                                    onClick={() => navigate(`/payment/${id}`)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
}