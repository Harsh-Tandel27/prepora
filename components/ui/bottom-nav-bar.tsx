"use client";

import { useState } from "react";
import Link from "next/link";

import { motion } from "framer-motion";
import {
  Home,
  Mic,
  BarChart3,
  Trophy,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Interview", icon: Mic, href: "/interview" },
  { label: "Analytics", icon: BarChart3, href: "/analytics" },
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
        "bg-card dark:bg-card border border-border dark:border-sidebar-border rounded-full flex items-center p-2 shadow-xl space-x-1 min-w-[500px] max-w-[95vw] h-[52px]",
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
              "flex items-center gap-2 px-4 py-2 rounded-full transition-colors duration-200 relative h-10 min-w-[80px] min-h-[40px] max-h-[44px]",
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
              className="flex items-center gap-2 w-full h-full"
            >
              <Icon
                size={20}
                strokeWidth={2}
                aria-hidden
                className="transition-colors duration-200"
              />
              <span
                className={cn(
                  "font-medium text-sm whitespace-nowrap select-none transition-colors duration-200",
                  isActive ? "text-primary dark:text-primary" : "text-muted-foreground dark:text-muted-foreground"
                )}
                title={item.label}
              >
                {item.label}
              </span>
            </Link>
          </motion.div>
        );
      })}
    </motion.nav>
  );
}

export default BottomNavBar;
