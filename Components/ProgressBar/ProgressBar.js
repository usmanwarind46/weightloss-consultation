import { motion } from "framer-motion";

const ProgressBar = ({ percentage = 0 }) => {
  return (
    <div className="w-full">
      {/* Outer container */}
      <div className="h-2 bg-gray-200 overflow-hidden shadow-inner">
        <motion.div
          className="h-2 bg-gradient-to-r from-[rgb(82,224,153)] to-[#34855c] "
          initial={{ width: 0 }}
          animate={{ 
            width: `${percentage}%`,
            scaleY: [1, 1.1, 1] // subtle pulse
          }}
          transition={{ 
            duration: 0.6, 
            ease: [0.4, 0, 0.2, 1] 
          }}
        />
      </div>

      {/* Optional text below */}
      {/* <p className="text-sm text-green-600 font-semibold text-center mt-2">
        {percentage}% Completed
      </p> */}
    </div>
  );
};

export default ProgressBar;
