"use client";

import { useState } from "react";
import Link from "next/link";

import { motion } from "framer-motion";
import {
  Home,
  Mic,
  BarChart3,
  MessageCircle,
  Trophy,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Interview", icon: Mic, href: "/interview" },
  { label: "Analytics", icon: BarChart3, href: "/analytics" },
  { label: "Feedback", icon: MessageCircle, href: "/feedback" },
  { label: "Achievements", icon: Trophy, href: "/achievements" },
  { label: "Profile", icon: User, href: "/profile" },
];

const MOBILE_LABEL_WIDTH = 72;

type BottomNavBarProps = {
  className?: string;
  defaultIndex?: number;
  stickyTop?: boolean;
};

export function BottomNavBar({
  className,
  defaultIndex = 0,
  stickyTop = false,
}: BottomNavBarProps) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  return (
    <motion.nav
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      role="navigation"
      aria-label="Top Navigation"
      className={cn(
        "bg-card dark:bg-card border border-border dark:border-sidebar-border rounded-full flex items-center p-2 shadow-xl space-x-1 min-w-[320px] max-w-[95vw] h-[52px]",
        stickyTop && "fixed inset-x-0 top-4 mx-auto z-20 w-fit",
        className,
      )}
    >
      {navItems.map((item, idx) => {
        const Icon = item.icon;
        const isActive = activeIndex === idx;

        return (
          <motion.div
            key={item.label}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "flex items-center gap-0 px-3 py-2 rounded-full transition-colors duration-200 relative h-10 min-w-[44px] min-h-[40px] max-h-[44px]",
              isActive
                ? "bg-primary/10 dark:bg-primary/15 text-primary dark:text-primary gap-2"
                : "bg-transparent text-muted-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-muted",
              "focus:outline-none focus-visible:ring-0",
            )}
          >
            <Link
              href={item.href}
              onClick={() => setActiveIndex(idx)}
              aria-label={item.label}
              className="flex items-center gap-0 w-full h-full"
            >
            <Icon
              size={22}
              strokeWidth={2}
              aria-hidden
              className="transition-colors duration-200"
            />

              <motion.div
                initial={false}
                animate={{
                  width: isActive ? `${MOBILE_LABEL_WIDTH}px` : "0px",
                  opacity: isActive ? 1 : 0,
                  marginLeft: isActive ? "8px" : "0px",
                }}
                transition={{
                  width: { type: "spring", stiffness: 350, damping: 32 },
                  opacity: { duration: 0.19 },
                  marginLeft: { duration: 0.19 },
                }}
                className={cn("overflow-hidden flex items-center max-w-[72px]")}
              >
                <span
                  className={cn(
                    "font-medium text-xs whitespace-nowrap select-none transition-opacity duration-200 overflow-hidden text-ellipsis text-[clamp(0.625rem,0.5263rem+0.5263vw,1rem)] leading-[1.9]",
                    isActive ? "text-primary dark:text-primary" : "opacity-0",
                  )}
                  title={item.label}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          </motion.div>
        );
      })}
    </motion.nav>
  );
}

export default BottomNavBar;
