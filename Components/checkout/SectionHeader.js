import { motion, AnimatePresence } from "framer-motion";
import { FiCheck, FiChevronDown } from "react-icons/fi";
import { useState, useEffect } from "react";

const SectionHeader = ({
  stepNumber,
  title,
  description,
  isCompleted,
  id,
  children,
  className
}) => {
  const [isOpen, setIsOpen] = useState(true); // open by default

  useEffect(() => {
    if (isCompleted) {
      setIsOpen(false); // complete hone pe default closed
    }
  }, [isCompleted]);

  const toggleAccordion = () => {
    // toggle always chale, regardless of isCompleted
    setIsOpen((prev) => !prev);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div
        className={`flex items-center space-x-3 cursor-pointer bg-[#f2f4fb] px-6 py-4 ${className}`}
        onClick={toggleAccordion}
      >
        <div
          className={`flex items-center justify-center w-7 h-7 rounded-full text-[13px] transition-all duration-300 ${isCompleted
            ? "bg-[#4565BF] text-white"
            : "border-2 border-[#4565BF] text-[#4565BF] inter-semibold-font"
            }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isCompleted ? (
              <motion.div
                key="check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.3 }}
              >
                <FiCheck className="w-5 h-5" />
              </motion.div>
            ) : (
              <motion.div
                key="number"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.3 }}
              >
                {stepNumber}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <h2 className="inter-semibold-font text-[15px] text-slate-900">{title}</h2>

        <motion.div
          className="ml-auto"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FiChevronDown className="w-4 h-4 text-slate-400" />
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key={id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 py-5">
            {description && (
              <p className="inter-reg-font text-[13px] text-slate-500 mb-4">
                {description}
              </p>
            )}
            {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SectionHeader;
