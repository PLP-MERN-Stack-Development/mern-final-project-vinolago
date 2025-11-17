import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "../ui";
import toast from 'react-hot-toast';

export default function AssetTransfer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [transaction, setTransaction] = useState(null);
    const [transferDetails, setTransferDetails] = useState({
        transferMethod: "",
        recipientInfo: "",
        notes: ""
    });

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

    const handleTransfer = async (e) => {
        e.preventDefault();

        if (!transferDetails.transferMethod || !transferDetails.recipientInfo) {
            toast.error("Please fill in all required fields.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/transactions/${id}/transfer-asset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transferDetails)
            });

            if (response.ok) {
                toast.success("Asset transfer initiated successfully!");
                navigate(`/inspection-period/${id}`);
            } else {
                toast.error("Failed to initiate asset transfer. Please try again.");
            }
        } catch (error) {
            toast.error("Transfer failed. Please contact support.");
        }
    };

    if (!transaction) return <div className="text-center py-8">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto mt-8 p-6">
            <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Asset Transfer</h2>
                <p className="text-gray-600 mb-6">
                    Now that payment has been confirmed, please provide the asset transfer details.
                </p>

                <form onSubmit={handleTransfer} className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <p className="font-semibold">Transaction #{transaction.id}</p>
                        <p>Asset: {transaction.assetType} - {transaction.assetTitle}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Transfer Method <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={transferDetails.transferMethod}
                            onChange={(e) => setTransferDetails(prev => ({
                                ...prev,
                                transferMethod: e.target.value
                            }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            required
                        >
                            <option value="">Select transfer method</option>
                            <option value="domain_transfer">Domain Transfer</option>
                            <option value="github_transfer">GitHub Repository Transfer</option>
                            <option value="file_upload">File Upload</option>
                            <option value="account_credentials">Account Credentials</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Recipient Information <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={transferDetails.recipientInfo}
                            onChange={(e) => setTransferDetails(prev => ({
                                ...prev,
                                recipientInfo: e.target.value
                            }))}
                            placeholder="Provide the necessary information for the buyer to access the asset..."
                            className="w-full border border-gray-300 rounded-md px-3 py-2 h-24"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Additional Notes (Optional)
                        </label>
                        <textarea
                            value={transferDetails.notes}
                            onChange={(e) => setTransferDetails(prev => ({
                                ...prev,
                                notes: e.target.value
                            }))}
                            placeholder="Any additional instructions or notes..."
                            className="w-full border border-gray-300 rounded-md px-3 py-2 h-20"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                    >
                        Initiate Asset Transfer
                    </button>
                </form>
            </Card>
        </div>
    );
}