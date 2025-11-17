import { motion } from "framer-motion";
import { Users, Banknote, Headphones } from "lucide-react";

export default function TrustSection() {
  const features = [
    {
      icon: <Users className="w-6 h-6 text-green-700" />,
      title: "Trusted by thousands",
      text: "Thousands of buyers and sellers across Kenya transact securely through our escrow platform every month.",
    },
    {
      icon: <Banknote className="w-6 h-6 text-green-700" />,
      title: "Regulated & transparent",
      text: "All transactions are governed by local regulations for compliance and your peace of mind.",
    },
    {
      icon: <Headphones className="w-6 h-6 text-green-700" />,
      title: "Bank-supported",
      text: "We hold your money with licensed financial instututions in Kenya.",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 text-center">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2, duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col items-center space-y-3"
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#9fe870] border border-green-100">
              {feature.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
            <p className="!text-gray-600 text-sm max-w-xs">{feature.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
