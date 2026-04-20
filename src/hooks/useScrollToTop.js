import { useEffect } from "react";

export function useScrollToTop(selector = ".lp-root") {
  useEffect(() => {
    const el = document.querySelector(selector);
    if (el) {
      el.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [selector]);
}