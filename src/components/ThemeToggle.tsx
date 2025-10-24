import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === "dark";

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative overflow-hidden group border-2 h-14 px-6 font-semibold transition-all duration-500 hover:scale-105 hover:shadow-lg"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative flex items-center gap-3">
        <div className="relative w-6 h-6">
          <Sun 
            className={`absolute inset-0 h-6 w-6 transition-all duration-500 ${
              isDark 
                ? 'rotate-90 scale-0 opacity-0' 
                : 'rotate-0 scale-100 opacity-100'
            }`}
          />
          <Moon 
            className={`absolute inset-0 h-6 w-6 transition-all duration-500 ${
              isDark 
                ? 'rotate-0 scale-100 opacity-100' 
                : '-rotate-90 scale-0 opacity-0'
            }`}
          />
        </div>
        <span className="text-base">
          {isDark ? '☀️ Bright Mode' : '🌙 Dark Mode'}
        </span>
      </div>
    </Button>
  );
}
