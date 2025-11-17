import { motion } from "framer-motion";

const logos = [
  { src: "/logos/jumia.png", alt: "Jumia" },
  { src: "/logos/pigia.png", alt: "PigiaMe" },
  { src: "/logos/olx.png", alt: "OLX" },
  { src: "/logos/airbnb.png", alt: "Airbnb" },
  { src: "/logos/jiiji.png", alt: "Jiiji" },
  { src: "/logos/ebay.png", alt: "eBay" },
  { src: "/logos/amazon.png", alt: "Amazon" },
  { src: "/logos/upwork.png", alt: "Upwork" },
  { src: "/logos/malt.png", alt: "Malt" },
];

export default function LogoCarousel() {
  return (
    <section className="py-10 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto text-left px-6">
        <h2 className="text-gray-800 font-semibold !text-sm mb-10">
          Powering top online platforms
        </h2>

        {/* Scrolling logos */}
        <div className="relative flex overflow-x-hidden">
          {/* Left gradient mask */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
          {/* Right gradient mask */}
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
          <motion.div
            className="flex gap-16 min-w-full justify-around"
            animate={{ x: ["0%", "-100%"] }}
            transition={{
              repeat: Infinity,
              duration: 25,
              ease: "linear",
            }}
          >
            {logos.concat(logos).map((logo, index) => (
              <img
                key={index}
                src={logo.src}
                alt={logo.alt}
                className="h-10 grayscale hover:grayscale-0 transition duration-300"
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
