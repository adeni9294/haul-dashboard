"use client";

import { useEffect, useState } from "react";

export default function SplashScreen({ children }) {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);

      setTimeout(() => {
        setLoading(false);
      }, 300);

    }, 1000); // tampil splash 1 detik

    return () => clearTimeout(timer);
  }, []);

  if (!loading) {
    return children;
  }

  return (
    <div className={`kb-splash ${fadeOut ? "fade-out" : ""}`}>
      <div className="kb-content">

        <div className="kb-glow"></div>

        <img
          src="/icon-192.png"
          alt="K&B"
          className="kb-logo"
        />

        <h1>K & B</h1>

        <p>Connecting Business, Building Trust</p>

        <div className="kb-progress">
          <div className="kb-progress-fill"></div>
        </div>

      </div>
    </div>
  );
}
