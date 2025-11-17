import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import start from "../../assets/start.gif";

export default function GetStarted() {
  const features = [
    "Low cost, with no hidden fees",
    "Full visibility of funds at all times so you know where your money is",
    "Payment to escrow is real-time",
    "Receieve money to your MPESA or Bank"
  ];

  return (
    <section className="py-20 bg-[#9fe870] w-full">
      <div className="max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left side text */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1"
        >
          <h2 className="text-4xl font-bold text-[#163300] leading-snug mb-6">
            Never Lose Money in Any Online Transaction Again 
          </h2>
          <p className="!text-[#163300] text-lg mb-8">
            Sign up and create a transaction agreement in seconds and secure every online deal you do.
          </p>

          <ul className="space-y-4">
            {features.map((feature, idx) => (
              <motion.li
                key={idx}
                className="flex items-start gap-3 text-gray-800"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <CheckCircle className="w-6 h-6 text-[#0d1f00] flex-shrink-0 ]" />
                <span>{feature}</span>
              </motion.li>
            ))}
          </ul>

          <motion.a
            href="#"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="inline-block mt-10 bg-[#163300] !text-[#9fe870] font-semibold px-8 py-3 rounded-full shadow-md hover:bg-[#0d1f00] transition-all duration-300"
          >
            Start transaction now
          </motion.a>
        </motion.div>

        {/* Right side (optional graphic placeholder) */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 hidden lg:flex justify-center"
        >
          <motion.div
            className="w-80 h-80 bg-green-100 rounded-3xl flex items-center justify-center text-green-700 font-medium"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <motion.img
              loading="lazy"
              src={start}
              alt="Digital Escrow Illustration"
              className="w-80 h-auto rounded-2xl shadow-lg"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
