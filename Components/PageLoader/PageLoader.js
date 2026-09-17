"use client";

import { motion, useReducedMotion } from "framer-motion";
import ApplicationLogo from "@/config/ApplicationLogo";

export default function PageLoader({ message = "" }) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-white/65 px-4 backdrop-blur-[5px]"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative flex w-full max-w-[380px] flex-col items-center gap-6 px-5 py-4 text-center"
      >
        <motion.div
          animate={
            reduceMotion
              ? undefined
              : { y: [0, -3, 0], opacity: [0.78, 1, 0.78] }
          }
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="relative overflow-hidden"
        >
          <ApplicationLogo
            width={260}
            height={83}
            className="h-auto w-[220px] select-none drop-shadow-[0_6px_12px_rgba(69,101,191,0.15)] sm:w-[240px]"
            style={{ width: 180, height: "auto", objectFit: "contain" }}
          />

          {!reduceMotion && (
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute -top-1/2 h-[200%] w-12 rotate-[22deg] bg-gradient-to-r from-transparent via-white/45 to-transparent blur-[0.5px]"
              initial={{ x: -80, y: -24 }}
              animate={{ x: 300, y: 24 }}
              transition={{
                duration: 1.35,
                repeat: Infinity,
                ease: "easeInOut",
                repeatDelay: 0.45,
              }}
            />
          )}
        </motion.div>

        <div className="flex items-center gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((index) => (
            <motion.span
              key={index}
              className="h-1.5 w-1.5 rounded-full bg-[#4565BF] shadow-[0_0_6px_rgba(69,101,191,0.35)]"
              animate={
                reduceMotion
                  ? undefined
                  : { opacity: [0.25, 1, 0.25], scale: [0.85, 1, 0.85] }
              }
              transition={{
                duration: 1.1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.16,
              }}
            />
          ))}
        </div>

        {message ? (
          <p className="inter-medium-font mt-2 px-3 text-[15px] leading-6 text-slate-700 drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">
            {message}
          </p>
        ) : null}

        <span className="sr-only">Loading, please wait</span>
      </motion.div>
    </div>
  );
}
