// Run work once the browser is idle (Safari has no requestIdleCallback). Returns a cancel function.
export function whenIdle(fn: () => void, timeout = 1200) {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(fn, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(fn, 300);
  return () => clearTimeout(id);
}
