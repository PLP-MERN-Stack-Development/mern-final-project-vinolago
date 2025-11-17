import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "../ui";
import toast from 'react-hot-toast';
import axios from 'axios';

export default function PaymentPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchTransaction = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/transactions/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setTransaction(data);
                }
            } catch (error) {
                console.error("Failed to fetch transaction:", error);
            }
        };
        fetchTransaction();
    }, [id]);

    const handleMpesaPayment = async () => {
        setLoading(true);
        try {
            // Simulate M-Pesa payment initiation
            const response = await axios.get(`http://localhost:5000/api/transactions/${id}/initiate-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentMethod: 'mpesa' })
            });

            if (response.ok) {
                toast.success("M-Pesa payment initiated. Check your phone for STK push.");
                // Redirect to payment confirmation after a delay
                setTimeout(() => {
                    navigate(`/payment-confirmation/${id}`);
                }, 3000);
            } else {
                toast.error("Failed to initiate payment. Please try again.");
            }
        } catch (error) {
            toast.error("Payment initiation failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!transaction) return <div className="text-center py-8">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto mt-8 p-6">
            <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Complete Payment</h2>
                <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-semibold">Transaction #{transaction.id}</p>
                        <p>Amount: KES {transaction.amount}</p>
                        <p>Asset: {transaction.assetType}</p>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="text-lg font-semibold mb-3">Payment Method</h3>
                        <button
                            onClick={handleMpesaPayment}
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50"
                        >
                            {loading ? "Processing..." : "Pay with M-Pesa"}
                        </button>
                        <p className="text-sm text-gray-600 mt-2">
                            You will receive an STK push on your phone to complete the payment.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}