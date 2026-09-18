import { motion } from "framer-motion";

const SectionWrapper = ({ children }) => (
  <motion.div
    layout
    transition={{ layout: { duration: 0.3, ease: "easeOut" } }}
    className="relative mb-6 overflow-hidden rounded-2xl border border-[#4565BF]/[0.08] bg-white shadow-[0_8px_32px_rgba(69,101,191,0.10)]"
  >
    {children}
  </motion.div>
);

export default SectionWrapper;
