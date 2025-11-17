import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion"; 

/**
 * TransactionDetails.jsx
 * - Mock-enabled (toggle USE_MOCK)
 * - Interactive: animated stepper, countdown, modal confirmations, toast messages
 * - Actions: Fund Escrow (simulate STK), Cancel, Mark Delivered, Confirm Receipt
 */

const USE_MOCK = false; // flip to false when backend is ready

const initialMock = {
  id: "TXN-20250916-01",
  status: "PENDING_PAYMENT", // try: PENDING_PAYMENT, FUNDED, DELIVERED, COMPLETED, CANCELLED, EXPIRED
  asset: {
    title: "example.co.ke",
    description: "Premium domain transfer with DNS and auth code.",
    type: "Domain",
  },
  price: 25000,
  escrowFeePct: 0.025, // 2.5%
  buyer: { id: "u-buyer", name: "A. Buyer", contact: "+254700000000" },
  seller: { id: "u-seller", name: "DevAgency", contact: "deva@agency.com" },
  // deadline ISO (3 days from now)
  deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  created_at: new Date().toISOString(),
};

const getTimeLeft = (iso) => {
  const t = Date.parse(iso) - Date.now();
  if (isNaN(t)) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  const seconds = Math.floor((t / 1000) % 60);
  const minutes = Math.floor((t / 1000 / 60) % 60);
  const hours = Math.floor((t / (1000 * 60 * 60)) % 24);
  const days = Math.floor(t / (1000 * 60 * 60 * 24));
  return { total: t, days, hours, minutes, seconds };
};

