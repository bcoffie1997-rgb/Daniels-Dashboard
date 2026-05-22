"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

export function SearchButton() {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setIsMac(/mac/i.test(navigator.platform));
    }
  }, []);

  function open() {
    window.dispatchEvent(new CustomEvent("mise:open-search"));
  }

  return (
    <button
      onClick={open}
      className="hidden md:inline-flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground hover:border-accent/40 hover:text-foreground transition-colors"
      aria-label="Search (Cmd-K)"
    >
      <Search className="h-3.5 w-3.5" />
      <span>Search</span>
      <span className="inline-flex items-center gap-0.5 ml-2">
        <kbd className="text-[10px] border border-border rounded px-1">
          {isMac ? "⌘" : "Ctrl"}
        </kbd>
        <kbd className="text-[10px] border border-border rounded px-1">K</kbd>
      </span>
    </button>
  );
}

// Mobile icon-only variant — same dispatch
export function SearchButtonMobile() {
  function open() {
    window.dispatchEvent(new CustomEvent("mise:open-search"));
  }
  return (
    <button
      onClick={open}
      className="md:hidden h-9 w-9 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      aria-label="Search"
    >
      <Search className="h-4 w-4" />
    </button>
  );
}
