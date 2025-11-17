import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Plus, ChevronRight } from "lucide-react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { Button, Card, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui";
import TransactionCard from "../components/TransactionCard";
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

export default function Transactions() {

  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { socket, isConnected } = useSocket();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        setLoading(true);
        const token = await getToken();
        const response = await axios.get('http://localhost:5000/api/transactions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data.transactions;

        // Transform backend data to match TransactionCard format
        const transformedTransactions = data.map(tx => ({
          id: tx.id,
          assetType: tx.assetType,
          title: tx.title,
          created: new Date(tx.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }),
          amount: `KES ${tx.amount.toLocaleString()}`,
          currency: "KES",
          role: tx.isSeller ? "Seller" : "Buyer",
          status: tx.status.charAt(0).toUpperCase() + tx.status.slice(1),
          requiresAction: tx.status === 'agreement' || tx.status === 'payment',
          paymentStatus: tx.paymentStatus,
        }));

        setTransactions(transformedTransactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    }

    if (isLoaded && user) {
      fetchTransactions();
    }
  }, [isLoaded, user, getToken]);

  // Real-time updates for transaction list
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleTransactionCreated = (data) => {
      console.log('New transaction created:', data);
      toast.success('New transaction created!');
      // Refresh transactions list
      setTransactions(prev => [data.transaction, ...prev]);
    };

    const handleTransactionUpdated = (data) => {
      console.log('Transaction updated:', data);
      // Update specific transaction in list
      setTransactions(prev => prev.map(tx => 
        tx.id === data.transactionId ? { ...tx, ...data.transaction } : tx
      ));
    };

    socket.on('transaction-created', handleTransactionCreated);
    socket.on('transaction-updated', handleTransactionUpdated);

    return () => {
      socket.off('transaction-created', handleTransactionCreated);
      socket.off('transaction-updated', handleTransactionUpdated);
    };
  }, [socket, isConnected]);

    const navigate = useNavigate();

    // Mock transactions commented out - now using actual backend data
    /*
    const [transactions, setTransactions] = useState([
      {
        id: "1312",
        assetType: "Domain",
        title: "Faida.co.ke domain name",
        created: "Oct 07, 2025",
        amount: "KES 1,974.00",
        currency: "KES",
        role: "Seller",
        status: "Awaiting agreement",
        requiresAction: true,
        paymentStatus: "pending",
      },
      {
        id: "1313",
        assetType: "Website",
        title: "Agency website",
        created: "Oct 08, 2025",
        amount: "KES 850.00",
        currency: "KES",
        role: "Buyer",
        status: "In progress",
        requiresAction: false,
        paymentStatus: "processing",
      },
      {
      id: "1314",
      assetType: "App",
      title: "Cryptocurrency trading app",
      created: "05 Oct 2025",
      amount: "KES 3,500",
      currency: "KES",
      role: "Seller",
      status: "Closed",
        requiresAction: false,
      paymentStatus: "completed",
      },
      {
      id: "1315",
      assetType: "Saas business",
      title: "Real estate management saas",
      created: "10 Oct 2025",
      amount: "KES 1,200",
      currency: "KES",
      role: "Buyer",
      status: "Open",
        requiresAction: true,
      paymentStatus: "processing",
    },
    ]);
    */

    const [transactions, setTransactions] = useState([]);
  
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("")

  // derive filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      let matchesFilter = false;


      if (filter === "All" || filter === "Filter by status") {
        matchesFilter = true;
      } else if (filter === "Action required") {
        matchesFilter = tx.requiresAction === true;
      } else {
        matchesFilter = tx.status === filter;
      }
      
      const matchesSearch =
        tx.title?.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
        tx.id?.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
        tx.assetType?.toLocaleLowerCase().includes(search.toLocaleLowerCase());
      
      return matchesFilter && matchesSearch;
    });
  }, [transactions, filter, search]);
  

    return (
      <div className="min-h-screen bg-gray-100 p-2 pb-72">
        <div className="max-w-3xl p-4">
        {user ? (
          <>
            <p className=" text-left text-gray-600 mb-4">
              Welcome back {user.firstName || user.fullName || user.username || 'User'}
            </p>
          </>
        ) : (
          <p className="text-gray-500">Loading user details...</p>
          )}
        </div>
        {/* Header */}
        <div className="flex flex-col  mb-8 gap-4 bg-white p-2 rounded-xl shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-[#213547] font-semibold mb-2 mt-6">Transactions</h1>
              {filteredTransactions.length === 0 ? (
                <p className="text-sm text-amber-600 font-medium">
                  No transactions yet. Create your first transaction! 🚀
                </p>
              ) : (
                <p className="text-sm text-slate-400">
                  You're viewing {filteredTransactions.length} transaction
                  {filteredTransactions.length > 1 ? "s" : ""}
                </p>
              )}
            </div>
          <div className="flex items-center gap-3">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="bg-green-50 text-green-700 rounded-md px-3 py-2 font-medium border border-green-200 cursor-pointer w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Filter by status" className="cursor-pointer">Filter by status</SelectItem>
                <SelectItem value="All" className="cursor-pointer" >All</SelectItem>
                <SelectItem value="Action required" className="cursor-pointer">Action required</SelectItem>
                <SelectItem value="Open" className="cursor-pointer">Open</SelectItem>
                <SelectItem value="Closed" className="cursor-pointer">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => navigate('/create-deal')} variant="primary" className="rounded-full cursor-pointer">
              <Plus size={18} className="mr-2" /> New Transaction
            </Button>
          </div>
                    </div>

          <div className="relative w-full sm:w-2/3">
            <Search
              className="absolute left-3 top-3 h-5 w-5 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Search transaction"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#163300]"
            />
          </div>          
        </div>

        {/* Table */}
        <Card className="overflow-hidden mt-0">
          {/* Table hidden on mobile */}
          <div className="hidden sm:grid grid-cols-6 gap-4 bg-indigo-50 text-xs font-semibold text-slate-600 uppercase tracking-wide p-4">
            <div>ID</div>
            <div>Transaction Title</div>
            <div>Created</div>
            <div>Amount</div>
            <div>Role</div>
            <div>Status</div>
          </div>

          {/* Rows/transactions list */}
          {loading ? (
            <p className="text-gray text-center p-4">Loading transactions...</p>
          ) : (
            filteredTransactions.map((tx) => (
              <TransactionCard key={tx.id} transaction={tx} />
            ))
          )}
        </Card>
    </div>

    );
}
