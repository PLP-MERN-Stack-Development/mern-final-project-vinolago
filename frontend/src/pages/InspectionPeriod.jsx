import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "../ui";
import toast from 'react-hot-toast';
import axios from 'axios';

export default function InspectionPeriod() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [transaction, setTransaction] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [canAccept, setCanAccept] = useState(false);

    useEffect(() => {
        const fetchTransaction = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/transactions/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setTransaction(data);

                    // Calculate inspection period (default 3 days)
                    const inspectionEnd = new Date(data.inspectionPeriodEnd || Date.now() + (3 * 24 * 60 * 60 * 1000));
                    const now = new Date();
                    const remaining = Math.max(0, inspectionEnd - now);
                    setTimeRemaining(remaining);
                    setCanAccept(remaining <= 0);
                }
            } catch (error) {
                console.error("Failed to fetch transaction:", error);
            }
        };

        fetchTransaction();

        // Update countdown every minute
        const interval = setInterval(() => {
            setTimeRemaining(prev => {
                const newTime = Math.max(0, prev - 60000);
                setCanAccept(newTime <= 0);
                return newTime;
            });
        }, 60000);

        return () => clearInterval(interval);
    }, [id]);

    const formatTime = (ms) => {
        const days = Math.floor(ms / (24 * 60 * 60 * 1000));
        const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
        return `${days}d ${hours}h ${minutes}m`;
    };

    const handleAcceptAsset = async () => {
        try {
            const response = await axios.post(`http://localhost:5000/api/transactions/${id}/accept-asset`, {
                method: 'POST'
            });

            if (response.ok) {
                toast.success("Asset accepted! Transaction will be completed.");
                navigate(`/transaction-complete/${id}`);
            } else {
                toast.error("Failed to accept asset. Please try again.");
            }
        } catch (error) {
            toast.error("Acceptance failed. Please contact support.");
        }
    };

    const handleRaiseDispute = () => {
        toast.info("Dispute raised. Support will contact you shortly.");
        // Navigate to dispute page or show dispute form
    };

    if (!transaction) return <div className="text-center py-8">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto mt-8 p-6">
            <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Inspection Period</h2>
                <p className="text-gray-600 mb-6">
                    You now have time to inspect and verify the transferred asset before accepting it.
                </p>

                <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-semibold">Transaction #{transaction.id}</p>
                        <p>Asset: {transaction.assetType} - {transaction.assetTitle}</p>
                    </div>

                    <div className="border-t pt-4">
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-semibold mb-2">Inspection Time Remaining</h3>
                            <div className="text-3xl font-bold text-blue-600">
                                {timeRemaining !== null ? formatTime(timeRemaining) : "Loading..."}
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                                {canAccept
                                    ? "Inspection period has ended. You can now accept the asset."
                                    : "Please thoroughly inspect the asset before the time expires."
                                }
                            </p>
                        </div>

                        {canAccept ? (
                            <div className="space-y-3">
                                <button
                                    onClick={handleAcceptAsset}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                                >
                                    Accept Asset & Complete Transaction
                                </button>
                                <button
                                    onClick={handleRaiseDispute}
                                    className="w-full border border-red-300 text-red-600 hover:bg-red-50 font-semibold py-3 px-6 rounded-lg transition"
                                >
                                    Raise Dispute
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-yellow-600 mb-3">
                                     Inspection period is still active
                                </p>
                                <p className="text-sm text-gray-600">
                                    You will be able to accept or dispute the asset once the inspection period ends.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
}