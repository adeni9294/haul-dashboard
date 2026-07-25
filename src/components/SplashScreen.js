"use client";

import { useEffect, useState } from "react";

export default function SplashScreen({ children }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="kb-splash">

        <img
          src="/logo.png"
          alt="K&B"
          className="kb-logo"
        />

        <h1>K & B</h1>

        <p>Connecting Business, Building Trust</p>

        <div className="loading-bar">
          <div className="loading-fill"></div>
        </div>

      </div>
    );
  }

  return children;
}
