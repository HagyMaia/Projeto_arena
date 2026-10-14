"use client";

import { useEffect, useState, useRef } from "react";
import { Sun, Moon, Laptop, ChevronDown } from "lucide-react";

type ThemeMode = "light" | "dark" | "system";

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("system");
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const saved = (localStorage.getItem("arenago_theme") as ThemeMode) || "system";
    setTheme(saved);
    applyTheme(saved);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const current = (localStorage.getItem("arenago_theme") as ThemeMode) || "system";
      if (current === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const applyTheme = (mode: ThemeMode) => {
    const root = document.documentElement;
    if (mode === "dark") {
      root.classList.add("dark");
    } else if (mode === "light") {
      root.classList.remove("dark");
    } else {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (systemDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  };

  const handleSelectTheme = (mode: ThemeMode) => {
    setTheme(mode);
    localStorage.setItem("arenago_theme", mode);
    applyTheme(mode);
    setIsOpen(false);
  };

  if (!mounted) {
    return (
      <div className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" />
    );
  }

  const currentIcon = () => {
    if (theme === "dark") return <Moon className="h-4 w-4 text-emerald-400" />;
    if (theme === "light") return <Sun className="h-4 w-4 text-emerald-600" />;
    return <Laptop className="h-4 w-4 text-slate-500 dark:text-slate-400" />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#0F172A] px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-xs"
        aria-label="Alternar tema"
        title="Alternar tema visual"
      >
        {currentIcon()}
        <span className="hidden sm:inline capitalize text-[11px]">
          {theme === "system" ? "Sistema" : theme === "dark" ? "Escuro" : "Claro"}
        </span>
        <ChevronDown className="h-3 w-3 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-36 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-1 shadow-lg z-50 text-xs animate-in fade-in zoom-in-95">
          <button
            onClick={() => handleSelectTheme("light")}
            className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition ${
              theme === "light"
                ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Sun className="h-4 w-4 text-emerald-600" />
            <span>Claro</span>
          </button>

          <button
            onClick={() => handleSelectTheme("dark")}
            className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition ${
              theme === "dark"
                ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Moon className="h-4 w-4 text-emerald-400" />
            <span>Escuro</span>
          </button>

          <button
            onClick={() => handleSelectTheme("system")}
            className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition ${
              theme === "system"
                ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Laptop className="h-4 w-4 text-slate-500" />
            <span>Sistema</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default ThemeToggle;

