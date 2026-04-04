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

  // Vary gold tones per particle for a richer look
  const goldPalettes = [
    "radial-gradient(circle, #fffbe0 0%, #f5c518 55%, #b8860b 100%)",
    "radial-gradient(circle, #fff8cc 0%, #e8b800 55%, #a07000 100%)",
    "radial-gradient(circle, #ffffff 0%, #ffd700 45%, #c8960a 100%)",
    "radial-gradient(circle, #fffae6 0%, #daa520 55%, #8b6914 100%)",
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden" style={{ opacity: 0.75 }}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
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
            background: goldPalettes[p.id % goldPalettes.length],
          }}
        />
      ))}
    </div>
  );
}
