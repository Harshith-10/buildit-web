import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { usePageNameStore } from "@/stores/use-page-name-store";

/**
 * Hook to set a custom page name for the current page.
 * This name will be displayed in the breadcrumbs.
 *
 * @param name - The custom name to display for this page
 *
 * @example
 * ```tsx
 * export default function MyPage() {
 *   usePageName("Custom Page Title");
 *   return <div>My Page Content</div>;
 * }
 * ```
 */
export function usePageName(name: string) {
  const pathname = usePathname();
  const setPageName = usePageNameStore((state) => state.setPageName);
  const clearPageName = usePageNameStore((state) => state.clearPageName);

  useEffect(() => {
    setPageName(pathname, name);

    // Cleanup: remove the page name when component unmounts
    return () => {
      clearPageName(pathname);
    };
  }, [pathname, name, setPageName, clearPageName]);
}
