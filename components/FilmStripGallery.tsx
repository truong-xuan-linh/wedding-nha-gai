"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";

const IMAGES = [
  "/assets/images/4277553449265611777.jpg",
  "/assets/images/14364002538572917985.jpg",
  "/assets/images/358840436175251077526.jpg",
  "/assets/images/8c4a8124-4e17-42f1-a18a-434a5492dda8.jpeg",
  "/assets/images/c2dbf33d-35d1-4182-807c-dc5fafb67ed4.jpeg",
  "/assets/images/3f02f973-928e-4ddf-950c-8ff8ee7c6f50.jpeg",
  "/assets/images/3692672230771225358.jpg",
];

const FRAME_H = 270;
const FRAME_GAP = 12;
const SPROCKET_ZONE = 20;
const FALLBACK_W = 198;

function calcUnit(widths: number[]) {
  return widths.reduce((sum, w) => sum + w + FRAME_GAP, 0);
}

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
  const scrollXRef = useRef(0);
  const unitRef = useRef(calcUnit(IMAGES.map(() => FALLBACK_W)));
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollRef = useRef(0);
  const totalDragRef = useRef(0);
  // which frame index the user pressed down on (-1 = none)
  const clickFrameRef = useRef(-1);
  const rafRef = useRef<number | null>(null);

  const [frameWidths, setFrameWidths] = useState<number[]>(
    IMAGES.map(() => FALLBACK_W)
  );
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const grabbingRef = useRef(false);
  const trackContainerRef = useRef<HTMLDivElement>(null);
  // portal requires DOM — only true after mount
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Measure natural aspect ratios
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      IMAGES.map(
        (src) =>
          new Promise<number>((resolve) => {
            const img = new window.Image();
            img.onload = () => {
              const ratio = img.naturalWidth / img.naturalHeight;
              resolve(Math.round(Math.max(140, Math.min(400, ratio * FRAME_H))));
            };
            img.onerror = () => resolve(FALLBACK_W);
            img.src = src;
          })
      )
    ).then((widths) => {
      if (cancelled) return;
      unitRef.current = calcUnit(widths);
      scrollXRef.current = unitRef.current; // start at middle copy
      setFrameWidths(widths);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const applyTransform = useCallback(() => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${-scrollXRef.current}px)`;
    }
  }, []);

  // Auto-scroll RAF
  useEffect(() => {
    const AUTO_SPEED = 0.45;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - last, 50);
      last = now;
      if (!isDraggingRef.current) {
        const unit = unitRef.current;
        scrollXRef.current += AUTO_SPEED * (dt / 16.67);
        if (scrollXRef.current >= unit * 2) scrollXRef.current -= unit;
        if (scrollXRef.current < 0) scrollXRef.current += unit;
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

  // Window-level drag listeners — avoids setPointerCapture which blocks click events
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      // prevent page scroll while dragging the strip
      e.preventDefault();
      const dx = e.clientX - startXRef.current;
      totalDragRef.current = Math.abs(dx);
      const total = unitRef.current * 3;
      let next = startScrollRef.current - dx;
      next = ((next % total) + total) % total;
      scrollXRef.current = next;
      applyTransform();
    };

    const onUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      grabbingRef.current = false;
      if (trackContainerRef.current) {
        trackContainerRef.current.style.cursor = "grab";
      }
      // treat as click if drag distance was small
      if (totalDragRef.current < 8 && clickFrameRef.current >= 0) {
        setLightboxIdx(clickFrameRef.current % IMAGES.length);
      }
      clickFrameRef.current = -1;
    };

    // { passive: false } required so preventDefault() works on mobile
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [applyTransform]);

  const onTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    isDraggingRef.current = true;
    grabbingRef.current = true;
    startXRef.current = e.clientX;
    startScrollRef.current = scrollXRef.current;
    totalDragRef.current = 0;
    if (trackContainerRef.current) {
      trackContainerRef.current.style.cursor = "grabbing";
    }
    // record which frame was pressed — no setPointerCapture needed
    const frameEl = (e.target as Element).closest("[data-frame-idx]");
    clickFrameRef.current = frameEl
      ? parseInt(frameEl.getAttribute("data-frame-idx") ?? "-1", 10)
      : -1;
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

  const allImages = [...IMAGES, ...IMAGES, ...IMAGES];
  const stripHeight = SPROCKET_ZONE + 8 + FRAME_H + 8 + SPROCKET_ZONE;

  const lightbox =
    mounted && lightboxIdx !== null
      ? createPortal(
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

            {/* Counter */}
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
              {String((lightboxIdx ?? 0) + 1).padStart(2, "0")} /{" "}
              {String(IMAGES.length).padStart(2, "0")}
            </div>

            {/* Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
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

            {/* Thumbnails */}
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
                    width: `${Math.round((frameWidths[idx] / FRAME_H) * 32)}px`,
                    height: "32px",
                    overflow: "hidden",
                    border:
                      idx === lightboxIdx
                        ? "2px solid rgba(201,169,110,0.9)"
                        : "2px solid rgba(255,255,255,0.15)",
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
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      {/* ===== Film Strip ===== */}
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
          boxShadow:
            "inset 0 4px 16px rgba(0,0,0,0.8), inset 0 -4px 16px rgba(0,0,0,0.8)",
        }}
      >
        <SprocketRow />

        {/* Film grain */}
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

        {/* Track wrapper — touch-action:none stops browser from claiming the gesture */}
        <div
          ref={trackContainerRef}
          onPointerDown={onTrackPointerDown}
          style={{
            touchAction: "none",
            cursor: "grab",
            overflow: "hidden",
          }}
        >
        {/* Inner scrolling track */}
        <div
          ref={trackRef}
          style={{
            display: "flex",
            gap: `${FRAME_GAP}px`,
            paddingLeft: `${FRAME_GAP}px`,
            paddingTop: "8px",
            paddingBottom: "8px",
            willChange: "transform",
          }}
        >
          {allImages.map((src, i) => {
            const imgIdx = i % IMAGES.length;
            const fw = frameWidths[imgIdx];
            return (
              <div
                key={i}
                data-frame-idx={i}
                style={{
                  flexShrink: 0,
                  width: `${fw}px`,
                  height: `${FRAME_H}px`,
                  position: "relative",
                  border: "2px solid rgba(255,255,255,0.12)",
                  overflow: "hidden",
                  background: "#1a1a1a",
                  boxShadow: "0 0 8px rgba(0,0,0,0.6)",
                  transition: "width 0.3s ease",
                }}
              >
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
                  {String(imgIdx + 1).padStart(2, "0")}
                </div>

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Khoảnh khắc ${imgIdx + 1}`}
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
                    (e.currentTarget as HTMLImageElement).style.filter =
                      "sepia(0) contrast(1.05) brightness(1.05)";
                    (e.currentTarget as HTMLImageElement).style.transform =
                      "scale(1.04)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLImageElement).style.filter =
                      "sepia(0.15) contrast(1.08) brightness(0.95)";
                    (e.currentTarget as HTMLImageElement).style.transform =
                      "scale(1)";
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.4) 100%)",
                    pointerEvents: "none",
                  }}
                />
              </div>
            );
          })}
        </div>
        </div>{/* end trackContainerRef */}

        <SprocketRow />

        {/* Edge vignettes */}
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

      {/* Lightbox rendered via portal → escapes transform stacking context */}
      {lightbox}
    </>
  );
}
