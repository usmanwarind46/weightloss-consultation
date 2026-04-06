import React from "react";
import defaultLogo from "@/public/images/user.png";
import Image from "next/image";

const ApplicationUser = ({ logoUrl, priority = false, ...props }) => {
  const logoSrc = logoUrl || defaultLogo;

  return (
    <Image
      src={logoSrc}
      alt="User"
      priority={priority} // ✅ Only preload if needed
      {...props}
    />
  );
};

export default ApplicationUser;
