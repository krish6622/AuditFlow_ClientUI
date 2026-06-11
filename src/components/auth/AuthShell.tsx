import type { ComponentType, ReactNode } from "react";
import {
  BarChart3,
  ClipboardList,
  FileText,
  Shield,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";

import { Brand } from "@/components/Brand";
import heroImage from "@/assets/login/elangovan-login-hero.jpg";

type Icon = ComponentType<{ className?: string }>;

const FEATURES: { icon: Icon; title: string; copy: string }[] = [
  { icon: ClipboardList, title: "Work Orders", copy: "Create, assign and track audit work seamlessly." },
  { icon: Users, title: "Team Collaboration", copy: "Keep your team aligned and productive." },
  { icon: FileText, title: "Professional Invoices", copy: "Generate accurate invoices with ease." },
];

const VALUES: { icon: Icon; title: string; copy: string }[] = [
  { icon: ShieldCheck, title: "Secure", copy: "Bank-grade security to protect your data." },
  { icon: BarChart3, title: "Accurate", copy: "Reliable reports for better decisions." },
  { icon: Users, title: "Collaborative", copy: "Work together and achieve more." },
  { icon: Zap, title: "Efficient", copy: "Save time and increase productivity." },
];

/** Left brand panel — hero image, overlay, vignette, corner blur, brand content. */
export function AuthBrandPanel() {
  return (
    <section
      className="relative h-72 w-full overflow-hidden bg-cover bg-center lg:h-auto lg:w-3/5"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      {/* 45% Midnight Navy overlay */}
      <div className="pointer-events-none absolute inset-0 bg-navy/45" />
      {/* Soft vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 75% at 50% 45%, transparent 45%, rgba(11,19,43,0.6) 100%)",
        }}
      />
      {/* Blur only on the extreme corners — center stays sharp */}
      <div
        className="pointer-events-none absolute inset-0 backdrop-blur-md"
        style={{
          WebkitMaskImage: "radial-gradient(115% 115% at 50% 50%, transparent 58%, black 100%)",
          maskImage: "radial-gradient(115% 115% at 50% 50%, transparent 58%, black 100%)",
        }}
      />

      <div className="relative z-10 flex h-full flex-col justify-between p-8 sm:p-12 lg:p-14">
        <header className="animate-fade-in-up">
          <Brand variant="onDark" size="lg" />
        </header>

        <div className="hidden max-w-md animate-fade-in-up lg:block" style={{ animationDelay: "120ms" }}>
          <p className="font-serif text-3xl font-light leading-snug text-white/95">
            Streamlining audit workflows, work orders and invoicing for modern professionals.
          </p>

          <ul className="mt-10 space-y-7">
            {FEATURES.map(({ icon: Icon, title, copy }, i) => (
              <li
                key={title}
                className="flex items-start gap-4 animate-fade-in-up"
                style={{ animationDelay: `${220 + i * 90}ms` }}
              >
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/40">
                  <Icon className="h-[18px] w-[18px] text-gold" />
                </span>
                <div>
                  <p className="text-sm font-semibold tracking-wide text-white">{title}</p>
                  <p className="mt-0.5 text-sm text-white/65">{copy}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <footer className="hidden animate-fade-in-up lg:block" style={{ animationDelay: "520ms" }}>
          <div className="flex items-center gap-2 text-gold">
            <Shield className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-[0.28em]">
              Secure. Reliable. Confidential.
            </span>
          </div>
          <p className="mt-3 text-xs text-white/45">
            © 2026 Elangovan Associates. All rights reserved.
          </p>
        </footer>
      </div>
    </section>
  );
}

/** Bottom four-column value bar. */
export function AuthValueBar() {
  return (
    <section className="border-t border-softgray bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {VALUES.map(({ icon: Icon, title, copy }) => (
          <div key={title} className="flex flex-col items-start gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-gold/5">
              <Icon className="h-5 w-5 text-gold" />
            </span>
            <h3 className="font-serif text-lg font-medium text-navy">{title}</h3>
            <p className="text-sm leading-relaxed text-charcoal/60">{copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Shared page chrome for the auth screens (login / register): the brand panel
 * on the left, an ivory authentication panel on the right that centers its
 * children, and the value bar beneath. Guarantees both pages share one identity.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-ivory font-sans text-charcoal">
      <div className="flex flex-1 flex-col lg:h-screen lg:flex-row">
        <AuthBrandPanel />

        <section className="relative flex w-full flex-1 items-center justify-center bg-ivory px-6 py-16 lg:w-2/5 lg:px-10">
          <div className="absolute right-6 top-6 flex items-center gap-1.5 text-charcoal/50 lg:right-10 lg:top-8">
            <ShieldCheck className="h-4 w-4 text-gold" />
            <span className="text-xs font-medium tracking-wide">Secure &amp; Trusted</span>
          </div>

          {children}
        </section>
      </div>

      <AuthValueBar />
    </div>
  );
}
