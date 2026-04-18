"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: string; // Material Symbols name
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: "castle" },
  { href: "/quests", label: "Quests", icon: "swords" },
  { href: "/skill-tree", label: "Skill Tree", icon: "account_tree" },
  { href: "/terminal", label: "Terminal", icon: "terminal" },
  { href: "/guild", label: "Guild", icon: "group" },
];

const BOTTOM_ITEMS: NavItem[] = [
  { href: "/settings", label: "Settings", icon: "settings" },
  { href: "/logout", label: "Logout", icon: "logout" },
];

interface SideNavProps {
  username: string;
  level: number;
  title: string;
  avatarUrl?: string;
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-full
        transition-all duration-300
        ${
          active
            ? "bg-surface-container text-primary shadow-inner"
            : "text-on-surface/70 hover:bg-surface-container/50 hover:text-primary hover:translate-x-1"
        }
      `}
    >
      <span
        className="material-symbols-outlined text-[20px]"
        style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        {item.icon}
      </span>
      <span className="text-sm font-medium">{item.label}</span>
    </Link>
  );
}

export function SideNav({ username, level, title, avatarUrl }: SideNavProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Material Symbols font */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
      />

      <nav
        className="
          hidden md:flex flex-col
          h-screen w-64 sticky left-0 top-0
          bg-surface-container-low text-primary
          rounded-r-lg
          p-4 gap-2
          shadow-ambient
          z-50
        "
      >
        {/* User profile */}
        <div className="flex items-center gap-3 px-4 py-4 mb-6">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={username}
              className="w-10 h-10 rounded-full object-cover border-2 border-primary"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {username.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="text-primary font-bold text-sm">{username}</div>
            <div className="text-on-surface-variant text-xs">
              Level {level} {title}
            </div>
          </div>
        </div>

        {/* New expedition CTA */}
        <Link
          href="/quests"
          className="gradient-cta text-[#271300] w-full py-3 rounded-full font-bold mb-6 hover:opacity-90 active:opacity-80 transition-opacity flex items-center justify-center gap-2 text-sm"
        >
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            add
          </span>
          New Expedition
        </Link>

        {/* Main nav */}
        <div className="flex-1 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href)
              }
            />
          ))}
        </div>

        {/* Bottom nav */}
        <div className="flex flex-col gap-1 mt-auto border-t border-outline-variant/20 pt-4">
          {BOTTOM_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={pathname.startsWith(item.href)}
            />
          ))}
        </div>
      </nav>
    </>
  );
}
