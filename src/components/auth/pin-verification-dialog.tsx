"use client";

import { Loader2, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { getDeviceName } from "@/lib/fingerprint";
import { usePinStore } from "@/stores/pin-store";

export default function PinVerificationDialog() {
  const { showVerificationDialog, verifyPin, isLoading } = usePinStore();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const verifyInputPin = async (pinToVerify: string) => {
    if (pinToVerify.length !== 4) return;

    setError("");
    const deviceName = getDeviceName();
    const success = await verifyPin(pinToVerify, deviceName);

    if (!success) {
      setError("Invalid PIN. Please try again.");
      setPin("");
    }
  };

  const handleVerifyClick = () => verifyInputPin(pin);

  const handlePinChange = (value: string) => {
    setPin(value);
    setError("");

    // Auto-submit when 4 digits entered
    if (value.length === 4) {
      // Use setTimeout to allow state update
      setTimeout(() => {
        verifyInputPin(value);
      }, 100);
    }
  };

  return (
    <Dialog open={showVerificationDialog}>
      <DialogContent showCloseButton={false} className="sm:max-w-sm">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 mb-2">
            <ShieldAlert className="h-6 w-6 text-amber-600 dark:text-amber-500" />
          </div>
          <DialogTitle className="text-center">PIN Verification</DialogTitle>
          <DialogDescription className="text-center">
            Enter your 4-digit PIN to continue
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-3 py-4">
          <InputOTP
            maxLength={4}
            value={pin}
            onChange={handlePinChange}
            autoFocus
            disabled={isLoading}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>

          {error && (
            <p className="text-sm text-destructive animate-in fade-in">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleVerifyClick}
            disabled={pin.length !== 4 || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
