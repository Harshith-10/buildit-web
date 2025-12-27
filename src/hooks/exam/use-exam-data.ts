"use client";

import { useState } from "react";
import type { Problem } from "@/types/problem";

interface UseExamDataProps {
  problems: Problem[];
}

export function useExamData({ problems }: UseExamDataProps) {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);

  const navigateTo = (index: number) => {
    if (index >= 0 && index < problems.length) {
      setCurrentProblemIndex(index);
    }
  };

  const next = () => navigateTo(currentProblemIndex + 1);
  const prev = () => navigateTo(currentProblemIndex - 1);

  return {
    problems,
    currentProblem: problems[currentProblemIndex],
    currentProblemIndex,
    navigateTo,
    next,
    prev,
    hasNext: currentProblemIndex < problems.length - 1,
    hasPrev: currentProblemIndex > 0,
  };
}
