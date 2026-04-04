"use client";

import { useEffect, useState } from "react";

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isTouch, setIsTouch] = useState(true);

  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const updateHoverState = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Nút bấm thực sự hoặc thẻ có onClick
      const isClickable =
        window.getComputedStyle(target).cursor === "pointer" ||
        target.tagName.toLowerCase() === "a" ||
        target.tagName.toLowerCase() === "button" ||
        target.closest('button') !== null ||
        target.closest('a') !== null;
      setIsHovering(isClickable);
    };

    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("mouseover", updateHoverState);

    // Sử dụng CSS global để ẩn luôn cursor mặc định trên toàn page
    const style = document.createElement("style");
    style.innerHTML = `* { cursor: none !important; }`;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mouseover", updateHoverState);
      document.head.removeChild(style);
    };
  }, []);

  if (isTouch) return null;

  return (
    <>
      <div
        className="fixed top-0 left-0 w-2 h-2 bg-[#d4af37] rounded-full pointer-events-none z-[100000000] transition-transform duration-75 ease-out shadow-[0_0_8px_rgba(212,175,55,0.8)]"
        style={{
          transform: `translate3d(${mousePosition.x - 4}px, ${mousePosition.y - 4}px, 0) scale(${isHovering ? 2 : 1})`,
        }}
      />
      <div
        className="fixed top-0 left-0 w-8 h-8 border-[1.5px] border-[#d4af37]/60 rounded-full pointer-events-none z-[100000000] transition-all duration-300 ease-out"
        style={{
          transform: `translate3d(${mousePosition.x - 16}px, ${mousePosition.y - 16}px, 0) scale(${isHovering ? 1.5 : 1})`,
          backgroundColor: isHovering ? "rgba(212, 175, 55, 0.15)" : "transparent",
        }}
      />
    </>
  );
}
