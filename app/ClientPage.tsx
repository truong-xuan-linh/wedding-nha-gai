"use client";

import { useEffect, useRef } from "react";

interface ClientPageProps {
  htmlContent: string;
}

export default function ClientPage({ htmlContent }: ClientPageProps) {
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

    transitionEls.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const key = htmlEl.getAttribute("data-transition-key") ?? "";
      if (key.includes("slide-up")) {
        htmlEl.style.transform = "translateY(50px)";
        htmlEl.style.opacity = "0";
      } else if (key.includes("slide-down")) {
        htmlEl.style.transform = "translateY(-50px)";
        htmlEl.style.opacity = "0";
      } else if (key.includes("slide-right")) {
        htmlEl.style.transform = "translateX(-50px)";
        htmlEl.style.opacity = "0";
      } else if (key.includes("slide-left")) {
        htmlEl.style.transform = "translateX(50px)";
        htmlEl.style.opacity = "0";
      } else if (key.includes("fade")) {
        htmlEl.style.opacity = "0";
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.style.transform = "none";
            el.style.opacity = "1";
            observer.unobserve(el);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    transitionEls.forEach((el) => observer.observe(el));

    // Auto-scroll: replicate original site's autoScroll speed of 0.06px per frame
    const scrollContainer = container.querySelector("#root-page-container")
      ?.parentElement as HTMLElement | null;
    let scrollAnimId: number;

    // Pause auto-scroll when user manually scrolls, resume after 3s idle
    let userScrollTimeout: ReturnType<typeof setTimeout> | null = null;
    let paused = false;

    const autoScroll = () => {
      if (!paused && scrollContainer) {
        const atBottom =
          scrollContainer.scrollTop + scrollContainer.clientHeight >=
          scrollContainer.scrollHeight - 1;
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

    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleUserScroll, { passive: true });
    }

    // Countdown timer
    const countdownEl = container.querySelector(".countdown.componentBOX") as HTMLElement;
    if (countdownEl) {
      const weddingDate = new Date("2026-01-07T00:00:00");

      const updateCountdown = () => {
        const now = new Date();
        const diff = weddingDate.getTime() - now.getTime();

        const dayDivs = countdownEl.querySelectorAll(":scope > div");

        if (diff <= 0) {
          if (dayDivs.length >= 1) {
            const dayEl = dayDivs[0].querySelector("div:first-child");
            if (dayEl) dayEl.textContent = "0";
          }
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          if (dayDivs.length >= 1) {
            const dayEl = dayDivs[0].querySelector("div:first-child");
            if (dayEl) dayEl.textContent = String(days);
          }
        }
      };

      updateCountdown();
      const countdownInterval = setInterval(updateCountdown, 60000);
      return () => {
        clearInterval(countdownInterval);
        observer.disconnect();
        cancelAnimationFrame(scrollAnimId);
        if (scrollContainer) scrollContainer.removeEventListener("scroll", handleUserScroll);
        if (userScrollTimeout) clearTimeout(userScrollTimeout);
        if (messageBtn) messageBtn.removeEventListener("click", openPopup);
        if (closeBtn) closeBtn.removeEventListener("click", closePopup);
        if (popupBackdrop) popupBackdrop.removeEventListener("click", closePopup);
      };
    }

    return () => {
      observer.disconnect();
      cancelAnimationFrame(scrollAnimId);
      if (scrollContainer) scrollContainer.removeEventListener("scroll", handleUserScroll);
      if (userScrollTimeout) clearTimeout(userScrollTimeout);
      if (messageBtn) messageBtn.removeEventListener("click", openPopup);
      if (closeBtn) closeBtn.removeEventListener("click", closePopup);
      if (popupBackdrop) popupBackdrop.removeEventListener("click", closePopup);
    };
  }, []);

  return (
    <>
      <link rel="preload" as="image" href="/audio-1.png" />
      <link rel="preload" as="image" href="/calen_heart_1.png" />
      <link rel="preload" as="image" href="/message.24f9a1e2.png" />
      <link rel="preload" as="image" href="/biubiu.png" />
      <div
        ref={containerRef}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </>
  );
}
