"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import InProcessRadioLogo from "@/components/ui/InProcessRadioLogo";

interface NavLink {
  href: string;
  label: string;
}

const BASE_NAV_LINKS: NavLink[] = [
  { href: "/", label: "Explore" },
  { href: "/artists", label: "Artists" },
  { href: "/collectors", label: "Collectors" },
];

export default function Header() {
  const { isLoggedIn, email, sendCode, login, logout } = useAuth();
  const pathname = usePathname();
  const [showLogin, setShowLogin] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navLinks: NavLink[] = isLoggedIn
    ? [...BASE_NAV_LINKS, { href: "/my-collection", label: "Collection" }]
    : BASE_NAV_LINKS;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  // Lock body scroll when modal or menu is open
  useEffect(() => {
    const shouldLock = (showLogin && !isLoggedIn) || showMenu;
    if (shouldLock) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [showLogin, showMenu, isLoggedIn]);

  // Close mobile menu on route change
  useEffect(() => {
    setShowMenu(false);
  }, [pathname]);

  const handleSendCode = async () => {
    setLoading(true);
    setError(null);
    try {
      await sendCode(loginEmail);
      setStep("code");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await login(loginEmail, code);
      setShowLogin(false);
      setStep("email");
      setLoginEmail("");
      setCode("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const closeLogin = () => {
    setShowLogin(false);
    setStep("email");
    setCode("");
    setError(null);
  };

  const loginForm = (
    <>
      {step === "email" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendCode();
          }}
        >
          <label className="mb-1.5 block text-xs text-zinc-400">
            Email address
          </label>
          <input
            type="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoFocus
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-500"
          />
          <button
            type="submit"
            disabled={loading || !loginEmail}
            className="mt-3 w-full rounded-md bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-white disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send code"}
          </button>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <p className="mb-3 text-xs text-zinc-400">
            Code sent to {loginEmail}
          </p>
          <input
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            required
            autoFocus
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-center text-sm tracking-widest text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-500"
          />
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="mt-3 w-full rounded-md bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-white disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Log in"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setCode("");
              setError(null);
            }}
            className="mt-2 w-full text-xs text-zinc-500 hover:text-zinc-300"
          >
            Use a different email
          </button>
        </form>
      )}
      {error && (
        <p className="mt-2 text-xs text-red-400">{error}</p>
      )}
    </>
  );

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm"
        style={{ paddingTop: "var(--safe-area-top)" }}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/" className="flex-shrink-0 text-zinc-50">
            <InProcessRadioLogo className="h-14 w-auto" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden flex-1 items-center gap-5 sm:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors hover:text-zinc-50 ${
                  isActive(link.href) ? "text-zinc-50" : "text-zinc-400"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="relative flex items-center gap-3">
            {/* Desktop auth controls */}
            <div className="hidden sm:block">
              {isLoggedIn ? (
                <div className="flex items-center gap-3">
                  <span className="hidden text-sm text-zinc-400 md:inline">{email}</span>
                  <button
                    onClick={logout}
                    className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLogin(!showLogin)}
                  className="text-sm font-medium text-zinc-300 transition-colors hover:text-zinc-50"
                >
                  Log in
                </button>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setShowMenu(true)}
              className="flex h-9 w-9 items-center justify-center rounded-md text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-50 sm:hidden"
              aria-label="Open menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            {/* Desktop dropdown */}
            {showLogin && !isLoggedIn && (
              <div className="absolute right-0 top-full mt-2 hidden w-72 rounded-lg border border-zinc-800 bg-zinc-900 p-4 shadow-xl sm:block">
                {loginForm}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile nav sheet */}
      {showMenu && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowMenu(false)}
          />
          <div className="relative w-full rounded-t-2xl border-t border-zinc-800 bg-zinc-900 px-5 pb-8 pt-4">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-700" />
            <nav className="flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setShowMenu(false)}
                  className={`border-b border-zinc-800 py-3 font-serif text-lg transition-colors ${
                    isActive(link.href) ? "text-zinc-50" : "text-zinc-300"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4">
              {isLoggedIn ? (
                <div className="flex items-center justify-between">
                  <span className="truncate text-xs text-zinc-500">{email}</span>
                  <button
                    onClick={() => {
                      logout();
                      setShowMenu(false);
                    }}
                    className="text-sm text-zinc-400 transition-colors hover:text-zinc-200"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowLogin(true);
                  }}
                  className="w-full rounded-md bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-white"
                >
                  Log in
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowMenu(false)}
              className="mt-4 w-full text-center text-xs text-zinc-500 hover:text-zinc-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Mobile full-screen modal — outside header to avoid stacking context issues */}
      {showLogin && !isLoggedIn && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeLogin}
          />
          <div className="relative w-full rounded-t-2xl border-t border-zinc-800 bg-zinc-900 px-5 pb-8 pt-4">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-700" />
            <h2 className="mb-4 text-center font-serif text-lg font-semibold text-zinc-50">
              Log in
            </h2>
            {loginForm}
            <button
              type="button"
              onClick={closeLogin}
              className="mt-4 w-full text-center text-xs text-zinc-500 hover:text-zinc-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
