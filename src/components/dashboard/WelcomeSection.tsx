import { motion } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";

export function WelcomeSection({ name }: { name: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-navy dark:text-ivory sm:text-4xl">
          Welcome back, {name}.
        </h1>
        <p className="mt-2 text-charcoal/60 dark:text-white/55">
          Here's what's happening in your organization today.
        </p>
      </div>
      <button
        type="button"
        className="inline-flex h-11 shrink-0 items-center gap-2 self-start rounded-full border border-softgray bg-white px-5 text-sm font-medium text-charcoal transition-all duration-200 hover:-translate-y-0.5 hover:border-gold hover:text-navy dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:text-white sm:self-auto"
      >
        <SlidersHorizontal className="h-4 w-4 text-gold" />
        Customize Dashboard
      </button>
    </motion.div>
  );
}
