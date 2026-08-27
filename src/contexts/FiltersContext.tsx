import React, { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";

export interface ClassFilters {
  search: string;
  courseId: string; // "all" | Course.id
  cohortId: string; // "all" | "unassigned" | Cohort.id
  subject: string; // "all" | subject code
  instructor: string; // "all" | instructor name
  campus: string; // "all" | campus name
  deliveryType: string; // "all" | DeliveryType
  day: string; // "all" | "0".."4"
}

export const defaultFilters: ClassFilters = {
  search: "",
  courseId: "all",
  cohortId: "all",
  subject: "all",
  instructor: "all",
  campus: "all",
  deliveryType: "all",
  day: "all",
};

interface FiltersContextType {
  filters: ClassFilters;
  setFilter: <K extends keyof ClassFilters>(key: K, value: ClassFilters[K]) => void;
  resetFilters: () => void;
  activeFilterCount: number;
}

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<ClassFilters>(defaultFilters);

  const setFilter = useCallback(
    <K extends keyof ClassFilters>(key: K, value: ClassFilters[K]) => {
      setFilters((prev) => {
        const next = { ...prev, [key]: value };
        // CR-001 §8.2 — changing course resets the cohort selection.
        if (key === "courseId") next.cohortId = "all";
        return next;
      });
    },
    []
  );

  const resetFilters = useCallback(() => setFilters(defaultFilters), []);

  const activeFilterCount = useMemo(
    () =>
      (Object.keys(filters) as (keyof ClassFilters)[]).filter((key) =>
        key === "search" ? filters.search.trim() !== "" : filters[key] !== "all"
      ).length,
    [filters]
  );

  return (
    <FiltersContext.Provider value={{ filters, setFilter, resetFilters, activeFilterCount }}>
      {children}
    </FiltersContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FiltersContext);
  if (context === undefined) {
    throw new Error("useFilters must be used within a FiltersProvider");
  }
  return context;
}
