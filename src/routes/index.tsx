import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { HeartPulse, CalendarClock, Pill, Sparkles, FileText, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/40">
      <header className="max-w-6xl mx-auto flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground grid place-items-center">
            <HeartPulse className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg">RK Health</span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost"><Link to="/auth">Sign in</Link></Button>
          <Button asChild><Link to="/auth">Get started</Link></Button>
        </div>
      </header>

      <section className="max-w-4xl mx-auto text-center px-6 pt-12 pb-20">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium mb-6">
          <Sparkles className="h-3.5 w-3.5" /> AI-powered care companion
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
          One dashboard for every<br />appointment, dose, and note.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
          RK Health brings your visits, medications, and AI-generated visit summaries together —
          so you never miss a dose or forget what the doctor said.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild size="lg"><Link to="/auth">Start free</Link></Button>
          <Button asChild size="lg" variant="outline"><Link to="/auth">I have an account</Link></Button>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24 grid gap-4 md:grid-cols-4">
        <Feature icon={<CalendarClock className="h-5 w-5" />} title="Appointments" text="Log visits and add them to Google Calendar in one click." />
        <Feature icon={<Pill className="h-5 w-5" />} title="Medications" text="Track doses, times, and phone-ready reminders." />
        <Feature icon={<Sparkles className="h-5 w-5" />} title="AI summaries" text="Turn visit notes into a patient-friendly summary." />
        <Feature icon={<FileText className="h-5 w-5" />} title="Health report" text="Printable overview to share with any provider." />
      </section>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        <ShieldCheck className="h-3 w-3 inline mr-1" /> Your records are private and only visible to you.
      </footer>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="p-5 rounded-xl bg-card border border-border">
      <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center mb-3">{icon}</div>
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-muted-foreground mt-1">{text}</div>
    </div>
  );
}
