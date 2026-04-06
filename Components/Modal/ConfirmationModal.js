import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const ConfirmationModal = ({ showModal, onConfirm, onCancel, removeItem }) => {
  if (!showModal) return null; // Don't render if modal isn't visible

  return (
    <AnimatePresence>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-40 backdrop-blur-sm z-50">
          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-6 rounded-xl shadow-lg w-96"
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200">
                <span className="text-gray-500 text-2xl">!</span>
              </div>
            </div>

            {/* Text */}
            <p className="text-center text-gray-800 font-med mb-6">Are you sure you want to remove?</p>

            {/* Buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={onCancel}
                className="font-med px-6 py-2 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-100 transition-all duration-200 capitalize cursor-pointer"
              >
                no
              </button>
              <button
                onClick={onConfirm}
                className="font-med px-6 py-2 rounded-lg bg-primary text-white hover:[#4565BF] transition-all duration-200 capitalize cursor-pointer"
              >
                yes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
