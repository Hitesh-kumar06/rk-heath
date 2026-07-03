import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/report")({
  component: ReportPage,
});

function ReportPage() {
  const { data } = useQuery({
    queryKey: ["report"],
    queryFn: async () => {
      const [appts, meds, sums] = await Promise.all([
        supabase.from("appointments").select("*").order("scheduled_at", { ascending: false }),
        supabase.from("medications").select("*").order("created_at", { ascending: false }),
        supabase.from("ai_summaries").select("*, appointments(title, scheduled_at)").order("created_at", { ascending: false }),
      ]);
      return { appts: appts.data ?? [], meds: meds.data ?? [], sums: sums.data ?? [] };
    },
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto print:max-w-full">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold">Health report</h1>
          <p className="text-muted-foreground">Printable overview of your records.</p>
        </div>
        <Button onClick={() => window.print()}><Printer className="h-4 w-4 mr-1" /> Print</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Appointments</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {data?.appts.map((a) => (
            <div key={a.id} className="border-b border-border last:border-0 pb-2">
              <div className="font-medium">{a.title} — Dr. {a.doctor_name}</div>
              <div className="text-muted-foreground">{format(new Date(a.scheduled_at), "PPp")} · {a.patient_name}</div>
              {a.notes && <div className="mt-1 whitespace-pre-wrap">{a.notes}</div>}
            </div>
          ))}
          {(data?.appts.length ?? 0) === 0 && <div className="text-muted-foreground">No records.</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Medications</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {data?.meds.map((m) => (
            <div key={m.id} className="border-b border-border last:border-0 pb-2">
              <div className="font-medium">{m.name} {m.active ? "" : "(inactive)"}</div>
              <div className="text-muted-foreground">{m.dosage} · {m.time_of_day}</div>
              {m.notes && <div className="mt-1">{m.notes}</div>}
            </div>
          ))}
          {(data?.meds.length ?? 0) === 0 && <div className="text-muted-foreground">No records.</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>AI visit summaries</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          {data?.sums.map((s) => (
            <div key={s.id} className="border-b border-border last:border-0 pb-3">
              <div className="text-muted-foreground text-xs mb-1">
                {s.appointments?.title ?? "Visit"} · {format(new Date(s.created_at), "PP")}
              </div>
              <div className="whitespace-pre-wrap">{s.summary}</div>
            </div>
          ))}
          {(data?.sums.length ?? 0) === 0 && <div className="text-muted-foreground">No summaries yet.</div>}
        </CardContent>
      </Card>
    </div>
  );
}
