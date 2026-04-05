"use client";

import { useEffect, useRef } from "react";
import BodyContent from "./BodyContent";
import CustomCursor from "../components/CustomCursor";
import SparkleEffects from "../components/SparkleEffects";

export default function ClientPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── Mobile scale — fit 474px-wide content into narrow viewports ────────────
    const DESIGN_WIDTH = 474;
    const rootPage = container.querySelector("#root-page-container") as HTMLElement | null;
    const applyMobileScale = () => {
      const vw = window.innerWidth;
      if (rootPage && vw < DESIGN_WIDTH) {
        const scale = vw / DESIGN_WIDTH;
        document.documentElement.style.setProperty("--mobile-scale", String(scale));

        // Fix for the "white area" at the bottom:
        // transform: scale only visual, doesn't affect document flow.
        // We use negative margin-bottom to shrink the occupied height.
        const originalHeight = 9238.39;
        const scaledHeight = originalHeight * scale;
        const diff = originalHeight - scaledHeight;
        rootPage.style.marginBottom = `-${diff}px`;

        // Also ensure pc-content parent doesn't have fixed 90vh on mobile if we want full screen
        const pcContent = container.querySelector(".pc-content") as HTMLElement | null;
        if (pcContent) {
          pcContent.style.height = "100vh";
        }
      } else if (rootPage) {
        document.documentElement.style.removeProperty("--mobile-scale");
        rootPage.style.marginBottom = "";
        const pcContent = container.querySelector(".pc-content") as HTMLElement | null;
        if (pcContent) {
          pcContent.style.height = "90vh";
        }
      }
    };
    applyMobileScale();
    window.addEventListener("resize", applyMobileScale);

    // Blessing popup open/close interaction.
    // The popup is hidden via inline style in body-content.html from the start.
    const popupBackdrop = container.querySelector(".popup-backdrop") as HTMLElement | null;
    const popupWrapper = container.querySelector("#blessing-box-popup") as HTMLElement | null;

    const POPUP_DURATION = 300;

    const openPopup = () => {
      // Reset animations first, then display, then force reflow, then apply animation
      if (popupBackdrop) {
        popupBackdrop.style.animation = "";
        popupBackdrop.style.display = "block";
        void popupBackdrop.offsetHeight; // force reflow so browser registers the displayed state
        popupBackdrop.style.animation = `backdropFadeIn ${POPUP_DURATION}ms ease-out forwards`;
      }
      if (popupWrapper) {
        popupWrapper.style.animation = "";
        popupWrapper.style.display = "block";
        void popupWrapper.offsetHeight; // force reflow
        popupWrapper.style.animation = `popupSlideUp ${POPUP_DURATION}ms ease-out forwards`;
      }
    };

    const closePopup = () => {
      if (popupBackdrop) {
        popupBackdrop.style.animation = `backdropFadeOut ${POPUP_DURATION}ms ease-in forwards`;
      }
      if (popupWrapper) {
        popupWrapper.style.animation = `popupSlideDown ${POPUP_DURATION}ms ease-in forwards`;
      }
      setTimeout(() => {
        if (popupBackdrop) {
          popupBackdrop.style.display = "none";
          popupBackdrop.style.animation = "";
        }
        if (popupWrapper) {
          popupWrapper.style.display = "none";
          popupWrapper.style.animation = "";
        }
      }, POPUP_DURATION);
    };

    const messageBtn = container.querySelector(".message-box-button") as HTMLElement | null;
    if (messageBtn) messageBtn.addEventListener("click", openPopup);

    const closeBtn = container.querySelector(".icon-guanbi") as HTMLElement | null;
    if (closeBtn) closeBtn.addEventListener("click", closePopup);

    if (popupBackdrop) popupBackdrop.addEventListener("click", closePopup);

    // ── RSVP form ──────────────────────────────────────────────────────────────
    const rsvpForm = container.querySelector(".rsvp-form form") as HTMLFormElement | null;
    if (rsvpForm) {
      const rsvpBtn = rsvpForm.querySelector("button[type='submit']") as HTMLButtonElement | null;

      // Highlight selected count button
      const countRadios = rsvpForm.querySelectorAll("input[name='rsvp-count']");
      const setCountStyle = (span: HTMLElement, active: boolean) => {
        span.style.background = active ? "rgba(185,145,80,0.14)" : "transparent";
        span.style.color = active ? "#7a5520" : "#a08060";
        span.style.borderColor = active ? "rgba(185,145,80,0.7)" : "rgba(185,145,80,0.25)";
        span.style.fontWeight = active ? "600" : "400";
      };
      countRadios.forEach((radio) => {
        radio.addEventListener("change", () => {
          countRadios.forEach((r) => {
            const span = r.nextElementSibling as HTMLElement | null;
            if (span) setCountStyle(span, false);
          });
          const selected = (radio as HTMLInputElement).nextElementSibling as HTMLElement | null;
          if (selected) setCountStyle(selected, true);
        });
      });

      // Highlight selected attendance card
      const attendanceRadios = rsvpForm.querySelectorAll("input[name='rsvp-attendance']");
      const setAttendanceStyle = (span: HTMLElement, active: boolean) => {
        span.style.background = active ? "rgba(185,145,80,0.12)" : "transparent";
        span.style.color = active ? "#7a5520" : "#a08060";
        span.style.borderColor = active ? "rgba(185,145,80,0.6)" : "rgba(185,145,80,0.25)";
        span.style.fontWeight = active ? "600" : "400";
      };
      attendanceRadios.forEach((radio) => {
        radio.addEventListener("change", () => {
          attendanceRadios.forEach((r) => {
            const span = r.nextElementSibling as HTMLElement | null;
            if (span) setAttendanceStyle(span, false);
          });
          const selected = (radio as HTMLInputElement).nextElementSibling as HTMLElement | null;
          if (selected) setAttendanceStyle(selected, true);
        });
      });

      rsvpForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nameInput = rsvpForm.querySelector("input[name='rsvp-name']") as HTMLInputElement;
        const attendingInput = rsvpForm.querySelector(
          "input[name='rsvp-attendance']:checked",
        ) as HTMLInputElement | null;
        const countInput = rsvpForm.querySelector("input[name='rsvp-count']:checked") as HTMLInputElement | null;

        const name = nameInput?.value?.trim() ?? "";
        const attending = attendingInput?.value !== "no";
        const attendee_count = Number(countInput?.value ?? "1");

        if (rsvpBtn) {
          rsvpBtn.disabled = true;
          rsvpBtn.textContent = "Đang gửi...";
        }

        try {
          const res = await fetch("/api/rsvp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, attending, attendee_count }),
          });
          if (res.ok) {
            if (rsvpBtn) {
              rsvpBtn.textContent = attending ? "✓  Đã xác nhận tham dự" : "✓  Đã ghi nhận, cảm ơn bạn!";
              rsvpBtn.style.background = "linear-gradient(135deg, #7caa6e 0%, #4e8040 100%)";
              rsvpBtn.style.boxShadow = "0 2px 12px rgba(78, 128, 64, 0.3)";
            }
            rsvpForm
              .querySelectorAll("input")
              .forEach((el) => (el as HTMLInputElement).setAttribute("disabled", "true"));
          } else {
            if (rsvpBtn) {
              rsvpBtn.disabled = false;
              rsvpBtn.textContent = "Gửi thất bại, thử lại";
            }
          }
        } catch {
          if (rsvpBtn) {
            rsvpBtn.disabled = false;
            rsvpBtn.textContent = "Gửi thất bại, thử lại";
          }
        }
      });
    }

    // ── Blessing ticker + form ─────────────────────────────────────────────────
    const blessingBox = container.querySelector("#blessing-box") as HTMLElement | null;
    const blessingNameInput = container.querySelector(".bar-m-name") as HTMLInputElement | null;
    const blessingTextarea = container.querySelector(".bar-m-mess") as HTMLTextAreaElement | null;
    const blessingBtn = container.querySelector("#blessing-box-popup .cinelove-btn") as HTMLButtonElement | null;

    // Prepend a message to the ticker — no item limit, show all blessings in full
    const pushToTicker = (name: string, message: string, animate = false) => {
      if (!blessingBox) return;
      const div = document.createElement("div");
      div.className = "jsx-3895218497 blessing-message" + (animate ? " blessing-message-new" : "");
      div.innerHTML = `<span class="jsx-3895218497 blessing-text"><strong class="jsx-3895218497">${name}</strong>: ${message}</span>`;
      blessingBox.prepend(div);
    };

    // Fetch ALL blessings, display one-by-one sequentially (no repeat), then fade out slowly
    let tickerIntervalId: ReturnType<typeof setInterval> | null = null;

    fetch("/api/blessings")
      .then((r) => r.json())
      .then((data) => {
        const list = (data.blessings ?? []) as Array<{ name: string; message: string }>;
        if (!list.length) return;
        const queue = [...list].reverse(); // oldest first
        let idx = 0;

        // Show first message immediately
        pushToTicker(queue[idx].name, queue[idx].message, true);
        idx++;

        tickerIntervalId = setInterval(() => {
          if (idx < queue.length) {
            pushToTicker(queue[idx].name, queue[idx].message, true);
            idx++;
          } else {
            // All blessings shown — wait 12s then fade out slowly
            if (tickerIntervalId) clearInterval(tickerIntervalId);
            setTimeout(() => {
              if (blessingBox) {
                blessingBox.style.transition = "opacity 2s ease-out";
                blessingBox.style.opacity = "0";
                setTimeout(() => {
                  if (blessingBox) {
                    blessingBox.innerHTML = "";
                    blessingBox.style.opacity = "1";
                    blessingBox.style.transition = "";
                  }
                }, 2000);
              }
            }, 8000);
          }
        }, 3000);
      })
      .catch(() => {});

    if (blessingBtn) {
      blessingBtn.addEventListener("click", async () => {
        const name = blessingNameInput?.value?.trim() ?? "";
        const message = blessingTextarea?.value?.trim() ?? "";

        if (!message) {
          alert("Vui lòng nhập lời chúc của bạn!");
          return;
        }

        blessingBtn.disabled = true;
        blessingBtn.textContent = "Đang gửi...";

        try {
          const res = await fetch("/api/blessings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, message }),
          });

          if (res.ok) {
            if (blessingNameInput) blessingNameInput.value = "";
            if (blessingTextarea) blessingTextarea.value = "";
            // Inject new blessing immediately into ticker
            pushToTicker(name || "Ẩn danh", message, true);
            // Close popup after short success feedback
            blessingBtn.textContent = "Đã gửi 💕";
            setTimeout(() => {
              closePopup();
              blessingBtn.disabled = false;
              blessingBtn.textContent = "Gửi Lời Chúc";
            }, 1200);
          } else {
            blessingBtn.disabled = false;
            blessingBtn.textContent = "Gửi thất bại, thử lại";
          }
        } catch {
          blessingBtn.disabled = false;
          blessingBtn.textContent = "Gửi thất bại, thử lại";
        }
      });
    }

    // Audio player interaction
    const audioWrapper = container.querySelector("#audio-control-wrapper") as HTMLElement;
    const audioEl = container.querySelector("audio") as HTMLAudioElement;
    const audioToggle = container.querySelector(".audio-toggle") as HTMLElement;

    // mrotate = spinning = playing; no mrotate = static = paused
    let isPlaying = false;

    const setPlayingState = (playing: boolean) => {
      isPlaying = playing;
      if (playing) {
        audioToggle.classList.add("mrotate");
        audioToggle.classList.remove("mrotate-stop");
      } else {
        audioToggle.classList.remove("mrotate");
        audioToggle.classList.add("mrotate-stop");
      }
    };

    if (audioWrapper && audioEl && audioToggle) {
      // Try autoplay on load; browsers may block until user interaction
      audioEl
        .play()
        .then(() => setPlayingState(true))
        .catch(() => {
          // Autoplay blocked — play on first user interaction anywhere on the page
          setPlayingState(false);
          const playOnInteraction = () => {
            audioEl
              .play()
              .then(() => {
                setPlayingState(true);
              })
              .catch(() => {});
            ["click", "touchstart", "keydown", "scroll"].forEach((evt) =>
              document.removeEventListener(evt, playOnInteraction),
            );
          };
          ["click", "touchstart", "keydown", "scroll"].forEach((evt) =>
            document.addEventListener(evt, playOnInteraction, { once: true, passive: true }),
          );
        });

      audioWrapper.addEventListener("click", (e) => {
        e.stopPropagation();
        if (isPlaying) {
          audioEl.pause();
          setPlayingState(false);
        } else {
          audioEl.play().catch(() => {});
          setPlayingState(true);
        }
      });
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
      const weddingDate = new Date("2026-04-21T00:00:00");

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

    // Sparkle parallax: stars drift gently in the same direction as scroll,
    // giving a sense that they share the same space as the page content.
    const sparkleLayer = document.getElementById("sparkle-layer") as HTMLElement | null;
    const handleSparkleParallax = () => {
      if (!scrollContainer || !sparkleLayer) return;
      // Cap drift so sparkles never leave the viewport regardless of page length.
      // At 0.008 multiplier, max drift at ~9000px scroll is ~72px — subtle and safe.
      const maxDrift = window.innerHeight * 0.15;
      const drift = Math.min(scrollContainer.scrollTop * 0.008, maxDrift);
      sparkleLayer.style.transform = `translateY(${drift}px)`;
    };
    if (scrollContainer && sparkleLayer) {
      scrollContainer.addEventListener("scroll", handleSparkleParallax, { passive: true });
    }

    const cleanupAll = () => {
      window.removeEventListener("resize", applyMobileScale);
      observer.disconnect();
      cancelAnimationFrame(scrollAnimId);
      clearInterval(countdownIntervalId);
      if (tickerIntervalId) clearInterval(tickerIntervalId);
      if (scrollContainer) {
        scrollContainer.removeEventListener("wheel", handleUserScroll);
        scrollContainer.removeEventListener("touchstart", handleUserScroll);
        scrollContainer.removeEventListener("touchmove", handleUserScroll);
        scrollContainer.removeEventListener("scroll", handleScrollReveal);
        scrollContainer.removeEventListener("scroll", handleSparkleParallax);
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
      <CustomCursor />
      <SparkleEffects />
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
