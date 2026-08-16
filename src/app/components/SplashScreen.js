"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen({ children }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tampil splash selama 1 detik, lalu hilang
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="kb-splash"
          >
            <div className="kb-content">
              {/* Efek Glow di belakang logo */}
              <div className="kb-glow"></div>

              {/* Logo Animasi Masuk */}
              <motion.img
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                src="/logo.png"
                alt="K&B"
                className="kb-logo"
              />

              <motion.h1
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              >
                K & B
              </motion.h1>

              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              >
                Connecting Business, Building Trust
              </motion.p>

              {/* Progress Bar */}
              <div className="kb-progress">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "0%" }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="kb-progress-fill"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && children}
    </>
  );
}
