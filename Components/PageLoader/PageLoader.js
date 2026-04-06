"use client";

import { motion } from "framer-motion";

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <ul className="flex gap-2 flex-wrap w-[120px] justify-center items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: 1,
            ease: "linear",
          }}
          className="w-12 h-12 border-4 border-t-transparent border-[#4565BF] rounded-full text-primary"
        />
      </ul>
    </div>
  );
}
