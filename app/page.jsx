"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";

export default function LandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = () => {
    setIsLoading(true);
    router.push("/chat");
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center px-6 relative overflow-hidden">
      {isLoading ? (
        <div className="flex gap-2 bg-gradient-to-r from-black via-white to-black bg-200% bg-clip-text  text-transparent animate-gradient-loader [text-fill-color:transparent] [-webkit-text-fill-color:transparent][-webkit-background-clip:text]">
          Setting Up...
        </div>
      ) : (
        <>
          {/* Background Image */}
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat bg-opacity-25 opacity-90 backdrop-blur-3xl"
            style={{
              backgroundImage:
                "url('https://ik.imagekit.io/mtkm3escy/regenerate%20the%20lands.png')",
            }}
          />

          {/* Content */}
          <div className="max-w-3xl mx-auto text-center relative z-10 px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Logo/Title */}
              <motion.h1
                className="text-4xl sm:text-5xl md:text-6xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6 tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                ChatDB
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 sm:mb-12 leading-relaxed font-light"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Chat with your data in plain English.
                <br />
                No SQL required.
              </motion.p>

              {/* CTA Button */}
              <motion.button
                onClick={handleGetStarted}
                className="bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg text-base sm:text-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Get Started
              </motion.button>

              {/* Minimal feature hints */}
              <motion.div
                className="mt-12 sm:mt-16 flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <span>PDF • Excel • CSV</span>
                <span className="hidden sm:inline">•</span>
                <span>Database Connections</span>
                <span className="hidden sm:inline">•</span>
                <span>AI-Powered</span>
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
