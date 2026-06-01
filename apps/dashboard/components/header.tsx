import Logo from "@repo/ui/components/ui/logo";
import { ThemeToggle } from "./theme-toggle";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between py-4 px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
      <Logo />
      <ThemeToggle />
    </header>
  );
};
