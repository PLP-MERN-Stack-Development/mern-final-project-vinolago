import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, Printer, RefreshCcw, CheckCircle2 } from "lucide-react";
import { Input, Button } from "../ui";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

const PaymentInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken, user } = useAuth();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mpesaPhone, setMpesaPhone] = useState("254723881433");
  const [stkStatus, setStkStatus] = useState("idle");
  const [isVerifying, setIsVerifying] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState(null);
  const [phoneError, setPhoneError] = useState("");
  // idle | pending | success | failed

  useEffect(() => {
    async function fetchTransaction() {
      try {
        const token = await getToken();
        const res = await axios.get(`http://localhost:5000/api/transactions/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTransaction(res.data);
      } catch (error) {
        console.error("Failed to fetch transaction:", error);
        toast.error("Failed to load invoice data");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchTransaction();
  }, [id, getToken]);

  const handlePrint = () => window.print();

  const handleDownloadPDF = async () => {
    if (!transaction) return;
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header
    pdf.setFontSize(20);
    pdf.text("EscrowPay", 20, yPosition);
    pdf.setFontSize(12);
    pdf.text("Secure Transaction Platform", 20, yPosition + 5);

    pdf.setFontSize(14);
    pdf.text(`Invoice #${transaction.invoiceNumber || transaction.transactionId || transaction.id}`, pageWidth - 60, yPosition);
    pdf.text(`Status: ${stkStatus === "success" ? "Paid" : "Unpaid"}`, pageWidth - 60, yPosition + 5);
    pdf.text(`Due Date: ${new Date(transaction.deadline).toLocaleDateString()}`, pageWidth - 60, yPosition + 10);

    yPosition += 20;

    // Instructions
    pdf.setFontSize(12);
    pdf.text("Payment Instructions", 20, yPosition);
    yPosition += 10;
    pdf.setFontSize(10);
    const instructions = `We use M-Pesa Express (STK Push) to simplify payments. A prompt will be sent to your phone to authorize KSh ${(transaction.amount + transaction.escrowFee + transaction.amount * 0.00).toLocaleString()} for this escrow transaction.`;
    const splitInstructions = pdf.splitTextToSize(instructions, 170);
    pdf.text(splitInstructions, 20, yPosition);
    yPosition += splitInstructions.length * 5 + 10;

    // Company Info
    pdf.text("Pay To:", 20, yPosition);
    pdf.text("EscrowPay Limited", 20, yPosition + 5);
    pdf.text("2nd Floor, Jewel Complex", 20, yPosition + 10);
    pdf.text("TRM Drive, Nairobi", 20, yPosition + 15);
    pdf.text("Phone: 0791517648", 20, yPosition + 20);
    pdf.text("Email: support@escrowpay.co.ke", 20, yPosition + 25);

    pdf.text("Invoiced To:", pageWidth - 60, yPosition);
    const invoicedTo = `${user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : transaction.buyer?.email || "Buyer"}`;
    pdf.text(invoicedTo, pageWidth - 60, yPosition + 5);
    pdf.text("Payment Method: M-Pesa Express", pageWidth - 60, yPosition + 10);
    pdf.text(`Invoice Date: ${new Date(transaction.createdAt).toLocaleDateString()}`, pageWidth - 60, yPosition + 15);

    yPosition += 35;

    // Table
    pdf.setFontSize(10);
    pdf.text("Description", 20, yPosition);
    pdf.text("Amount (KSh)", pageWidth - 40, yPosition);
    yPosition += 5;
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 5;

    pdf.text(`Escrow Payment for ${transaction.assetType} - ${transaction.assetTitle}`, 20, yPosition);
    pdf.text(transaction.amount.toLocaleString(), pageWidth - 40, yPosition);
    yPosition += 5;
    pdf.text("Escrow Fee", 20, yPosition);
    pdf.text(transaction.escrowFee.toLocaleString(), pageWidth - 40, yPosition);
    yPosition += 5;
    pdf.text("VAT", 20, yPosition);
    pdf.text((transaction.amount * 0.00).toLocaleString(), pageWidth - 40, yPosition);
    yPosition += 5;
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 5;
    pdf.setFont(undefined, 'bold');
    pdf.text("Total", 20, yPosition);
    pdf.text((transaction.amount + transaction.escrowFee + transaction.amount * 0.00).toLocaleString(), pageWidth - 40, yPosition);
    pdf.setFont(undefined, 'normal');

    yPosition += 15;

    // Transaction Details
    pdf.text("Transaction Details", 20, yPosition);
    yPosition += 10;
    pdf.text(`Transaction ID: ${transaction.transactionId || transaction.id}`, 20, yPosition);
    pdf.text(`Asset Type: ${transaction.assetType}`, 20, yPosition + 5);
    pdf.text(`Asset Title: ${transaction.assetTitle}`, 20, yPosition + 10);
    pdf.text(`Seller: ${transaction.seller?.email || "N/A"}`, 20, yPosition + 15);
    pdf.text(`Buyer: ${transaction.buyer?.name || transaction.buyer?.email || "N/A"}`, 20, yPosition + 20);
    pdf.text(`Status: ${transaction.status}`, 20, yPosition + 25);

    pdf.save(`invoice-${transaction.invoiceNumber || transaction.transactionId || transaction.id}.pdf`);
  };

  // 🔹 Validate M-Pesa phone number
  const validateMpesaPhone = (phone) => {
    // Kenyan Safaricom numbers: 2547XXXXXXXX, 2541XXXXXXXX, 07XXXXXXXX, 01XXXXXXXX
    const kenyaPhoneRegex = /^(254|0)(7[0-9]{8}|1[0-9]{8})$/;
    return kenyaPhoneRegex.test(phone.replace(/\s+/g, ''));
  };

  // 🔹 Format phone number to international format
  const formatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/\s+/g, '');
    if (cleaned.startsWith('0')) {
      return '254' + cleaned.substring(1);
    }
    return cleaned;
  };

  // 🔹 Handle phone input change
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setMpesaPhone(value);

    if (value && !validateMpesaPhone(value)) {
      setPhoneError("Please enter a valid Kenyan Safaricom phone number (e.g., 254712345678 or 0712345678)");
    } else {
      setPhoneError("");
    }
  };

  // 🔹 Trigger STK Push
  const handleSendStkPush = async () => {
    if (!validateMpesaPhone(mpesaPhone)) {
      setPhoneError("Please enter a valid Kenyan Safaricom phone number");
      return;
    }

    try {
      setStkStatus("pending");
      setPhoneError("");
      const token = await getToken();
      const formattedPhone = formatPhoneNumber(mpesaPhone);

      const res = await axios.post(
        "http://localhost:5000/api/payments/stkpush",
        {
          phone: formattedPhone,
          amount: transaction.amount + transaction.escrowFee + transaction.amount * 0.00,
          transactionId: transaction.transactionId || transaction.id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setCheckoutRequestId(res.data.CheckoutRequestID);
        toast.success("STK Push sent. Check your phone.");
      } else {
        throw new Error(res.data.message || "Failed to send STK Push");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to send STK Push.");
      setStkStatus("failed");
    }
  };

  const handleCompleteTransaction = async () => {
    if (!checkoutRequestId) {
      toast.error("No active payment request found.");
      return;
    }

    try {
      setIsVerifying(true);
      const token = await getToken();
      const res = await axios.post(
        "http://localhost:5000/api/payments/stkquery",
        { CheckoutRequestID: checkoutRequestId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success && res.data.status === "success") {
        // Payment successful
        toast.success("Invoice paid, redirecting you to transactions");
        setStkStatus("success");
        setTimeout(() => {
          navigate("/transactions");
        }, 3000);
      } else {
        toast.error(`Payment not completed: ${res.data.resultDesc || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      toast.error("Error verifying payment. Try again.");
    } finally {
      setIsVerifying(false);
    }
  };
  

  if (loading) return <p className="text-center mt-10">Loading invoice...</p>;
  if (!transaction) return <p className="text-center mt-10">Invoice not found</p>;

  return (
    <motion.div
      className="min-h-screen bg-gray-50 py-12 px-4 md:px-10"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div id="invoice" className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8 print:shadow-none print:p-0">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">EscrowPay</h1>
            <p className="text-sm text-gray-500">Secure Transaction Platform</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-semibold text-gray-900">
              Invoice #{transaction.invoiceNumber || transaction.transactionId || transaction.id}
            </h2>
            <p className={`text-md font-medium ${stkStatus === "success" ? "!text-green-500" : "!text-red-500"}`}>
              {stkStatus === "success" ? "Paid" : "Unpaid"}
            </p>
            <p className="text-sm text-gray-600">
              Due Date: {new Date(transaction.deadline).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Payment Instructions */}
        <section className="mb-10">
          <h3 className="text-lg font-semibold mb-3">Instructions - How to Pay</h3>
          <p className="text-gray-700 leading-relaxed">
            We use <strong>M-Pesa Express (STK Push)</strong> to simplify payments. 
            A prompt will be sent to your phone to authorize 
            <strong> KSh {(transaction.amount + transaction.escrowFee + transaction.amount * 0.00).toLocaleString()}</strong> 
            for this escrow transaction (#{transaction.invoiceNumber || transaction.id}).
          </p>

          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-5">
            <label className="block text-gray-800 font-medium mb-2">
              Enter the M-Pesa phone number that will make the payment:
            </label>
            <Input
              type="text"
              value={mpesaPhone}
              onChange={handlePhoneChange}
              className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:outline-none ${
                phoneError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
              }`}
              placeholder="e.g., 254712345678 or 0712345678"
            />
            {phoneError && (
              <p className="text-red-500 text-sm mt-1">{phoneError}</p>
            )}

            {stkStatus === "idle" && (
              <Button
                onClick={handleSendStkPush}
                className="mt-4 bg-[#9fe870] hover:bg-[#65cf21] text-[#163300] cursor-pointer font-semibold px-6 py-2 rounded-lg transition-all"
              >
                Send STK Push
              </Button>
            )}

            {stkStatus === "pending" && (
              <div className="mt-4 text-sm text-gray-700">
                <p className="mb-3">
                  Please enter your PIN and wait for a confirmation message from M-Pesa.
                </p>
                <div className="flex justify-center gap-3">
                  <Button
                    onClick={handleCompleteTransaction}
                    disabled={isVerifying}
                    className="bg-[#9fe870] text-[#163300] cursor-pointer hover:bg-[#65cf21] disabled:opacity-50">
                    <CheckCircle2 size={16} className="mr-2" />
                    {isVerifying ? "Verifying..." : "Complete Transaction"}
                  </Button>
                  <Button
                    onClick={handleSendStkPush}
                    className="border border-gray-700 cursor-pointer text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <RefreshCcw size={16} className="mr-2" /> Resend Prompt
                  </Button>
                </div>
              </div>
            )}

            {stkStatus === "failed" && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 font-semibold">STK Push failed. Please try again.</p>
                <Button
                  onClick={() => {
                    setStkStatus("idle");
                    setCheckoutRequestId(null);
                  }}
                  className="mt-2 bg-[#9fe870] hover:bg-[#65cf21] cursor-pointer text-[#163300]">
                  Try Again
                </Button>
              </div>
            )}

            {stkStatus === "success" && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 font-semibold">Payment completed successfully!</p>
                <p className="text-sm text-green-600 mt-1">Your transaction will proceed to the next step.</p>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-600 mt-3">
            Click{" "}
            <a href="#" className="text-green-600 underline">
              here
            </a>{" "}
            if you would like to use the old M-Pesa C2B (Manual Method) or if
            you already paid but the invoice is still marked unpaid.
          </p>
        </section>

        {/* Company & Client Info */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Pay To</h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              EscrowPay Limited <br />
              2nd Floor, Jewel Complex <br />
              TRM Drive, Nairobi <br />
              Phone: 0791517648 <br />
              Email: support@escrowpay.co.ke <br />
              Website: www.escrowpay.co.ke <br />
              Tax ID: P052338380N
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Invoiced To</h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : transaction.buyer?.email || "Buyer"} <br />
              Payment Method: M-Pesa Express <br />
              Invoice Date: {new Date(transaction.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Invoice Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-t border-gray-200">
            <thead className="bg-gray-100 text-gray-800">
              <tr>
                <th className="text-left py-3 px-4">Description</th>
                <th className="text-right py-3 px-4">Amount (KSh)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-3 px-4">
                  Escrow Payment for {transaction.assetType} - {transaction.assetTitle}
                </td>
                <td className="py-3 px-4 text-right">{transaction.amount.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="py-3 px-4">Escrow Fee</td>
                <td className="py-3 px-4 text-right">{transaction.escrowFee.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="py-3 px-4">VAT</td>
                <td className="py-3 px-4 text-right">{(transaction.amount * 0.00).toLocaleString()}</td>
              </tr>
              <tr className="font-semibold">
                <td className="py-3 px-4 text-right">Total</td>
                <td className="py-3 px-4 text-right">{(transaction.amount + transaction.escrowFee + (transaction.amount * 0.00)).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Transactions */}
        <div className="mt-8">
          <h4 className="font-semibold text-gray-900 mb-3">
            Transaction Details
          </h4>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
            <p><strong>Transaction ID:</strong> {transaction.transactionId || transaction.id}</p>
            <p><strong>Asset Type:</strong> {transaction.assetType}</p>
            <p><strong>Asset Title:</strong> {transaction.assetTitle}</p>
            <p><strong>Seller:</strong> {transaction.seller?.email || "N/A"}</p>
            <p><strong>Buyer:</strong> {transaction.buyer?.name || transaction.buyer?.email || "N/A"}</p>
            <p><strong>Status:</strong> {transaction.status}</p>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <p className="text-lg font-semibold text-gray-900">
              Balance: KSh {(transaction.amount + transaction.escrowFee + (transaction.amount * 0.16)).toLocaleString()}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center cursor-pointer gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                <Printer size={18} /> Print
              </button>
             <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 bg-gray-900 cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
                <Download size={18} /> Download
              </button>
            </div>
          </div>
        </div>
      </div>
      
    </motion.div>
  
  );
};

export default PaymentInvoice;
