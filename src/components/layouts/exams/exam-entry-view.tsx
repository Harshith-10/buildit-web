"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Maximize,
  MonitorOff,
  MousePointerClick,
  Play,
  ShieldAlert,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch (err) {
      console.error("Error attempting to enable fullscreen:", err);
    }
  };

  const startExam = () => {
    if (!isFullscreen) {
      alert("Please enter fullscreen mode to start the exam.");
      return;
    }
    // Navigate to actual exam runner
    // For now, assuming /exam/[id]/run is the route, or similar.
    // User request just said "Create page to start exam", didn't specify next route.
    // I'll assume a 'run' route exists or will exist.
    router.push(`/exam/${examId}/run`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Ready for {examTitle}?
            </h1>
            <p className="text-muted-foreground">
              Please review the instructions and features below before starting.
            </p>
          </div>

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

        <Card className="border-2 shadow-lg">
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
                Exiting fullscreen, switching tabs, or resizing the window will
                be logged as suspicious activity and may lead to
                disqualification.
              </AlertDescription>
            </Alert>

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
              >
                <Maximize className="h-4 w-4" /> Enter Fullscreen
              </Button>
            ) : (
              <Button
                size="lg"
                className="w-full gap-2 bg-green-600 hover:bg-green-700"
                onClick={startExam}
              >
                <Play className="h-4 w-4" /> Start Exam
              </Button>
            )}
            <p
              className={cn(
                "text-xs text-center transition-colors",
                isFullscreen ? "text-green-500" : "text-muted-foreground",
              )}
            >
              {isFullscreen
                ? "Fullscreen mode active. You can now start."
                : "Fullscreen mode required"}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border">
      <div className="p-2 bg-background rounded-md shadow-sm">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-sm">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
