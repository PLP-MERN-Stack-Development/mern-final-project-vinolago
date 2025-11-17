import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "What is an escrow service?",
    answer:
      "An escrow service acts as a trusted third party that holds funds until both the buyer and seller meet their obligations. It ensures fair and secure transactions, especially for online or high-value deals.",
  },
  {
    question: "How does escrow work for buyers and sellers in Kenya?",
    answer:
      "Once both parties agree to terms, the buyer deposits funds into the escrow account. The seller delivers the service or completes the transfer, and once the buyer confirms it, the funds are released to the seller.",
  },
  {
    question: "How do you secure my funds?",
    answer:
      "Your money is securely handled by a reputable banking partner licensed and regulated by the Central Bank of Kenya(CBK).",
  },
  {
    question: "How long does it take for funds to be released?",
    answer:
      "Typically within 24–48 hours after both parties confirm completion. Timelines may vary depending on the payment method and verification steps.",
  },
  {
    question: "Is escrow regulated in Kenya?",
    answer:
      "Yes. Escrow services operate under Kenya’s Central Bank and Data Protection guidelines to ensure transparency, AML compliance, and consumer protection.",
    },
    {
        question: "Is there a minimum transaction amount?",
        answer: "Escrow can be used for any amount. Currently maximum transaction limit allowed is KES 300,000 (MPESA Limit)."
  },
];

export default function FAQS() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="relative py-20 bg-white">
      <motion.div
        className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {/* Left illustration */}
        <motion.img
          src="/images/escrow-illustration.png"
          alt="Escrow illustration"
          className="w-full max-w-md mx-auto"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        />

        {/* Right FAQ section */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">FAQs</h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-[#163300] pb-4">
                <button
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  className="flex justify-between items-center w-full text-left"
                >
                  <span className="text-lg font-medium text-gray-800 cursor-pointer hover:text-[#0d1f00] transition">
                    {faq.question}
                  </span>
                  <span className="text-xl text-gray-500">
                    {openIndex === index ? "−" : "+"}
                  </span>
                </button>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-gray-600 mt-3 text-sm leading-relaxed"
                    >
                      {faq.answer}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
