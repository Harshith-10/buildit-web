import type { ReactNode } from "react";

export type ViewMode = "table" | "card";

export interface FilterOption {
  label: string;
  key: string; // The URL search param key
  options: {
    label: string;
    value: string;
  }[];
}

export interface SortOption {
  label: string;
  value: string; // The value to pass to the sort query param
}

export interface DataItemsViewProps<T> {
  title: string;
  description?: string;
  data: T[];
  totalItems: number; // For pagination
  // Render props
  renderCard?: (item: T) => ReactNode;
  columns?: {
    header: string;
    accessorKey: keyof T | ((item: T) => ReactNode);
    className?: string;
  }[];

  // Configuration
  availableViews?: ViewMode[];
  defaultView?: ViewMode;
  searchPlaceholder?: string;

  // Filters & Sorting
  filters?: FilterOption[];
  sortOptions?: SortOption[];

  // Actions
  createAction?: {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
  };
}
