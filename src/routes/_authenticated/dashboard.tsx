import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarClock, Pill, Sparkles, FileText } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const stats = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const [appts, meds, sums] = await Promise.all([
        supabase.from("appointments").select("*").order("scheduled_at", { ascending: true }),
        supabase.from("medications").select("*").eq("active", true),
        supabase.from("ai_summaries").select("*").order("created_at", { ascending: false }).limit(3),
      ]);
      return {
        appointments: appts.data ?? [],
        medications: meds.data ?? [],
        summaries: sums.data ?? [],
      };
    },
  });

  const upcoming = (stats.data?.appointments ?? []).filter(
    (a) => new Date(a.scheduled_at) >= new Date(),
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground">Here's a snapshot of your health today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={<CalendarClock className="h-5 w-5" />} label="Upcoming visits" value={upcoming.length} />
        <StatCard icon={<Pill className="h-5 w-5" />} label="Active medications" value={stats.data?.medications.length ?? 0} />
        <StatCard icon={<Sparkles className="h-5 w-5" />} label="AI summaries" value={stats.data?.summaries.length ?? 0} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Next appointments</CardTitle>
              <CardDescription>Your upcoming visits</CardDescription>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/appointments">Manage</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming.slice(0, 4).map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">{a.title}</div>
                  <div className="text-muted-foreground">Dr. {a.doctor_name}</div>
                </div>
                <div className="text-right text-muted-foreground">
                  {format(new Date(a.scheduled_at), "MMM d, p")}
                </div>
              </div>
            ))}
            {upcoming.length === 0 && (
              <p className="text-sm text-muted-foreground">No upcoming appointments.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active medications</CardTitle>
              <CardDescription>Reminders you're tracking</CardDescription>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/medications">Manage</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {(stats.data?.medications ?? []).slice(0, 4).map((m) => (
              <div key={m.id} className="flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">{m.name}</div>
                  <div className="text-muted-foreground">{m.dosage}</div>
                </div>
                <div className="text-muted-foreground">{m.time_of_day}</div>
              </div>
            ))}
            {(stats.data?.medications ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">No medications yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent AI summaries</CardTitle>
            <CardDescription>Patient-friendly visit summaries</CardDescription>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link to="/report"><FileText className="h-4 w-4 mr-1" /> Full report</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {(stats.data?.summaries ?? []).map((s) => (
            <div key={s.id} className="text-sm p-3 rounded-md bg-muted/50 whitespace-pre-wrap">
              {s.summary.slice(0, 260)}{s.summary.length > 260 ? "…" : ""}
            </div>
          ))}
          {(stats.data?.summaries ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">Generate a summary from an appointment to see it here.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="text-3xl font-bold mt-1">{value}</div>
        </div>
        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
