import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiX } from "react-icons/fi";
import {
  HiLocationMarker,
  HiOutlineLockClosed,
  HiShoppingBag,
  HiUser,
} from "react-icons/hi";
import { GiMedicines } from "react-icons/gi";
import ApplicationLogo from "@/config/ApplicationLogo";
import styles from "@/styles/sidebar.module.css"; // ✅ Import as module
import { FaWeight } from "react-icons/fa";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const router = useRouter();
  const currentPath = router.pathname;

  const navItems = [
    {
      href: "/dashboard",
      label: "My Account",
      icon: <GiMedicines />,
      key: "tab-home",
      match: ["/dashboard"],
    },
    {
      href: "/orders",
      label: currentPath.startsWith("/order-detail")
        ? "Order Details"
        : "My Orders",
      icon: <HiShoppingBag />,
      key: "tab-orders",
      match: ["/orders", "/order-detail"],
    },
    {
      href: "/address",
      label: "My Address Book",
      icon: <HiLocationMarker />,
      key: "tab-address",
      match: ["/address"],
    },
    {
      href: "/change-password",
      label: "Change Password",
      icon: <HiOutlineLockClosed />,
      key: "tab-password",
      match: ["/change-password"],
    },
    {
      href: "/weight-loss-journey",
      label: "Weight Loss Journey",
      icon: <FaWeight />,
      key: "tab-weight",
      match: ["/weight-loss-journey"],
    },
  ];

  return (
    <div
      className={`sm:m-4 sm:rounded-lg fixed top-0 left-0 lg:relative h-full bg-[#F9FAFB] py-4 px-3 flex flex-col shadow-md transform transition-transform duration-300 ease-in-out z-50 sm:relative sm:translate-x-0 sm:w-64 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex justify-between p-1 mb-3 md:hidden">
        <ApplicationLogo className="w-32 sm:w-40" />
        <div
          className="align-middle ms-2 pt-2 text-2xl text-primary"
          onClick={toggleSidebar}
        >
          <FiX size={30} />
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = item.match.some((path) =>
            currentPath.startsWith(path),
          );
          console.log(currentPath, "→", item.label, "isActive:", isActive);

          return (
            <Link href={item.href} legacyBehavior key={item.key}>
              <a
                onClick={toggleSidebar}
                className={`flex items-center p-2 rounded-md ${item.key} ${
                  isActive
                    ? `bg-primary text-white ${styles["active-tab"]}`
                    : "hover:bg-gray-200 darkGrayColor"
                } medium-font niba-reg-font`}
              >
                {React.cloneElement(item.icon, {
                  className: `text-2xl mr-3 ${isActive ? "text-white" : "text-[#6b7280]"}`,
                })}
                <span
                  className={styles[`tab-text-${item.key.split("tab-")[1]}`]}
                >
                  {item.label}
                </span>
              </a>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
