import "@testing-library/jest-dom/vitest";

declare global {
	// eslint-disable-next-line no-var
	var __mockSearchParams: URLSearchParams | undefined;
	// eslint-disable-next-line no-var
	var __mockPathname: string | undefined;
	interface Window {
		__mockSearchParams?: URLSearchParams;
	}
}

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
	useSearchParams: () => (typeof window !== "undefined" && window.__mockSearchParams) || globalThis.__mockSearchParams || new URLSearchParams(),
	usePathname: () => globalThis.__mockPathname || "/",
}));

vi.mock("maplibre-gl", () => ({
	setWorkerUrl: vi.fn(),
	Map: vi.fn().mockImplementation(function () {
		return {
			addControl: vi.fn(),
			on: vi.fn(),
			flyTo: vi.fn(),
			remove: vi.fn(),
		};
	}),
	Marker: vi.fn().mockImplementation(function () {
		return {
			setLngLat: vi.fn().mockReturnThis(),
			addTo: vi.fn().mockReturnThis(),
			on: vi.fn().mockReturnThis(),
			remove: vi.fn().mockReturnThis(),
			getLngLat: vi.fn().mockReturnValue({ lat: 9.7457, lng: -63.1832 }),
		};
	}),
	NavigationControl: vi.fn().mockImplementation(function () {
		return {};
	}),
}));
