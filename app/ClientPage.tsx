"use client";

import { useEffect, useRef } from "react";
import BodyContent from "./BodyContent";

export default function ClientPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Blessing popup open/close interaction.
    // The popup is hidden via inline style in body-content.html from the start.
    const popupBackdrop = container.querySelector(".popup-backdrop") as HTMLElement | null;
    const popupWrapper = container.querySelector("#blessing-box-popup") as HTMLElement | null;

    const openPopup = () => {
      if (popupBackdrop) popupBackdrop.style.display = "block";
      if (popupWrapper) popupWrapper.style.display = "block";
    };
    const closePopup = () => {
      if (popupBackdrop) popupBackdrop.style.display = "none";
      if (popupWrapper) popupWrapper.style.display = "none";
    };

    const messageBtn = container.querySelector(".message-box-button") as HTMLElement | null;
    if (messageBtn) messageBtn.addEventListener("click", openPopup);

    const closeBtn = container.querySelector(".icon-guanbi") as HTMLElement | null;
    if (closeBtn) closeBtn.addEventListener("click", closePopup);

    if (popupBackdrop) popupBackdrop.addEventListener("click", closePopup);

    // Audio player interaction
    const audioWrapper = container.querySelector("#audio-control-wrapper") as HTMLElement;
    const audioEl = container.querySelector("audio") as HTMLAudioElement;
    const audioToggle = container.querySelector(".audio-toggle") as HTMLElement;

    let isPlaying = false;

    if (audioWrapper && audioEl && audioToggle) {
      const handleAudioClick = () => {
        if (isPlaying) {
          audioEl.pause();
          audioToggle.classList.add("mrotate");
          audioToggle.classList.remove("mrotate-stop");
          isPlaying = false;
        } else {
          audioEl.play().catch(() => {});
          audioToggle.classList.remove("mrotate");
          audioToggle.classList.add("mrotate-stop");
          isPlaying = true;
        }
      };
      audioWrapper.addEventListener("click", handleAudioClick);
    }

    // Scroll-based reveal animations using IntersectionObserver.
    // Elements were captured in their final state, so we reset them to their
    // initial (hidden/translated) state first, then animate them in on scroll.
    const transitionEls = container.querySelectorAll("[data-transition-key]");

    // Detect the actual scrollable container.
    const scrollContainer = container.querySelector(".relative.overflow-x-hidden") as HTMLElement | null;

    const revealedRefs = new Set<HTMLElement>();

    const revealEl = (el: HTMLElement) => {
      if (revealedRefs.has(el)) return;
      revealedRefs.add(el);
      el.style.transform = "none";
      el.style.opacity = "1";
    };

    transitionEls.forEach((el) => {
      const htmlEl = el as HTMLElement;

      // Disable transition temporarily to set the initial hidden state instantly
      htmlEl.style.transition = "none";

      const key = htmlEl.getAttribute("data-transition-key") ?? "";
      if (key.includes("slide-up")) {
        htmlEl.style.transform = "translateY(50px)";
      } else if (key.includes("slide-down")) {
        htmlEl.style.transform = "translateY(-50px)";
      } else if (key.includes("slide-right")) {
        htmlEl.style.transform = "translateX(-50px)";
      } else if (key.includes("slide-left")) {
        htmlEl.style.transform = "translateX(50px)";
      }
      htmlEl.style.opacity = "0";

      // Force a reflow
      htmlEl.offsetHeight;
      // Set a standard transition for the reveal effect
      htmlEl.style.transition = "opacity 0.8s ease-out, transform 0.8s ease-out";
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revealEl(entry.target as HTMLElement);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: scrollContainer,
        threshold: 0,
        rootMargin: "0px 0px 50px 0px",
      },
    );

    // Fallback scroll listener for cases where IntersectionObserver fails or is clipped by ancestors
    const handleScrollReveal = () => {
      if (!scrollContainer) return;
      const containerRect = scrollContainer.getBoundingClientRect();
      transitionEls.forEach((el) => {
        const htmlEl = el as HTMLElement;
        if (revealedRefs.has(htmlEl)) return;
        const rect = htmlEl.getBoundingClientRect();
        // Trigger if top of element is within viewport + margin
        if (rect.top < containerRect.bottom + 50) {
          revealEl(htmlEl);
        }
      });
    };

    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScrollReveal);
    }

    // Double rAF: IntersectionObserver fires BEFORE paint (as part of the rendering
    // pipeline: rAF → layout → IO → paint). A single rAF means IO reveals elements
    // before the browser ever paints them hidden — no transition plays.
    // The outer rAF causes the browser to paint the hidden state first.
    // The inner rAF then starts observing; IO fires in the next rendering cycle
    // when elements have already been painted hidden, so the transition plays.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        transitionEls.forEach((el) => observer.observe(el));
      });
    });

    // Auto-scroll: replicate original site's autoScroll speed of 0.06px per frame

    let scrollAnimId: number;

    // Pause auto-scroll when user manually scrolls, resume after 3s idle
    let userScrollTimeout: ReturnType<typeof setTimeout> | null = null;
    let paused = false;

    const autoScroll = () => {
      if (!paused && scrollContainer) {
        const atBottom = scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - 1;
        if (!atBottom) {
          scrollContainer.scrollTop += 0.06;
        }
      }
      scrollAnimId = requestAnimationFrame(autoScroll);
    };
    scrollAnimId = requestAnimationFrame(autoScroll);

    const handleUserScroll = () => {
      paused = true;
      if (userScrollTimeout) clearTimeout(userScrollTimeout);
      userScrollTimeout = setTimeout(() => {
        paused = false;
      }, 3000);
    };

    // Listen on wheel/touch events only — NOT the scroll event — so that
    // auto-scroll's own programmatic scrollTop changes don't pause themselves.
    if (scrollContainer) {
      scrollContainer.addEventListener("wheel", handleUserScroll, { passive: true });
      scrollContainer.addEventListener("touchstart", handleUserScroll, { passive: true });
      scrollContainer.addEventListener("touchmove", handleUserScroll, { passive: true });
    }

    // Countdown timer
    const countdownEl = container.querySelector(".countdown.componentBOX") as HTMLElement;
    let countdownIntervalId: NodeJS.Timeout;

    if (countdownEl) {
      const weddingDate = new Date("2026-01-07T00:00:00");

      const updateCountdown = () => {
        const now = new Date();
        const diff = weddingDate.getTime() - now.getTime();

        const dayDivs = countdownEl.querySelectorAll(":scope > div");

        if (diff <= 0) {
          dayDivs.forEach((div) => {
            const numEl = div.querySelector("div:first-child");
            if (numEl) numEl.textContent = "0";
          });
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((diff / 1000 / 60) % 60);
          const seconds = Math.floor((diff / 1000) % 60);

          if (dayDivs.length >= 4) {
            const d = dayDivs[0].querySelector("div:first-child");
            const h = dayDivs[1].querySelector("div:first-child");
            const m = dayDivs[2].querySelector("div:first-child");
            const s = dayDivs[3].querySelector("div:first-child");
            if (d) d.textContent = String(days);
            if (h) h.textContent = String(hours);
            if (m) m.textContent = String(minutes);
            if (s) s.textContent = String(seconds);
          }
        }
      };

      updateCountdown();
      countdownIntervalId = setInterval(updateCountdown, 1000);
    }

    const cleanupAll = () => {
      observer.disconnect();
      cancelAnimationFrame(scrollAnimId);
      clearInterval(countdownIntervalId);
      if (scrollContainer) {
        scrollContainer.removeEventListener("wheel", handleUserScroll);
        scrollContainer.removeEventListener("touchstart", handleUserScroll);
        scrollContainer.removeEventListener("touchmove", handleUserScroll);
        scrollContainer.removeEventListener("scroll", handleScrollReveal);
      }
      if (userScrollTimeout) clearTimeout(userScrollTimeout);
      if (messageBtn) messageBtn.removeEventListener("click", openPopup);
      if (closeBtn) closeBtn.removeEventListener("click", closePopup);
      if (popupBackdrop) popupBackdrop.removeEventListener("click", closePopup);
    };

    return cleanupAll;
  }, []);

  return (
    <>
      <link rel="preload" as="image" href="/audio-1.png" />
      <link rel="preload" as="image" href="/calen_heart_1.png" />
      <link rel="preload" as="image" href="/message.24f9a1e2.png" />
      <link rel="preload" as="image" href="/biubiu.png" />
      <div ref={containerRef}>
        <BodyContent />
      </div>
    </>
  );
}
