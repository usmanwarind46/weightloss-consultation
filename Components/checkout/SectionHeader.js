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
        className={`flex items-center space-x-4 cursor-pointer ${className}`}
        onClick={toggleAccordion}
      >
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-all duration-300 ${isCompleted
            ? "bg-primary text-white"
            : "border border-black text-black"
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

        <h2 className="text-black bold-font text-base">{title}</h2>

        <motion.div
          className="ml-auto"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FiChevronDown className="w-5 h-5 text-gray-600" />
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
            <hr className="border-gray-200 my-2" />
            {description && (
              <p className="text-sm text-black mt-1 reg-font paragraph">
                {description}
              </p>
            )}
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SectionHeader;
