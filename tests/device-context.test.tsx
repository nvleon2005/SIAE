import { renderHook } from "@testing-library/react";
import { useDeviceContext } from "@/src/hooks/use-device-context";

describe("useDeviceContext hook", () => {
  const originalMatchMedia = window.matchMedia;
  const originalInnerWidth = window.innerWidth;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    window.innerWidth = originalInnerWidth;
  });

  it("detects desktop environment correctly by default", () => {
    window.innerWidth = 1280;
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useDeviceContext());

    expect(result.current.isMounted).toBe(true);
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isStandalone).toBe(false);
  });

  it("detects mobile viewport width", () => {
    window.innerWidth = 375;
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useDeviceContext());

    expect(result.current.isMounted).toBe(true);
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });

  it("detects standalone PWA mode", () => {
    window.innerWidth = 390;
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === "(display-mode: standalone)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useDeviceContext());

    expect(result.current.isMounted).toBe(true);
    expect(result.current.isStandalone).toBe(true);
  });
});
