"use client";
import { useRef, useEffect, useState, useCallback } from "react";

const IMAGES = [
  "/assets/images/4277553449265611777.jpg",
  "/assets/images/14364002538572917985.jpg",
  "/assets/images/358840436175251077526.jpg",
  "/assets/images/8c4a8124-4e17-42f1-a18a-434a5492dda8.jpeg",
  "/assets/images/c2dbf33d-35d1-4182-807c-dc5fafb67ed4.jpeg",
  "/assets/images/3f02f973-928e-4ddf-950c-8ff8ee7c6f50.jpeg",
  "/assets/images/3692672230771225358.jpg",
];

const FRAME_W = 198;
const FRAME_H = 270;
const FRAME_GAP = 12;
const SPROCKET_ZONE = 20;
// total width of one repeated unit
const UNIT = (FRAME_W + FRAME_GAP) * IMAGES.length;

function SprocketRow() {
  return (
    <div
      style={{
        height: `${SPROCKET_ZONE}px`,
        display: "flex",
        alignItems: "center",
        gap: "18px",
        paddingLeft: "12px",
        background: "#0d0d0d",
      }}
    >
      {Array.from({ length: 22 }).map((_, i) => (
        <div
          key={i}
          style={{
            width: "11px",
            height: "8px",
            borderRadius: "2px",
            background: "rgba(201,169,110,0.35)",
            border: "1px solid rgba(201,169,110,0.2)",
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

export default function FilmStripGallery() {
  const trackRef = useRef<HTMLDivElement>(null);
  // start in the middle copy so we can loop both ways
  const scrollXRef = useRef(UNIT);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollRef = useRef(0);
  const totalDragRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [grabbing, setGrabbing] = useState(false);

  const applyTransform = useCallback(() => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${-scrollXRef.current}px)`;
    }
  }, []);

  useEffect(() => {
    const AUTO_SPEED = 0.45; // px per 60fps frame
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(now - last, 50);
      last = now;

      if (!isDraggingRef.current) {
        scrollXRef.current += AUTO_SPEED * (dt / 16.67);
        // loop: keep between UNIT..UNIT*2 to always have content on both sides
        if (scrollXRef.current >= UNIT * 2) scrollXRef.current -= UNIT;
        if (scrollXRef.current < 0) scrollXRef.current += UNIT;
        applyTransform();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    applyTransform();
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [applyTransform]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startScrollRef.current = scrollXRef.current;
    totalDragRef.current = 0;
    setGrabbing(true);
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - startXRef.current;
    totalDragRef.current = Math.abs(dx);
    let next = startScrollRef.current - dx;
    // keep in loopable range
    const total = UNIT * 3;
    next = ((next % total) + total) % total;
    scrollXRef.current = next;
    applyTransform();
  };

  const onPointerUp = () => {
    isDraggingRef.current = false;
    setGrabbing(false);
  };

  const openLightbox = (imgIdx: number) => {
    if (totalDragRef.current > 8) return;
    setLightboxIdx(imgIdx % IMAGES.length);
  };

  const closeLightbox = () => setLightboxIdx(null);

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIdx((prev) => ((prev ?? 0) - 1 + IMAGES.length) % IMAGES.length);
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIdx((prev) => ((prev ?? 0) + 1) % IMAGES.length);
  };

  // 3 copies for seamless looping
  const allImages = [...IMAGES, ...IMAGES, ...IMAGES];

  const stripHeight = SPROCKET_ZONE + 8 + FRAME_H + 8 + SPROCKET_ZONE;

  return (
    <>
      {/* ===== Film Strip Container ===== */}
      <div
        style={{
          position: "absolute",
          top: "8470px",
          left: 0,
          width: "474px",
          height: `${stripHeight}px`,
          background: "#0d0d0d",
          overflow: "hidden",
          userSelect: "none",
          boxShadow: "inset 0 4px 16px rgba(0,0,0,0.8), inset 0 -4px 16px rgba(0,0,0,0.8)",
        }}
      >
        {/* Sprocket holes — top */}
        <SprocketRow />

        {/* Film grain overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 10,
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
            backgroundSize: "200px 200px",
            opacity: 0.5,
          }}
        />

        {/* Scrolling track */}
        <div
          ref={trackRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          style={{
            display: "flex",
            gap: `${FRAME_GAP}px`,
            paddingLeft: `${FRAME_GAP}px`,
            paddingTop: "8px",
            paddingBottom: "8px",
            willChange: "transform",
            cursor: grabbing ? "grabbing" : "grab",
          }}
        >
          {allImages.map((src, i) => {
            const frameNum = (i % IMAGES.length) + 1;
            return (
              <div
                key={i}
                onClick={() => openLightbox(i)}
                style={{
                  flexShrink: 0,
                  width: `${FRAME_W}px`,
                  height: `${FRAME_H}px`,
                  position: "relative",
                  border: "2px solid rgba(255,255,255,0.12)",
                  overflow: "hidden",
                  background: "#1a1a1a",
                  boxShadow: "0 0 8px rgba(0,0,0,0.6)",
                }}
              >
                {/* Frame number stamp */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 5,
                    right: 8,
                    color: "rgba(201,169,110,0.6)",
                    fontSize: "10px",
                    fontFamily: "monospace",
                    letterSpacing: "1px",
                    zIndex: 3,
                    pointerEvents: "none",
                  }}
                >
                  {String(frameNum).padStart(2, "0")}
                </div>

                {/* Photo */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Khoảnh khắc ${frameNum}`}
                  draggable={false}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: "sepia(0.15) contrast(1.08) brightness(0.95)",
                    transition: "filter 0.3s ease, transform 0.4s ease",
                    pointerEvents: "none",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLImageElement).style.filter = "sepia(0) contrast(1.05) brightness(1.05)";
                    (e.currentTarget as HTMLImageElement).style.transform = "scale(1.04)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLImageElement).style.filter = "sepia(0.15) contrast(1.08) brightness(0.95)";
                    (e.currentTarget as HTMLImageElement).style.transform = "scale(1)";
                  }}
                />

                {/* Click hint overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.4) 100%)",
                    pointerEvents: "none",
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Sprocket holes — bottom */}
        <SprocketRow />

        {/* Right-edge vignette */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "60px",
            height: "100%",
            background: "linear-gradient(to right, transparent, rgba(0,0,0,0.7))",
            pointerEvents: "none",
            zIndex: 5,
          }}
        />
        {/* Left-edge vignette */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "60px",
            height: "100%",
            background: "linear-gradient(to left, transparent, rgba(0,0,0,0.7))",
            pointerEvents: "none",
            zIndex: 5,
          }}
        />
      </div>

      {/* ===== Lightbox ===== */}
      {lightboxIdx !== null && (
        <div
          onClick={closeLightbox}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.92)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            style={{
              position: "absolute",
              top: 16,
              right: 20,
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.8)",
              fontSize: "36px",
              lineHeight: 1,
              cursor: "pointer",
              zIndex: 1,
              padding: "4px 8px",
            }}
          >
            ×
          </button>

          {/* Frame counter */}
          <div
            style={{
              position: "absolute",
              top: 20,
              left: "50%",
              transform: "translateX(-50%)",
              color: "rgba(201,169,110,0.8)",
              fontFamily: "monospace",
              fontSize: "13px",
              letterSpacing: "2px",
            }}
          >
            {String((lightboxIdx ?? 0) + 1).padStart(2, "0")} / {String(IMAGES.length).padStart(2, "0")}
          </div>

          {/* Image */}
          <img
            src={IMAGES[lightboxIdx]}
            alt={`Khoảnh khắc ${lightboxIdx + 1}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90vw",
              maxHeight: "82vh",
              objectFit: "contain",
              borderRadius: "2px",
              boxShadow: "0 0 60px rgba(0,0,0,0.9)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          />

          {/* Prev */}
          <button
            onClick={prevPhoto}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "50%",
              width: 44,
              height: 44,
              color: "white",
              fontSize: 22,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ‹
          </button>

          {/* Next */}
          <button
            onClick={nextPhoto}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "50%",
              width: 44,
              height: 44,
              color: "white",
              fontSize: 22,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ›
          </button>

          {/* Film strip bottom thumbnails */}
          <div
            style={{
              position: "absolute",
              bottom: 16,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: "6px",
              background: "rgba(0,0,0,0.5)",
              padding: "6px 10px",
              borderRadius: "4px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {IMAGES.map((src, idx) => (
              <div
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIdx(idx);
                }}
                style={{
                  width: "44px",
                  height: "32px",
                  overflow: "hidden",
                  border: idx === lightboxIdx ? "2px solid rgba(201,169,110,0.9)" : "2px solid rgba(255,255,255,0.15)",
                  borderRadius: "2px",
                  cursor: "pointer",
                  opacity: idx === lightboxIdx ? 1 : 0.5,
                  transition: "opacity 0.2s, border-color 0.2s",
                  flexShrink: 0,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
