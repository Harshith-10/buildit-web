import { create } from "zustand";

export type ViolationType = "fullscreen" | "tab" | "blur" | "devtools";

export type ViolationState = "IDLE" | "VIOLATION_ACTIVE" | "RESOLVED" | "TERMINATED";

export interface ViolationRecord {
  violationType: ViolationType;
  count: number;
  timestamp: number;
  isBlocking: boolean;
}

const MAX_VIOLATIONS = 3;

interface ViolationStoreState {
  // Current violation state
  state: ViolationState;
  
  // Active violation (if any)
  activeViolation: ViolationRecord | null;
  
  // Violation history
  violations: ViolationRecord[];
  
  // Exam active flag (violations only apply during exam)
  examActive: boolean;
  
  // Termination callback
  onTerminate: (() => void) | null;
  
  // Actions
  setExamActive: (active: boolean) => void;
  setOnTerminate: (callback: () => void) => void;
  triggerViolation: (type: ViolationType) => void;
  resolveViolation: () => void;
  incrementViolationCount: (type: ViolationType) => void;
  clearViolations: () => void;
  getViolationCount: (type: ViolationType) => number;
  getTotalViolations: () => number;
  isTerminated: () => boolean;
}

export const useViolationStore = create<ViolationStoreState>((set, get) => ({
  state: "IDLE",
  activeViolation: null,
  violations: [],
  examActive: false,
  onTerminate: null,

  setExamActive: (active) => {
    set({ examActive: active });
    if (!active) {
      // Clear active violation when exam ends
      set({ state: "IDLE", activeViolation: null });
    }
  },

  setOnTerminate: (callback) => {
    set({ onTerminate: callback });
  },

  triggerViolation: (type) => {
    const { examActive, state, onTerminate } = get();
    
    if (!examActive) return;
    if (state === "TERMINATED") return;

    // Get current count for this violation type
    const existingViolations = get().violations.filter(v => v.violationType === type);
    const count = existingViolations.length + 1;

    const newViolation: ViolationRecord = {
      violationType: type,
      count,
      timestamp: Date.now(),
      isBlocking: true,
    };

    const updatedViolations = [...get().violations, newViolation];
    const totalViolations = updatedViolations.length;

    console.log(`[ViolationStore] Triggered ${type} violation (count: ${count}, total: ${totalViolations})`);

    // Check if we've reached max violations
    if (totalViolations >= MAX_VIOLATIONS) {
      console.log(`[ViolationStore] ⚠️ MAX VIOLATIONS REACHED (${totalViolations}/${MAX_VIOLATIONS}) - TERMINATING EXAM`);
      set({
        state: "TERMINATED",
        activeViolation: newViolation,
        violations: updatedViolations,
      });
      
      // Trigger termination callback
      if (onTerminate) {
        setTimeout(() => onTerminate(), 100);
      }
      return;
    }

    set({
      state: "VIOLATION_ACTIVE",
      activeViolation: newViolation,
      violations: updatedViolations,
    });
  },

  resolveViolation: () => {
    const { activeViolation } = get();
    
    if (!activeViolation) return;

    console.log(`[ViolationStore] Resolved ${activeViolation.violationType} violation`);
    
    set({
      state: "RESOLVED",
      activeViolation: null,
    });

    // Reset to IDLE after brief delay
    setTimeout(() => {
      if (get().state === "RESOLVED") {
        set({ state: "IDLE" });
      }
    }, 100);
  },

  incrementViolationCount: (type) => {
    const { violations, activeViolation } = get();
    
    if (activeViolation && activeViolation.violationType === type) {
      set({
        activeViolation: {
          ...activeViolation,
          count: activeViolation.count + 1,
        },
      });
    }
  },

  clearViolations: () => {
    set({
      state: "IDLE",
      activeViolation: null,
      violations: [],
    });
  },

  getViolationCount: (type) => {
    return get().violations.filter(v => v.violationType === type).length;
  },

  getTotalViolations: () => {
    return get().violations.length;
  },

  isTerminated: () => {
    return get().state === "TERMINATED";
  },
}));
