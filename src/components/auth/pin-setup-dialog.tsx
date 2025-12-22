"use client";

import { Loader2, Shield, ShieldCheck } from "lucide-react";
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
import { usePinStore } from "@/stores/pin-store";

type PinStrategy = "always" | "new_device" | "random";

const strategyOptions: {
  value: PinStrategy;
  label: string;
  description: string;
}[] = [
  {
    value: "new_device",
    label: "New devices only",
    description: "Ask for PIN when logging in from unrecognized devices",
  },
  {
    value: "always",
    label: "Every login",
    description: "Always ask for PIN when logging in",
  },
  {
    value: "random",
    label: "Random verification",
    description: "Occasionally ask for PIN for extra security",
  },
];

export default function PinSetupDialog() {
  const { showSetupDialog, setupPin, skipPinSetup, isLoading } = usePinStore();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [strategy, setStrategy] = useState<PinStrategy>("new_device");
  const [step, setStep] = useState<"intro" | "setup" | "confirm" | "strategy">(
    "intro",
  );
  const [error, setError] = useState("");

  const handleSetup = async () => {
    if (pin !== confirmPin) {
      setError("PINs do not match");
      return;
    }
    const success = await setupPin(pin, strategy);
    if (success) {
      resetState();
    } else {
      setError("Failed to setup PIN. Please try again.");
    }
  };

  const handleSkip = () => {
    skipPinSetup();
    resetState();
  };

  const resetState = () => {
    setPin("");
    setConfirmPin("");
    setStrategy("new_device");
    setStep("intro");
    setError("");
  };

  const handlePinComplete = (value: string) => {
    setPin(value);
    if (value.length === 4) {
      setStep("confirm");
    }
  };

  const handleConfirmComplete = (value: string) => {
    setConfirmPin(value);
    setError("");
  };

  return (
    <Dialog
      open={showSetupDialog}
      onOpenChange={(open) => {
        if (!open) handleSkip();
      }}
    >
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        {step === "intro" && (
          <>
            <DialogHeader>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-2">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle className="text-center">
                Enhanced Security
              </DialogTitle>
              <DialogDescription className="text-center">
                Set up a 4-digit PIN for extra protection. This adds a second
                layer of security to your account.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">
                    Protect against password leaks
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Even if your password is compromised, your account stays
                    safe
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Verify new devices</p>
                  <p className="text-xs text-muted-foreground">
                    Get notified when someone logs in from a new device
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Button onClick={() => setStep("setup")} className="w-full">
                Set up PIN
              </Button>
              <Button variant="ghost" onClick={handleSkip} className="w-full">
                Maybe later
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "setup" && (
          <>
            <DialogHeader>
              <DialogTitle>Create your PIN</DialogTitle>
              <DialogDescription>
                Enter a 4-digit PIN that you&apos;ll remember
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center py-4">
              <InputOTP
                maxLength={4}
                value={pin}
                onChange={handlePinComplete}
                autoFocus
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setStep("intro")}>
                Back
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle>Confirm your PIN</DialogTitle>
              <DialogDescription>
                Enter the same PIN again to confirm
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-2 py-4">
              <InputOTP
                maxLength={4}
                value={confirmPin}
                onChange={handleConfirmComplete}
                autoFocus
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => {
                  setConfirmPin("");
                  setStep("setup");
                }}
              >
                Back
              </Button>
              <Button
                onClick={() => {
                  if (confirmPin.length === 4) {
                    if (pin === confirmPin) {
                      setStep("strategy");
                    } else {
                      setError("PINs do not match");
                    }
                  }
                }}
                disabled={confirmPin.length !== 4}
              >
                Continue
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "strategy" && (
          <>
            <DialogHeader>
              <DialogTitle>When to ask for PIN?</DialogTitle>
              <DialogDescription>
                Choose when you want to be asked for your PIN
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              {strategyOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    strategy === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="strategy"
                    value={option.value}
                    checked={strategy === option.value}
                    onChange={(e) => setStrategy(e.target.value as PinStrategy)}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm font-medium">{option.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setStep("confirm")}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button onClick={handleSetup} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  "Complete setup"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
