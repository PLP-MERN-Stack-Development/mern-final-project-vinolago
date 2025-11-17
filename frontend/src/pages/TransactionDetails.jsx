import { useEffect, useState } from "react";
import axios from 'axios';

// Helper: progress mapping
const progressMap = {
  pending: 25,
  funded: 50,
  completed: 100,
  cancelled: 0,
  expired: 0,
};

export default function TransactionDetails({ transactionId }) {
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch transaction details
    useEffect(() => {

    const fetchTransaction = async () => {
      try {
        const res = await axios.get(`/api/transactions/${transactionId}`);
        if (!res.ok) throw new Error("Failed to fetch transaction");
        const data = await res.json();
        setTransaction(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTransaction();
  }, [transactionId]); 

  // Fund escrow action
  const handleFund = async () => {
    if (new Date(transaction.deadline) < new Date()) {
      alert("Deadline has passed. Cannot fund escrow.");
      return;
    }

    try {
      const res = await axios.post(`/api/transactions/${transactionId}/fund`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Funding failed");
      const updated = await res.json();
      setTransaction(updated);
    } catch (err) {
      alert(err.message);
    }
  };

  // Complete transaction
  const handleComplete = async () => {
    try {
      const res = await axios.post(`/api/transactions/${transactionId}/complete`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Completion failed");
      const updated = await res.json();
      setTransaction(updated);
    } catch (err) {
      alert(err.message);
    }
  };

  // Cancel transaction
  const handleCancel = async () => {
    try {
      const res = await axios.post(`/api/transactions/${transactionId}/cancel`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Cancel failed");
      const updated = await res.json();
      setTransaction(updated);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p className="text-center py-6">Loading transaction...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!transaction) return <p>No transaction found.</p>;

  const progress = progressMap[transaction.status] || 0;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow">
      <h2 className="text-xl font-bold mb-4">Transaction Details</h2>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full ${
              transaction.status === "completed"
                ? "bg-green-500"
                : transaction.status === "cancelled" || transaction.status === "expired"
                ? "bg-red-500"
                : "bg-blue-500"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm mt-2 font-medium">Status: {transaction.status}</p>
      </div>

      {/* Transaction info */}
      <div className="space-y-2 text-sm">
        <p><span className="font-semibold">Buyer:</span> {transaction.buyer}</p>
        <p><span className="font-semibold">Seller:</span> {transaction.seller}</p>
        <p><span className="font-semibold">Amount:</span> ${transaction.amount}</p>
        <p>
          <span className="font-semibold">Deadline:</span>{" "}
          {new Date(transaction.deadline).toLocaleDateString()}
        </p>
      </div>

      {/* Warning */}
      {transaction.status === "pending" && (
        <p className="mt-4 text-yellow-600 text-sm font-medium">
          You must fund escrow by the deadline, or the deal will automatically expire.
        </p>
      )}

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        {transaction.status === "pending" && (
          <button
            onClick={handleFund}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Fund Escrow
          </button>
        )}

        {transaction.status === "funded" && (
          <button
            onClick={handleComplete}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Mark as Complete
          </button>
        )}

        {transaction.status === "pending" || transaction.status === "funded" ? (
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Cancel Deal
          </button>
        ) : null}
      </div>
    </div>
  );
}
