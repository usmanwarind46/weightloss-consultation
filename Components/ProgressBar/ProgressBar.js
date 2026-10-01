import { motion } from "framer-motion";

const ProgressBar = ({ percentage = 0 }) => {
  const pct = Math.min(100, Math.max(0, Number(percentage) || 0));

  return (
    <div className="sticky top-[66px] z-30 w-full bg-white/95 backdrop-blur-sm border-b border-slate-100">
      <div className="relative h-[3px] w-full bg-slate-100">
        <motion.div
          className="h-full bg-gradient-to-r from-[#4565BF] to-[#7b9be6]"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1],
          }}
        />
        <motion.span
          className="inter-medium-font absolute top-[3px] z-10 -translate-x-full whitespace-nowrap rounded-b-md bg-[#4565BF] px-2 py-0.5 text-[12px] leading-4 text-white max-sm:text-[12px]"
          initial={{ left: "58px" }}
          animate={{ left: `max(${pct}%, 58px)` }}
          transition={{
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          {Math.round(pct)}%
        </motion.span>
      </div>
    </div>
  );
};

export default ProgressBar;
