import React from "react";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Globe,
  ShoppingBag,
  Layout,
  Rocket,
  Users,
  Store,
  Video,
  Smartphone,
} from "lucide-react";

const categories = [
  {
    icon: <Globe className="w-10 h-10 text-green-600" />,
    title: "Domains",
    description: "Use Escrow to protect your payment until the domain is securely transferred.",
  },
  {
    icon: <Layout className="w-10 h-10 text-green-600" />,
    title: "Websites",
    description: "Buy or sell established websites and online blogs with Escrow protection.",
  },
  {
    icon: <Rocket className="w-10 h-10 text-green-600" />,
    title: "SaaS",
    description: "Escrow lets you verify code, users, and revenue before completing the deal.",
  },
  {
    icon: <ShoppingBag className="w-10 h-10 text-green-600" />,
    title: "Milestones",
    description: "Split payments into milestones for complex or long-term projects.",
  },
  {
    icon: <Users className="w-10 h-10 text-green-600" />,
    title: "Social media accounts",
    description: "Escrow guarantees the account is transferred and verified before payment.",
  },
  {
    icon: <Store className="w-10 h-10 text-green-600" />,
    title: "E-commerce",
    description: "Transfer store ownership and inventory safely using Escrow.",
  },
  {
    icon: <Smartphone className="w-10 h-10 text-green-600" />,
    title: "Apps",
    description: "Escrow protects your investment by securing the code, users, and rights.",
  },
  {
    icon: <Video className="w-10 h-10 text-green-600" />,
    title: "YouTube channels",
    description: "Escrow ensures you control the content and credentials before paying.",
  },
];

const EscrowCategories = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [tappedIndex, setTappedIndex] = useState(null);

  return (
    <section className="py-20 bg-white text-center">
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-gray-800 mb-12"
        >
          What can you buy or sell with Escrow
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {categories.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{
                opacity: 1,
                y: [50, -10, 0]
              }}
              transition={{
                delay: index * 0.15,
                duration: 0.8,
                ease: "easeOut"
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={()=> setHoveredIndex(null)}
              onClick={() => setTappedIndex(tappedIndex === index ? null : index)}
              //className="relative perspective p-6 border border-gray-200 bg-gray-50 rounded-2xl shadow-sm bg-white hover:shadow-lg transition-all duration-300 flex flex-col items-center space-y-3"
            >
              <motion.div
                className="relative w-full h-48 rounded-2xl shadow-md border border-gray-200 bg-gray-50 preserve-3d"
                animate={{ rotateY: (hoveredIndex === index || tappedIndex === index) ? 180 : 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Front */}
                <div className="absolute inset-0 flex flex-col justify-center items-center space-y-3 backface-hidden">
                  <div className="p-4 bg-green-50 rounded-full">{item.icon}</div>
                  <h3 className="font-semibold text-gray-800 text-lg p-4">{item.title}</h3>
                </div>

                {/* Back */}
                <div className="absolute inset-0 bg-[#163300] text-[#9fe870] rounded-2xl p-6 flex justify-center items-center text-sm backface-hidden rotateY-180">
                  <p className="!text-[#9fe870]">{item.description}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EscrowCategories;
