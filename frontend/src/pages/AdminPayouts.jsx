import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import { Button, Card } from "../ui";

export default function AdminPayouts() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletSummary, setWalletSummary] = useState({
    totalInEscrow: 0,
    awaitingPayout: 0,
    totalReleased: 0
  });

  useEffect(() => {
    fetchPayouts();
    fetchWalletSummary();
  }, []);

  const fetchPayouts = async () => {
    try {
      const token = await getToken();
      const res = await axios.get('http://localhost:5000/api/admin/payouts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(res.data.transactions);
    } catch (error) {
      console.error('Error fetching payouts:', error);
      toast.error('Failed to fetch payouts');
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletSummary = async () => {
    try {
      const token = await getToken();
      const res = await axios.get('http://localhost:5000/api/admin/wallet-summary', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWalletSummary(res.data);
    } catch (error) {
      console.error('Error fetching wallet summary:', error);
    }
  };

  const handleDisburseFunds = async (transactionId) => {
    const message = process.env.NODE_ENV !== 'production'
      ? "Are you sure you want to disburse funds to the seller? (Simulation mode - no real money will be transferred)"
      : "Are you sure you want to disburse funds to the seller? This will trigger a real M-Pesa payment.";

    if (window.confirm(message)) {
      try {
        const token = await getToken();
        await axios.post(`http://localhost:5000/api/admin/payouts/${transactionId}/disburse`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Funds disbursed successfully");
        fetchPayouts(); // Refresh the list
        fetchWalletSummary(); // Refresh wallet summary
      } catch (error) {
        console.error('Error disbursing funds:', error);
        toast.error('Failed to disburse funds');
      }
    }
  };

  if (loading) return <p className="text-center py-6">Loading payouts...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Payouts</h1>

        {/* Wallet Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800">Total in Escrow</h3>
            <p className="text-2xl font-bold text-blue-600">KSh {walletSummary.totalInEscrow.toLocaleString()}</p>
            <p className="text-sm text-gray-600">All funded transactions</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800">Awaiting Payout</h3>
            <p className="text-2xl font-bold text-orange-600">KSh {walletSummary.awaitingPayout.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Ready for disbursement</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800">Total Released</h3>
            <p className="text-2xl font-bold text-green-600">KSh {walletSummary.totalReleased.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Successfully disbursed</p>
          </Card>
        </div>

        {/* Simulation Notice - Development Only */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2">🔧 Simulation Mode Active</h3>
            <p className="text-sm text-yellow-700">
              You can use the "Simulate Disbursement" buttons below to test the payout flow without real money transfers.
            </p>
          </div>
        )}

        {/* Payouts Table */}
        <Card className="overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Pending Payouts</h2>
            <p className="text-sm text-gray-600">Transactions awaiting fund disbursement</p>
          </div>

          {transactions.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No pending payouts</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Buyer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seller
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Funded
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.transactionId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transaction.transactionId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.buyer?.email || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.seller?.email || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        KSh {transaction.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.paymentDetails?.completedAt
                          ? new Date(transaction.paymentDetails.completedAt).toLocaleDateString()
                          : 'N/A'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          onClick={() => handleDisburseFunds(transaction.transactionId)}
                          className="bg-green-600 hover:bg-green-700 cursor-pointer text-white px-4 py-2 rounded"
                        >
                          Disburse Funds
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}