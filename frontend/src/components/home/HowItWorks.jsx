import { motion } from "framer-motion";
import { useState } from "react";
import { ShieldCheck, HandCoins, Package, CheckCircle, Wallet, Handshake, ArrowLeftRight } from "lucide-react";

const steps = [
    {
        id: 1,
        icon: <ArrowLeftRight className="w-10 h-10 text-green-600" />,
        title: "Create escrow transaction",
        description: "Provide transaction details and send a payment request to the other party."
    },
  { id: 2,
    icon: <Handshake className="w-10 h-10 text-green-600" />,
    title: "Agree terms",
    description: "Both parties confirm transaction details and pricing before starting the escrow process.",
  },
  { id: 3,
    icon: <HandCoins className="w-10 h-10 text-green-600" />,
    title: "Buyer submits payment to Escrow",
    description: "Funds are securely held by Escrow until both parties fulfill their obligations.",
  },
  { id: 4,
    icon: <Package className="w-10 h-10 text-green-600" />,
    title: "Seller delivers services or transfers assets",
    description: "The seller transfers assets or completes the service as agreed.",
  },
  { id: 5,
    icon: <CheckCircle className="w-10 h-10 text-green-600" />,
    title: "Buyer approves assets or services",
    description: "Buyer verifies the assets or confirms that the services meet expectations.",
  },
  { id: 6,
    icon: <Wallet className="w-10 h-10 text-green-600" />,
    title: "Escrow releases payment to seller",
    description: "Payment is instantly released to the seller, completing transaction.",
  },
];

export default function HowItWorks() {
    const [hovered, setHovered] = useState(null);

    return (
        <section className="py-20 bg-white relative overflow-hidden">
        <motion.div
            className="max-w-7xl mx-auto px-6 text-center relative"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
        >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How it works</h2>
            <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
            Secure, transparent, and simple
            </p>

            <motion.div
                className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center relative z-10"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
            >
            {steps.map((step, index) => (
              <div key={index} className="relative group w-full max-w-[300px]">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-pink-500 via-red-500 to-orange-400 opacity-0 group-hover:opacity-100 blur-lg transition duration-500"></div>

                <motion.div
                  className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-2xl shadow-sm hover:shadow-md transition relative z-10 h-[280px] w-full"
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="absolute top-2 left-2 w-8 h-8 flex items-center justify-center font-bold text-white-700 border rounded  z-20">
                    {index + 1}
                  </div>
                  <div className="bg-green-50 rounded-full p-4 mb-4 flex items-center justify-center">
                    {step.icon}
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 min-h-[48px] flex items-center justify-center">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm max-w-[220px] flex-grow flex items-center justify-center text-center">
                    {step.description}
                  </p>
                </motion.div>
              </div>
              
            ))}
            </motion.div>
          </motion.div>
        </section>
    );
}
