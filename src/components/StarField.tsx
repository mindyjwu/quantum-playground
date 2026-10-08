"use client";
import { useEffect, useRef } from "react";
import { TONE_RGB, makeStars, starCount, starY, twinkle, type Star } from "@/lib/stars";

type Shooter = { x: number; y: number; vx: number; vy: number; age: number; life: number };

/** Fixed, full-screen canvas of softly shimmering stars. Decorative only. */
export default function StarField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let w = 0, h = 0, dpr = 1;
    let stars: Star[] = [];
    let raf = 0, last = 0, running = false;
    let shooter: Shooter | null = null;
    let nextShot = performance.now() + 9000 + Math.random() * 9000;

    const spaceOn = () => document.documentElement.dataset.theme !== "light";

    function draw(now: number) {
      if (!ctx) return;
      const calm = motion.matches;
      const t = now / 1000;
      const scroll = calm ? 0 : window.scrollY;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      for (const s of stars) {
        const [r, g, b] = TONE_RGB[s.tone];
        const alpha = calm ? s.a * 0.85 : twinkle(s, t);
        const x = s.x * w, y = starY(s, scroll, h);
        if (s.flare) {
          const glow = ctx.createRadialGradient(x, y, 0, x, y, s.r * 6);
          glow.addColorStop(0, `rgba(${r},${g},${b},${alpha * 0.28})`);
          glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
          ctx.fillStyle = glow;
          ctx.fillRect(x - s.r * 6, y - s.r * 6, s.r * 12, s.r * 12);
          ctx.strokeStyle = `rgba(${r},${g},${b},${alpha * 0.35})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(x - s.r * 4.5, y); ctx.lineTo(x + s.r * 4.5, y);
          ctx.moveTo(x, y - s.r * 4.5); ctx.lineTo(x, y + s.r * 4.5);
          ctx.stroke();
        }
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (shooter) {
        const k = shooter.age / shooter.life; // 0..1
        const x = shooter.x + shooter.vx * shooter.age, y = shooter.y + shooter.vy * shooter.age;
        const tail = 90;
        const len = Math.hypot(shooter.vx, shooter.vy);
        const tx = x - (shooter.vx / len) * tail, ty = y - (shooter.vy / len) * tail;
        const grad = ctx.createLinearGradient(tx, ty, x, y);
        const fade = Math.sin(Math.PI * k); // fade in then out
        grad.addColorStop(0, "rgba(190,215,255,0)");
        grad.addColorStop(1, `rgba(235,244,255,${0.85 * fade})`);
        ctx.strokeStyle = grad; ctx.lineWidth = 1.4; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke();
      }
    }

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      if (now - last < 33) return; // ~30fps is plenty for a slow shimmer, and kinder to batteries
      const dt = last ? now - last : 33;
      last = now;
      if (shooter) { shooter.age += dt; if (shooter.age >= shooter.life) shooter = null; }
      else if (now > nextShot) {
        const fromLeft = Math.random() < 0.5;
        shooter = { x: fromLeft ? w * (0.1 + Math.random() * 0.3) : w * (0.6 + Math.random() * 0.3), y: h * (0.05 + Math.random() * 0.35), vx: (fromLeft ? 1 : -1) * 0.55, vy: 0.22, age: 0, life: 1100 };
        nextShot = now + 16000 + Math.random() * 14000; // rare on purpose
      }
      draw(now);
    }

    function sync() {
      const shouldRun = spaceOn() && !document.hidden && !motion.matches;
      if (shouldRun && !running) { running = true; last = 0; raf = requestAnimationFrame(frame); }
      else if (!shouldRun && running) { running = false; cancelAnimationFrame(raf); }
      if (!shouldRun && spaceOn()) draw(performance.now()); // still sky when motion is reduced or tab hidden
    }

    function resize() {
      w = window.innerWidth; h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(w * dpr); canvas!.height = Math.round(h * dpr);
      canvas!.style.width = `${w}px`; canvas!.style.height = `${h}px`;
      stars = makeStars(starCount(w, h));
      draw(performance.now());
    }

    resize();
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf); mo.disconnect();
      motion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="starfield" aria-hidden="true" />;
}
