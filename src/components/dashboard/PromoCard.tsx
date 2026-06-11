import type { MouseEvent } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";

const PARTICLES = [
  { l: "14%", t: "24%", s: 6, d: 0 },
  { l: "34%", t: "72%", s: 4, d: 0.6 },
  { l: "72%", t: "28%", s: 5, d: 1.1 },
  { l: "86%", t: "60%", s: 4, d: 0.3 },
  { l: "58%", t: "16%", s: 3, d: 0.9 },
];

/** Elegant invoice sheet illustration with champagne-gold accents. */
function InvoiceIllustration() {
  return (
    <svg width="150" height="180" viewBox="0 0 150 180" fill="none" className="drop-shadow-xl">
      <rect x="14" y="10" width="118" height="160" rx="10" fill="#FAF9F6" />
      <rect
        x="14.5"
        y="10.5"
        width="117"
        height="159"
        rx="9.5"
        stroke="#C6A769"
        strokeOpacity="0.5"
      />
      <rect x="28" y="28" width="46" height="8" rx="4" fill="#0B132B" />
      <rect x="28" y="44" width="30" height="5" rx="2.5" fill="#C6A769" />
      <rect x="28" y="74" width="94" height="4" rx="2" fill="#E5E7EB" />
      <rect x="28" y="86" width="94" height="4" rx="2" fill="#E5E7EB" />
      <rect x="28" y="98" width="70" height="4" rx="2" fill="#E5E7EB" />
      <rect x="28" y="124" width="94" height="22" rx="6" fill="#0B132B" />
      <rect x="36" y="132" width="34" height="6" rx="3" fill="#C6A769" />
      <circle cx="110" cy="135" r="5" fill="#C6A769" />
    </svg>
  );
}

export function PromoCard() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 20 });
  const sy = useSpring(my, { stiffness: 120, damping: 20 });
  const illoX = useTransform(sx, [-0.5, 0.5], [12, -12]);
  const illoY = useTransform(sy, [-0.5, 0.5], [10, -10]);
  const linesX = useTransform(sx, [-0.5, 0.5], [-8, 8]);

  function onMove(e: MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <motion.div
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl bg-navy p-8 text-white shadow-[0_24px_60px_-24px_rgba(11,19,43,0.6)] sm:p-10"
    >
      {/* Gold decorative lines (parallax) */}
      <motion.div style={{ x: linesX }} className="pointer-events-none absolute inset-0">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border border-gold/15" />
        <div className="absolute -right-6 -top-10 h-64 w-64 rounded-full border border-gold/10" />
        <div className="absolute bottom-0 left-0 h-px w-2/3 bg-gradient-to-r from-gold/40 to-transparent" />
      </motion.div>

      {/* Floating particles */}
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute rounded-full bg-gold/50"
          style={{ left: p.l, top: p.t, width: p.s, height: p.s }}
          animate={{ y: [0, -10, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 4 + p.d, repeat: Infinity, ease: "easeInOut", delay: p.d }}
        />
      ))}

      {/* Illustration (parallax) */}
      <motion.div
        style={{ x: illoX, y: illoY }}
        className="pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 lg:block"
      >
        <InvoiceIllustration />
      </motion.div>

      <div className="relative max-w-md">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-gold">
          Invoicing
        </p>
        <h3 className="mt-3 font-serif text-3xl font-medium leading-tight">
          Create invoices faster
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-white/65">
          Convert completed work orders into professional invoices in just a few clicks.
        </p>
        <Link
          to="/invoice"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold/70 px-6 py-3 text-sm font-medium text-gold transition-all duration-200 hover:-translate-y-0.5 hover:border-gold hover:bg-gold/10"
        >
          Create Invoice Now
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  );
}
