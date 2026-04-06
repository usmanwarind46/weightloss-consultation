import { motion } from "framer-motion";

const SectionWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 60 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{
      type: "spring",
      stiffness: 50, // ⭐ Softer spring (less tight)
      damping: 15, // ⭐ More bounce, slower stop
      duration: 1.2, // ⭐ Slow graceful feel
    }}
    className="bg-white rounded-xl shadow-sm p-6 mb-8 relative"
  >
    {children}
  </motion.div>
);

export default SectionWrapper;
