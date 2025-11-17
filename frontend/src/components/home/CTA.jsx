import { motion } from "framer-motion";
import React from "react";

const SecureCTA = () => {
  return (
    <section className="bg-white py-12 overflow-hidden">
      <motion.div
        className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 md:px-12"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        {/* Left content */}
        <motion.div
          className="md:w-1/2 mb-10 md:mb-0"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h2 className="!text-[3.5rem] md:text-[5rem] font-extrabold leading-[1.1] mb-8 tracking-tight">
            Disappoint thieves
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Every month, thousands of Kenyans use Escrow
            to transact without fear of being scammed.
          </p>
          <motion.a
            href="#"
            className="inline-block bg-lime-400 text-gray-900 font-semibold text-lg px-8 py-4 rounded-full hover:bg-lime-500 transition-all duration-300 shadow-md hover:shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            Learn how it works
          </motion.a>
        </motion.div>

        {/* Right image */}
        <motion.div
          className="md:w-1/2 flex justify-center"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <img
            src="/path/to/your/image.png"
            alt="Illustration"
            className="w-80 h-auto select-none"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default SecureCTA;
