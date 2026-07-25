"use client";

import { useEffect, useState } from "react";

export default function SplashScreen({
  children,
  appReady = false,
}) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (appReady) {
      setFadeOut(true);
    }
  }, [appReady]);

  if (appReady && fadeOut) {
    return (
      <div className="kb-splash fade-out">
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

  if (appReady) {
    return children;
  }

  return (
    <div className="kb-splash">
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
