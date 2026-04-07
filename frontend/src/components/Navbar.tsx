"use client";

import { useEffect, useState } from "react";

import dynamic from "next/dynamic";
import { Moon, Sun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActiveRole } from "../hooks/useActiveRole";

const WalletConnection = dynamic(() => import("./providers/WalletConnection"), {
  ssr: false,
});

type NavItem =
  | {
      label: string;
      href: string;
      targetId?: undefined;
    }
  | {
      label: string;
      href: string;
      targetId: string;
    };

const NAV_ITEMS: NavItem[] = [
  { label: "Features", href: "/#features", targetId: "features" },
  { label: "Workflow", href: "/#workflow", targetId: "workflow" },
  { label: "Jobs", href: "/jobs" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { activeRole, setActiveRole } = useActiveRole();

  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") {
      return "dark";
    }

    const savedTheme = window.localStorage.getItem("theme");
    return savedTheme === "light" ? "light" : "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  const handleSmoothScroll = (
    event: React.MouseEvent<HTMLAnchorElement>,
    targetId: string,
  ) => {
    event.preventDefault();
    const element = document.getElementById(targetId);

    if (element && pathname === "/") {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <nav className="surface-nav sticky top-0 z-50 backdrop-blur-md">
      <div className="app-container py-3">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="https://img.freepik.com/premium-vector/je-logo-is-little-explanation-concept-logo-unique-je-letter-with-clean-clear-thick-elegant-lines_1156881-286.jpg?semt=ais_incoming&w=740&q=80"
              alt="Job Escrow Logo"
              className="rounded-full border"
              width={40}
              height={40}
            />
            <div className="leading-tight">
              <p className="font-bold text-cyan-400">Job Escrow</p>
              <p className="text-muted text-xs">Freelance Protocol</p>
            </div>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            {NAV_ITEMS.map((item) =>
              item.targetId && pathname === "/" ? (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(event) => handleSmoothScroll(event, item.targetId)}
                  className="nav-link"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="nav-link"
                >
                  {item.label}
                </Link>
              ),
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1 md:flex">
              <button
                type="button"
                onClick={() => setActiveRole("Client")}
                className={activeRole === "Client" ? "chip chip-active" : "chip"}
              >
                Client
              </button>
              <button
                type="button"
                onClick={() => setActiveRole("Freelancer")}
                className={
                  activeRole === "Freelancer" ? "chip chip-active" : "chip"
                }
              >
                Freelancer
              </button>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="btn btn-secondary px-3 py-2 text-sm"
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              title={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Moon className="h-4 w-4" aria-hidden="true" />
              )}
              <span className="sr-only">
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </span>
            </button>
            <WalletConnection />
          </div>
        </div>
      </div>
    </nav>
  );
}
