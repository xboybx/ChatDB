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
        <div className="flex gap-2">Setting Up...</div>
      ) : (
        <>
          {/* Background Image */}
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat bg-opacity-25 opacity-90 backdrop-blur-3xl"
            style={{
              backgroundImage: "url('/landingImage.png')",
            }}
          />

          {/* Content */}
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Logo/Title */}
              <motion.h1
                className="text-5xl md:text-6xl font-semibold text-gray-900 mb-6 tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                ChatDB
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed font-light"
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
                className="bg-gray-900 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-800 transition-colors shadow-sm"
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
                className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <span>PDF • Excel • CSV</span>
                <span>•</span>
                <span>Database Connections</span>
                <span>•</span>
                <span>AI-Powered</span>
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
