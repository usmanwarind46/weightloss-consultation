import React, { useState } from "react";
import Sidebar from "@/Components/Dashboard/Sidebar/Sidebar";
import StepsHeader from "@/layout/stepsHeader";

const Dashboard = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="flex flex-col h-screen bg-[#f3f4f6]">
      {/* Header */}
      <StepsHeader isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (fixed width) */}
        <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-4">
          <div className="rounded-md">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
