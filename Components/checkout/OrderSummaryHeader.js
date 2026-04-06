import { motion, AnimatePresence } from "framer-motion";
import { FiCheck } from "react-icons/fi";

const OrderSummaryHeader = ({ stepNumber, title, description, isCompleted }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white"
    >
      <div className="flex items-center space-x-4">
        {/* Step Circle or Check */}
        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-all duration-300 ${isCompleted ? "bg-primary text-white" : "border border-black text-black"
          }`}>
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

        {/* Title */}
        <h2 className="text-black bold-font text-base">
          {title}
        </h2>
      </div>

      {/* Divider */}
      <hr className="border-gray-200 relative top-1 my-3" />

      {/* Description */}
      {description && (
        <p className="text-sm text-black mt-1 reg-font paragraph">
          {description}
        </p>
      )}
    </motion.div>
  );
};

export default OrderSummaryHeader;
