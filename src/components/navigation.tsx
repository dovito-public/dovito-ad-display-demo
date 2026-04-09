"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { mockAuth } from "@/lib/mock-auth";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface NavItem {
  id: string;
  label: string;
  href?: string;
  isLink?: boolean;
}

interface NavigationProps {
  customNavItems?: NavItem[];
}

export default function Navigation({ customNavItems }: NavigationProps = {}) {
  const { isAuthenticated, user } = useAuth();
  const [navbarCollapsed, setNavbarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const lastScrollY = useRef(0);

  const defaultNavItems: NavItem[] = [
    { id: "how-it-works", label: "How It Works" },
    { id: "pricing", label: "Pricing" },
    { id: "calculator", label: "Calculator" },
    { id: "display", label: "Live Display", href: "/display", isLink: true },
    { id: "track", label: "Track Status", href: "/track", isLink: true },
    { id: "audit", label: "Audit", href: "/audit", isLink: true },
    ...(isAuthenticated ? [{ id: "dashboard", label: "Dashboard", href: "/dashboard", isLink: true }] : []),
    ...(isAuthenticated && (user?.role === "admin" || user?.role === "super_admin") ? [{ id: "admin", label: "Admin", href: "/admin", isLink: true }] : []),
  ];

  const navItems = customNavItems || defaultNavItems;

  const handleLogout = async () => {
    try {
      mockAuth.signOut();
      toast.success("You have been successfully logged out.");
      window.location.href = "/";
    } catch {
      toast.error("An error occurred while logging out.");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 100;

      if (currentScrollY > scrollThreshold) {
        if (currentScrollY > lastScrollY.current) {
          setNavbarCollapsed(true);
        } else {
          setNavbarCollapsed(false);
        }
      } else {
        setNavbarCollapsed(false);
      }

      lastScrollY.current = currentScrollY;

      const sections = navItems.filter(item => !item.isLink).map(item => item.id);
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const top = element.offsetTop;
          const bottom = top + element.offsetHeight;

          if (scrollPosition >= top && scrollPosition < bottom) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [navItems]);

  const handleNavClick = (item: NavItem) => {
    if (item.isLink) return;
    const element = document.getElementById(item.id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="fixed top-9 left-0 right-0 z-50 pt-4 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto px-6 relative flex justify-between items-center h-14">
        <motion.div
          className="flex items-center z-10 relative"
          initial={false}
          animate={{ x: navbarCollapsed ? -24 : 0 }}
          transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
        >
          <motion.div
            className="absolute -inset-x-4 -inset-y-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full -z-10"
            initial={false}
            animate={{
              opacity: navbarCollapsed ? 1 : 0,
              scale: navbarCollapsed ? 1 : 0.9,
            }}
            transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
          />
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <span className="text-xl font-bold text-white">Ads by Dovito</span>
            </div>
          </Link>
        </motion.div>

        <motion.div
          className="hidden md:flex items-center space-x-6"
          initial={false}
          animate={{
            opacity: navbarCollapsed ? 0 : 1,
            pointerEvents: navbarCollapsed ? "none" : "auto",
          }}
          transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
        >
          {navItems.map((item) => (
            item.isLink ? (
              <Link key={item.id} href={item.href || "/"}>
                <span
                  className={`relative px-3 py-1.5 text-sm font-medium transition-all duration-300 cursor-pointer ${
                    activeSection === item.id
                      ? "text-[#3fb9ff]"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ) : (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`relative px-3 py-1.5 text-sm font-medium transition-all duration-300 ${
                  activeSection === item.id
                    ? "text-[#3fb9ff]"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {item.label}
                {activeSection === item.id && (
                  <div className="absolute inset-0 bg-[#3fb9ff]/10 rounded-lg -z-10" />
                )}
              </button>
            )
          ))}
        </motion.div>

        <motion.div
          className="z-10 flex items-center space-x-3"
          initial={false}
          animate={{ x: navbarCollapsed ? 24 : 0 }}
          transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
        >
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-white/70 hidden sm:inline">
                Welcome, {user?.firstName || user?.email}
              </span>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="border border-white/20 text-white hover:bg-white/10 hover:text-white rounded-full"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link href="/login">
                <Button
                  variant="ghost"
                  data-testid="button-login"
                  className="border border-white/20 text-white hover:bg-white/10 hover:text-white rounded-full"
                >
                  Login
                </Button>
              </Link>
              <Link href="/apply">
                <Button
                  className="bg-[#3fb9ff] hover:bg-[#3fb9ff]/90 text-white px-6 py-2 rounded-full font-medium transition-all duration-300"
                  data-testid="button-get-started"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}
        </motion.div>

        <motion.div
          className="absolute -inset-x-0 -top-1 -bottom-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full shadow-lg shadow-black/20 -z-10"
          initial={false}
          animate={{
            opacity: navbarCollapsed ? 0 : 1,
            scaleX: navbarCollapsed ? 0.95 : 1,
          }}
          transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
        />
      </div>
    </div>
  );
}
