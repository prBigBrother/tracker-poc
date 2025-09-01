"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";

type Props = {
  user: { name?: string | null; email?: string | null; image?: string | null };
};

export default function UserMenu({ user }: Props) {
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const initial = (user?.name || user?.email || "?")?.slice(0, 1).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-100 focus:outline-none border border-gray-200 cursor-pointer"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {user?.image && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt={user.name || user.email || "User avatar"}
            className="h-8 w-8 rounded-full object-cover"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-700 border border-gray-200">
            {initial}
          </div>
        )}
        <div className="hidden sm:block text-left leading-tight">
          <div className="text-sm font-medium text-gray-900 truncate max-w-[12rem]">{user?.name || "User"}</div>
          {user?.email && <div className="text-xs text-gray-500 truncate max-w-[12rem]">{user.email}</div>}
        </div>
        <svg className="h-4 w-4 text-gray-500 ml-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 rounded-md border border-gray-200 bg-white shadow-lg overflow-hidden z-50"
        >
          <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-200">
            Signed in as
            <div className="truncate text-gray-700">{user?.email || user?.name || "User"}</div>
          </div>
          <button
            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
            onClick={() => setOpen(false)}
            disabled
          >
            Profile (coming soon)
          </button>
          <button
            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
