"use client"

import { motion } from "framer-motion"
import Image from "next/image"

interface Logo {
  id: number
  name: string
  image: string
  url: string
}

// TwoByTwo Learning Centers
const logos: Logo[] = [
  {
    id: 1,
    name: "TwoByTwo Learning Centers",
    image: "https://us1-photo.nextdoor.com/business_logo/65/6a/656a9d2cd332eb8385695d1ea0c61fcd.jpeg",
    url: "https://www.twobytwolearningcenters.com"
  }
]

export function LogoCarousel() {
  // Create enough duplicates for seamless scrolling
  const logoCount = 10 // Number of logos to display
  const singleSet = Array(logoCount).fill(logos[0]).map((logo, i) => ({
    ...logo,
    uniqueId: i
  }))

  return (
    <section className="w-full py-8 relative overflow-hidden">
      {/* Fade edges for smooth appearance */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#FDFBD4] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#FDFBD4] to-transparent z-10 pointer-events-none" />

      {/* Title */}
      <div className="text-center mb-4">
        <p className="text-sm font-semibold text-gray-600 tracking-wide uppercase">
          Our Partnered Institutions 
        </p>
      </div>

      {/* Scrolling logos container */}
      <div className="relative mx-auto overflow-hidden">
        <motion.div
          className="flex"
          animate={{
            x: ["0px", "-50%"],
          }}
          transition={{
            x: {
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            },
          }}
        >
          {/* First set of logos */}
          <div className="flex gap-16 pr-16">
            {singleSet.map((logo) => (
              <a
                key={`first-${logo.uniqueId}`}
                href={logo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 group cursor-pointer relative"
              >
                <div className="w-24 h-24 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm hover:shadow-lg transition-all duration-500 hover:scale-105 hover:bg-white">
                  <img
                    src={logo.image}
                    alt={logo.name}
                    className="w-14 h-14 object-contain transition-all duration-500"
                  />
                </div>
                {/* Elegant tooltip on hover */}
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-xs text-gray-700 font-medium bg-white/90 px-2 py-1 rounded-md shadow-sm whitespace-nowrap">
                    {logo.name}
                  </span>
                </div>
              </a>
            ))}
          </div>

          {/* Duplicate set for seamless loop */}
          <div className="flex gap-16 pr-16">
            {singleSet.map((logo) => (
              <a
                key={`second-${logo.uniqueId}`}
                href={logo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 group cursor-pointer relative"
              >
                <div className="w-24 h-24 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm hover:shadow-lg transition-all duration-500 hover:scale-105 hover:bg-white">
                  <img
                    src={logo.image}
                    alt={logo.name}
                    className="w-14 h-14 object-contain transition-all duration-500"
                  />
                </div>
                {/* Elegant tooltip on hover */}
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-xs text-gray-700 font-medium bg-white/90 px-2 py-1 rounded-md shadow-sm whitespace-nowrap">
                    {logo.name}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default LogoCarousel
