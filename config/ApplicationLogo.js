import React from "react";
import defaultLogo from "@/public/images/logo.png";
import Image from "next/image";

const ApplicationLogo = ({ logoUrl, priority = false, ...props }) => {
  const logoSrc = logoUrl || defaultLogo;

  return (
    <Image
      src={logoSrc}
      alt="Logo"
      priority={priority} // ✅ Now you can control this from parent
      {...props}
    />
  );
};

export default ApplicationLogo;
