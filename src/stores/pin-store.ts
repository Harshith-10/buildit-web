import { create } from "zustand";
import {
  checkPinStatus as checkPinStatusAction,
  setupPin as setupPinAction,
  verifyPin as verifyPinAction,
} from "@/actions/pin";

interface PinState {
  // State
  pinEnabled: boolean;
  pinRequired: boolean;
  pinVerified: boolean;
  isFirstLogin: boolean;
  showSetupDialog: boolean;
  showVerificationDialog: boolean;
  isLoading: boolean;
  fingerprint: string | null;
  authCompleted: boolean;

  // Actions
  setFingerprint: (fingerprint: string) => void;
  setPinVerified: (verified: boolean) => void;
  setShowSetupDialog: (show: boolean) => void;
  setShowVerificationDialog: (show: boolean) => void;
  checkPinStatus: (fingerprint: string) => Promise<void>;
  setupPin: (pin: string, strategy: string) => Promise<boolean>;
  verifyPin: (pin: string, deviceName?: string) => Promise<boolean>;
  skipPinSetup: () => void;
  reset: () => void;
}

const initialState = {
  pinEnabled: false,
  pinRequired: false,
  pinVerified: false,
  isFirstLogin: false,
  showSetupDialog: false,
  showVerificationDialog: false,
  isLoading: false,
  fingerprint: null,
  authCompleted: false,
};

export const usePinStore = create<PinState>((set, get) => ({
  ...initialState,

  setFingerprint: (fingerprint: string) => set({ fingerprint }),

  setPinVerified: (verified: boolean) => set({ pinVerified: verified }),

  setShowSetupDialog: (show: boolean) => set({ showSetupDialog: show }),

  setShowVerificationDialog: (show: boolean) =>
    set({ showVerificationDialog: show }),

  checkPinStatus: async (fingerprint: string) => {
    set({ isLoading: true, fingerprint });
    try {
      const data = await checkPinStatusAction(fingerprint);

      set({
        pinEnabled: data.pinEnabled,
        pinRequired: data.pinRequired,
        pinVerified: data.pinVerified,
        isFirstLogin: data.isFirstLogin,
        isLoading: false,
      });

      // Show appropriate dialog or mark auth as completed
      if (data.isFirstLogin) {
        set({ showSetupDialog: true });
      } else if (data.pinRequired && !data.pinVerified) {
        set({ showVerificationDialog: true });
      } else {
        // No PIN required or already verified, auth is complete
        set({ authCompleted: true });
      }
    } catch (error) {
      console.error("Failed to check PIN status:", error);
      set({ isLoading: false });
    }
  },

  setupPin: async (pin: string, strategy: string) => {
    set({ isLoading: true });
    try {
      const result = await setupPinAction(pin, strategy);

      if (!result.success) {
        throw new Error(result.error || "Failed to setup PIN");
      }

      set({
        pinEnabled: true,
        pinVerified: true,
        showSetupDialog: false,
        isFirstLogin: false,
        isLoading: false,
        authCompleted: true,
      });

      // Also verify PIN to mark session as verified
      const fingerprint = get().fingerprint;
      if (fingerprint) {
        await get().verifyPin(pin);
      }

      return true;
    } catch (error) {
      console.error("Failed to setup PIN:", error);
      set({ isLoading: false });
      return false;
    }
  },

  verifyPin: async (pin: string, deviceName?: string) => {
    set({ isLoading: true });
    try {
      const fingerprint = get().fingerprint || "";
      const result = await verifyPinAction(pin, fingerprint, deviceName);

      if (!result.success) {
        throw new Error(result.error || "Failed to verify PIN");
      }

      set({
        pinVerified: true,
        pinRequired: false,
        showVerificationDialog: false,
        isLoading: false,
        authCompleted: true,
      });
      return true;
    } catch (error) {
      console.error("Failed to verify PIN:", error);
      set({ isLoading: false });
      return false;
    }
  },

  skipPinSetup: () => {
    set({
      showSetupDialog: false,
      isFirstLogin: false,
      pinVerified: true, // Mark as verified so user can proceed
      authCompleted: true,
    });
  },

  reset: () => set(initialState),
}));
