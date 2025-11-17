import React from "react";
import { motion } from "framer-motion";

const Comparison = () => {
  const currentWay = [
    "Buyers MPESA money before receiving goods, often losing cash to scammers on Jiji, TikTok & Facebook.",
    "Sellers deliver items or services only for buyers to ghost or refuse payment.",
    "Transactions rely on screenshots & WhatsApp promises with no real protection.",
    "Disputes end up on social media with no clear way to recover money.",
  ];

  const escrowWay = [
    "Money is held securely by Escrow until buyer confirms delivery or service completion.",
    "Sellers get payment assurance before delivering, buyers get Escrow protection.",
    "Transparent tracking — both sides see transaction status in real time.",
    "Disputes handled fairly through Escrow resolution support.",
  ];

  return (
    <section className="py-20 bg-gray-50 scroll-smooth">
      <motion.div
        className="max-w-6xl mx-auto px-6 text-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >

        <motion.div
          className="grid md:grid-cols-2 gap-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          {/* Current Way */}
          <div className="border border-[#9fe870] rounded-xl shadow-sm bg-white">
            <h3 className="bg-[#9fe870] rounded-xl py-4 font-semibold text-xl border-b">
              Current way is broken
            </h3>
            <div className="divide-y">
              {currentWay.map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-5 text-left">
                  <div className="w-8 h-8 flex items-center justify-center font-bold text-white-700 border rounded">
                    {i + 1}
                  </div>
                  <p className="!text-[#163300]">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Escrow Way */}
          <div className="border border-[#9fe870] rounded-xl shadow-sm bg-[#163300] text-white">
            <h3 className="bg-[#9fe870] rounded-xl py-4 font-semibold text-xl border-b ">
              Go the Escrow way
            </h3>
            <div className="divide-y divide-[#9fe870]">
              {escrowWay.map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-5 text-left">
                  <div className="w-8 h-8 flex items-center justify-center font-bold border rounded border-white">
                    {i + 1}
                  </div>
                  <p className="!text-gray-300 font-md">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Comparison;
