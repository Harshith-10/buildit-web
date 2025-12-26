"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Info,
  LogOut,
  Maximize,
  MonitorOff,
  Play,
  ShieldAlert,
  Timer,
  User as UserIcon,
} from "lucide-react";
import { redirect } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { startExamAction } from "@/actions/startExam";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient, useSession } from "@/lib/auth-client";
import { getDeviceFingerprint } from "@/lib/fingerprint";
import { cn } from "@/lib/utils";

interface ExamEntryViewProps {
  examId: string;
  examTitle: string;
  durationMinutes: number;
}

export function ExamEntryView({
  examId,
  examTitle,
  durationMinutes,
}: ExamEntryViewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [terminating, setTerminating] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const { data } = useSession();
  if (!data) redirect("/auth");
  const { user, session } = data;

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const fetchSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const sessions = await authClient.listSessions();
      setActiveSessions(sessions.data || []);
    } catch (error) {
      console.error("Failed to fetch sessions", error);
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch (err) {
      console.error("Error attempting to enable fullscreen:", err);
    }
  };

  const startExam = async () => {
    try {
      // Enter fullscreen first
      if (!document.fullscreenElement) {
        try {
          await document.documentElement.requestFullscreen();
          // Wait a moment for fullscreen to activate
          await new Promise((resolve) => setTimeout(resolve, 300));
        } catch (err) {
          toast.error("Please allow fullscreen mode to start the exam");
          console.error("Fullscreen error:", err);
          return;
        }
      }

      setIsStarting(true);
      toast.loading("Starting exam...");

      // Get device fingerprint on the client
      const fingerprint = await getDeviceFingerprint();

      // Pass fingerprint to server action
      await startExamAction(examId, user.id, fingerprint);
      // The action will redirect to /exam/[sessionId] and fullscreen will be maintained
    } catch (error: any) {
      setIsStarting(false);
      toast.dismiss();
      toast.error(error?.message || "Failed to start exam");
      console.error("Error starting exam:", error);
    }
  };

  const handleTerminateOtherSessions = async () => {
    setTerminating(true);
    try {
      await authClient.revokeOtherSessions();
      toast.success("Other sessions terminated successfully");
      await fetchSessions();
    } catch (error) {
      toast.error("Failed to terminate other sessions");
      console.error(error);
    } finally {
      setTerminating(false);
    }
  };

  const hasMultipleSessions = activeSessions.length > 1;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              {examTitle}
            </h1>
            <h1 className="text-2xl font-bold text-primary tracking-tight mb-2">
              Ready for the test?
            </h1>
            <p className="text-muted-foreground">
              Please review the instructions and features below before starting.
            </p>
          </div>

          {/* User & Session Info Card */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <UserIcon className="h-4 w-4" /> candidate Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{user.name || "Loading..."}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">
                  {user.email || "Loading..."}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Active Sessions:</span>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={hasMultipleSessions ? "destructive" : "secondary"}
                  >
                    {loadingSessions ? "..." : activeSessions.length}
                  </Badge>
                  {hasMultipleSessions && (
                    <span className="text-xs text-destructive font-medium">
                      Multiple detected
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FeatureCard
              icon={Timer}
              title="Timed Exam"
              description={`${durationMinutes} minutes duration`}
            />
            <FeatureCard
              icon={CheckCircle2}
              title="Auto-Save"
              description="Answers saved automatically"
            />
            <FeatureCard
              icon={MonitorOff}
              title="No Tab Switch"
              description="Switching tabs is recorded"
            />
            <FeatureCard
              icon={ShieldAlert}
              title="Proctored"
              description="Malpractice detection active"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Card className="border-2 shadow-lg h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Confirmation
              </CardTitle>
              <CardDescription>Action required to proceed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Malpractice Warning</AlertTitle>
                <AlertDescription>
                  Exiting fullscreen, switching tabs, or resizing the window
                  will be logged as suspicious activity and may lead to
                  disqualification.
                </AlertDescription>
              </Alert>

              {hasMultipleSessions && (
                <Alert variant="destructive" className="border-destructive/50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Multiple Sessions Detected</AlertTitle>
                  <AlertDescription className="space-y-3">
                    <p>
                      You are logged in on {activeSessions.length} devices.
                      Access is restricted to one device only to prevent
                      cheating.
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleTerminateOtherSessions}
                      disabled={terminating}
                      className="w-full"
                    >
                      {terminating
                        ? "Terminating..."
                        : "Terminate Other Sessions"}
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium">To start the exam:</p>
                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                  <li>Close all other tabs and applications.</li>
                  <li>Ensure you have a stable internet connection.</li>
                  <li>Click "Enter Fullscreen" below.</li>
                  <li>Click "Start Exam" once enabled.</li>
                </ol>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              {!isFullscreen ? (
                <Button
                  size="lg"
                  className="w-full gap-2"
                  onClick={enterFullscreen}
                  disabled={hasMultipleSessions}
                >
                  {hasMultipleSessions ? (
                    <>
                      <LogOut className="h-4 w-4" /> Terminate Sessions First
                    </>
                  ) : (
                    <>
                      <Maximize className="h-4 w-4" /> Enter Fullscreen
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="w-full gap-2 bg-green-600 hover:bg-green-700"
                  onClick={startExam}
                  disabled={hasMultipleSessions || isStarting}
                >
                  <Play className="h-4 w-4" />{" "}
                  {isStarting ? "Starting..." : "Start Exam"}
                </Button>
              )}
              <p
                className={cn(
                  "text-xs text-center transition-colors",
                  isFullscreen ? "text-green-500" : "text-muted-foreground",
                  hasMultipleSessions && "text-destructive font-medium",
                )}
              >
                {hasMultipleSessions
                  ? "Multiple sessions detected. Please resolve."
                  : isFullscreen
                    ? "Fullscreen mode active. You can now start."
                    : "Fullscreen mode required"}
              </p>
            </CardFooter>
          </Card>

          <FeatureCard
            icon={Info}
            title="NO Auto-Submit"
            description="Answers are NOT submitted automatically"
            variant="destructive"
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  variant = "default",
}: {
  icon: any;
  title: string;
  description: string;
  variant?: "default" | "destructive";
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg bg-card border",
        variant === "destructive" && "bg-destructive/10 border-destructive/40",
      )}
    >
      <div
        className={cn(
          "p-2 rounded-md shadow-sm",
          variant === "destructive" ? "bg-destructive/20" : "bg-primary/20",
        )}
      >
        <Icon
          className={cn(
            "h-5 w-5",
            variant === "destructive" ? "text-destructive" : "text-primary",
          )}
        />
      </div>
      <div>
        <h3 className="font-semibold text-sm">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