export default function TransactionDetails({ transactionId }) {
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("buyer"); // demo: view as buyer/seller/admin
  const [modal, setModal] = useState(null); // { type: 'fund' | 'cancel' | 'complete' | 'deliver' , loading: bool }
  const [toast, setToast] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const intervalRef = useRef(null);

  // Fetch or Mock load
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (USE_MOCK) {
          setTransaction(initialMock);
        } else {
          // Example safe fetch handling (adjust endpoint)
          const id = transactionId || "txn-id";
          const res = await fetch(`/api/transactions/${id}`);
          if (!res.ok) {
            const text = await res.text();
            throw new Error(`API error: ${res.status} ${text}`);
          }
          const data = await res.json();
          setTransaction(data);
        }
      } catch (err) {
        showToast(err.message, "error");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
      clearInterval(intervalRef.current);
    };
  }, [transactionId]);

  // Setup countdown & auto-expire for pending deals
  useEffect(() => {
    if (!transaction) return;
    const updateTimer = () => {
      const left = getTimeLeft(transaction.deadline);
      setTimeLeft(left);
      if (left.total <= 0 && transaction.status === "PENDING_PAYMENT") {
        // Auto-expire (mock)
        setTransaction((t) => ({ ...t, status: "EXPIRED" }));
        showToast("Deal expired due to non-payment", "error");
        clearInterval(intervalRef.current);
      }
    };
    updateTimer();
    intervalRef.current = setInterval(updateTimer, 1000);
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transaction?.deadline, transaction?.status]);

  // small toast helper
  function showToast(message, type = "success", ms = 3500) {
    setToast({ message, type });
    setTimeout(() => setToast(null), ms);
  }

  // Modal confirm handlers (simulate actions)
  const performAction = async (action) => {
    // action: 'fund' | 'cancel' | 'deliver' | 'confirm'
    setModal((m) => ({ ...m, loading: true }));
    try {
      // simulate remote call + network latency
      await new Promise((r) => setTimeout(r, 1200));

      if (action === "fund") {
        // simulate STK success
        setTransaction((t) => ({ ...t, status: "FUNDED" }));
        showToast("Payment received. Funds held in escrow.", "success");
      } else if (action === "deliver") {
        setTransaction((t) => ({ ...t, status: "DELIVERED" }));
        showToast("Seller marked item delivered.", "success");
      } else if (action === "confirm") {
        setTransaction((t) => ({ ...t, status: "COMPLETED" }));
        showToast("Transaction completed. Seller paid.", "success");
      } else if (action === "cancel") {
        setTransaction((t) => ({ ...t, status: "CANCELLED" }));
        showToast("Deal cancelled.", "success");
      }
    } catch (err) {
      showToast("Action failed: " + err.message, "error");
    } finally {
      setModal(null);
    }
  };

  // UI helpers
  const calcEscrowFee = (price, pct) => Math.round(price * pct);
  const totalAmount = (price, pct) => Number(price) + calcEscrowFee(price, pct);

  if (loading || !transaction)
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="animate-pulse bg-gray-100 p-6 rounded-lg">Loading transaction preview…</div>
      </div>
    );

  const { price, escrowFeePct } = transaction;
  const fee = calcEscrowFee(price, escrowFeePct || 0.025);
  const total = totalAmount(price, escrowFeePct || 0.025);

  // Progress percent mapping
  const percentMap = {
    PENDING_PAYMENT: 10,
    FUNDED: 45,
    DELIVERED: 75,
    COMPLETED: 100,
    CANCELLED: 0,
    EXPIRED: 0,
  };
  const pct = percentMap[transaction.status] ?? 0;

  // Role-specific action visibility
  const isBuyer = role === "buyer";
  const isSeller = role === "seller";

  // nice human time left
  const humanLeft = timeLeft
    ? `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`
    : "—";

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`fixed right-6 top-6 z-50 px-4 py-2 rounded shadow-lg ${
              toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Transaction {transaction.id}</h1>
          <p className="text-sm text-gray-500 mt-1">{transaction.asset.title} — {transaction.asset.type}</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-600 mr-2">View as</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow p-6">
        {/* animated progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">Progress</div>
            <div className="text-sm text-gray-500">{transaction.status.replace("_", " ")}</div>
          </div>

          <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ type: "spring", stiffness: 120 }}
              className={`h-3 ${transaction.status === "COMPLETED" ? "bg-green-500" : transaction.status === "EXPIRED" || transaction.status === "CANCELLED" ? "bg-red-500" : "bg-blue-600"}`}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: details */}
          <div className="md:col-span-2 space-y-4">
            <div className="rounded-lg border p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold">{transaction.asset.title}</h2>
                  <p className="text-sm text-gray-600">{transaction.asset.description}</p>
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-500">Price</div>
                  <div className="text-xl font-bold">KES {price.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4 flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <div>Escrow fee ({(escrowFeePct * 100).toFixed(2)}%)</div>
                <div className="font-medium">KES {fee.toLocaleString()}</div>
              </div>
              <div className="flex justify-between text-lg">
                <div className="font-semibold">Total</div>
                <div className="font-bold">KES {total.toLocaleString()}</div>
              </div>
            </div>

            <div className="rounded-lg border p-4 flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Deadline</div>
                <div className="font-medium">{new Date(transaction.deadline).toLocaleString()}</div>
                <div className={`text-xs mt-1 ${timeLeft && timeLeft.total <= 24*3600*1000 ? "text-red-600" : "text-gray-500"}`}>Time left: {humanLeft}</div>
              </div>

              {/* small question tooltip */}
              <div className="text-sm text-gray-500">
                <div className="relative inline-block group">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center border">?</div>
                  <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                    You must fund escrow by the deadline, or the deal will automatically expire.
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline / actions */}
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-3">Actions</h3>

              {/* Conditional actions by status & role */}
              <div className="flex flex-wrap gap-3">
                {/* Pending -> Buyer can fund or cancel */}
                {transaction.status === "PENDING_PAYMENT" && isBuyer && (
                  <>
                    <button
                      onClick={() => setModal({ type: "fund", loading: false })}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Fund Escrow
                    </button>
                    <button
                      onClick={() => setModal({ type: "cancel", loading: false })}
                      className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Cancel Deal
                    </button>
                  </>
                )}

                {/* Funded -> Seller can mark delivered */}
                {transaction.status === "FUNDED" && isSeller && (
                  <button
                    onClick={() => setModal({ type: "deliver", loading: false })}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    Mark as Delivered
                  </button>
                )}

                {/* Delivered -> Buyer confirms */}
                {transaction.status === "DELIVERED" && isBuyer && (
                  <button
                    onClick={() => setModal({ type: "confirm", loading: false })}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Confirm Receipt & Release Funds
                  </button>
                )}

                {/* Completed or Cancelled state */}
                {(transaction.status === "COMPLETED" || transaction.status === "CANCELLED" || transaction.status === "EXPIRED") && (
                  <div className="text-sm text-gray-600">No actions available for this status.</div>
                )}
              </div>
            </div>
          </div>

          {/* Right: parties */}
          <aside className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="text-xs text-gray-500">Buyer</div>
              <div className="font-medium">{transaction.buyer.name}</div>
              <div className="text-sm text-gray-600">{transaction.buyer.contact}</div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="text-xs text-gray-500">Seller</div>
              <div className="font-medium">{transaction.seller.name}</div>
              <div className="text-sm text-gray-600">{transaction.seller.contact}</div>
            </div>

            <div className="rounded-lg border p-4 text-sm text-gray-600">
              <div className="font-semibold mb-2">Tips</div>
              <ul className="list-disc pl-4">
                <li>Keep screenshots of delivery evidence.</li>
                <li>Contact the other party before opening disputes.</li>
                <li>Escrow fee is charged once per transaction.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/40" onClick={() => setModal(null)} />

            <motion.div
              initial={{ y: 40, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, opacity: 0.6 }}
              className="relative z-50 w-full max-w-lg bg-white rounded-lg shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold mb-3">
                {modal.type === "fund" && "Confirm Payment"}
                {modal.type === "cancel" && "Cancel Deal"}
                {modal.type === "deliver" && "Mark Delivered"}
                {modal.type === "confirm" && "Confirm Receipt"}
              </h3>

              <div className="text-sm text-gray-700 mb-4">
                {modal.type === "fund" && (
                  <>
                    You're about to pay <strong>KES {total.toLocaleString()}</strong> (Price + escrow fee).
                    You will be prompted to complete payment via M-Pesa.
                  </>
                )}
                {modal.type === "cancel" && "Cancelling will mark this deal as cancelled. This cannot be undone without parties' agreement."}
                {modal.type === "deliver" && "Marking as delivered notifies the buyer to confirm receipt."}
                {modal.type === "confirm" && "Confirming receipt will release funds to the seller."}
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => setModal(null)} className="px-4 py-2 rounded border">Close</button>
                <button
                  onClick={() => performAction(modal.type === "confirm" ? "confirm" : modal.type)}
                  disabled={modal.loading}
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  {modal.loading ? "Processing…" : modal.type === "fund" ? "Proceed to Pay" : "Confirm"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

///


