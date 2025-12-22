"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import PinVerificationDialog from "@/components/auth/pin-verification-dialog";
import { getDeviceFingerprint } from "@/lib/fingerprint";
import { usePinStore } from "@/stores/pin-store";

interface PinProtectionProps {
  children: React.ReactNode;
}

export default function PinProtection({ children }: PinProtectionProps) {
  const [isChecking, setIsChecking] = useState(true);
  const { checkPinStatus, pinRequired, pinVerified } = usePinStore();

  useEffect(() => {
    const checkPin = async () => {
      try {
        const fingerprint = await getDeviceFingerprint();
        await checkPinStatus(fingerprint);
      } catch (error) {
        console.error("Failed to check PIN status:", error);
        // Check without fingerprint
        await checkPinStatus("");
      } finally {
        setIsChecking(false);
      }
    };

    checkPin();
  }, [checkPinStatus]);

  // Show loading while checking PIN status
  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If PIN is required but not verified, show verification dialog
  if (pinRequired && !pinVerified) {
    return (
      <>
        <div className="flex items-center justify-center h-screen w-screen">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Verifying your identity...</p>
          </div>
        </div>
        <PinVerificationDialog />
      </>
    );
  }

  // PIN verified or not required, show children
  return <>{children}</>;
}
