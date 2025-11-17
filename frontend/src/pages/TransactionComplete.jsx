import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "../ui";
import toast from 'react-hot-toast';

export default function TransactionComplete() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [transaction, setTransaction] = useState(null);

    useEffect(() => {
        const fetchTransaction = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/transactions/${id}`);
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

    const handleViewTransactions = () => {
        navigate('/transactions');
    };

    const handleDownloadReceipt = () => {
        // Simulate receipt download
        toast.success("Receipt downloaded successfully!");
    };

    if (!transaction) return <div className="text-center py-8">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto mt-8 p-6">
            <Card className="p-6 text-center">
                <div className="mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-green-600 mb-2">Transaction Completed!</h2>
                    <p className="text-gray-600">
                        Your escrow transaction has been successfully completed.
                    </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h3 className="font-semibold mb-2">Transaction Summary</h3>
                    <div className="text-left space-y-1">
                        <p><span className="font-medium">Transaction ID:</span> #{transaction.id}</p>
                        <p><span className="font-medium">Asset:</span> {transaction.assetType} - {transaction.assetTitle}</p>
                        <p><span className="font-medium">Amount:</span> KES {transaction.amount}</p>
                        <p><span className="font-medium">Status:</span> <span className="text-green-600 font-medium">Completed</span></p>
                        <p><span className="font-medium">Completed On:</span> {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={handleViewTransactions}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                    >
                        View All Transactions
                    </button>
                    <button
                        onClick={handleDownloadReceipt}
                        className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-6 rounded-lg transition"
                    >
                        Download Receipt
                    </button>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <strong>What's next?</strong> The seller has been notified and funds have been released.
                        If you have any questions, please contact our support team.
                    </p>
                </div>
            </Card>
        </div>
    );
}