"use client";

import { useEffect, useState } from "react";

export default function SparkleEffects() {
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; size: number; duration: number; delay: number; twinkleDuration: number }>
  >([]);

  useEffect(() => {
    const newParticles: Array<{ id: number; x: number; y: number; size: number; duration: number; delay: number; twinkleDuration: number }> = [];
    const numParticles = window.innerWidth < 768 ? 20 : 40; // Giảm particle trên mobile

    for (let i = 0; i < numParticles; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1.5, // Tăng nhẹ size tối thiểu
        duration: Math.random() * 20 + 20,
        delay: Math.random() * 10,
        twinkleDuration: Math.random() * 2 + 1.5, // Tốc độ chớp nháy khác nhau (1.5s - 3.5s)
      });
    }
    const timer = setTimeout(() => setParticles(newParticles), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden opacity-60 mix-blend-screen">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-[#fdf5e6]"
          style={{
            left: `${p.x}vw`,
            top: `${p.y}vh`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationName: "float-up, twinkle",
            animationDuration: `${p.duration}s, ${p.twinkleDuration}s`,
            animationTimingFunction: "linear, ease-in-out",
            animationIterationCount: "infinite, infinite",
            animationDirection: "normal, alternate",
            animationDelay: `${p.delay}s, ${p.delay}s`,
            boxShadow: `0 0 ${p.size * 4}px rgba(212, 175, 55, 1), 0 0 ${p.size * 2}px #fff`,
            background: "radial-gradient(circle, #fff 0%, #fdf5e6 60%, #d4af37 100%)",
          }}
        />
      ))}
    </div>
  );
}
