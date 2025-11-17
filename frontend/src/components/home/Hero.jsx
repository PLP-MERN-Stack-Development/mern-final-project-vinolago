import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui";
import { useNavigate } from "react-router-dom";



export default function HeroSection() {
    const navigate = useNavigate();
    const [amount, setAmount] = useState("");
    const [role, setRole] = useState("buyer");
    const [currency, setCurrency] = useState("KES");

    const feeRate = 0.005; // 2% escrow fee
    const fee = amount ? (amount * feeRate).toFixed(2) : 0;
    const halfFee = (fee / 2).toFixed(2);
    const sellerReceives = amount ? (amount - halfFee).toFixed(2) : 0;
    const buyerPays = amount ? (parseFloat(amount) + parseFloat(halfFee)).toFixed(2) : 0;


  return (
    <section className="flex flex-col md:flex-row items-center justify-between w-full mx-auto px-6 py-16 md:py-24 bg-white border border-gray-200">
      {/* Left: Text Content */}
      <div className="md:w-2/3 mt-10 md:mt-0  lg:px-20 md:py-6">
        <h1 className="!text-[3.8rem] md:text-8xl lg:text-[120px] font-extrabold text-[#163300] leading-none tracking-tight max-w-[18ch]">
          Escrow it everytime you buy or sell online
        </h1>
        <p className="mt-6 text-lg text-gray-600">
          Escrow protects buyers who pay and sellers who deliver. Buy and sell anything safely, without risks of MPESA reversals or scams.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Button
            className="font-semibold cursor-pointer px-6 py-3 rounded-lg shadow transition flex items-center justify-center gap-2"
            onClick={() => navigate('/signup')}
          >
            Transact now <ArrowRight size={18} />
          </Button>
        </div>
      </div>

      {/* Right: Interactive Deal Widget */}
      <div className="md:w-1/2 bg-white shadow-lg border border-gray-100 rounded-3xl p-6 md:p-8 max-w-md w-full">
        <p className=" font-semibold !text-[#163300] mb-4 text-center">
          See how quick and easy it is.
        </p>

        <div className="space-y-5">
          {/* Role Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              I am a:
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setRole("buyer")}
                className={`flex-1 p-2 rounded-md cursor-pointer !outline-none focus:outline-none ${
                  role === "buyer"
                    ? "bg-[#9fe870] text-[#163300] font-semibold"
                    : "bg-gray-100 text-[#163300] "
                }`}
              >
                Buyer
              </button>
              <button
                onClick={() => setRole("seller")}
                className={`flex-1 p-2 rounded-md cursor-pointer !outline-none focus:outline-none ${
                  role === "seller"
                    ? "bg-[#9fe870] text-[#163300]"
                    : "bg-gray-100 text-g[#163300] font-semibold"
                }`}
              >
                Seller
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction amount
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="flex-1 p-2 outline-none text-gray-800"
              />
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="bg-gray-50 border-l border-gray-300 text-gray-700 w-20 h-10 rounded-none border-0 focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KES">KES</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results */}
          {amount > 0 && (
            <div className="bg-gray-50 p-4 rounded-xl space-y-2">
              <p className="text-sm text-gray-600">
                Our fee (0.50% split 50/50): <span className="font-medium text-gray-900">{fee} {currency}</span>
              </p>
              {role === "buyer" ? (
                <>
                  <p className="text-sm text-gray-600">
                    You pay: <span className="font-medium text-gray-900">{buyerPays} {currency}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Seller receives: <span className="font-medium text-gray-900">{sellerReceives} {currency}</span>
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600">
                    You receive: <span className="font-medium text-gray-900">{sellerReceives} {currency}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Buyer pays: <span className="font-medium text-gray-900">{buyerPays} {currency}</span>
                  </p>
                </>
              )}
            </div>
          )}

          {/* CTA */}
          <Button
            className="w-full mt-3 font-semibold px-6 py-3 rounded-lg shadow transition flex items-center justify-center cursor-pointer gap-2"
            onClick={() => navigate('/signup')}
          >
            {role === "buyer" ? "Start transaction" : "Accept payment"} <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </section>
  );
}
