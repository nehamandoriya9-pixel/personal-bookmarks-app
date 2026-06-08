"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function AuthShell({
  title,
  subtitle,
  children,
  alternate,
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-250px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-white/[0.03] blur-[160px]" />
        <div className="absolute bottom-[-200px] left-1/2 h-[450px] w-[450px] -translate-x-1/2 rounded-full bg-white/[0.02] blur-[160px]" />
        <div className="absolute left-[10%] top-[20%] h-[250px] w-[250px] rotate-12 rounded-full bg-white/[0.015] blur-[90px]" />
        <div className="absolute right-[10%] top-[40%] h-[220px] w-[220px] rounded-full bg-white/[0.015] blur-[90px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Header */}
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white/40 backdrop-blur-xl transition hover:text-white/70"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
            Personal Bookmarks
          </Link>

          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-2 text-xs leading-relaxed text-white/35">
              {subtitle}
            </p>
          )}
        </div>

        {/* Card */}
        <div className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-3xl">
          
          {/* Moving Border Light */}
          <motion.div
            animate={{ x: ["-120%", "220%"] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
            className="pointer-events-none absolute inset-y-0 w-28 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-xl"
          />

          {/* Glass overlays */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.10] via-transparent to-transparent" />

          <div className="pointer-events-none absolute -left-10 top-0 h-full w-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

          {/* Content */}
          <div className="relative z-10">
            {children}
          </div>
        </div>

        {/* Footer */}
        {alternate && (
          <p className="mt-5 text-center text-xs text-white/70">
            {alternate}
          </p>
        )}
      </motion.div>
    </main>
  );
}