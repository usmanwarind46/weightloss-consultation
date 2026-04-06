import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";

const variants = {
  initial: {
    x: 100,
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeInOut" },
  },
  exit: {
    x: -100,
    opacity: 0,
    transition: { duration: 0.4, ease: "easeInOut" },
  },
};

export default function PageAnimationWrapper({ children }) {
  const router = useRouter();
  const [currentRoute, setCurrentRoute] = useState(router.asPath);
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(true);

  useEffect(() => {
    setCurrentRoute(router.asPath);
  }, [router.asPath]);

  useEffect(() => {
    const handleResize = () => {
      setIsAnimationEnabled(window.innerWidth >= 500);
    };

    // Initial check
    handleResize();

    // Optional: Watch for resize
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isAnimationEnabled) {
    return <div className="w-full relative">{children}</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div key={currentRoute} initial="initial" animate="animate" exit="exit" variants={variants} className="w-full">
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
