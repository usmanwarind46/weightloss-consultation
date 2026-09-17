import { motion } from "framer-motion";

const ProgressBar = ({ percentage = 0 }) => {
  const pct = Math.min(100, Math.max(0, Number(percentage) || 0));

  return (
    <div className="w-full bg-white/95 backdrop-blur-sm border-b border-slate-100">
      <div className="h-[3px] w-full overflow-hidden bg-slate-100">
        <motion.div
          className="h-full bg-gradient-to-r from-[#4565BF] to-[#7b9be6]"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1],
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
