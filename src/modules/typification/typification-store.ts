import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface TypificationSelection {
  categoryCode: string | null;
  subtypeCode: string | null;
  freeText: string;
  pictogramsOnly: boolean;
}

interface TypificationState extends TypificationSelection {
  setCategory: (categoryCode: string | null) => void;
  setSubtype: (subtypeCode: string | null) => void;
  setFreeText: (freeText: string) => void;
  setPictogramsOnly: (pictogramsOnly: boolean) => void;
  reset: () => void;
}

const defaultSelection: TypificationSelection = {
  categoryCode: null,
  subtypeCode: null,
  freeText: "",
  pictogramsOnly: false,
};

export const useTypification = create<TypificationState>()(
  persist(
    (set) => ({
      ...defaultSelection,
      setCategory: (categoryCode) =>
        set((state) => ({
          ...state,
          categoryCode,
          subtypeCode: null,
        })),
      setSubtype: (subtypeCode) => set({ subtypeCode }),
      setFreeText: (freeText) => set({ freeText }),
      setPictogramsOnly: (pictogramsOnly) => set({ pictogramsOnly }),
      reset: () => set({ ...defaultSelection }),
    }),
    {
      name: "siae-tipification",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => undefined,
            removeItem: () => undefined,
          };
        }

        return window.sessionStorage;
      }),
    },
  ),
);
