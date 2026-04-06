import React, { useState } from "react";
import { motion } from "framer-motion";
import OrderTabs from "./OrdersTabs"; // Ensure correct path

const OrdersTabs = ({ activeTab, onTabChange, tabs }) => {
  // Handle tab change
  const handleTabChange = (index) => {
    onTabChange(index); // Update the active tab
  };

  return (
    <div>
      {/* Tabs displayed directly on mobile (horizontal layout) */}
      <div className="sm:hidden flex justify-start p-4 space-x-4 overflow-x-auto">
        <div className="flex space-x-4">
          {tabs.map((tab, index) => (
            <motion.div
              key={index}
              onClick={() => handleTabChange(index)}
              className={`text-xs niba-reg-font py-1 text-nowrap px-2 cursor-pointer ${activeTab === index
                  ? " text-black border-b-4 border-[#4565BF]"
                  : "text-gray-700 hover:border-b-4 border-[#4565BF]"
                }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {tab}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Normal Content Area (Tabs visible on larger screens) */}
      <div className="sm:block hidden">
        <div className="flex space-x-8 justify-start p-4">
          {tabs.map((tab, index) => (
            <motion.div
              key={index}
              onClick={() => handleTabChange(index)}
              className={`text-lg niba-bold-font py-1 px-6 cursor-pointer ${activeTab === index
                  ? " text-primary border-b-4 border-[#4565BF]"
                  : "text-gray-700 hover:border-b-4 border-[#4565BF]"
                }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {tab}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersTabs;
