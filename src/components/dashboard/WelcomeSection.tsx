import { motion } from "framer-motion";

export function WelcomeSection({ name }: { name: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <h1 className="font-serif text-3xl font-medium tracking-tight text-navy dark:text-ivory sm:text-4xl">
        Welcome back, {name}.
      </h1>
      <p className="mt-2 text-charcoal/60 dark:text-white/55">
        Here's what's happening in your organization today.
      </p>
    </motion.div>
  );
}
