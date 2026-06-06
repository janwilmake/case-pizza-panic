"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Pizza } from "lucide-react";
import { cn } from "@/lib/utils";
import { UsernameMenu } from "@/components/username-menu";

const NAV = [
  { href: "/", label: "Overview" },
  { href: "/create", label: "New order" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Pizza className="size-5 text-amber-600" />
          Pizza Panic
        </Link>
        <nav className="flex items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto">
          <UsernameMenu />
        </div>
      </div>
    </header>
  );
}
