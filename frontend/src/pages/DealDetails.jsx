import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import { Button, Card } from "../ui";
import ProgressSteps from "../components/ProgressSteps";
import Modal from "../components/Modal";
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

export default function TransactionDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getToken, user } = useAuth();
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [nationalId, setNationalId] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");

    useEffect(() => {
        async function fetchTransaction() {
            try {
                const token = await getToken();
                const res = await axios.get(`http://localhost:5000/api/transactions/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = res.data;
                setTransaction(data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch transaction:", error);
                setLoading(false);
            }
        }
        if (id) {
            fetchTransaction();
        }
    }, [id, getToken]);

    const handleReviewTransaction = () => {
        navigate(`/transaction-details/${transaction.id}`);
    }

    const handleSavePaymentDetails = async () => {
        try {
            const token = await getToken();
            await axios.post(`http://localhost:5000/api/users/payment-details`, {
                nationalId,
                paymentMethod
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            toast.success("Payment details saved successfully!");
            setShowModal(false);
            setTimeout(() => {
                navigate('/transactions');
            }, 2000);
        } catch (error) {
            console.error("Failed to save payment details:", error);
            toast.error("Failed to save payment details. Please try again.");
        }
    }

    const handleReleaseFunds = async () => {
        if (window.confirm("Are you sure you want to release the funds? This will move them to admin review for disbursement to the seller.")) {
            try {
                const token = await getToken();
                await axios.post(`http://localhost:5000/api/transactions/${id}/release-funds`, {}, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success("Funds released successfully. Admin will review and disburse to seller.");
                // Refresh the transaction data
                window.location.reload();
            } catch (err) {
                toast.error(err.response?.data?.error || "Failed to release funds");
            }
        }
    };

    const handleDisburseFunds = async (transactionId) => {
        try {
            const token = await getToken();
            await axios.post(`http://localhost:5000/api/admin/payouts/${transactionId}/disburse`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Funds disbursed successfully");
            window.location.reload();
        } catch (error) {
            console.error('Error disbursing funds:', error);
            toast.error('Failed to disburse funds');
        }
    };

        


    if (loading) return <p className="text-center mt-10">Loading...</p>;
    if (!transaction) return <p className="text-center mt-10">Transaction not found</p>;

    const steps = [
        { key: "agreement", label: "Agreement" },
        { key: "payment", label: "Payment" },
        { key: "transfer", label: "Asset Transfer" },
        { key: "inspection", label: "Inspection" },
        { key: "awaiting_admin_payout", label: "Admin Review" },
        { key: "completed", label: "Closed" },
    ];

    const activeIndex = steps.findIndex((s) => s.key === transaction.status);

    return (
      <>
        <div className="max-w-3xl mx-auto mt-8 mb-72">
          <Card className="p-6">
            {/* Existing transaction details UI */}
            <div
              className={`rounded-md p-3 mb-4 text-sm font-medium flex items-center gap-2 ${
                transaction.currentUserRole === "seller"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}
            >
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  transaction.currentUserRole === "seller"
                    ? "bg-green-500"
                    : "bg-blue-500"
                }`}
              ></span>

              {transaction.currentUserRole === "seller" ? (
                <span>
                  You're viewing this transaction as the <strong>Seller</strong>.
                </span>
              ) : (
                <span>
                  You're viewing this transaction as the <strong>Buyer</strong>.
                </span>
              )}
            </div>

            <h2 className="text-2xl font-bold mb-2">This transaction is for sale of {transaction.assetType}</h2>
            <p className="text-gray-500 mb-4">Transaction #{transaction.id}</p>

            <div className="flex items-center gap-2 mb-4">
              <span className="h-3 w-3 bg-yellow-500 rounded-full"></span>
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                {transaction.status}
              </span>
            </div>

            <p className="text-gray-700 mb-6">
              {transaction.currentUserRole === "buyer" ? (
                <>I am buying <strong>{transaction.assetType} </strong> from <strong>{transaction.seller?.email || "seller"}</strong>. </>
              ) : (
                <>I am selling <strong>{transaction.assetType}</strong> to <strong>{transaction.buyer?.email || "buyer"}</strong>. </>
              )}
              The confirmation period is <strong>{transaction.inspectionPeriod}</strong> day(s).
            </p>

            {/* Progress Steps */}
            <ProgressSteps steps={steps} activeIndex={activeIndex} />


            <div className="border p-4 rounded-lg bg-blue-50">
              {transaction.status === "agreement" && transaction.currentUserRole === "buyer" && (
                <>
                  <h3 className="font-semibold text-blue-800 mb-2">Review the transaction</h3>
                  <p className="text-gray-600 mb-4">
                    The seller initiated this transaction. Please review the terms and proceed to payment.
                  </p>
                  <Button onClick={() => navigate(`/payment-invoice/${transaction.id}`)} variant="primary" className="cursor-pointer">
                    Proceed to pay
                  </Button>
                </>
              )}

              {transaction.status === "payment" && transaction.currentUserRole === "buyer" && (
                <>
                  <h3 className="font-semibold text-blue-800 mb-2">Complete payment</h3>
                  <p className="text-gray-600 mb-4">
                    Please complete the payment to fund the escrow.
                  </p>
                  <Button onClick={() => navigate(`/payment-invoice/${transaction.id}`)} variant="primary" className="cursor-pointer">
                    Complete Payment
                  </Button>
                </>
              )}

              {transaction.status === "transfer" && transaction.currentUserRole === "seller" && (
                <>
                  <h3 className="font-semibold text-blue-800 mb-2">Transfer the asset</h3>
                  <p className="text-gray-600 mb-4">
                    Please transfer the asset to the buyer as agreed.
                  </p>
                  <Button onClick={() => navigate(`/asset-transfer/${transaction.id}`)} variant="primary" className="cursor-pointer">
                    Transfer Asset
                  </Button>
                </>
              )}

              {transaction.status === "inspection" && transaction.currentUserRole === "buyer" && (
                <>
                  <h3 className="font-semibold text-blue-800 mb-2">Inspect and release funds</h3>
                  <p className="text-gray-600 mb-4">
                    Please inspect the asset. If satisfied, release the funds for admin review.
                  </p>
                  <Button onClick={handleReleaseFunds} variant="primary" className="cursor-pointer">
                    Release Funds
                  </Button>
                </>
              )}

              {transaction.status === "awaiting_admin_payout" && (
                <>
                  <h3 className="font-semibold text-blue-800 mb-2">Funds released for admin review</h3>
                  <p className="text-gray-600 mb-4">
                    Your funds have been released and are awaiting admin disbursement to the seller.
                  </p>
                  {/* Admin Disburse Button - Only show for admin users */}
                  {user?.publicMetadata?.role === 'admin' && (
                    <div className="mb-4">
                      <Button
                        onClick={() => {
                          if (window.confirm("Are you sure you want to disburse funds to the seller? This will trigger a real M-Pesa payment.")) {
                            // Real disbursement
                            handleDisburseFunds(transaction.id);
                          }
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mr-2"
                      >
                        Disburse Funds
                      </Button>
                    </div>
                  )}
                  <Button onClick={() => navigate('/transactions')} variant="secondary" className="cursor-pointer">
                    Back to Transactions
                  </Button>
                </>
              )}

              {transaction.status === "completed" && (
                <>
                  <h3 className="font-semibold text-green-800 mb-2">Transaction completed</h3>
                  <p className="text-gray-600 mb-4">
                    This transaction has been successfully completed.
                  </p>
                  <Button onClick={() => navigate('/transactions')} variant="secondary" className="cursor-pointer">
                    Back to Transactions
                  </Button>
                </>
              )}

              {transaction.currentUserRole === "seller" && transaction.status === "agreement" && (
                <>
                  <h3 className="font-semibold text-blue-800 mb-2">Choose a payment method</h3>
                  <p className="text-gray-600 mb-4">
                    Please select how you'll receive funds once this transaction is complete.
                  </p>
                  <Button onClick={() => navigate('/seller-payment-setup')} variant="secondary" className="cursor-pointer">
                    Add payment method
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
          {/* Modal */}
          <Modal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title={
              transaction.currentUserRole === "seller"
                ? "Add Payment Details"
                : "Pay with MPESA"
            }
          >
            {transaction.currentUserRole === "seller" ? (
              <>
                <label className="block mb-2 text-sm font-medium">
                  National ID
                </label>
                <input
                  type="text"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
                  placeholder="Enter your ID number"
                />

                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
                >
                  <option value="">Choose method</option>
                  <option value="mpesa">Mpesa</option>
                  <option value="bank">Bank</option>
                </select>

                <Button onClick={handleSavePaymentDetails} className="w-full cursor-pointer">
                  Add
                </Button>
              </>
            ) : (
              <Button
                onClick={() => navigate(`/payment/${transaction.transactionId}`)}
                variant="primary"
                className="w-full cursor-pointer"
              >
                Pay with MPESA
              </Button>
            )}
          </Modal>
        </>
    );

}
