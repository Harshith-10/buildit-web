import Image from "next/image";
import Link from "next/link";

import { LandingBackground } from "@/components/landing/landing-background";
import { LandingHeader } from "@/components/landing/landing-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  FileCode2,
  Gauge,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";

import { FeatureCard } from "./feature-card";

export function LandingPage() {
  const companyLogos = [
    { file: "microsoft.png", name: "Microsoft" },
    { file: "tcs.png", name: "TCS" },
    { file: "capgemini.png", name: "Capgemini" },
    { file: "verizon.png", name: "Verizon" },
    { file: "tech-mahindra.png", name: "Tech Mahindra" },
    { file: "virtusa.png", name: "Virtusa" },
    { file: "cyient.png", name: "Cyient" },
    { file: "larsen-and-toubro.png", name: "Larsen & Toubro" },
    { file: "lg.png", name: "LG" },
    { file: "mphasis.png", name: "Mphasis" },
    { file: "ntt-data.png", name: "NTT Data" },
  ];

  return (
    <main className="relative w-full overflow-x-hidden">
      <LandingBackground />

      <div className="relative">
        <LandingHeader />

        <section className="mx-auto grid min-h-[92vh] w-full max-w-7xl grid-cols-1 items-center gap-10 px-6 pb-20 pt-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <Badge
              variant="secondary"
              className="border-border/60 bg-foreground/5 text-foreground dark:bg-white/5"
            >
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              Assessments, exams, and coding—one platform
            </Badge>

            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              BuildIT helps colleges run modern, secure coding exams.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Create problem sets, run timed exams, support MCQ + coding rounds,
              and track results with a clean dashboard—built for speed and
              fairness.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/auth">Start now</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#features">See features</a>
              </Button>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Stat label="Fast setup" value="Minutes" />
              <Stat label="Question types" value="MCQ + Code" />
              <Stat label="Built-in" value="Leaderboard" />
            </div>
          </div>

          <div className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-x-8 -top-10 h-56 rounded-full bg-primary/15 blur-3xl"
            />

            <Card className="relative overflow-hidden border-border/60 bg-card/50 p-2 shadow-lg">
              <Image
                src="/feature-photos/dark-mode/coding-assessments.png"
                alt="BuildIT coding assessments screenshot"
                width={1400}
                height={900}
                className="h-auto w-full rounded-lg"
                priority
              />
            </Card>

            <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-foreground/5 px-3 py-1 dark:bg-white/5">
                <ShieldCheck className="h-3.5 w-3.5" />
                Anti-cheat friendly UI
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-foreground/5 px-3 py-1 dark:bg-white/5">
                <Gauge className="h-3.5 w-3.5" />
                Snappy dashboards
              </div>
            </div>
          </div>
        </section>
      </div>

      <section id="companies" className="mx-auto w-full max-w-7xl px-6 py-14">
        <p className="text-sm text-muted-foreground">Built for teams who care about outcomes</p>
        <div className="logo-marquee logo-marquee-ltr mt-6 rounded-2xl border border-border/60 bg-card/20 py-4">
          <div className="logo-marquee-track gap-6 px-2">
            {[...companyLogos, ...companyLogos].map((logo, idx) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={`${logo.file}-${idx}`}
                className="flex items-center justify-center rounded-xl border border-border/60 bg-card/30 px-6 py-3"
              >
                <Image
                  src={`/company-logos/light/${logo.file}`}
                  alt={logo.name}
                  width={200}
                  height={80}
                  className="h-7 w-auto opacity-80 grayscale dark:hidden"
                />
                <Image
                  src={`/company-logos/dark/${logo.file}`}
                  alt={logo.name}
                  width={200}
                  height={80}
                  className="hidden h-7 w-auto opacity-80 grayscale dark:block"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto w-full max-w-7xl px-6 py-14">
        <div className="flex flex-col gap-3">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need for an exam day.
          </h2>
          <p className="max-w-2xl text-muted-foreground">
            Create problems, run sessions, and evaluate faster—with guardrails
            for fairness.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<FileCode2 className="h-5 w-5" />}
            title="Coding + MCQ in one flow"
            description="Mix question types, set points, and keep the exam experience consistent." 
          />
          <FeatureCard
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Designed for secure sessions"
            description="Pinned exam flow and session-first UX to reduce distractions and keep students focused." 
          />
          <FeatureCard
            icon={<Trophy className="h-5 w-5" />}
            title="Leaderboard and insights"
            description="Track submissions, compare performance, and identify top performers quickly." 
          />
          <FeatureCard
            icon={<GraduationCap className="h-5 w-5" />}
            title="Made for campuses"
            description="Simple setup for instructors, clear workflows for students, and scalable dashboards." 
            className="lg:col-span-2"
          />
          <FeatureCard
            icon={<Gauge className="h-5 w-5" />}
            title="Fast, modern UI"
            description="Built with performance-first UI patterns so pages stay responsive even on busy days." 
          />
        </div>
      </section>

      <section id="showcase" className="py-16">
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2">
            <div className="pt-2">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Clean screens students can trust.
              </h2>
              <p className="mt-3 max-w-xl text-muted-foreground">
                Crisp layouts for MCQ, coding, and instructions—so students focus
                on solving, not fighting the UI.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button asChild>
                  <Link href="/auth">Try BuildIT</Link>
                </Button>
                <Button asChild variant="outline">
                  <a href="#companies">See who it’s for</a>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Card className="overflow-hidden border-border/60">
                <Image
                  src="/feature-photos/dark-mode/multi-choice.png"
                  alt="MCQ questions screenshot"
                  width={1200}
                  height={800}
                  className="h-auto w-full"
                />
              </Card>
              <Card className="overflow-hidden border-border/60">
                <Image
                  src="/feature-photos/dark-mode/all-types-of-question.png"
                  alt="All question types screenshot"
                  width={1200}
                  height={800}
                  className="h-auto w-full"
                />
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-8 rounded-2xl border border-border/60 bg-card/40 p-8 backdrop-blur md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Ready to run your next exam?
              </h2>
              <p className="mt-3 text-muted-foreground">
                Jump in, sign in, and start building your first collection.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 md:justify-end">
              <Button asChild size="lg">
                <Link href="/auth">Get started</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#features">Explore features</Link>
              </Button>
            </div>
          </div>

          <footer className="mt-10 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} BuildIT</p>
            <p className="text-xs">Built for campuses and coding rounds.</p>
          </footer>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-foreground/5 p-4 dark:bg-white/5">
      <div className="text-lg font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
