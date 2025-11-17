import React from "react";
import { motion } from "framer-motion";

export default function Footer() {
  const footerLinks = [
    {
      title: "Escrow products",
      links: [
        "Payment gateway",
        "Payouts",
        "Escrow account",
        "Buyer protection",
      ],
    },
    {
      title: "Support",
      links: [
        "Fee calculator",
        "Payment options",
        "Security",
        "Fraud prevention",
      ],
    },
    {
      title: "Resources",
      links: ["FAQs", "Case Studies", "Insights",],
    },
    {
      title: "Company",
      links: [
        "About Us",
        "Careers",
        "Licenses",
        "Service status",
        "Contact us",
      ],
    },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="bg-gray-200 border-t border-gray-50 py-0"
    >
      <div className="max-w-7xl mx-auto px-6 py-8 md:px-12 grid grid-cols-1 md:grid-cols-5 gap-12">
        
        {/* Logo + Security */}
        <div className="col-span-1">
          <img
            src="/path/to/logo.png"
            alt="Escrow Platform Logo"
            className="h-10 mb-6"
          />
          <p className="text-gray-700 text-sm mb-4">Security Standard with</p>
          <img
            src="/path/to/pci-dss.png"
            alt="PCI"
            className="h-10"
          />
        </div>

        {/* Footer Columns */}
        {footerLinks.map((section, index) => (
          <div key={index}>
            <h4 className="font-semibold mb-4 text-md !text-gray-700">
              {section.title}
            </h4>
            <ul className="space-y-2 !text-gray-700">
              {section.links.map((link, i) => (
                <li
                  key={i}
                  className="hover:underline text-sm hover:underline-offset-4 focus:underline transition-all duration-200 hover:text-gray-700"
                >
                  {link === "Careers" ? (
                    <div className="flex items-center gap-2">
                      <a href="#">{link}</a>
                      <span className="bg-black text-white text-xs px-2 py-0.5 rounded-md">
                        We’re HIRING
                      </span>
                    </div>
                  ) : (
                    <a  href="#" className="!text-gray-700">{link}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Copyright */}

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center border-t border-gray-300">
        <p className="text-sm">&copy; {new Date().getFullYear()} Escrow. All rights reserved.</p>
        
        <div className="flex space-x-4 mt-4 md:mt-0">
          <a href="/privacy" className=" text-sm ">Privacy Policy</a>
          <a href="/terms" className=" text-sm">Terms of Service</a>
        </div>
      </div>
    </motion.footer>
  );
};


